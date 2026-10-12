import { user } from "@orcestra-desafios/db";
import { eq } from "drizzle-orm";
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

const INSUFFICIENT_MEMBERS_REGEX =
	/Membros insuficientes na trilha deste desafio \(PROTOTIPACAO\)/;
const ALREADY_ALLOCATED_REGEX = /já estão alocados em outra dupla/;
const SAME_MEMBER_REGEX = /não podem ser a mesma pessoa/;
const ADMIN_CANNOT_PARTICIPATE_REGEX =
	/Administradores não podem participar de duplas/;
const ASSESSOR_CANNOT_BE_MEMBER_REGEX =
	/O avaliador do desafio não pode ser alocado/;

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

	it("deve parear membro de maior conhecimento com membro de menor conhecimento segundo a planilha e pontos (Issue #4)", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			trackTheme: "DEVOPS",
		});

		// Configura as personas pré-existentes para outra trilha para que apenas os 4 membros de DevOps participem deste teste
		await testDb.db
			.update(user)
			.set({ trackPreferences: JSON.stringify(["FRONT"]) })
			.where(eq(user.id, adminPersona.id));
		await testDb.db
			.update(user)
			.set({ trackPreferences: JSON.stringify(["FRONT"]) })
			.where(eq(user.id, memberPersona.id));
		await testDb.db
			.update(user)
			.set({ trackPreferences: JSON.stringify(["FRONT"]) })
			.where(eq(user.id, assessorPersona.id));

		// Cria 4 usuários com nomes conhecidos da planilha
		// Eduardo L. = 90%
		const u1 = await createTestUser(testDb.db, {
			email: "edul@orcestra.com",
			name: "Eduardo L.",
			points: 10,
			trackPreferences: JSON.stringify(["DEVOPS"]),
		});

		// Faby = 50%
		const u2 = await createTestUser(testDb.db, {
			email: "faby@orcestra.com",
			name: "Faby",
			points: 0,
			trackPreferences: JSON.stringify(["DEVOPS"]),
		});

		// Lucas N. = 25%
		const u3 = await createTestUser(testDb.db, {
			email: "lucasn@orcestra.com",
			name: "Lucas N.",
			points: 5,
			trackPreferences: JSON.stringify(["DEVOPS"]),
		});

		// Carlos = 0%
		const u4 = await createTestUser(testDb.db, {
			email: "carlos@orcestra.com",
			name: "Carlos",
			points: 0,
			trackPreferences: JSON.stringify(["DEVOPS"]),
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const drawRes = await adminCaller.admin.drawPairs({
			challengeId: chal.id,
		});

		expect(drawRes.success).toBe(true);

		const createdPairs = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});

		expect(createdPairs).toHaveLength(2);

		// Par 1 deve ter o de maior conhecimento (Eduardo L. [score 100]) pareado com o de menor (Carlos [score 0])
		const pairWithU1 = createdPairs.find(
			(p) => p.member1Id === u1.id || p.member2Id === u1.id
		);
		expect(pairWithU1).toBeDefined();
		const u1PartnerId =
			pairWithU1?.member1Id === u1.id
				? pairWithU1?.member2Id
				: pairWithU1?.member1Id;
		expect(u1PartnerId).toBe(u4.id); // Carlos

		// Par 2 deve ter Faby (score 50) com Lucas N. (score 30)
		const pairWithU2 = createdPairs.find(
			(p) => p.member1Id === u2.id || p.member2Id === u2.id
		);
		expect(pairWithU2).toBeDefined();
		const u2PartnerId =
			pairWithU2?.member1Id === u2.id
				? pairWithU2?.member2Id
				: pairWithU2?.member1Id;
		expect(u2PartnerId).toBe(u3.id); // Lucas N.
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

	it("deve excluir desafio com sucesso, remover suas duplas e registrar log de auditoria", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			title: "Desafio Para Deletar",
			trackTheme: "BACK",
		});

		// Cria uma dupla para este desafio
		await createTestPair(testDb.db, {
			challengeId: chal.id,
			member1Id: memberPersona.id,
			member2Id: assessorPersona.id,
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const deleteRes = await adminCaller.admin.deleteChallenge({
			id: chal.id,
		});

		expect(deleteRes.success).toBe(true);

		// Verifica que o desafio não existe mais
		const dbChal = await testDb.db.query.challenge.findFirst({
			where: { id: chal.id },
		});
		expect(dbChal).toBeUndefined();

		// Verifica que as duplas associadas foram excluídas
		const dbPairs = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});
		expect(dbPairs).toHaveLength(0);

		// Verifica log de auditoria
		const log = await testDb.db.query.adminLog.findFirst({
			where: { action: "DELETOU_DESAFIO" },
		});
		expect(log).toBeDefined();
		expect(log?.actorId).toBe(adminPersona.id);
	});

	it("deve lançar NOT_FOUND ao tentar excluir desafio inexistente", async () => {
		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		await expect(
			adminCaller.admin.deleteChallenge({
				id: "id-inexistente",
			})
		).rejects.toThrow("Desafio não encontrado");
	});

	it("não deve permitir que membro comum exclua desafio", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
		});

		const memberCaller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		await expect(
			memberCaller.admin.deleteChallenge({
				id: chal.id,
			})
		).rejects.toThrow();
	});

	it("não deve sortear membros de outras trilhas e deve falhar se houver menos de 2 membros na trilha", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			trackTheme: "PROTOTIPACAO",
		});

		// Configura todos os usuários existentes para trilhas diferentes de PROTOTIPACAO
		await testDb.db
			.update(user)
			.set({ trackPreferences: JSON.stringify(["FRONT"]) })
			.where(eq(user.id, memberPersona.id));

		// Cria apenas 1 usuário na trilha PROTOTIPACAO
		await createTestUser(testDb.db, {
			name: "Faby",
			role: "MEMBER",
			trackPreferences: JSON.stringify(["PROTOTIPACAO"]),
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		// Deve lançar erro e NÃO puxar quem é de FRONT
		await expect(
			adminCaller.admin.drawPairs({
				challengeId: chal.id,
			})
		).rejects.toThrow(INSUFFICIENT_MEMBERS_REGEX);

		const pairsCount = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});
		expect(pairsCount).toHaveLength(0);
	});

	it("deve alocar duplas manualmente (allocatePair) e impedir duplicações", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			trackTheme: "FRONT",
		});

		const u1 = await createTestUser(testDb.db, {
			name: "Membro A",
			role: "MEMBER",
			trackPreferences: JSON.stringify(["FRONT"]),
		});
		const u2 = await createTestUser(testDb.db, {
			name: "Membro B",
			role: "MEMBER",
			trackPreferences: JSON.stringify(["FRONT"]),
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		// 1. Aloca com sucesso
		const allocRes = await adminCaller.admin.allocatePair({
			challengeId: chal.id,
			member1Id: u1.id,
			member2Id: u2.id,
		});

		expect(allocRes.success).toBe(true);
		expect(allocRes.pair).toBeDefined();

		// 2. Tenta alocar os mesmos membros novamente (deve falhar)
		await expect(
			adminCaller.admin.allocatePair({
				challengeId: chal.id,
				member1Id: u1.id,
				member2Id: u2.id,
			})
		).rejects.toThrow(ALREADY_ALLOCATED_REGEX);

		// 3. Tenta alocar a mesma pessoa como member1 e member2
		await expect(
			adminCaller.admin.allocatePair({
				challengeId: chal.id,
				member1Id: u1.id,
				member2Id: u1.id,
			})
		).rejects.toThrow(SAME_MEMBER_REGEX);

		// 4. Tenta alocar usuário com role ADMIN
		const adminUser = await createTestUser(testDb.db, {
			name: "Admin Dani",
			role: "ADMIN",
		});
		const freshMember = await createTestUser(testDb.db, {
			name: "Fresh Member",
			role: "MEMBER",
		});
		await expect(
			adminCaller.admin.allocatePair({
				challengeId: chal.id,
				member1Id: adminUser.id,
				member2Id: freshMember.id,
			})
		).rejects.toThrow(ADMIN_CANNOT_PARTICIPATE_REGEX);

		// 5. Tenta alocar o próprio assessor do desafio (mesmo se fosse role MEMBER)
		const assessorMember = await createTestUser(testDb.db, {
			name: "Assessor Membro",
			role: "MEMBER",
		});
		const chalWithMemberAssessor = await createTestChallenge(testDb.db, {
			assessorId: assessorMember.id,
			trackTheme: "FRONT",
		});
		await expect(
			adminCaller.admin.allocatePair({
				challengeId: chalWithMemberAssessor.id,
				member1Id: assessorMember.id,
				member2Id: freshMember.id,
			})
		).rejects.toThrow(ASSESSOR_CANNOT_BE_MEMBER_REGEX);
	});

	it("deve desortear duplas do desafio (clearPairs) e excluir dupla individual (deletePair)", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			trackTheme: "FRONT",
		});

		const u1 = await createTestUser(testDb.db, { name: "M1", role: "MEMBER" });
		const u2 = await createTestUser(testDb.db, { name: "M2", role: "MEMBER" });
		const u3 = await createTestUser(testDb.db, { name: "M3", role: "MEMBER" });
		const u4 = await createTestUser(testDb.db, { name: "M4", role: "MEMBER" });

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const p1 = await adminCaller.admin.allocatePair({
			challengeId: chal.id,
			member1Id: u1.id,
			member2Id: u2.id,
		});
		await adminCaller.admin.allocatePair({
			challengeId: chal.id,
			member1Id: u3.id,
			member2Id: u4.id,
		});

		let pairsInDb = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});
		expect(pairsInDb).toHaveLength(2);

		// 1. Deleta uma dupla individual
		const delSingleRes = await adminCaller.admin.deletePair({
			pairId: p1.pair.id,
		});
		expect(delSingleRes.success).toBe(true);

		pairsInDb = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});
		expect(pairsInDb).toHaveLength(1);

		// 2. Desorteia / limpa todas as duplas do desafio
		const clearRes = await adminCaller.admin.clearPairs({
			challengeId: chal.id,
		});
		expect(clearRes.success).toBe(true);
		expect(clearRes.clearedCount).toBe(1);

		pairsInDb = await testDb.db.query.pair.findMany({
			where: { challengeId: chal.id },
		});
		expect(pairsInDb).toHaveLength(0);
	});

	it("deve listar membros para o desafio sinalizando se pertencem à trilha e se já foram alocados (listMembersForChallenge)", async () => {
		const chal = await createTestChallenge(testDb.db, {
			assessorId: assessorPersona.id,
			trackTheme: "PROTOTIPACAO",
		});

		const faby = await createTestUser(testDb.db, {
			name: "Faby",
			role: "MEMBER",
			trackPreferences: JSON.stringify(["PROTOTIPACAO"]),
		});

		const carlos = await createTestUser(testDb.db, {
			name: "Carlos",
			role: "MEMBER",
			trackPreferences: JSON.stringify(["BACK"]),
		});

		const adminCaller = createTestCaller({
			db: testDb.db,
			persona: "admin",
		});

		const listRes = await adminCaller.admin.listMembersForChallenge({
			challengeId: chal.id,
		});

		expect(listRes.challengeTrack).toBe("PROTOTIPACAO");
		const fabyItem = listRes.members.find((m) => m.id === faby.id);
		const carlosItem = listRes.members.find((m) => m.id === carlos.id);

		expect(fabyItem?.isMatchingTrack).toBe(true);
		expect(fabyItem?.isAssigned).toBe(false);

		expect(carlosItem?.isMatchingTrack).toBe(false);
		expect(carlosItem?.isAssigned).toBe(false);
	});
});
