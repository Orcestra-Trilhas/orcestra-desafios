import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = import.meta.dirname;

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@\/(.*)/,
				replacement: path.resolve(rootDir, "apps/web/src/$1"),
			},
			{ find: "@tests", replacement: path.resolve(rootDir, "tests") },
		],
	},
	test: {
		coverage: {
			exclude: [
				"node_modules/**",
				"tests/**",
				"**/*.config.*",
				"packages/db/src/migrations/**",
			],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		globals: true,
		include: ["tests/integration/**/*.test.ts"],
		testTimeout: 20_000,
	},
});
