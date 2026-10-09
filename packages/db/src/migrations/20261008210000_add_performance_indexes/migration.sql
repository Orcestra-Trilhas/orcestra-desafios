CREATE INDEX IF NOT EXISTS "user_department_idx" ON "user" ("department");
CREATE INDEX IF NOT EXISTS "user_points_idx" ON "user" ("points");
CREATE INDEX IF NOT EXISTS "challenge_active_idx" ON "challenge" ("active");
CREATE INDEX IF NOT EXISTS "challenge_trackTheme_idx" ON "challenge" ("track_theme");
CREATE INDEX IF NOT EXISTS "pair_member3Id_idx" ON "pair" ("member3_id");
CREATE INDEX IF NOT EXISTS "pair_status_idx" ON "pair" ("status");

