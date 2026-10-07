import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/,
		},
		{
			dependencies: ["setup"],
			name: "Desktop Chrome",
			testMatch: /.*\.spec\.ts/,
			use: {
				...devices["Desktop Chrome"],
			},
		},
		{
			dependencies: ["setup"],
			name: "Mobile Chrome",
			testMatch: /.*\.spec\.ts/,
			use: {
				...devices["Pixel 5"],
			},
		},
	],
	reporter: [["html", { open: "never" }], ["list"]],
	retries: process.env.CI ? 2 : 0,
	testDir: "./tests/e2e",
	use: {
		baseURL: "http://localhost:3001",
		trace: "on-first-retry",
		video: "on-first-retry",
	},
	webServer: {
		command: "npm run dev:web",
		port: 3001,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
	workers: process.env.CI ? 1 : undefined,
});

