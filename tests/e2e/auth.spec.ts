import { expect, test } from "@playwright/test";

const LOGIN_URL_REGEX = /\/login/;
const DASHBOARD_URL_REGEX = /\/dashboard/;
const AUTH_HEADING_REGEX = /CADASTRO|ACESSO/i;
const SWITCH_SIGN_IN_REGEX = /já tem uma conta\? acesse aqui|acesse aqui/i;
const SIGN_IN_HEADING_REGEX = /ACESSO \/\/ MEMBROS/i;
const SWITCH_SIGN_UP_REGEX = /crie seu perfil aqui/i;
const SIGN_UP_HEADING_REGEX = /CADASTRO \/\/ EJ/i;
const SUBMIT_SIGN_IN_REGEX = /ENTRAR NA PLATAFORMA/i;
const SUBMIT_SIGN_UP_REGEX = /CRIAR CONTA/i;

test.describe("Autenticação e Controle de Acesso (E2E)", () => {
	test("deve redirecionar usuário não autenticado para /login ao tentar acessar /dashboard", async ({
		page,
	}) => {
		await page.goto("/dashboard");
		await expect(page).toHaveURL(LOGIN_URL_REGEX);
		await expect(
			page.getByRole("heading", { name: AUTH_HEADING_REGEX })
		).toBeVisible();
	});

	test("deve alternar entre o formulário de cadastro e o de login", async ({
		page,
	}) => {
		await page.goto("/login");

		// Por padrão abre no cadastro
		const switchSignInBtn = page.getByRole("button", {
			name: SWITCH_SIGN_IN_REGEX,
		});

		if (await switchSignInBtn.isVisible()) {
			await switchSignInBtn.click();
			await expect(
				page.getByRole("heading", { name: SIGN_IN_HEADING_REGEX })
			).toBeVisible();

			// Alterna de volta para cadastro
			const switchSignUpBtn = page.getByRole("button", {
				name: SWITCH_SIGN_UP_REGEX,
			});
			await switchSignUpBtn.click();
			await expect(
				page.getByRole("heading", { name: SIGN_UP_HEADING_REGEX })
			).toBeVisible();
		} else {
			// Se estiver em login por padrão
			const switchSignUpBtn = page.getByRole("button", {
				name: SWITCH_SIGN_UP_REGEX,
			});
			await switchSignUpBtn.click();
			await expect(
				page.getByRole("heading", { name: SIGN_UP_HEADING_REGEX })
			).toBeVisible();
		}
	});

	test("deve validar campos obrigatórios no formulário de acesso", async ({
		page,
	}) => {
		await page.goto("/login");

		// Garante que está no formulário de login
		const switchBtn = page.getByRole("button", {
			name: SWITCH_SIGN_IN_REGEX,
		});
		if (await switchBtn.isVisible()) {
			await switchBtn.click();
		}

		// Tenta submeter sem preencher nada
		const submitBtn = page.getByRole("button", {
			name: SUBMIT_SIGN_IN_REGEX,
		});
		await submitBtn.click();

		// O input email deve ter validação nativa required
		const emailInput = page.locator("#email");
		await expect(emailInput).toHaveAttribute("required", "");
	});

	test("deve cadastrar um novo membro e redirecionar para o dashboard", async ({
		page,
	}) => {
		await page.goto("/login");

		// Garante que está no formulário de cadastro
		const signUpHeading = page.getByRole("heading", {
			name: SIGN_UP_HEADING_REGEX,
		});
		if (!(await signUpHeading.isVisible())) {
			await page.getByRole("button", { name: SWITCH_SIGN_UP_REGEX }).click();
		}

		const uniqueEmail = `test.e2e.${Date.now()}@orcestra.com`;

		await page.locator("#name").fill("Desenvolvedor E2E Test");
		await page.locator("#email").fill(uniqueEmail);
		await page.locator("#password").fill("senha123456");

		// Clica em criar conta
		const submitBtn = page.getByRole("button", { name: SUBMIT_SIGN_UP_REGEX });
		await submitBtn.click();

		// Deve redirecionar para /dashboard com sucesso
		await expect(page).toHaveURL(DASHBOARD_URL_REGEX, { timeout: 15_000 });
	});
});

