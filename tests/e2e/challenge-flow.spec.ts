import { expect, test } from "@playwright/test";
import { authenticateAsNewMember } from "./e2e-auth-helper";

const NOT_FOUND_HEADING_REGEX = /DESAFIO NÃO ENCONTRADO/i;
const BACK_TO_CHALLENGES_LINK_REGEX = /VOLTAR AOS DESAFIOS/i;
const DASHBOARD_URL_REGEX = /\/dashboard/;
const EXPLORE_BTN_REGEX = /EXPLORAR DESAFIOS/i;
const DETAILS_LINK_REGEX = /DETALHES/i;
const CHALLENGES_URL_REGEX = /\/challenges\//;
const BACK_TO_CHALLENGES_BTN_REGEX = /VOLTAR AOS DESAFIOS/i;

test.describe("Fluxo de Desafios & Detalhes (E2E)", () => {
	test("deve exibir card de 'DESAFIO NÃO ENCONTRADO' e link de retorno para ID inexistente", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/challenges/chal_non_existent_9999");
		await expect(
			page.getByRole("heading", { name: NOT_FOUND_HEADING_REGEX })
		).toBeVisible();

		const backBtn = page.getByRole("link", {
			name: BACK_TO_CHALLENGES_LINK_REGEX,
		});
		await expect(backBtn).toBeVisible();
		await backBtn.click();

		await expect(page).toHaveURL(DASHBOARD_URL_REGEX);
	});

	test("deve navegar do explorer de desafios para a página de detalhes quando houver desafios", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/dashboard");

		// Abre o modal de explorar desafios
		const exploreBtn = page
			.getByRole("button", {
				name: EXPLORE_BTN_REGEX,
			})
			.first();
		await exploreBtn.click();

		const detailsLink = page
			.getByRole("link", { name: DETAILS_LINK_REGEX })
			.first();
		if (await detailsLink.isVisible()) {
			await detailsLink.click();
			await expect(page).toHaveURL(CHALLENGES_URL_REGEX);
			// Confirma que a página carregou elementos do desafio
			await expect(
				page.getByRole("button", { name: BACK_TO_CHALLENGES_BTN_REGEX })
			).toBeVisible();
		}
	});
});
