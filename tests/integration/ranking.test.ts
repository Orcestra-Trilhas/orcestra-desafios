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

describe("Ranking & Leaderboard Router (Caixa-Cinza)", () => {
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

	it("deve retornar o ranking individual (MEMBERS) ordenado por pontos decrescentes", async () => {
		// Persona admin: 100 pontos
		// Persona assessor: 50 pontos
		// Persona member: 0 pontos
		// Adiciona mais um usuário com 150 pontos
		await createTestUser(testDb.db, {
			email: "top1@orcestra.com",
			name: "Mestre dos Pontos",
			points: 150,
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const leaderboard = await caller.ranking.getLeaderboard({
			category: "ALL",
			viewMode: "MEMBERS",
		});

		expect(leaderboard.viewMode).toBe("MEMBERS");
		expect(leaderboard.totalCount).toBe(4);

		const [first, second, third] = leaderboard.top3;
		expect(first?.name).toBe("Mestre dos Pontos");
		expect(first?.points).toBe(150);
		expect(second?.name).toBe("Administrador SOTA");
		expect(second?.points).toBe(100);
		expect(third?.name).toBe("Assessor Técnico SOTA");
		expect(third?.points).toBe(80);

		expect(leaderboard.ranked).toHaveLength(1);
		const [fourth] = leaderboard.ranked;
		expect(fourth?.name).toBe("Membro SOTA");
		expect(fourth?.points).toBe(25);
	});

	it("deve filtrar o ranking individual por departamento", async () => {
		// memberPersona é DIPROJ, adminPersona é TOPS, assessorPersona é DIBIS
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const diprojLeaderboard = await caller.ranking.getLeaderboard({
			category: "DEPARTMENT",
			filterValue: "DIPROJ",
			viewMode: "MEMBERS",
		});

		expect(diprojLeaderboard.totalCount).toBe(1);
		const [first] = diprojLeaderboard.top3;
		expect(first?.id).toBe(memberPersona.id);
	});

	it("deve ordenar e pontuar duplas corretamente (PAIRS) baseado no status e etapa", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			pointsReward: 100,
		});

		// Dupla 1: APPROVED -> 100 pontos
		const pairApproved = await createTestPair(testDb.db, {
			challengeId: chal.id,
			id: "pair_appr",
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "APPROVED",
		});

		// Dupla 2: SUBMITTED -> 70 pontos (70%)
		const userSub1 = await createTestUser(testDb.db, {
			email: "sub1@orcestra.com",
		});
		const userSub2 = await createTestUser(testDb.db, {
			email: "sub2@orcestra.com",
		});
		const pairSubmitted = await createTestPair(testDb.db, {
			challengeId: chal.id,
			id: "pair_subm",
			member1Id: userSub1.id,
			member2Id: userSub2.id,
			status: "SUBMITTED",
		});

		// Dupla 3: Step 2 em progresso -> 30 pontos (30%)
		const userStep1 = await createTestUser(testDb.db, {
			email: "step1@orcestra.com",
		});
		const userStep2 = await createTestUser(testDb.db, {
			email: "step2@orcestra.com",
		});
		const pairStep2 = await createTestPair(testDb.db, {
			challengeId: chal.id,
			currentStep: 2,
			id: "pair_step2",
			member1Id: userStep1.id,
			member2Id: userStep2.id,
			status: "IN_PROGRESS",
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const pairsLeaderboard = await caller.ranking.getLeaderboard({
			category: "ALL",
			viewMode: "PAIRS",
		});

		expect(pairsLeaderboard.viewMode).toBe("PAIRS");
		expect(pairsLeaderboard.totalCount).toBe(3);

		const [first, second, third] = pairsLeaderboard.top3;
		expect(first?.id).toBe(pairApproved.id);
		expect(first?.score).toBe(100);

		expect(second?.id).toBe(pairSubmitted.id);
		expect(second?.score).toBe(70);

		expect(third?.id).toBe(pairStep2.id);
		expect(third?.score).toBe(30);
	});

	it("deve calcular o termômetro do sprint com progresso ponderado", async () => {
		const chal = await createTestChallenge(testDb.db, {
			active: true,
			assessorId: assessorPersona.id,
		});

		// 1 aprovada (peso 1) + 1 submetida (peso 0.5) em 2 duplas = (1 + 0.5) / 2 = 75%
		await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
			status: "APPROVED",
		});

		const otherUser1 = await createTestUser(testDb.db, {
			email: "th1@orcestra.com",
		});
		const otherUser2 = await createTestUser(testDb.db, {
			email: "th2@orcestra.com",
		});
		await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: otherUser1.id,
			member2Id: otherUser2.id,
			status: "SUBMITTED",
		});

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const thermometer = await caller.ranking.getSprintThermometer();

		expect(thermometer.total).toBe(2);
		expect(thermometer.completed).toBe(1);
		expect(thermometer.submitted).toBe(1);
		expect(thermometer.percentage).toBe(75);
	});
});
