import type { Page } from "@playwright/test";

const SIGN_UP_HEADING_REGEX = /CADASTRO \/\/ EJ/i;
const SWITCH_BTN_REGEX = /crie seu perfil aqui/i;
const SUBMIT_BTN_REGEX = /CRIAR CONTA/i;
const DASHBOARD_URL_REGEX = /\/dashboard/;

/**
 * Cadastra e autentica um novo membro na sessão do navegador
 */
export async function authenticateAsNewMember(page: Page) {
	await page.goto("/login");

	// Garante que está no formulário de cadastro
	const signUpHeading = page.getByRole("heading", {
		name: SIGN_UP_HEADING_REGEX,
	});
	if (!(await signUpHeading.isVisible())) {
		const switchBtn = page.getByRole("button", {
			name: SWITCH_BTN_REGEX,
		});
		if (await switchBtn.isVisible()) {
			await switchBtn.click();
		}
	}

	const uniqueEmail = `membro.e2e.${Date.now()}_${Math.random().toString(36).slice(7)}@orcestra.com`;

	await page.locator("#name").fill("Membro E2E Automatizado");
	await page.locator("#email").fill(uniqueEmail);
	await page.locator("#password").fill("senha123456");

	const submitBtn = page.getByRole("button", { name: SUBMIT_BTN_REGEX });
	await submitBtn.click();

	await page.waitForURL(DASHBOARD_URL_REGEX, { timeout: 15_000 });
	return { email: uniqueEmail };
}
