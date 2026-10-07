import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { relations } from "@orcestra-desafios/db/relations";
import { drizzle } from "drizzle-orm/pglite";

export type TestDb = ReturnType<
	typeof drizzle<{ client: PGlite; relations: typeof relations }>
>;

export interface TestDbInstance {
	client: PGlite;
	close: () => Promise<void>;
	db: TestDb;
	reset: () => Promise<void>;
}

/**
 * Creates an isolated in-memory PostgreSQL instance using PGlite
 * and applies all database migrations automatically.
 */
export async function createTestDatabase(): Promise<TestDbInstance> {
	const client = new PGlite();
	const db = drizzle({ client, relations });

	const migrationsDir = path.resolve(
		import.meta.dirname,
		"../../packages/db/src/migrations"
	);

	const migrationFolders = [
		"20261001225032_lowly_maddog",
		"20261002121630_loose_dreaming_celestial",
	];

	const migrationSqlChunks = migrationFolders.map((folder) => {
		const sqlPath = path.join(migrationsDir, folder, "migration.sql");
		if (!fs.existsSync(sqlPath)) {
			throw new Error(`Migration file not found at: ${sqlPath}`);
		}
		return fs.readFileSync(sqlPath, "utf-8");
	});

	await client.exec(migrationSqlChunks.join("\n"));

	const reset = async () => {
		// Truncate all application tables for a fresh state between tests
		const truncateSql = `
			TRUNCATE TABLE 
				profile_gift,
				user_badge,
				badge,
				pair,
				challenge,
				session,
				account,
				verification,
				admin_log,
				"user"
			CASCADE;
		`;
		await client.exec(truncateSql);
	};

	const close = async () => {
		await client.close();
	};

	return { client, close, db, reset };
}
