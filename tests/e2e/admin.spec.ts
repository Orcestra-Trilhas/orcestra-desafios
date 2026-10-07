import { expect, test } from "@playwright/test";
import { authenticateAsNewMember } from "./e2e-auth-helper";

const ADMIN_URL_REGEX = /\/admin/;
const DASHBOARD_URL_REGEX = /\/dashboard/;
const ADMIN_RESTRICTED_REGEX = /ACESSO RESTRITO \/\/ ADMIN/i;
const RESTRICTION_MESSAGE_REGEX =
	/Esta área é reservada exclusivamente para assessores/i;
const BACK_TO_DASHBOARD_REGEX = /VOLTAR PARA MEUS DESAFIOS/i;

test.describe("Área Administrativa & Controle de Acesso (E2E)", () => {
	test("deve bloquear acesso de membro comum à rota /admin e exibir card de restrição", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/admin");
		await expect(page).toHaveURL(ADMIN_URL_REGEX);

		// Card de acesso restrito
		await expect(
			page.getByRole("heading", { name: ADMIN_RESTRICTED_REGEX })
		).toBeVisible();

		await expect(page.getByText(RESTRICTION_MESSAGE_REGEX)).toBeVisible();

		// Botão para retornar ao dashboard
		const backBtn = page.getByRole("link", {
			name: BACK_TO_DASHBOARD_REGEX,
		});
		await expect(backBtn).toBeVisible();
		await backBtn.click();

		await expect(page).toHaveURL(DASHBOARD_URL_REGEX);
	});
});
