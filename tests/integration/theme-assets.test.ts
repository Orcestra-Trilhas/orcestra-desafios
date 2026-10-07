import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Theme Logos & Favicon Assets", () => {
	const projectRoot = path.resolve(import.meta.dirname, "../..");
	const faviconDir = path.join(projectRoot, "apps/web/public/favicon");
	const publicDir = path.join(projectRoot, "apps/web/public");

	it("deve conter todos os SVGs temáticos com estrutura correta e acessível", () => {
		const expectedSvgs = [
			"favicon-orc-dark.svg",
			"favicon-orc-light.svg",
			"favicon-dark.svg",
			"favicon-light.svg",
			"favicon.svg",
		];

		for (const filename of expectedSvgs) {
			const filePath = path.join(faviconDir, filename);
			expect(fs.existsSync(filePath), `Arquivo ${filename} deve existir`).toBe(
				true
			);

			const content = fs.readFileSync(filePath, "utf-8");
			expect(content).toContain("<svg");
			expect(content).toContain("<title>");
			expect(content).toContain('fill-rule="evenodd"');
			expect(content).toContain('width="200"');
			expect(content).toContain('height="200"');
		}
	});

	it("deve conter cores primárias corretas para cada variação de tema", () => {
		const orcDark = fs.readFileSync(
			path.join(faviconDir, "favicon-orc-dark.svg"),
			"utf-8"
		);
		expect(orcDark).toContain("#02571E");

		const orcLight = fs.readFileSync(
			path.join(faviconDir, "favicon-orc-light.svg"),
			"utf-8"
		);
		expect(orcLight).toContain("#0D3309");

		const dark = fs.readFileSync(
			path.join(faviconDir, "favicon-dark.svg"),
			"utf-8"
		);
		expect(dark).toContain("#D9381E");

		const light = fs.readFileSync(
			path.join(faviconDir, "favicon-light.svg"),
			"utf-8"
		);
		expect(light).toContain("#EC4899");
	});

	it("deve conter todos os ícones PNG para PWA e Apple Touch", () => {
		const expectedPngs = [
			"favicon-96x96.png",
			"apple-touch-icon.png",
			"web-app-manifest-192x192.png",
			"web-app-manifest-512x512.png",
		];

		for (const filename of expectedPngs) {
			const filePath = path.join(faviconDir, filename);
			expect(fs.existsSync(filePath), `PNG ${filename} deve existir`).toBe(
				true
			);
			const stat = fs.statSync(filePath);
			expect(stat.size).toBeGreaterThan(500);
		}
	});

	it("deve conter ícones e manifests específicos para cada um dos 4 temas do PWA", () => {
		const themes = ["orc-dark", "orc-light", "dark", "light"];

		for (const t of themes) {
			const appleIcon = path.join(faviconDir, `apple-touch-icon-${t}.png`);
			const manifest192 = path.join(
				faviconDir,
				`web-app-manifest-192x192-${t}.png`
			);
			const manifest512 = path.join(
				faviconDir,
				`web-app-manifest-512x512-${t}.png`
			);
			const manifestFile = path.join(publicDir, `manifest-${t}.webmanifest`);

			expect(fs.existsSync(appleIcon), `Apple icon ${t} deve existir`).toBe(
				true
			);
			expect(fs.existsSync(manifest192), `Manifest 192 ${t} deve existir`).toBe(
				true
			);
			expect(fs.existsSync(manifest512), `Manifest 512 ${t} deve existir`).toBe(
				true
			);
			expect(
				fs.existsSync(manifestFile),
				`Manifest json ${t} deve existir`
			).toBe(true);

			const manifestJson = JSON.parse(fs.readFileSync(manifestFile, "utf-8"));
			expect(manifestJson.icons.length).toBeGreaterThanOrEqual(4);
			expect(manifestJson.icons[0].src).toContain(`-${t}.png`);
		}
	});

	it("deve atualizar a logo da documentação em apps/docs com alta resolução", () => {
		const docsLogoPath = path.join(
			projectRoot,
			"apps/docs/src/assets/logo.png"
		);
		expect(fs.existsSync(docsLogoPath)).toBe(true);
		const stat = fs.statSync(docsLogoPath);
		expect(stat.size).toBeGreaterThan(1000);
	});
});
