import {
	badge,
	challenge,
	pair,
	profileGift,
	session,
	user,
	userBadge,
} from "@orcestra-desafios/db/schema";
import {
	assessorPersona,
	memberPersona,
	type PersonaDefinition,
} from "./personas";
import type { TestDb } from "./test-db";

export async function seedPersona(db: TestDb, persona: PersonaDefinition) {
	await db.insert(user).values({
		department: persona.department ?? "DIPROJ",
		email: persona.email,
		emailVerified: true,
		id: persona.id,
		name: persona.name,
		points: persona.session.user.points ?? 0,
		role: persona.role,
		whatsapp: persona.session.user.whatsapp ?? null,
	});

	await db.insert(session).values({
		createdAt: persona.session.session.createdAt,
		expiresAt: persona.session.session.expiresAt,
		id: persona.session.session.id,
		ipAddress: persona.session.session.ipAddress ?? null,
		token: persona.session.session.token,
		updatedAt: persona.session.session.updatedAt,
		userId: persona.id,
	});
}

export async function createTestUser(
	db: TestDb,
	overrides: Partial<typeof user.$inferInsert> = {}
) {
	const id = overrides.id ?? `usr_test_${crypto.randomUUID().slice(0, 8)}`;
	const values: typeof user.$inferInsert = {
		department: "DIPROJ",
		email: `${id}@orcestra.com`,
		emailVerified: true,
		id,
		name: `Test User ${id}`,
		points: 0,
		role: "MEMBER",
		...overrides,
	};
	await db.insert(user).values(values);
	return values;
}

export async function createTestChallenge(
	db: TestDb,
	overrides: Partial<typeof challenge.$inferInsert> = {}
) {
	const id = overrides.id ?? `chal_test_${crypto.randomUUID().slice(0, 8)}`;
	const values: typeof challenge.$inferInsert = {
		active: true,
		assessorId: overrides.assessorId ?? "usr_admin_sota_001",
		deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
		description: "Descrição detalhada do desafio de teste SOTA",
		id,
		pointsReward: 100,
		rulesMarkdown:
			"## Regras do Desafio\n- Seguir Clean Code\n- Escrever testes",
		title: `Desafio SOTA ${id}`,
		trackTheme: "BACK",
		...overrides,
	};
	await db.insert(challenge).values(values);
	return values;
}

export async function createTestPair(
	db: TestDb,
	overrides: Partial<typeof pair.$inferInsert> = {}
) {
	let { challengeId } = overrides;
	if (!challengeId) {
		challengeId = "chal_default";
		const existingChal = await db.query.challenge.findFirst({
			where: { id: challengeId },
		});
		if (!existingChal) {
			await createTestChallenge(db, {
				assessorId: assessorPersona.id,
				id: challengeId,
			});
		}
	}

	const id = overrides.id ?? `pair_test_${crypto.randomUUID().slice(0, 8)}`;
	const values: typeof pair.$inferInsert = {
		challengeId,
		currentStep: 1,
		id,
		member1Id: overrides.member1Id ?? memberPersona.id,
		member2Id: overrides.member2Id ?? assessorPersona.id,
		status: "IN_PROGRESS",
		submissionType: "PR",
		...overrides,
	};
	await db.insert(pair).values(values);
	return values;
}

export async function createTestGift(
	db: TestDb,
	overrides: Partial<typeof profileGift.$inferInsert> = {}
) {
	const id = overrides.id ?? `gift_test_${crypto.randomUUID().slice(0, 8)}`;
	const values: typeof profileGift.$inferInsert = {
		id,
		mediaUrl: "https://media.giphy.com/media/3ohnEqJ1XOfvWaSk7e/giphy.gif",
		message: "Parabéns pela entrega técnica!",
		recipientId: overrides.recipientId ?? "usr_membro_sota_002",
		senderId: overrides.senderId ?? "usr_admin_sota_001",
		...overrides,
	};
	await db.insert(profileGift).values(values);
	return values;
}

export async function createTestBadge(
	db: TestDb,
	overrides: Partial<typeof badge.$inferInsert> = {}
) {
	const id = overrides.id ?? `badge_test_${crypto.randomUUID().slice(0, 8)}`;
	const values: typeof badge.$inferInsert = {
		criteria: "Completar 3 desafios de Backend",
		description: "Mestre do Backend",
		iconUrl: "https://example.com/badge.png",
		id,
		name: "Backend Pro",
		...overrides,
	};
	await db.insert(badge).values(values);
	return values;
}

export async function assignTestBadge(
	db: TestDb,
	userId: string,
	badgeId: string
) {
	const id = `ub_${crypto.randomUUID().slice(0, 8)}`;
	await db.insert(userBadge).values({
		badgeId,
		id,
		userId,
	});
	return { badgeId, id, userId };
}
