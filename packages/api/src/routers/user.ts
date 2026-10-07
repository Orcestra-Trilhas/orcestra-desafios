import { profileGift, user } from "@orcestra-desafios/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { findSheetMember, getSheetMembers } from "../services/members-sheet";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
	deleteGift: protectedProcedure
		.input(z.object({ giftId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			const gift = await ctx.db.query.profileGift.findFirst({
				where: { id: input.giftId },
			});

			if (!gift) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Presente não encontrado",
				});
			}

			const isRecipient = gift.recipientId === userId;
			const isSender = gift.senderId === userId;
			const isAdmin = userRole === "ADMIN";

			if (!(isRecipient || isSender || isAdmin)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Você não tem permissão para remover este presente",
				});
			}

			await ctx.db.delete(profileGift).where(eq(profileGift.id, input.giftId));

			return { success: true };
		}),

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

	getEligibleMembers: publicProcedure.query(async ({ ctx }) => {
		const sheetMembers = getSheetMembers();
		const registeredUsers = await ctx.db.query.user.findMany({
			columns: {
				name: true,
			},
		});

		const registeredNames = new Set(
			registeredUsers.map((u) => u.name.trim().toLowerCase())
		);

		return sheetMembers.map((m) => ({
			displayTrack: m.displayTrack,
			isRegistered: registeredNames.has(m.name.trim().toLowerCase()),
			name: m.name,
			progressPercent: m.progressPercent,
			rawTrack: m.rawTrack,
			satisfaction: m.satisfaction,
			trackPreferences: m.trackPreferences,
		}));
	}),

	getMemberTrackByName: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ input }) => {
			const member = findSheetMember(input.name);
			if (member) {
				return {
					displayTrack: member.displayTrack,
					name: member.name,
					progressPercent: member.progressPercent,
					trackPreferences: member.trackPreferences,
				};
			}
			return {
				displayTrack: "Geral (Todas as Trilhas)",
				name: input.name,
				progressPercent: 0,
				trackPreferences: ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"],
			};
		}),

	getProfile: protectedProcedure
		.input(
			z
				.object({
					userId: z.string().optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const targetUserId = input?.userId || ctx.session.user.id;
			const foundUser = await ctx.db.query.user.findFirst({
				where: { id: targetUserId },
			});

			if (!foundUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Usuário não encontrado",
				});
			}

			const badges = await ctx.db.query.userBadge.findMany({
				where: { userId: targetUserId },
				with: {
					badge: true,
				},
			});

			const gifts = await ctx.db.query.profileGift.findMany({
				orderBy: { createdAt: "desc" },
				where: { recipientId: targetUserId },
				with: {
					sender: {
						columns: {
							department: true,
							gifUrl: true,
							id: true,
							image: true,
							name: true,
						},
					},
				},
			});

			// Calculate completed approved challenges
			const pairs = await ctx.db.query.pair.findMany({
				where: {
					OR: [
						{ member1Id: targetUserId },
						{ member2Id: targetUserId },
						{ member3Id: targetUserId },
					],
					status: "APPROVED",
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
				completedChallenges: pairs.length,
				gifts,
				isOwner: ctx.session.user.id === targetUserId,
				trackPreferencesList: tracks,
			};
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

	sendGift: protectedProcedure
		.input(
			z.object({
				mediaUrl: z.string().min(1, "URL da imagem ou GIF é obrigatória"),
				message: z
					.string()
					.max(300, "Mensagem deve ter no máximo 300 caracteres")
					.optional()
					.nullable(),
				recipientId: z.string().min(1, "Destinatário não especificado"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const senderId = ctx.session.user.id;

			const recipient = await ctx.db.query.user.findFirst({
				where: { id: input.recipientId },
			});

			if (!recipient) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Destinatário não encontrado",
				});
			}

			const id = crypto.randomUUID();
			await ctx.db.insert(profileGift).values({
				id,
				mediaUrl: input.mediaUrl.trim(),
				message: input.message?.trim() || null,
				recipientId: input.recipientId,
				senderId,
			});

			return { id, success: true };
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
