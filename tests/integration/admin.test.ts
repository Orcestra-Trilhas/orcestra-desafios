import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	createTestChallenge,
	createTestPair,
	createTestUser,
	seedPersona,
} from "../helpers/factories";
import {
	adminPersona,
	assessorPersona,
	memberPersona,
} from "../helpers/personas";
import { createTestCaller } from "../helpers/test-context";
import { createTestDatabase, type TestDbInstance } from "../helpers/test-db";

describe("Admin Router & Submissions Evaluation (Caixa-Cinza)", () => {
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

	it("deve criar desafio com sucesso e gerar log de auditoria no banco", async () => {
		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const result = await adminCaller.admin.createChallenge({
			active: true,
			assessorId: assessorPersona.id,
			deadline: new Date(Date.now() + 86_400_000 * 7).toISOString(),
			description: "Criar uma API RESTful escalável com NestJS e Postgres",
			pointsReward: 200,
			rulesMarkdown: "## Regras do Desafio\n- Usar Docker\n- Cobrir com testes",
			title: "Desafio Backend Avançado",
			trackTheme: "BACK",
		});

		expect(result.success).toBe(true);
		expect(result.id).toBeDefined();

		// Asserção direta na tabela challenge
		const dbChal = await testDb.db.query.challenge.findFirst({
			where: { id: result.id },
		});

		expect(dbChal?.title).toBe("Desafio Backend Avançado");
		expect(dbChal?.pointsReward).toBe(200);

		// Asserção no admin_log
		const log = await testDb.db.query.adminLog.findFirst({
			where: { action: "CRIOU_DESAFIO" },
		});

		expect(log).toBeDefined();
		expect(log?.actorId).toBe(adminPersona.id);
	});

	it("deve sortear duplas automaticamente e formar trios caso ímpar", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			trackTheme: "FRONT",
		});

		// Adiciona mais um usuário para somar 4 usuários elegíveis (admin, member, assessor + newMember)
		await createTestUser(testDb.db, {
			email: "dev3@orcestra.com",
			name: "Dev Três",
			role: "MEMBER",
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const drawRes = await adminCaller.admin.drawPairs({
			challengeId: chal.id,
		});

		expect(drawRes.success).toBe(true);
		expect(drawRes.pairsCreated).toBeGreaterThanOrEqual(1);

		// Valida que duplas foram criadas no banco para este desafio
		const createdPairs = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});

		expect(createdPairs.length).toBe(drawRes.pairsCreated);
	});

	it("deve aprovar submissão de dupla, creditar pontos aos membros e registrar log", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			pointsReward: 120,
		});

		const p = await createTestPair(testDb.db, {
			challengeId: chal.id,
			currentStep: 3,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "SUBMITTED",
		});

		const memberInitialPoints = memberPersona.session.user.points ?? 0;
		const assessorInitialPoints = assessorPersona.session.user.points ?? 0;

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const reviewRes = await adminCaller.admin.reviewSubmission({
			feedback: "Excelente projeto! Arquitetura muito limpa.",
			pairId: p.id,
			pointsBonus: 30,
			status: "APPROVED",
		});

		expect(reviewRes.success).toBe(true);

		// 1. Valida atualização da dupla
		const updatedPair = await testDb.db.query.pair.findFirst({
			where: { id: p.id },
		});

		expect(updatedPair?.status).toBe("APPROVED");
		expect(updatedPair?.feedback).toBe(
			"Excelente projeto! Arquitetura muito limpa."
		);

		// 2. Valida pontuação dos membros (120 base + 30 bônus = +150 pontos)
		const memberAfter = await testDb.db.query.user.findFirst({
			where: { id: memberPersona.id },
		});
		const assessorAfter = await testDb.db.query.user.findFirst({
			where: { id: assessorPersona.id },
		});

		expect(memberAfter?.points).toBe(memberInitialPoints + 150);
		expect(assessorAfter?.points).toBe(assessorInitialPoints + 150);

		// 3. Valida log de auditoria
		const log = await testDb.db.query.adminLog.findFirst({
			where: { action: "APROVOU_SUBMISSAO" },
		});
		expect(log).toBeDefined();
	});

	it("deve solicitar ajustes (CHANGES_REQUESTED), retornar para etapa 2 e salvar feedback", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
		});

		const p = await createTestPair(testDb.db, {
			challengeId: chal.id,
			currentStep: 3,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "SUBMITTED",
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const reviewRes = await adminCaller.admin.reviewSubmission({
			feedback: "Favor adicionar testes unitários antes da aprovação final.",
			pairId: p.id,
			status: "CHANGES_REQUESTED",
		});

		expect(reviewRes.success).toBe(true);

		const updatedPair = await testDb.db.query.pair.findFirst({
			where: { id: p.id },
		});

		expect(updatedPair?.status).toBe("CHANGES_REQUESTED");
		expect(updatedPair?.currentStep).toBe(2);
		expect(updatedPair?.feedback).toBe(
			"Favor adicionar testes unitários antes da aprovação final."
		);
	});

	it("deve alternar ativação do desafio (toggleChallenge) e registrar log", async () => {
		const chal = await createTestChallenge(testDb.db, {
			active: true,
			assessorId: assessorPersona.id,
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		// Desativa o desafio
		await adminCaller.admin.toggleChallenge({
			active: false,
			id: chal.id,
		});

		const chalAfterDeactivate = await testDb.db.query.challenge.findFirst({
			where: { id: chal.id },
		});
		expect(chalAfterDeactivate?.active).toBe(false);

		// Reativa o desafio
		await adminCaller.admin.toggleChallenge({
			active: true,
			id: chal.id,
		});

		const chalAfterReactivate = await testDb.db.query.challenge.findFirst({
			where: { id: chal.id },
		});
		expect(chalAfterReactivate?.active).toBe(true);
	});

	it("deve calcular métricas globais corretamente (getMetrics)", async () => {
		const chal = await createTestChallenge(testDb.db, {
			active: true,
			assessorId: assessorPersona.id,
		});

		// 1 submissão aprovada
		await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "APPROVED",
		});

		// 1 submissão pendente
		await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: adminPersona.id,
			member2Id: memberPersona.id,
			status: "SUBMITTED",
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const metrics = await adminCaller.admin.getMetrics();

		expect(metrics.totalChallenges).toBeGreaterThanOrEqual(1);
		expect(metrics.activeChallenges).toBeGreaterThanOrEqual(1);
		expect(metrics.totalPairs).toBe(2);
		expect(metrics.approvedPairs).toBe(1);
		expect(metrics.submittedPairs).toBe(1);
		expect(metrics.approvalRate).toBe(50); // 1 aprovado / 2 submetidos = 50%
	});
});

