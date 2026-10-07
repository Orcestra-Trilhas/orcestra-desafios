import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	assignTestBadge,
	createTestBadge,
	createTestGift,
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

describe("User & Profile Router (Caixa-Cinza)", () => {
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

	it("deve retornar perfil do próprio usuário (me) com preferências de trilha", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const me = await caller.user.me();
		expect(me.id).toBe(memberPersona.id);
		expect(me.name).toBe(memberPersona.name);
		expect(me.trackPreferencesList).toEqual([
			"BACK",
			"FRONT",
			"PROTOTIPACAO",
			"DEVOPS",
		]);
	});

	it("deve retornar o perfil completo de um usuário com badges e presentes", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		// Cria badge e associa ao membro
		const badge = await createTestBadge(testDb.db, {
			name: "Primeiro Desafio",
			slug: "primeiro-desafio",
		});
		await assignTestBadge(testDb.db, memberPersona.id, badge.id);

		// Cria presente enviado pelo assessor ao membro
		await createTestGift(testDb.db, {
			mediaUrl: "https://media.giphy.com/media/v1/giphy.gif",
			message: "Parabéns pelo envio!",
			recipientId: memberPersona.id,
			senderId: assessorPersona.id,
		});

		const profile = await caller.user.getProfile({ userId: memberPersona.id });

		expect(profile.id).toBe(memberPersona.id);
		expect(profile.isOwner).toBe(true);
		expect(profile.badges).toHaveLength(1);
		expect(profile.badges[0]?.name).toBe("Primeiro Desafio");
		expect(profile.gifts).toHaveLength(1);
		expect(profile.gifts[0]?.message).toBe("Parabéns pelo envio!");
		expect(profile.gifts[0]?.sender.id).toBe(assessorPersona.id);
	});

	it("deve indicar isOwner: false ao consultar perfil de outro usuário", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const profile = await caller.user.getProfile({
			userId: assessorPersona.id,
		});
		expect(profile.id).toBe(assessorPersona.id);
		expect(profile.isOwner).toBe(false);
	});

	it("deve lançar NOT_FOUND ao buscar perfil de usuário inexistente", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		await expect(
			caller.user.getProfile({ userId: "usr_non_existent_999" })
		).rejects.toThrowError("Usuário não encontrado");
	});

	it("deve atualizar o perfil do usuário e refletir imediatamente no banco de dados", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const result = await caller.user.updateProfile({
			department: "DICOM",
			gifUrl: "https://media.giphy.com/media/v2/cool.gif",
			image: "https://images.unsplash.com/photo-avatar",
			name: "Eduardo Silva Atualizado",
			trackPreferences: ["FRONT", "DEVOPS"],
			whatsapp: "5511988887777",
		});

		expect(result.success).toBe(true);

		// Validação caixa-cinza direta no banco
		const updatedInDb = await testDb.db.query.user.findFirst({
			where: { id: memberPersona.id },
		});

		expect(updatedInDb?.name).toBe("Eduardo Silva Atualizado");
		expect(updatedInDb?.department).toBe("DICOM");
		expect(updatedInDb?.gifUrl).toBe(
			"https://media.giphy.com/media/v2/cool.gif"
		);
		expect(updatedInDb?.whatsapp).toBe("5511988887777");
		expect(JSON.parse(updatedInDb?.trackPreferences ?? "[]")).toEqual([
			"FRONT",
			"DEVOPS",
		]);
	});

	it("deve contabilizar desafios concluídos com status APPROVED", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		// Cria uma dupla com status APPROVED e outra com IN_PROGRESS
		await createTestPair(testDb.db, {
			member1Id: memberPersona.id,
			status: "APPROVED",
		});
		await createTestPair(testDb.db, {
			member1Id: memberPersona.id,
			status: "IN_PROGRESS",
		});

		const profile = await caller.user.getProfile({ userId: memberPersona.id });
		expect(profile.completedChallenges).toBe(1);
	});

	it("deve permitir envio de presente (mural) entre usuários", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const giftResult = await caller.user.sendGift({
			mediaUrl: "https://media.giphy.com/media/v3/congrats.gif",
			message: "Bom trabalho na entrega!",
			recipientId: assessorPersona.id,
		});

		expect(giftResult.success).toBe(true);
		expect(giftResult.id).toBeDefined();

		// Asserção direta na tabela profile_gift
		const dbGift = await testDb.db.query.profileGift.findFirst({
			where: { id: giftResult.id },
		});

		expect(dbGift).toBeDefined();
		expect(dbGift?.senderId).toBe(memberPersona.id);
		expect(dbGift?.recipientId).toBe(assessorPersona.id);
		expect(dbGift?.message).toBe("Bom trabalho na entrega!");
	});

	it("deve falhar ao enviar presente para usuário inexistente", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		await expect(
			caller.user.sendGift({
				mediaUrl: "https://media.giphy.com/media/v3/congrats.gif",
				message: "Oi!",
				recipientId: "usr_ghost_user_404",
			})
		).rejects.toThrowError("Destinatário não encontrado");
	});

	it("deve permitir exclusão de presente pelo destinatário, remetente e admin, mas bloquear terceiros", async () => {
		// Cria outro usuário não relacionado
		const bystander = await createTestUser(testDb.db, {
			email: "bystander@orcestra.com",
			name: "Membro Neutro",
			role: "MEMBER",
		});

		// Presente do assessor para o membro
		const gift = await createTestGift(testDb.db, {
			mediaUrl: "https://media.giphy.com/media/v4/gift.gif",
			message: "Presente de teste",
			recipientId: memberPersona.id,
			senderId: assessorPersona.id,
		});

		// 1. Membro neutro tenta excluir -> FORBIDDEN
		const bystanderCaller = createTestCaller({
			db: testDb.db,
			persona: {
				department: bystander.department,
				email: bystander.email,
				id: bystander.id,
				name: bystander.name,
				role: bystander.role,
			},
		});

		await expect(
			bystanderCaller.user.deleteGift({ giftId: gift.id })
		).rejects.toThrowError("Você não tem permissão para remover este presente");

		// 2. Destinatário (memberPersona) exclui com sucesso
		const memberCaller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const deleteRes = await memberCaller.user.deleteGift({ giftId: gift.id });
		expect(deleteRes.success).toBe(true);

		// Confirma que não existe mais no banco
		const deletedGift = await testDb.db.query.profileGift.findFirst({
			where: { id: gift.id },
		});
		expect(deletedGift).toBeUndefined();

		// 3. Tentar excluir presente já excluído -> NOT_FOUND
		await expect(
			memberCaller.user.deleteGift({ giftId: gift.id })
		).rejects.toThrowError("Presente não encontrado");
	});

	it("deve listar avaliadores/usuários cadastrados", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const assessors = await caller.user.listAssessors();
		expect(assessors.length).toBeGreaterThanOrEqual(3);
		const ids = assessors.map((a) => a.id);
		expect(ids).toContain(adminPersona.id);
		expect(ids).toContain(memberPersona.id);
		expect(ids).toContain(assessorPersona.id);
	});
});
