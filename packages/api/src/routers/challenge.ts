import { pair } from "@orcestra-desafios/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const challengeRouter = router({
	advanceStep: protectedProcedure
		.input(z.object({ pairId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const p = await ctx.db.query.pair.findFirst({
				where: { id: input.pairId },
			});

			if (!p) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Dupla não encontrada",
				});
			}

			if (
				p.member1Id !== userId &&
				p.member2Id !== userId &&
				p.member3Id !== userId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Você não faz parte desta dupla",
				});
			}

			if (p.currentStep === 1) {
				await ctx.db
					.update(pair)
					.set({ currentStep: 2 })
					.where(eq(pair.id, input.pairId));
			}

			return { success: true };
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const ch = await ctx.db.query.challenge.findFirst({
				where: { id: input.id },
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

			if (!ch) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Desafio não encontrado",
				});
			}

			const sessionUser = ctx.session.user as { id: string; role?: string };
			const userId = sessionUser.id;
			let isAdmin = sessionUser.role === "ADMIN";

			if (!isAdmin) {
				const dbUser = await ctx.db.query.user.findFirst({
					where: { id: userId },
				});
				if (dbUser?.role === "ADMIN") {
					isAdmin = true;
				}
			}

			const myPair = ch.pairs.find(
				(p) =>
					p.member1Id === userId ||
					p.member2Id === userId ||
					p.member3Id === userId
			);

			const totalPairs = ch.pairs.length;
			const submittedPairs = ch.pairs.filter(
				(p) => p.status === "SUBMITTED" || p.status === "APPROVED"
			).length;
			const approvedPairs = ch.pairs.filter(
				(p) => p.status === "APPROVED"
			).length;

			const isDeadlinePassed = new Date(ch.deadline).getTime() < Date.now();
			const myPairSubmitted =
				myPair?.status === "SUBMITTED" || myPair?.status === "APPROVED";
			const canViewAllSolutions =
				isAdmin || myPairSubmitted || isDeadlinePassed;

			const submissions = ch.pairs
				.filter((p) => p.status === "SUBMITTED" || p.status === "APPROVED")
				.map((p) => {
					const isMyOwnPair = p.id === myPair?.id;
					const isUnlocked = canViewAllSolutions || isMyOwnPair;

					return {
						currentStep: p.currentStep,
						feedback: isUnlocked ? p.feedback : null,
						id: p.id,
						isMyOwnPair,
						isSpoilerLocked: !isUnlocked,
						member1: p.member1
							? {
									department: p.member1.department,
									gifUrl: p.member1.gifUrl,
									id: p.member1.id,
									name: p.member1.name,
							  }
							: null,
						member2: p.member2
							? {
									department: p.member2.department,
									gifUrl: p.member2.gifUrl,
									id: p.member2.id,
									name: p.member2.name,
							  }
							: null,
						member3: p.member3
							? {
									department: p.member3.department,
									gifUrl: p.member3.gifUrl,
									id: p.member3.id,
									name: p.member3.name,
							  }
							: null,
						prUrl: isUnlocked ? p.prUrl : null,
						repoUrl: isUnlocked ? p.repoUrl : null,
						reviewedAt: p.reviewedAt,
						status: p.status,
						submissionNotes: isUnlocked ? p.submissionNotes : null,
						submissionType: p.submissionType,
						updatedAt: p.updatedAt,
					};
				});

			return {
				...ch,
				approvedPairs,
				canViewAllSolutions,
				isDeadlinePassed,
				myPair: myPair ?? null,
				submissions,
				submittedPairs,
				totalPairs,
			};
		}),
	listActive: protectedProcedure.query(async ({ ctx }) => {
		const challenges = await ctx.db.query.challenge.findMany({
			orderBy: { deadline: "asc" },
			where: { active: true },
			with: {
				assessor: true,
				pairs: true,
			},
		});

		return challenges.map((ch) => {
			const totalPairs = ch.pairs.length;
			const submittedOrApproved = ch.pairs.filter(
				(p) => p.status === "SUBMITTED" || p.status === "APPROVED"
			).length;

			return {
				...ch,
				submittedOrApproved,
				totalPairs,
			};
		});
	}),

	myPairs: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const pairs = await ctx.db.query.pair.findMany({
			orderBy: { createdAt: "desc" },
			where: {
				OR: [
					{ member1Id: userId },
					{ member2Id: userId },
					{ member3Id: userId },
				],
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

		return pairs.map((p) => {
			const partners = [p.member1, p.member2, p.member3].filter(
				(m): m is NonNullable<typeof m> => Boolean(m && m.id !== userId)
			);

			return {
				...p,
				assessor: p.challenge?.assessor ?? null,
				partners,
			};
		});
	}),

	submitSolution: protectedProcedure
		.input(
			z.object({
				pairId: z.string(),
				prUrl: z.string().optional().nullable(),
				repoUrl: z.string().optional().nullable(),
				submissionNotes: z.string().optional().nullable(),
				submissionType: z
					.enum(["PR", "REPO", "DOCUMENT", "IMAGE", "TEXT"])
					.default("PR"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const p = await ctx.db.query.pair.findFirst({
				where: { id: input.pairId },
			});

			if (!p) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Dupla não encontrada",
				});
			}

			if (
				p.member1Id !== userId &&
				p.member2Id !== userId &&
				p.member3Id !== userId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Você não faz parte desta dupla",
				});
			}

			await ctx.db
				.update(pair)
				.set({
					currentStep: 3,
					prUrl: input.prUrl || null,
					repoUrl: input.repoUrl || null,
					status: "SUBMITTED",
					submissionNotes: input.submissionNotes || null,
					submissionType: input.submissionType,
				})
				.where(eq(pair.id, input.pairId));

			return { success: true };
		}),
});
