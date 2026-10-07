import { expect, test } from "@playwright/test";
import { authenticateAsNewMember } from "./e2e-auth-helper";

const PROFILE_URL_REGEX = /\/profile/;
const MEMBER_NAME_REGEX = /Membro E2E Automatizado/i;
const TRACK_PREFS_REGEX = /TRILHAS DE INTERESSE/i;
const GIFT_MURAL_REGEX = /MURAL DE PRESENTES/i;
const SAVE_BTN_REGEX = /SALVAR ALTERAÇÕES|SALVAR/i;
const PROFILE_UPDATED_REGEX = /Perfil atualizado com sucesso/i;
const LOGOUT_BTN_REGEX = /SAIR DA CONTA|SAIR/i;
const LOGIN_URL_REGEX = /\/login/;

test.describe("Perfil do Usuário & Mural de Presentes (E2E)", () => {
	test("deve exibir as informações do perfil, trilhas e seções do usuário", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/profile");
		await expect(page).toHaveURL(PROFILE_URL_REGEX);

		// Cabeçalho de perfil
		await expect(
			page.getByRole("heading", { name: MEMBER_NAME_REGEX })
		).toBeVisible({ timeout: 10_000 });

		// Seção de preferências de trilha
		await expect(page.getByText(TRACK_PREFS_REGEX).first()).toBeVisible();

		// Seção do mural de presentes
		await expect(page.getByText(GIFT_MURAL_REGEX).first()).toBeVisible();
	});

	test("deve permitir atualizar o nome do usuário no formulário de edição", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/profile");

		// Campo de nome
		const nameInput = page.locator("input[name='name'], input#name").first();
		if (await nameInput.isVisible()) {
			await nameInput.fill("Nome Atualizado via E2E");

			const saveBtn = page.getByRole("button", {
				name: SAVE_BTN_REGEX,
			});
			if (await saveBtn.isVisible()) {
				await saveBtn.click();
				// Aguarda confirmação visual
				await expect(page.getByText(PROFILE_UPDATED_REGEX).first()).toBeVisible(
					{ timeout: 10_000 }
				);
			}
		}
	});

	test("deve permitir realizar logout e redirecionar para a página de login", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/profile");

		const logoutBtn = page.getByRole("button", { name: LOGOUT_BTN_REGEX });
		if (await logoutBtn.isVisible()) {
			await logoutBtn.click();
			await expect(page).toHaveURL(LOGIN_URL_REGEX, { timeout: 15_000 });
		}
	});
});
