import { appRouter, createCallerFactory } from "@orcestra-desafios/api";
import type { Context } from "@orcestra-desafios/api/context";
import { createAuth, type Session } from "@orcestra-desafios/auth";
import type { Database } from "@orcestra-desafios/db";
import {
	adminPersona,
	assessorPersona,
	memberPersona,
	type PersonaDefinition,
} from "./personas";
import type { TestDb } from "./test-db";

const testAuthConfig = {
	BETTER_AUTH_SECRET: "sota_test_secret_must_be_at_least_32_chars_long",
	BETTER_AUTH_URL: "http://localhost:3001",
};

export type PersonaType =
	| "admin"
	| "member"
	| "assessor"
	| "unauthenticated"
	| PersonaDefinition
	| Session
	| null;

const createCaller = createCallerFactory(appRouter);

export function createTestCaller(options: {
	db: TestDb;
	persona?: PersonaType;
}) {
	const { db, persona = "member" } = options;

	let session: Session | null = null;

	if (persona === "admin") {
		({ session } = adminPersona);
	} else if (persona === "member") {
		({ session } = memberPersona);
	} else if (persona === "assessor") {
		({ session } = assessorPersona);
	} else if (persona === "unauthenticated" || persona === null) {
		session = null;
	} else if ("session" in persona && "user" in persona) {
		session = persona as Session;
	} else if ("session" in persona && "role" in persona) {
		({ session } = persona as PersonaDefinition);
	} else if ("id" in persona && "role" in persona) {
		const customUser = persona as {
			department?: string;
			email: string;
			id: string;
			name: string;
			role: "ADMIN" | "MEMBER";
		};
		session = {
			session: {
				createdAt: new Date(),
				expiresAt: new Date(Date.now() + 86_400_000),
				id: `sess_${customUser.id}`,
				ipAddress: "127.0.0.1",
				token: `tok_${customUser.id}`,
				updatedAt: new Date(),
				userId: customUser.id,
			},
			user: {
				createdAt: new Date(),
				department: customUser.department ?? "DIPROJ",
				email: customUser.email,
				emailVerified: true,
				id: customUser.id,
				name: customUser.name,
				role: customUser.role,
				updatedAt: new Date(),
			},
		};
	}

	const auth = createAuth(testAuthConfig, db as unknown as Database);

	const ctx: Context = {
		auth,
		db: db as unknown as Database,
		session,
	};

	return createCaller(ctx);
}
