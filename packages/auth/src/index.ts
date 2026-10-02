import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@orcestra-desafios/db";
import * as schema from "@orcestra-desafios/db/schema/auth";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export interface AuthConfig {
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
}

export function createAuth(env: AuthConfig, database: Database) {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(database, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 4,
		},
		plugins: [nextCookies()],
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.BETTER_AUTH_URL],
		user: {
			additionalFields: {
				department: {
					defaultValue: "DIPROJ",
					input: true,
					required: false,
					type: "string",
				},
				gifUrl: {
					input: true,
					required: false,
					type: "string",
				},
				points: {
					defaultValue: 0,
					required: false,
					type: "number",
				},
				role: {
					defaultValue: "MEMBER",
					input: true,
					required: false,
					type: "string",
				},
				trackPreferences: {
					defaultValue: '["BACK","FRONT","PROTOTIPACAO","DEVOPS"]',
					input: true,
					required: false,
					type: "string",
				},
				whatsapp: {
					input: true,
					required: false,
					type: "string",
				},
			},
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type AuthUser = Session["user"];
