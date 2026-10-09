import { hashPassword } from "better-auth/crypto";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { createAuth } from "../packages/auth/src/index";
import { createDb } from "../packages/db/src/index";
import {
	account,
	badge,
	challenge,
	pair,
	user,
} from "../packages/db/src/schema/index";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	console.error("DATABASE_URL não encontrada no .env.local");
	process.exit(1);
}

const db = createDb({ DATABASE_URL: dbUrl });
const auth = createAuth(
	{
		BETTER_AUTH_SECRET:
			process.env.BETTER_AUTH_SECRET || "dev-secret-key-orcestra-desafios-2026",
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	},
	db
);

async function seedAdmin(): Promise<string | undefined> {
	const adminEmail = "admin@orcestra.com";
	let adminUser = await db.query.user.findFirst({
		where: { email: adminEmail },
	});

	if (adminUser) {
		const existingAccount = await db.query.account.findFirst({
			where: { providerId: "credential", userId: adminUser.id },
		});
		const hashedPassword = await hashPassword("admin");
		if (existingAccount) {
			await db
				.update(account)
				.set({ password: hashedPassword })
				.where(eq(account.id, existingAccount.id));
		} else {
			await db.insert(account).values({
				accountId: adminEmail,
				id: `account-admin-${Date.now()}`,
				password: hashedPassword,
				providerId: "credential",
				userId: adminUser.id,
			});
		}
	} else {
		console.log("Criando usuário admin...");
		const signUpRes = await auth.api.signUpEmail({
			body: {
				email: adminEmail,
				name: "Administrador EJ Orcestra",
				password: "admin",
			},
		});

		if (signUpRes?.user?.id) {
			adminUser = await db.query.user.findFirst({
				where: { id: signUpRes.user.id },
			});
		}
	}

	if (adminUser) {
		await db
			.update(user)
			.set({
				department: "TOPS",
				points: 1500,
				role: "ADMIN",
				whatsapp: "5511999999999",
			})
			.where(eq(user.id, adminUser.id));
		console.log(
			"✅ Admin configurado: admin@orcestra.com / admin (Role: ADMIN)"
		);
		return adminUser.id;
	}

	return undefined;
}

interface DemoMemberConfig {
	department: "DIPROJ" | "DIBIS" | "DICOM" | "DAF" | "DIPEX" | "TOPS";
	email: string;
	name: string;
	points: number;
	tracks: string;
	whatsapp: string;
}

const DEMO_MEMBERS: DemoMemberConfig[] = [
	{
		department: "DIPROJ",
		email: "carlos.silva@orcestra.com",
		name: "Carlos Silva",
		points: 420,
		tracks: JSON.stringify(["FRONT", "BACK"]),
		whatsapp: "5511988881111",
	},
	{
		department: "DIPROJ",
		email: "mariana.costa@orcestra.com",
		name: "Mariana Costa",
		points: 380,
		tracks: JSON.stringify(["FRONT", "PROTOTIPACAO"]),
		whatsapp: "5511988882222",
	},
	{
		department: "DIBIS",
		email: "pedro.almeida@orcestra.com",
		name: "Pedro Almeida",
		points: 250,
		tracks: JSON.stringify(["BACK", "DEVOPS"]),
		whatsapp: "5511988883333",
	},
	{
		department: "DICOM",
		email: "ana.beatriz@orcestra.com",
		name: "Ana Beatriz",
		points: 190,
		tracks: JSON.stringify(["PROTOTIPACAO", "FRONT"]),
		whatsapp: "5511988884444",
	},
];

async function seedSingleMember(
	m: DemoMemberConfig
): Promise<string | undefined> {
	const u = await db.query.user.findFirst({
		where: { email: m.email },
	});
	if (u) {
		return u.id;
	}

	const res = await auth.api.signUpEmail({
		body: {
			email: m.email,
			name: m.name,
			password: "orcestra123",
		},
	});
	if (res?.user?.id) {
		await db
			.update(user)
			.set({
				department: m.department,
				points: m.points,
				role: "MEMBER",
				trackPreferences: m.tracks,
				whatsapp: m.whatsapp,
			})
			.where(eq(user.id, res.user.id));
		return res.user.id;
	}
	return undefined;
}

async function seedMembers(): Promise<string[]> {
	const memberIds: string[] = [];
	for (const m of DEMO_MEMBERS) {
		// biome-ignore lint/performance/noAwaitInLoops: sequential user registration to prevent race condition in DB
		const id = await seedSingleMember(m);
		if (id) {
			memberIds.push(id);
		}
	}
	console.log(`✅ ${memberIds.length} membros demo configurados.`);
	return memberIds;
}

