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

describe("Challenge & Pair Progression Router (Caixa-Cinza)", () => {
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

	it("deve permitir que membro da dupla avance da etapa 1 para a etapa 2", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			title: "Desafio Frontend Next.js",
		});

		const p = await createTestPair(testDb.db, {
			challengeId: chal.id,
			currentStep: 1,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const result = await caller.challenge.advanceStep({ pairId: p.id });
		expect(result.success).toBe(true);

		// Validação caixa-cinza direta no banco de dados
		const dbPair = await testDb.db.query.pair.findFirst({
			where: { id: p.id },
		});
		expect(dbPair?.currentStep).toBe(2);
	});

	it("deve bloquear tentativa de avanço de etapa por usuário que não pertence à dupla (FORBIDDEN)", async () => {
		const outsider = await createTestUser(testDb.db, {
			email: "outsider@orcestra.com",
			name: "Membro Forasteiro",
			role: "MEMBER",
		});

		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
		});

		const p = await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
		});

		const outsiderCaller = createTestCaller({
			db: testDb.db,
			persona: {
				department: outsider.department,
				email: outsider.email,
				id: outsider.id,
				name: outsider.name,
				role: outsider.role,
			},
		});

		await expect(
			outsiderCaller.challenge.advanceStep({ pairId: p.id })
		).rejects.toThrowError("Você não faz parte desta dupla");
	});

	it("deve permitir submissão de solução e avançar status para SUBMITTED e etapa para 3", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
		});

		const p = await createTestPair(testDb.db, {
			challengeId: chal.id,
			currentStep: 2,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "IN_PROGRESS",
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const submissionRes = await caller.challenge.submitSolution({
			pairId: p.id,
			prUrl: "https://github.com/orcestra/projeto/pull/42",
			repoUrl: "https://github.com/orcestra/projeto",
			submissionNotes: "Implementação completa com testes E2E",
			submissionType: "PR",
		});

		expect(submissionRes.success).toBe(true);

		// Validação caixa-cinza no banco
		const updatedPair = await testDb.db.query.pair.findFirst({
			where: { id: p.id },
		});

		expect(updatedPair?.status).toBe("SUBMITTED");
		expect(updatedPair?.currentStep).toBe(3);
		expect(updatedPair?.prUrl).toBe(
			"https://github.com/orcestra/projeto/pull/42"
		);
		expect(updatedPair?.submissionNotes).toBe(
			"Implementação completa com testes E2E"
		);
	});

	it("deve aplicar proteção anti-spoiler ocultando submissões alheias se o usuário ainda não submeteu", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			deadline: new Date(Date.now() + 86_400_000 * 5).toISOString(),
		});

		// Dupla A (memberPersona) - Em progresso, NÃO submeteu
		await createTestPair(testDb.db, {
			challengeId: chal.id,
			id: "pair_member_a",
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "IN_PROGRESS",
		});

		// Dupla B (outro membro) - Já submeteu com PR confidencial
		const otherMember = await createTestUser(testDb.db, {
			email: "other@orcestra.com",
			name: "Outro Desenvolvedor",
		});

		await createTestPair(testDb.db, {
			challengeId: chal.id,
			id: "pair_other_b",
			member1Id: otherMember.id,
			member2Id: adminPersona.id,
			prUrl: "https://github.com/secret/pull/1",
			status: "SUBMITTED",
			submissionNotes: "Solução ultra secreta",
		});

		// Membro A consulta o desafio
		const memberCaller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const challengeView = await memberCaller.challenge.getById({
			id: chal.id,
		});

		expect(challengeView.canViewAllSolutions).toBe(false);
		expect(challengeView.submissions).toHaveLength(1);

		const [otherSubmission] = challengeView.submissions;
		expect(otherSubmission?.isSpoilerLocked).toBe(true);
		expect(otherSubmission?.prUrl).toBeNull();
		expect(otherSubmission?.submissionNotes).toBeNull();
	});

	it("deve desbloquear visualização de soluções alheias quando o usuário já tiver submetido ou for ADMIN", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			deadline: new Date(Date.now() + 86_400_000 * 5).toISOString(),
		});

		// Dupla de outro membro já submetida
		const otherMember = await createTestUser(testDb.db, {
			email: "other2@orcestra.com",
			name: "Outro Desenvolvedor 2",
		});

		await createTestPair(testDb.db, {
			challengeId: chal.id,
			id: "pair_other_sub",
			member1Id: otherMember.id,
			member2Id: assessorPersona.id,
			prUrl: "https://github.com/secret/pull/99",
			status: "SUBMITTED",
			submissionNotes: "Segredo revelado para admin",
		});

		// 1. ADMIN consulta o desafio -> canViewAllSolutions = true
		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const adminView = await adminCaller.challenge.getById({ id: chal.id });
		expect(adminView.canViewAllSolutions).toBe(true);
		const [adminSub] = adminView.submissions;
		expect(adminSub?.isSpoilerLocked).toBe(false);
		expect(adminSub?.prUrl).toBe("https://github.com/secret/pull/99");
		expect(adminSub?.submissionNotes).toBe("Segredo revelado para admin");
	});

	it("deve listar apenas desafios ativos e com totais computados", async () => {
		// Desafio 1 Ativo
		await createTestChallenge(testDb.db, {
			active: true,
			assessorId: assessorPersona.id,
			title: "Desafio Ativo 1",
		});

		// Desafio 2 Inativo
		await createTestChallenge(testDb.db, {
			active: false,
			assessorId: assessorPersona.id,
			title: "Desafio Inativo 2",
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const activeChallenges = await caller.challenge.listActive();
		expect(activeChallenges).toHaveLength(1);
		const [firstActive] = activeChallenges;
		expect(firstActive?.title).toBe("Desafio Ativo 1");
		expect(firstActive?.totalPairs).toBeDefined();
	});

	it("deve retornar as duplas do usuário autenticado (myPairs) com os parceiros corretos", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			title: "Desafio com Parceiro",
		});

		await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const pairs = await caller.challenge.myPairs();
		expect(pairs).toHaveLength(1);
		const [firstPair] = pairs;
		expect(firstPair?.partners).toHaveLength(1);
		expect(firstPair?.partners[0]?.id).toBe(assessorPersona.id);
		expect(firstPair?.challenge.title).toBe("Desafio com Parceiro");
	});
});
