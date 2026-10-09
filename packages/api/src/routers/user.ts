import { hashPassword } from "@orcestra-desafios/auth";
import { account, profileGift, session, user } from "@orcestra-desafios/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
	canMemberChooseOtherTracks,
	findSheetMember,
	getSheetMembers,
	MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
} from "../services/members-sheet";
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
			canChooseOtherTracks: canMemberChooseOtherTracks(m),
			displayTrack: m.displayTrack,
			isRegistered: registeredNames.has(m.name.trim().toLowerCase()),
			minProgressRequired: MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
			name: m.name,
			primaryTrack: m.primaryTrack,
			progressPercent: m.progressPercent,
			rawTrack: m.rawTrack,
			satisfaction: m.satisfaction,
			trackPreferences: m.trackPreferences,
		}));
	}),

	getMemberTrackByName: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(({ input }) => {
			const member = findSheetMember(input.name);
			if (member) {
				return {
					canChooseOtherTracks: canMemberChooseOtherTracks(member),
					displayTrack: member.displayTrack,
					minProgressRequired: MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
					name: member.name,
					primaryTrack: member.primaryTrack,
					progressPercent: member.progressPercent,
					trackPreferences: member.trackPreferences,
				};
			}
			return {
				canChooseOtherTracks: true,
				displayTrack: "Geral (Todas as Trilhas)",
				minProgressRequired: MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
				name: input.name,
				primaryTrack: null,
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

			const member = findSheetMember(foundUser.name);
			const canChooseOtherTracks = canMemberChooseOtherTracks(member);

			let tracks: string[] = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"];
			if (foundUser.trackPreferences) {
				try {
					tracks = JSON.parse(foundUser.trackPreferences);
				} catch {
					tracks = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"];
				}
			}

			if (!canChooseOtherTracks && member?.primaryTrack) {
				tracks = [member.primaryTrack];
			}

			return {
				...foundUser,
				badges: badges.map((b) => b.badge),
				canChooseOtherTracks,
				completedChallenges: pairs.length,
				customTheme: foundUser.customTheme ?? null,
				gifts,
				isOwner: ctx.session.user.id === targetUserId,
				minProgressRequired: MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
				primaryTrack: member?.primaryTrack ?? null,
				primaryTrackLabel: member?.displayTrack ?? "Geral (Todas as Trilhas)",
				primaryTrackProgress: member?.progressPercent ?? 0,
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

		const member = findSheetMember(foundUser.name);
		const canChooseOtherTracks = canMemberChooseOtherTracks(member);

		let tracks: string[] = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"];
		if (foundUser.trackPreferences) {
			try {
				tracks = JSON.parse(foundUser.trackPreferences);
			} catch {
				tracks = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"];
			}
		}

		if (!canChooseOtherTracks && member?.primaryTrack) {
			tracks = [member.primaryTrack];
		}

		return {
			...foundUser,
			badges: badges.map((b) => b.badge),
			canChooseOtherTracks,
			customTheme: foundUser.customTheme ?? null,
			minProgressRequired: MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
			primaryTrack: member?.primaryTrack ?? null,
			primaryTrackLabel: member?.displayTrack ?? "Geral (Todas as Trilhas)",
			primaryTrackProgress: member?.progressPercent ?? 0,
			trackPreferencesList: tracks,
		};
	}),

	resetPassword: publicProcedure
		.input(
			z.object({
				email: z.string().email("E-mail inválido"),
				newPassword: z
					.string()
					.min(4, "A senha deve ter no mínimo 4 caracteres"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const normalizedEmail = input.email.trim().toLowerCase();
			const foundUser = await ctx.db.query.user.findFirst({
				where: { email: normalizedEmail },
			});

			if (!foundUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Nenhum usuário cadastrado com este e-mail.",
				});
			}

			const existingAccount = await ctx.db.query.account.findFirst({
				where: {
					providerId: "credential",
					userId: foundUser.id,
				},
			});

			const hashedPassword = await hashPassword(input.newPassword);

			if (existingAccount) {
				await ctx.db
					.update(account)
					.set({ password: hashedPassword })
					.where(eq(account.id, existingAccount.id));
			} else {
				await ctx.db.insert(account).values({
					accountId: foundUser.email,
					id: `account-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
					password: hashedPassword,
					providerId: "credential",
					userId: foundUser.id,
				});
			}

			// Invalida sessões ativas anteriores por segurança
			await ctx.db.delete(session).where(eq(session.userId, foundUser.id));

			return {
				email: foundUser.email,
				name: foundUser.name,
				success: true,
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

	updateCustomTheme: protectedProcedure
		.input(
			z.object({
				customTheme: z.string().nullable(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			await ctx.db
				.update(user)
				.set({
					customTheme: input.customTheme,
				})
				.where(eq(user.id, userId));

			return { success: true };
		}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				customTheme: z.string().optional().nullable(),
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

			const foundUser = await ctx.db.query.user.findFirst({
				where: { id: userId },
			});

			if (!foundUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Usuário não encontrado",
				});
			}

			// Procura o membro na planilha pelo nome atual ou pelo novo nome
			const member =
				findSheetMember(foundUser.name) ?? findSheetMember(input.name);
			const canChooseOther = canMemberChooseOtherTracks(member);

			if (!canChooseOther && member?.primaryTrack) {
				const invalidTracks = input.trackPreferences.filter(
					(t) => t !== member.primaryTrack
				);

				if (invalidTracks.length > 0) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Você precisa atingir pelo menos 85% de progresso na sua trilha principal (${member.displayTrack}) para selecionar outras trilhas. Progresso atual: ${member.progressPercent}%.`,
					});
				}
			}

			let finalTrackPreferences = input.trackPreferences;
			if (
				member?.primaryTrack &&
				!finalTrackPreferences.includes(member.primaryTrack)
			) {
				finalTrackPreferences = [member.primaryTrack, ...finalTrackPreferences];
			}

			await ctx.db
				.update(user)
				.set({
					customTheme:
						input.customTheme === undefined
							? foundUser.customTheme
							: input.customTheme,
					department: input.department,
					gifUrl: input.gifUrl || null,
					image: input.image || null,
					name: input.name,
					trackPreferences: JSON.stringify(finalTrackPreferences),
					whatsapp: input.whatsapp || null,
				})
				.where(eq(user.id, userId));

			return { success: true };
		}),
});
