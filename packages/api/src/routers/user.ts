import { user } from "@orcestra-desafios/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

export const userRouter = router({
	ensureDevAdmin: publicProcedure.mutation(async ({ ctx }) => {
		const adminEmail = "admin@orcestra.com";
		const existing = await ctx.db.query.user.findFirst({
			where: { email: adminEmail },
		});

		if (existing) {
			if (
				existing.role !== "ADMIN" ||
				existing.department !== "TOPS" ||
				!existing.whatsapp
			) {
				await ctx.db
					.update(user)
					.set({ department: "TOPS", role: "ADMIN", whatsapp: "5511999999999" })
					.where(eq(user.id, existing.id));
			}
			return { message: "Admin já configurado", success: true };
		}

		if (ctx.auth) {
			try {
				const result = await ctx.auth.api.signUpEmail({
					body: {
						email: adminEmail,
						name: "Administrador EJ Orcestra",
						password: "admin",
					},
				});

				if (result?.user?.id) {
					await ctx.db
						.update(user)
						.set({
							department: "TOPS",
							role: "ADMIN",
							whatsapp: "5511999999999",
						})
						.where(eq(user.id, result.user.id));
				}
			} catch {
				// Fallback
			}
		}

		return { message: "Admin inicial verificado/criado", success: true };
	}),

	listAssessors: protectedProcedure.query(async ({ ctx }) => {
		const assessors = await ctx.db.query.user.findMany({
			columns: {
				department: true,
				email: true,
				id: true,
				image: true,
				name: true,
				role: true,
				whatsapp: true,
			},
		});
		return assessors;
	}),
	me: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const foundUser = await ctx.db.query.user.findFirst({
			where: { id: userId },
		});

		if (!foundUser) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Usuário não encontrado",
			});
		}

		const badges = await ctx.db.query.userBadge.findMany({
			where: { userId },
			with: {
				badge: true,
			},
		});

		let tracks: string[] = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"];
		if (foundUser.trackPreferences) {
			try {
				tracks = JSON.parse(foundUser.trackPreferences);
			} catch {
				tracks = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"];
			}
		}

		return {
			...foundUser,
			badges: badges.map((b) => b.badge),
			trackPreferencesList: tracks,
		};
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				department: z.enum(["DICOM", "DIBIS", "DIPROJ", "TOPS"]),
				gifUrl: z.string().optional().nullable(),
				image: z.string().optional().nullable(),
				name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
				trackPreferences: z.array(z.string()).default([]),
				whatsapp: z.string().optional().nullable(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			await ctx.db
				.update(user)
				.set({
					department: input.department,
					gifUrl: input.gifUrl || null,
					image: input.image || null,
					name: input.name,
					trackPreferences: JSON.stringify(input.trackPreferences),
					whatsapp: input.whatsapp || null,
				})
				.where(eq(user.id, userId));

			return { success: true };
		}),
});
