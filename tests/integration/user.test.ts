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

	it("deve retornar lista de membros elegíveis da planilha e indicar se já estão cadastrados", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		// Cadastra um usuário com o nome exato "Eduardo L."
		await createTestUser(testDb.db, {
			email: "edulobo@orcestra.com",
			name: "Eduardo L.",
		});

		const eligible = await caller.user.getEligibleMembers();
		expect(eligible.length).toBeGreaterThan(0);

		// Eduardo L. deve estar marcado como cadastrado
		const eduardo = eligible.find((m) => m.name === "Eduardo L.");
		expect(eduardo).toBeDefined();
		expect(eduardo?.isRegistered).toBe(true);
		expect(eduardo?.trackPreferences).toEqual(["DEVOPS"]);

		// Outro membro não cadastrado ainda
		const artur = eligible.find((m) => m.name === "Artur");
		expect(artur).toBeDefined();
		expect(artur?.isRegistered).toBe(false);
	});

	it("deve retornar a trilha automática de um membro ao consultar por nome", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const trackCarlos = await caller.user.getMemberTrackByName({
			name: "Carlos",
		});
		expect(trackCarlos.displayTrack).toBe("Back-end");
		expect(trackCarlos.primaryTrack).toBe("BACK");
		expect(trackCarlos.progressPercent).toBe(0);
		expect(trackCarlos.canChooseOtherTracks).toBe(false);
		expect(trackCarlos.trackPreferences).toEqual(["BACK"]);

		const trackFaby = await caller.user.getMemberTrackByName({ name: "Faby" });
		expect(trackFaby.displayTrack).toBe("Design / Protótipo");
		expect(trackFaby.primaryTrack).toBe("PROTOTIPACAO");
		expect(trackFaby.progressPercent).toBe(50);
		expect(trackFaby.canChooseOtherTracks).toBe(false);
		expect(trackFaby.trackPreferences).toEqual(["PROTOTIPACAO"]);

		const trackEduardo = await caller.user.getMemberTrackByName({
			name: "Eduardo L.",
		});
		expect(trackEduardo.displayTrack).toBe("DevOps");
		expect(trackEduardo.primaryTrack).toBe("DEVOPS");
		expect(trackEduardo.progressPercent).toBe(90);
		expect(trackEduardo.canChooseOtherTracks).toBe(true);
		expect(trackEduardo.trackPreferences).toEqual(["DEVOPS"]);

		const trackUnknown = await caller.user.getMemberTrackByName({
			name: "Desconhecido",
		});
		expect(trackUnknown.displayTrack).toBe("Geral (Todas as Trilhas)");
		expect(trackUnknown.primaryTrack).toBeNull();
		expect(trackUnknown.canChooseOtherTracks).toBe(true);
		expect(trackUnknown.trackPreferences).toEqual([
			"BACK",
			"FRONT",
			"PROTOTIPACAO",
			"DEVOPS",
		]);
	});

	it("deve bloquear seleção de outras trilhas se progresso da trilha principal for inferior a 85%", async () => {
		// Cria o usuário Carlos (Back-end, 0% no CSV)
		const carlosUser = await createTestUser(testDb.db, {
			email: "carlos.dev@orcestra.com",
			name: "Carlos",
			trackPreferences: JSON.stringify(["BACK"]),
		});

		// Cria uma sessão/caller para o Carlos
		const carlosCaller = createTestCaller({
			db: testDb.db,
			persona: {
				department: "DIPROJ",
				email: "carlos.dev@orcestra.com",
				id: carlosUser.id,
				name: "Carlos",
				role: "MEMBER",
				session: {
					session: {
						createdAt: new Date(),
						expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
						id: "sess_carlos_001",
						ipAddress: "127.0.0.1",
						token: "tok_carlos_001",
						updatedAt: new Date(),
						userId: carlosUser.id,
					},
					user: {
						createdAt: new Date(),
						department: "DIPROJ",
						email: "carlos.dev@orcestra.com",
						emailVerified: true,
						id: carlosUser.id,
						name: "Carlos",
						points: 0,
						role: "MEMBER",
						updatedAt: new Date(),
						whatsapp: null,
					},
				},
			},
		});

		const carlosMe = await carlosCaller.user.me();
		expect(carlosMe.primaryTrack).toBe("BACK");
		expect(carlosMe.primaryTrackProgress).toBe(0);
		expect(carlosMe.canChooseOtherTracks).toBe(false);
		expect(carlosMe.trackPreferencesList).toEqual(["BACK"]);

		// Carlos tenta salvar outras trilhas (ex: DevOps) sem atingir 85% -> deve falhar com BAD_REQUEST
		await expect(
			carlosCaller.user.updateProfile({
				department: "DIPROJ",
				name: "Carlos",
				trackPreferences: ["BACK", "DEVOPS"],
			})
		).rejects.toThrowError(
			"Você precisa atingir pelo menos 85% de progresso na sua trilha principal (Back-end) para selecionar outras trilhas."
		);

		// Carlos salvando apenas sua trilha principal -> deve ter sucesso
		const successRes = await carlosCaller.user.updateProfile({
			department: "DIPROJ",
			name: "Carlos",
			trackPreferences: ["BACK"],
		});
		expect(successRes.success).toBe(true);
	});

	it("deve permitir seleção de outras trilhas se progresso da trilha principal for >= 85%", async () => {
		// Cria o usuário Eduardo L. (DevOps, 90% no CSV)
		const eduUser = await createTestUser(testDb.db, {
			email: "edul.senior@orcestra.com",
			name: "Eduardo L.",
			trackPreferences: JSON.stringify(["DEVOPS"]),
		});

		const eduCaller = createTestCaller({
			db: testDb.db,
			persona: {
				department: "TOPS",
				email: "edul.senior@orcestra.com",
				id: eduUser.id,
				name: "Eduardo L.",
				role: "MEMBER",
				session: {
					session: {
						createdAt: new Date(),
						expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
						id: "sess_edu_001",
						ipAddress: "127.0.0.1",
						token: "tok_edu_001",
						updatedAt: new Date(),
						userId: eduUser.id,
					},
					user: {
						createdAt: new Date(),
						department: "TOPS",
						email: "edul.senior@orcestra.com",
						emailVerified: true,
						id: eduUser.id,
						name: "Eduardo L.",
						points: 0,
						role: "MEMBER",
						updatedAt: new Date(),
						whatsapp: null,
					},
				},
			},
		});

		const eduMe = await eduCaller.user.me();
		expect(eduMe.primaryTrack).toBe("DEVOPS");
		expect(eduMe.primaryTrackProgress).toBe(90);
		expect(eduMe.canChooseOtherTracks).toBe(true);

		// Eduardo L. pode adicionar outras trilhas livremente
		const updateRes = await eduCaller.user.updateProfile({
			department: "TOPS",
			name: "Eduardo L.",
			trackPreferences: ["DEVOPS", "FRONT", "BACK"],
		});
		expect(updateRes.success).toBe(true);

		const updatedMe = await eduCaller.user.me();
		expect(updatedMe.trackPreferencesList).toEqual(["DEVOPS", "FRONT", "BACK"]);
	});

	it("deve permitir que o usuário crie e atualize seu próprio tema personalizado", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const customThemePayload = JSON.stringify({
			background: "#121212",
			baseMode: "dark",
			border: "#FF4A1C",
			card: "#1C1C1C",
			foreground: "#FFFFFF",
			name: "MEU TEMA FAUVE",
			primary: "#FF4A1C",
		});

		const updateRes = await caller.user.updateCustomTheme({
			customTheme: customThemePayload,
		});
		expect(updateRes.success).toBe(true);

		const me = await caller.user.me();
		expect(me.customTheme).toBe(customThemePayload);

		const profile = await caller.user.getProfile({ userId: memberPersona.id });
		expect(profile.customTheme).toBe(customThemePayload);
	});

	it("deve exibir o tema personalizado de outro usuário ao visitar seu perfil", async () => {
		// Atualiza o tema do membro
		const memberCaller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const customThemePayload = JSON.stringify({
			background: "#08090D",
			baseMode: "dark",
			border: "#00F0FF",
			card: "#12141F",
			foreground: "#F0F6FC",
			name: "CYBERPUNK NEON",
			primary: "#00F0FF",
		});

		await memberCaller.user.updateCustomTheme({
			customTheme: customThemePayload,
		});

		// Assessor visita o perfil do membro
		const assessorCaller = createTestCaller({
			db: testDb.db,
			persona: "assessor",
		});

		const targetProfile = await assessorCaller.user.getProfile({
			userId: memberPersona.id,
		});
		expect(targetProfile.isOwner).toBe(false);
		expect(targetProfile.customTheme).toBe(customThemePayload);
	});
});