const INITIAL_BADGES = [
	{
		criteria: "Completar o primeiro desafio com sucesso",
		description: "Concedido ao concluir o primeiro desafio do ciclo.",
		iconUrl: "https://api.iconify.design/lucide:zap.svg?color=%23FF4A1C",
		name: "Primeiro Passo",
	},
	{
		criteria: "Completar 3 desafios",
		description: "Demonstrou consistência participando e concluindo desafios.",
		iconUrl: "https://api.iconify.design/lucide:flame.svg?color=%23f97316",
		name: "Em Chamas",
	},
	{
		criteria: "Aprovação sem ajustes solicitados",
		description:
			"Código aprovado sem necessidade de refatorações ou apontamentos.",
		iconUrl:
			"https://api.iconify.design/lucide:shield-check.svg?color=%2310b981",
		name: "Clean Code",
	},
	{
		criteria: "Liderar o ranking geral",
		description: "Alcançou o primeiro lugar geral no ranking de pontuação.",
		iconUrl: "https://api.iconify.design/lucide:trophy.svg?color=%23eab308",
		name: "Top 1 da Rodada",
	},
];

async function seedBadges(): Promise<void> {
	await Promise.all(
		INITIAL_BADGES.map(async (b) => {
			const existingBadge = await db.query.badge.findFirst({
				where: { name: b.name },
			});
			if (!existingBadge) {
				await db.insert(badge).values({
					criteria: b.criteria,
					description: b.description,
					iconUrl: b.iconUrl,
					id: `badge-${b.name.toLowerCase().replace(/[\s\W]+/g, "-")}`,
					name: b.name,
				});
			}
		})
	);
	console.log("✅ Badges de gamificação registradas.");
}

async function seedChallenges(
	adminId: string,
	memberIds: string[]
): Promise<void> {
	const initialChallenges = [
		{
			active: true,
			assessorId: adminId,
			deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			description:
				"Crie um componente acessível de Modal e Stepper interativo com validação de acessibilidade (a11y) e design mobile-first.",
			mkdocsUrl: "https://docs.orcestra.com/desafios/frontend-stepper",
			rulesMarkdown:
				"### Regras do Desafio\n1. O componente deve utilizar padrões semânticos de HTML e ARIA attributes.\n2. Responsividade completa: tela mobile (<640px) e desktop.\n3. Testes unitários com Vitest ou React Testing Library cobrindo abertura/fechamento.\n4. Código limpo seguindo o padrão Ultracite (sem any).",
			title: "Desafio Frontend: Componentes com Radix & Tailwind v4",
			trackTheme: "FRONT" as const,
		},
		{
			active: true,
			assessorId: adminId,
			deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
			description:
				"Implemente rotas protegidas em tRPC com verificação de sessão, middleware de rate-limiting e auditoria em PostgreSQL.",
			mkdocsUrl: "https://docs.orcestra.com/desafios/backend-auth",
			rulesMarkdown:
				"### Regras do Desafio\n1. Criar middleware tRPC que valida se o usuário possui role de assessor ou admin.\n2. Gravar logs de cada ação na tabela admin_logs.\n3. Tratamento defensivo de erros com TRPCError apropriados.",
			title: "Desafio Backend: API de Autenticação e Rate Limiting no Neon",
			trackTheme: "BACK" as const,
		},
	];

	for (const c of initialChallenges) {
		// biome-ignore lint/performance/noAwaitInLoops: sequential challenge creation
		const existingChal = await db.query.challenge.findFirst({
			where: { title: c.title },
		});
		if (!existingChal) {
			const inserted = await db
				.insert(challenge)
				.values({
					active: c.active,
					assessorId: c.assessorId,
					deadline: c.deadline,
					description: c.description,
					id: `chal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
					mkdocsUrl: c.mkdocsUrl,
					rulesMarkdown: c.rulesMarkdown,
					title: c.title,
					trackTheme: c.trackTheme,
				})
				.returning();

			if (memberIds.length >= 2 && inserted[0]) {
				const existingPair = await db.query.pair.findFirst({
					where: { challengeId: inserted[0].id },
				});
				if (!existingPair) {
					await db.insert(pair).values({
						challengeId: inserted[0].id,
						currentStep: 2,
						id: `pair-sample-${Date.now()}`,
						member1Id: memberIds[0],
						member2Id: memberIds[1],
						prUrl:
							"https://github.com/orcestra/desafio-frontend-stepper/pull/1",
						repoUrl: "https://github.com/orcestra/desafio-frontend-stepper",
						status: "SUBMITTED",
						submissionNotes:
							"Concluímos o Stepper com animação suave e suporte completo a teclado!",
					});
					console.log(
						`✅ Dupla demo criada no desafio "${c.title}" com Carlos e Mariana (Status: SUBMITTED).`
					);
				}
			}
		}
	}
	console.log("✅ Desafios e duplas configuradas.");
}

async function seed() {
	console.log("🚀 Iniciando seed do banco de dados Orcestra Desafios...");
	const adminId = await seedAdmin();
	const memberIds = await seedMembers();
	await seedBadges();

	const resolvedAdminId = adminId ?? memberIds[0] ?? "admin-fallback";
	await seedChallenges(resolvedAdminId, memberIds);

	console.log("✨ Seed concluído com sucesso!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("❌ Erro ao rodar seed:", err);
	process.exit(1);
});
