import { expect, test } from "@playwright/test";
import { authenticateAsNewMember } from "./e2e-auth-helper";

const DASHBOARD_URL_REGEX = /\/dashboard/;
const GREETING_REGEX = /OLÁ,/i;
const PTS_REGEX = /PTS/i;
const EXPLORE_BTN_REGEX = /EXPLORAR DESAFIOS/i;
const EXPLORER_HEADING_REGEX = /DESAFIOS ABERTOS \/\/ EJ/i;
const ACTIVE_MISSIONS_REGEX = /MEUS DESAFIOS ATIVOS \/\/ MISSÕES/i;
const EMPTY_STATE_REGEX = /NENHUMA DUPLA ATIVA NA RODADA/i;

test.describe("Dashboard & Missões (E2E)", () => {
	test("deve exibir o cabeçalho e poster banner com pontos e botões de ação", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await expect(page).toHaveURL(DASHBOARD_URL_REGEX);

		// Poster banner
		await expect(
			page.getByRole("heading", { name: GREETING_REGEX })
		).toBeVisible();

		// Badge de pontos
		await expect(page.getByText(PTS_REGEX).first()).toBeVisible();

		// Botão de explorar desafios
		const exploreBtn = page
			.getByRole("button", {
				name: EXPLORE_BTN_REGEX,
			})
			.first();
		await expect(exploreBtn).toBeVisible();

		// Clica em explorar desafios e abre o modal
		await exploreBtn.click();
		await expect(
			page.getByRole("heading", { name: EXPLORER_HEADING_REGEX })
		).toBeVisible();

		// Fecha o modal pelo botão X
		const closeBtn = page.getByRole("button", { name: "X" });
		await closeBtn.click();
		await expect(
			page.getByRole("heading", { name: EXPLORER_HEADING_REGEX })
		).not.toBeVisible();
	});

	test("deve renderizar a seção de missões ativas ou estado vazio", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await expect(
			page.getByRole("heading", { name: ACTIVE_MISSIONS_REGEX })
		).toBeVisible();

		// Como é usuário recém-criado, deve exibir empty state ou mensagem de rodada
		const emptyState = page.getByRole("heading", {
			name: EMPTY_STATE_REGEX,
		});
		await expect(emptyState).toBeVisible();
	});
});

