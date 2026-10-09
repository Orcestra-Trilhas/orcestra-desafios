import { adminLog, challenge, pair, user } from "@orcestra-desafios/db";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { calculateMemberKnowledgeScore } from "../services/members-sheet";
import { adminProcedure, router } from "../trpc";

export const adminRouter = router({
	createChallenge: adminProcedure
		.input(
			z.object({
				assessorId: z.string(),
				deadline: z.string(),
				description: z
					.string()
					.min(10, "Descrição deve ter pelo menos 10 caracteres"),
				enrollmentDeadline: z.string().optional().nullable(),
				mkdocsUrl: z.string().optional().nullable(),
				pointsReward: z.number().default(100),
				rulesMarkdown: z
					.string()
					.min(10, "Regras devem ter pelo menos 10 caracteres"),
				title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
				trackTheme: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = crypto.randomUUID();

			await ctx.db.insert(challenge).values({
				active: true,
				assessorId: input.assessorId,
				deadline: new Date(input.deadline),
				description: input.description,
				enrollmentDeadline: input.enrollmentDeadline
					? new Date(input.enrollmentDeadline)
					: null,
				id,
				mkdocsUrl: input.mkdocsUrl || null,
				pointsReward: input.pointsReward,
				rulesMarkdown: input.rulesMarkdown,
				title: input.title,
				trackTheme: input.trackTheme,
			});

			await ctx.db.insert(adminLog).values({
				action: "CRIOU_DESAFIO",
				actorId: ctx.session.user.id,
				details: {
					challengeId: id,
					title: input.title,
					track: input.trackTheme,
				},
				id: crypto.randomUUID(),
			});

			return { id, success: true };
		}),

	deleteChallenge: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const ch = await ctx.db.query.challenge.findFirst({
				where: { id: input.id },
				with: {
					pairs: true,
				},
			});

			if (!ch) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Desafio não encontrado",
				});
			}

			// Deleta duplas associadas
			await ctx.db.delete(pair).where(eq(pair.challengeId, input.id));

			// Deleta o desafio
			await ctx.db.delete(challenge).where(eq(challenge.id, input.id));

			// Registra o log administrativo
			await ctx.db.insert(adminLog).values({
				action: "DELETOU_DESAFIO",
				actorId: ctx.session.user.id,
				details: {
					challengeId: input.id,
					pairsCount: ch.pairs.length,
					title: ch.title,
					track: ch.trackTheme,
				},
				id: crypto.randomUUID(),
			});

			return { success: true };
		}),

	drawPairs: adminProcedure
		.input(z.object({ challengeId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const ch = await ctx.db.query.challenge.findFirst({
				where: { id: input.challengeId },
				with: {
					pairs: true,
				},
			});

			if (!ch) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Desafio não encontrado",
				});
			}

			// Collect members already in pairs for this challenge
			const assignedUserIds = new Set<string>();
			for (const p of ch.pairs) {
				assignedUserIds.add(p.member1Id);
				assignedUserIds.add(p.member2Id);
				if (p.member3Id) {
					assignedUserIds.add(p.member3Id);
				}
			}

			// Find all users
			const allUsers = await ctx.db.query.user.findMany();

			// Filter eligible users who have the track in their trackPreferences and are not already assigned
			let eligible = allUsers.filter((u) => {
				if (assignedUserIds.has(u.id)) {
					return false;
				}
				try {
					const tracks = u.trackPreferences
						? JSON.parse(u.trackPreferences)
						: [];
					return Array.isArray(tracks) && tracks.includes(ch.trackTheme);
				} catch {
					return false;
				}
			});

			// If no members explicitly have this track toggle on, fall back to any unassigned members
			if (eligible.length < 2) {
				eligible = allUsers.filter((u) => !assignedUserIds.has(u.id));
			}

			if (eligible.length < 2) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Membros insuficientes para sortear duplas (encontrados: ${eligible.length}, mínimo: 2).`,
				});
			}

			// Ordena os membros elegíveis por nível de conhecimento decrescente
			// Pontuação = Progresso da Planilha de Acompanhamentos (0 a 100%) + Pontos acumulados na plataforma
			const rankedMembers = [...eligible].sort((a, b) => {
				const scoreA = calculateMemberKnowledgeScore(a.name, a.points);
				const scoreB = calculateMemberKnowledgeScore(b.name, b.points);
				if (scoreB !== scoreA) {
					return scoreB - scoreA;
				}
				return a.name.localeCompare(b.name);
			});

			const pairsToInsert: Array<{
				id: string;
				challengeId: string;
				member1Id: string;
				member2Id: string;
				member3Id: string | null;
				currentStep: number;
				status: string;
			}> = [];

			// Algoritmo de dois ponteiros: Pareia maior conhecimento com menor conhecimento
			let left = 0;
			let right = rankedMembers.length - 1;

			while (left < right) {
				const mHigh = rankedMembers[left];
				const mLow = rankedMembers[right];

				if (mHigh && mLow) {
					pairsToInsert.push({
						challengeId: ch.id,
						currentStep: 1,
						id: crypto.randomUUID(),
						member1Id: mHigh.id,
						member2Id: mLow.id,
						member3Id: null,
						status: "IN_PROGRESS",
					});
				}

				left += 1;
				right -= 1;
			}

			// Se a quantidade for ímpar (ex: 3, 5, 7 membros), o membro mediano restante
			// é acoplado na última dupla criada para formar um trio equilibrado
			if (left === right) {
				const medianMember = rankedMembers[left];
				const lastPair = pairsToInsert.at(-1);
				if (medianMember && lastPair) {
					lastPair.member3Id = medianMember.id;
				}
			}

			if (pairsToInsert.length > 0) {
				await ctx.db.insert(pair).values(pairsToInsert);
			}

			await ctx.db.insert(adminLog).values({
				action: "SORTEIO_DUPLAS",
				actorId: ctx.session.user.id,
				details: {
					algorithm: "BALANCED_TWO_POINTER_KNOWLEDGE",
					challengeId: ch.id,
					scores: rankedMembers.map((m) => ({
						id: m.id,
						name: m.name,
						score: calculateMemberKnowledgeScore(m.name, m.points),
					})),
					totalFormed: pairsToInsert.length,
					totalMembers: eligible.length,
				},
				id: crypto.randomUUID(),
			});

			return {
				membersCount: eligible.length,
				pairsCreated: pairsToInsert.length,
				success: true,
			};
		}),
	getMetrics: adminProcedure.query(async ({ ctx }) => {
		const allChallenges = await ctx.db.query.challenge.findMany();
		const allPairs = await ctx.db.query.pair.findMany({
			with: {
				challenge: true,
			},
		});

		const totalChallenges = allChallenges.length;
		const activeChallenges = allChallenges.filter((c) => c.active).length;
		const totalPairs = allPairs.length;
		const submittedPairs = allPairs.filter(
			(p) => p.status === "SUBMITTED"
		).length;
		const approvedPairs = allPairs.filter(
			(p) => p.status === "APPROVED"
		).length;
		const changesRequested = allPairs.filter(
			(p) => p.status === "CHANGES_REQUESTED"
		).length;

		const approvalRate =
			submittedPairs + approvedPairs > 0
				? Math.round((approvedPairs / (submittedPairs + approvedPairs)) * 100)
				: 100;

		const now = new Date();
		const stuckPairs = allPairs.filter((p) => {
			if (p.status !== "IN_PROGRESS") {
				return false;
			}
			if (!p.challenge) {
				return false;
			}
			const deadline = new Date(p.challenge.deadline);
			return deadline.getTime() <= now.getTime();
		}).length;

		return {
			activeChallenges,
			approvalRate,
			approvedPairs,
			changesRequested,
			stuckPairs,
			submittedPairs,
			totalChallenges,
			totalPairs,
		};
	}),

	listChallenges: adminProcedure.query(async ({ ctx }) => {
		const challenges = await ctx.db.query.challenge.findMany({
			orderBy: { createdAt: "desc" },
			with: {
				assessor: true,
				pairs: {
					with: {
						member1: true,
						member2: true,
						member3: true,
					},
				},
			},
		});
		return challenges;
	}),

	listLogs: adminProcedure.query(async ({ ctx }) => {
		const logs = await ctx.db.query.adminLog.findMany({
			limit: 50,
			orderBy: { createdAt: "desc" },
			with: {
				actor: true,
			},
		});
		return logs;
	}),

	listSubmissions: adminProcedure.query(async ({ ctx }) => {
		const submissions = await ctx.db.query.pair.findMany({
			orderBy: { updatedAt: "desc" },
			where: {
				status: { in: ["SUBMITTED", "CHANGES_REQUESTED", "APPROVED"] },
			},
			with: {
				challenge: {
					with: {
						assessor: true,
					},
				},
				member1: true,
				member2: true,
				member3: true,
			},
		});
		return submissions;
	}),

	reviewSubmission: adminProcedure
		.input(
			z.object({
				feedback: z.string().optional().nullable(),
				pairId: z.string(),
				pointsBonus: z.number().default(0),
				status: z.enum(["APPROVED", "CHANGES_REQUESTED"]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const p = await ctx.db.query.pair.findFirst({
				where: { id: input.pairId },
				with: {
					challenge: true,
				},
			});

			if (!p) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Submissão / dupla não encontrada",
				});
			}

			if (input.status === "APPROVED") {
				await ctx.db
					.update(pair)
					.set({
						currentStep: 3,
						feedback:
							input.feedback ||
							"Desafio aprovado com sucesso! Parabéns à dupla!",
						reviewedAt: new Date(),
						status: "APPROVED",
					})
					.where(eq(pair.id, input.pairId));

				const basePoints = p.challenge?.pointsReward ?? 100;
				const pointsAwarded = basePoints + input.pointsBonus;

				const memberIds = [p.member1Id, p.member2Id, p.member3Id].filter(
					(id): id is string => Boolean(id)
				);

				await Promise.all(
					memberIds.map((memberId) =>
						ctx.db
							.update(user)
							.set({
								points: sql`${user.points} + ${pointsAwarded}`,
							})
							.where(eq(user.id, memberId))
					)
				);

				await ctx.db.insert(adminLog).values({
					action: "APROVOU_SUBMISSAO",
					actorId: ctx.session.user.id,
					details: {
						challengeTitle: p.challenge?.title ?? "Desafio",
						members: memberIds,
						pairId: p.id,
						pointsAwarded,
					},
					id: crypto.randomUUID(),
				});
			} else {
				await ctx.db
					.update(pair)
					.set({
						currentStep: 2,
						feedback: input.feedback || "Ajustes solicitados pelo assessor.",
						reviewedAt: new Date(),
						status: "CHANGES_REQUESTED",
					})
					.where(eq(pair.id, input.pairId));

				await ctx.db.insert(adminLog).values({
					action: "SOLICITOU_AJUSTES",
					actorId: ctx.session.user.id,
					details: {
						challengeTitle: p.challenge?.title ?? "Desafio",
						feedback: input.feedback,
						pairId: p.id,
					},
					id: crypto.randomUUID(),
				});
			}

			return { success: true };
		}),

	toggleChallenge: adminProcedure
		.input(z.object({ active: z.boolean(), id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(challenge)
				.set({ active: input.active })
				.where(eq(challenge.id, input.id));

			await ctx.db.insert(adminLog).values({
				action: input.active ? "ATIVOU_DESAFIO" : "DESATIVOU_DESAFIO",
				actorId: ctx.session.user.id,
				details: { challengeId: input.id },
				id: crypto.randomUUID(),
			});

			return { success: true };
		}),
});
