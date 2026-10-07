import { test as setup } from "@playwright/test";

setup("setup dev environment and test accounts", async ({ request }) => {
	// Chamada de aquecimento para garantir que o servidor Next.js e banco estão prontos
	const res = await request.get("/api/auth/get-session");
	// Mesmo que retorne 200 com null ou 401, confirma que o servidor está respondendo
	setup.info().annotations.push({
		description: `Status de resposta inicial: ${res.status()}`,
		type: "readiness",
	});
});
