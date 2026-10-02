import { defineRelationsPart } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const challenge = pgTable(
	"challenge",
	{
		active: boolean("active").default(true).notNull(),
		assessorId: text("assessor_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		deadline: timestamp("deadline").notNull(),
		description: text("description").notNull(),
		enrollmentDeadline: timestamp("enrollment_deadline"),
		id: text("id").primaryKey(),
		mkdocsUrl: text("mkdocs_url"),
		pointsReward: integer("points_reward").default(100).notNull(),
		rulesMarkdown: text("rules_markdown").notNull(),
		title: text("title").notNull(),
		trackTheme: text("track_theme").notNull(), // 'BACK' | 'FRONT' | 'PROTOTIPACAO' | 'DEVOPS' | 'GIT'
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("challenge_assessorId_idx").on(table.assessorId)]
);

export const pair = pgTable(
	"pair",
	{
		challengeId: text("challenge_id")
			.notNull()
			.references(() => challenge.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		currentStep: integer("current_step").default(1).notNull(), // 1: Alinhamento, 2: Submissão, 3: Avaliação
		feedback: text("feedback"),
		id: text("id").primaryKey(),
		member1Id: text("member1_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		member2Id: text("member2_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		member3Id: text("member3_id").references(() => user.id, {
			onDelete: "set null",
		}), // Trio se ímpar
		prUrl: text("pr_url"),
		repoUrl: text("repo_url"),
		reviewedAt: timestamp("reviewed_at"),
		status: text("status").default("IN_PROGRESS").notNull(), // 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED'
		submissionNotes: text("submission_notes"),
		submissionType: text("submission_type").default("PR").notNull(), // 'PR' | 'REPO' | 'DOCUMENT' | 'IMAGE' | 'TEXT'
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("pair_challengeId_idx").on(table.challengeId),
		index("pair_member1Id_idx").on(table.member1Id),
		index("pair_member2Id_idx").on(table.member2Id),
	]
);

export const badge = pgTable("badge", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	criteria: text("criteria").notNull(),
	description: text("description").notNull(),
	iconUrl: text("icon_url").notNull(),
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});

export const userBadge = pgTable(
	"user_badge",
	{
		badgeId: text("badge_id")
			.notNull()
			.references(() => badge.id, { onDelete: "cascade" }),
		earnedAt: timestamp("earned_at").defaultNow().notNull(),
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("user_badge_userId_idx").on(table.userId),
		index("user_badge_badgeId_idx").on(table.badgeId),
	]
);

export const adminLog = pgTable(
	"admin_log",
	{
		action: text("action").notNull(),
		actorId: text("actor_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		details: jsonb("details"),
		id: text("id").primaryKey(),
	},
	(table) => [index("admin_log_actorId_idx").on(table.actorId)]
);

export const profileGift = pgTable(
	"profile_gift",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		id: text("id").primaryKey(),
		mediaUrl: text("media_url").notNull(),
		message: text("message"),
		recipientId: text("recipient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("profile_gift_recipientId_idx").on(table.recipientId),
		index("profile_gift_senderId_idx").on(table.senderId),
	]
);

export const challengeRelations = defineRelationsPart(
	{ adminLog, badge, challenge, pair, profileGift, user, userBadge },
	(r) => ({
		adminLog: {
			actor: r.one.user({
				from: r.adminLog.actorId,
				to: r.user.id,
			}),
		},
		badge: {
			userBadges: r.many.userBadge({
				from: r.badge.id,
				to: r.userBadge.badgeId,
			}),
		},
		challenge: {
			assessor: r.one.user({
				from: r.challenge.assessorId,
				to: r.user.id,
			}),
			pairs: r.many.pair({
				from: r.challenge.id,
				to: r.pair.challengeId,
			}),
		},
		pair: {
			challenge: r.one.challenge({
				from: r.pair.challengeId,
				to: r.challenge.id,
			}),
			member1: r.one.user({
				from: r.pair.member1Id,
				to: r.user.id,
			}),
			member2: r.one.user({
				from: r.pair.member2Id,
				to: r.user.id,
			}),
			member3: r.one.user({
				from: r.pair.member3Id,
				to: r.user.id,
			}),
		},
		profileGift: {
			recipient: r.one.user({
				from: r.profileGift.recipientId,
				to: r.user.id,
			}),
			sender: r.one.user({
				from: r.profileGift.senderId,
				to: r.user.id,
			}),
		},
		userBadge: {
			badge: r.one.badge({
				from: r.userBadge.badgeId,
				to: r.badge.id,
			}),
			user: r.one.user({
				from: r.userBadge.userId,
				to: r.user.id,
			}),
		},
	})
);
