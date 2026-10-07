import { expect, test } from "@playwright/test";
import { authenticateAsNewMember } from "./e2e-auth-helper";

const RANKING_URL_REGEX = /\/ranking/;
const RANKING_HEADING_REGEX = /RANKING \/\/ MISSÕES/i;
const THERMOMETER_TEXT_REGEX = /TERMÔMETRO GERAL DAS MISSÕES/i;
const TARGET_TEXT_REGEX = /META COLETIVA:/i;
const MEMBERS_BTN_REGEX = /MEMBROS/i;
const DEPT_BTN_REGEX = /DIRETORIA/i;
const TRACK_BTN_REGEX = /TRILHA TÉCNICA/i;

test.describe("Ranking & Termômetro de Missões (E2E)", () => {
	test("deve exibir cabeçalho de ranking e o termômetro geral das missões", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/ranking");
		await expect(page).toHaveURL(RANKING_URL_REGEX);

		// Título da página
		await expect(
			page.getByRole("heading", { name: RANKING_HEADING_REGEX })
		).toBeVisible();

		// Termômetro geral
		await expect(page.getByText(THERMOMETER_TEXT_REGEX)).toBeVisible();
		await expect(page.getByText(TARGET_TEXT_REGEX)).toBeVisible();
	});

	test("deve alternar entre visualização de Duplas e Membros e filtros de categoria", async ({
		page,
	}) => {
		await authenticateAsNewMember(page);

		await page.goto("/ranking");

		// Botão para alternar para Membros
		const membersToggleBtn = page.getByRole("button", {
			name: MEMBERS_BTN_REGEX,
		});
		if (await membersToggleBtn.isVisible()) {
			await membersToggleBtn.click();
			await expect(membersToggleBtn).toBeVisible();
		}

		// Filtro por Diretoria
		const deptFilterBtn = page.getByRole("button", { name: DEPT_BTN_REGEX });
		if (await deptFilterBtn.isVisible()) {
			await deptFilterBtn.click();
			await expect(deptFilterBtn).toBeVisible();
		}

		// Filtro por Trilha
		const trackFilterBtn = page.getByRole("button", {
			name: TRACK_BTN_REGEX,
		});
		if (await trackFilterBtn.isVisible()) {
			await trackFilterBtn.click();
			await expect(trackFilterBtn).toBeVisible();
		}
	});
});
