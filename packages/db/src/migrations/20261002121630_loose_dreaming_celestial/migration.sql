CREATE TABLE "profile_gift" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"media_url" text NOT NULL,
	"message" text,
	"recipient_id" text NOT NULL,
	"sender_id" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "profile_gift_recipientId_idx" ON "profile_gift" ("recipient_id");--> statement-breakpoint
CREATE INDEX "profile_gift_senderId_idx" ON "profile_gift" ("sender_id");--> statement-breakpoint
ALTER TABLE "profile_gift" ADD CONSTRAINT "profile_gift_recipient_id_user_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profile_gift" ADD CONSTRAINT "profile_gift_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE;