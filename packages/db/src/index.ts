import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
	const sql = neon(env.DATABASE_URL);
	return drizzle({ client: sql, relations });
}

export type Database = ReturnType<typeof createDb>;
// biome-ignore lint/performance/noBarrelFile: Package entry point
export * from "./schema";
