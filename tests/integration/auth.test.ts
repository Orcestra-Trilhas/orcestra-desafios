import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedPersona } from "../helpers/factories";
import {
	adminPersona,
	assessorPersona,
	memberPersona,
} from "../helpers/personas";
import { createTestCaller } from "../helpers/test-context";
import { createTestDatabase, type TestDbInstance } from "../helpers/test-db";

describe("Auth & Role-Based Access Control (Caixa-Cinza)", () => {
	let testDb: TestDbInstance;

	beforeAll(async () => {
		testDb = await createTestDatabase();
	});

	afterAll(async () => {
		await testDb.close();
	});

	beforeEach(async () => {
		await testDb.reset();
		await seedPersona(testDb.db, adminPersona);
		await seedPersona(testDb.db, memberPersona);
		await seedPersona(testDb.db, assessorPersona);
	});

	it("deve permitir requisições públicas sem autenticação (healthCheck)", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "unauthenticated",
		});

		const result = await caller.healthCheck();
		expect(result).toBe("OK");
	});

	it("deve bloquear acesso a procedures protegidas para chamadas não autenticadas", async () => {
		const unauthCaller = createTestCaller({
			db: testDb.db,
			persona: "unauthenticated",
		});

		await expect(unauthCaller.user.me()).rejects.toThrowError(
			"Autenticação necessária"
		);
	});

	it("deve permitir acesso a procedures protegidas para membro autenticado", async () => {
		const memberCaller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const me = await memberCaller.user.me();
		expect(me.id).toBe(memberPersona.id);
		expect(me.email).toBe(memberPersona.email);
		expect(me.role).toBe("MEMBER");
	});

	it("deve bloquear acesso a procedures administrativas para membro comum (FORBIDDEN)", async () => {
		const memberCaller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		await expect(
			memberCaller.admin.createChallenge({
				active: true,
				assessorId: adminPersona.id,
				deadline: new Date().toISOString(),
				description: "Desafio não autorizado",
				pointsReward: 50,
				rulesMarkdown: "Regras",
				title: "Tentativa de Criação por Membro",
				trackTheme: "FRONT",
			})
		).rejects.toThrowError("Acesso restrito para administradores");
	});

	it("deve permitir acesso a procedures administrativas para persona com papel ADMIN", async () => {
		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const newChallenge = await adminCaller.admin.createChallenge({
			active: true,
			assessorId: adminPersona.id,
			deadline: new Date(Date.now() + 86_400_000).toISOString(),
			description: "Desafio criado por admin com sucesso",
			pointsReward: 150,
			rulesMarkdown: "Regras oficiais",
			title: "Desafio Oficial do Admin",
			trackTheme: "BACK",
		});

		expect(newChallenge.success).toBe(true);
		expect(newChallenge.id).toBeDefined();

		// Asserção caixa-cinza direta no banco de dados
		const dbChallenge = await testDb.db.query.challenge.findFirst({
			where: (c, { eq }) => eq(c.id, newChallenge.id),
		});

		expect(dbChallenge).toBeDefined();
		expect(dbChallenge?.title).toBe("Desafio Oficial do Admin");
		expect(dbChallenge?.pointsReward).toBe(150);
	});

	it("deve validar que um usuário com role ADMIN possui privilégios de diretoria", async () => {
		const adminUser = await testDb.db.query.user.findFirst({
			where: (u, { eq }) => eq(u.role, "ADMIN"),
		});

		expect(adminUser).toBeDefined();
		expect(adminUser?.role).toBe("ADMIN");
		expect(adminUser?.department).toBe("TOPS");
	});
});
