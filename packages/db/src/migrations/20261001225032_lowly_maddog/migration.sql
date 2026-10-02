CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"department" text DEFAULT 'DIPROJ' NOT NULL,
	"whatsapp" text,
	"gif_url" text,
	"points" integer DEFAULT 0 NOT NULL,
	"track_preferences" text DEFAULT '["BACK","FRONT","PROTOTIPACAO","DEVOPS"]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_log" (
	"id" text PRIMARY KEY,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badge" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon_url" text NOT NULL,
	"criteria" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"track_theme" text NOT NULL,
	"rules_markdown" text NOT NULL,
	"mkdocs_url" text,
	"assessor_id" text NOT NULL,
	"points_reward" integer DEFAULT 100 NOT NULL,
	"enrollment_deadline" timestamp,
	"deadline" timestamp NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pair" (
	"id" text PRIMARY KEY,
	"challenge_id" text NOT NULL,
	"member1_id" text NOT NULL,
	"member2_id" text NOT NULL,
	"member3_id" text,
	"status" text DEFAULT 'IN_PROGRESS' NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"submission_type" text DEFAULT 'PR' NOT NULL,
	"repo_url" text,
	"pr_url" text,
	"submission_notes" text,
	"feedback" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badge" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "admin_log_actorId_idx" ON "admin_log" ("actor_id");--> statement-breakpoint
CREATE INDEX "challenge_assessorId_idx" ON "challenge" ("assessor_id");--> statement-breakpoint
CREATE INDEX "pair_challengeId_idx" ON "pair" ("challenge_id");--> statement-breakpoint
CREATE INDEX "pair_member1Id_idx" ON "pair" ("member1_id");--> statement-breakpoint
CREATE INDEX "pair_member2Id_idx" ON "pair" ("member2_id");--> statement-breakpoint
CREATE INDEX "user_badge_userId_idx" ON "user_badge" ("user_id");--> statement-breakpoint
CREATE INDEX "user_badge_badgeId_idx" ON "user_badge" ("badge_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "admin_log" ADD CONSTRAINT "admin_log_actor_id_user_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_assessor_id_user_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "pair" ADD CONSTRAINT "pair_challenge_id_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pair" ADD CONSTRAINT "pair_member1_id_user_id_fkey" FOREIGN KEY ("member1_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pair" ADD CONSTRAINT "pair_member2_id_user_id_fkey" FOREIGN KEY ("member2_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pair" ADD CONSTRAINT "pair_member3_id_user_id_fkey" FOREIGN KEY ("member3_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_badge_id_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badge"("id") ON DELETE CASCADE;