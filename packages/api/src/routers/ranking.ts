import { challenge, pair } from "@orcestra-desafios/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const rankingRouter = router({
	getLeaderboard: protectedProcedure
		.input(
			z.object({
				category: z.enum(["ALL", "DEPARTMENT", "TRACK"]).default("ALL"),
				filterValue: z.string().optional(),
				viewMode: z.enum(["PAIRS", "MEMBERS"]).default("PAIRS"),
			})
		)
		.query(async ({ ctx, input }) => {
			if (input.viewMode === "MEMBERS") {
				const isDeptFilter =
					input.category === "DEPARTMENT" && Boolean(input.filterValue);

				const users = await ctx.db.query.user.findMany({
					orderBy: { points: "desc" },
					where:
						isDeptFilter && input.filterValue
							? { department: input.filterValue }
							: undefined,
				});

				const filtered = users.filter((u) => {
					if (input.category === "TRACK" && input.filterValue) {
						try {
							const tracks = u.trackPreferences
								? JSON.parse(u.trackPreferences)
								: [];
							return (
								Array.isArray(tracks) && tracks.includes(input.filterValue)
							);
						} catch {
							return false;
						}
					}
					return true;
				});

				const top3 = filtered.slice(0, 3);
				const rest = filtered.slice(3);

				return {
					ranked: rest,
					top3,
					totalCount: filtered.length,
					viewMode: "MEMBERS" as const,
				};
			}

			// viewMode === "PAIRS"
			const pairs = await ctx.db.query.pair.findMany({
				with: {
					challenge: true,
					member1: true,
					member2: true,
					member3: true,
				},
			});

			const filteredPairs = pairs.filter((p) => {
				if (input.category === "TRACK" && input.filterValue) {
					return p.challenge?.trackTheme === input.filterValue;
				}
				if (input.category === "DEPARTMENT" && input.filterValue) {
					return (
						p.member1?.department === input.filterValue ||
						p.member2?.department === input.filterValue ||
						p.member3?.department === input.filterValue
					);
				}
				return true;
			});

			// Calculate score for pair
			const scoredPairs = filteredPairs.map((p) => {
				const pointsReward = p.challenge?.pointsReward ?? 100;
				let score = 0;
				if (p.status === "APPROVED") {
					score = pointsReward;
				} else if (p.status === "SUBMITTED") {
					score = Math.round(pointsReward * 0.7);
				} else if (p.currentStep === 2) {
					score = Math.round(pointsReward * 0.3);
				}

				const members = [p.member1, p.member2, p.member3].filter(
					(m): m is NonNullable<typeof m> => Boolean(m)
				);

				return {
					...p,
					members,
					score,
				};
			});

			scoredPairs.sort(
				(a, b) => b.score - a.score || b.currentStep - a.currentStep
			);

			const top3 = scoredPairs.slice(0, 3);
			const rest = scoredPairs.slice(3);

			return {
				ranked: rest,
				top3,
				totalCount: scoredPairs.length,
				viewMode: "PAIRS" as const,
			};
		}),
	getSprintThermometer: protectedProcedure.query(async ({ ctx }) => {
		const activePairsData = await ctx.db
			.select({
				status: pair.status,
			})
			.from(pair)
			.innerJoin(challenge, eq(pair.challengeId, challenge.id))
			.where(eq(challenge.active, true));

		let completed = 0;
		let submitted = 0;

		for (const p of activePairsData) {
			if (p.status === "APPROVED") {
				completed += 1;
			} else if (p.status === "SUBMITTED") {
				submitted += 1;
			}
		}

		const total = activePairsData.length;
		const percentage =
			total > 0 ? Math.round(((completed + submitted * 0.5) / total) * 100) : 0;

		return {
			completed,
			percentage: Math.min(percentage, 100),
			submitted,
			target: total > 0 ? total : 10,
			total,
		};
	}),
});
