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

async function seed() {
	console.log("🚀 Iniciando seed do banco de dados Orcestra Desafios...");

	// 1. Admin Dev
	const adminEmail = "admin@orcestra.com";
	let adminUser = await db.query.user.findFirst({
		where: { email: adminEmail },
	});

	if (adminUser) {
		// Ensure password for existing admin is "admin"
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
	}

	// 2. Demo Members
	const demoMembers = [
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

	const createdMemberIds: string[] = [];

	for (const m of demoMembers) {
		const u = await db.query.user.findFirst({
			where: { email: m.email },
		});
		if (u) {
			createdMemberIds.push(u.id);
		} else {
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
				createdMemberIds.push(res.user.id);
			}
		}
	}
	console.log(
		`✅ ${createdMemberIds.length} membros demo criados/verificados.`
	);

	// 3. Badges
	const initialBadges = [
		{
			criteria: "Submeter 1 desafio",
			description:
				"Submeteu a primeira solução de desafio na plataforma da EJ.",
			iconUrl:
				"https://api.iconify.design/lucide:git-commit.svg?color=%236366f1",
			name: "Primeiro Commit",
		},
		{
			criteria: "Completar desafio em dupla",
			description: "Concluiu um desafio em dupla com nota máxima na sprint.",
			iconUrl: "https://api.iconify.design/lucide:flame.svg?color=%23f59e0b",
			name: "Dupla Dinâmica",
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

	for (const b of initialBadges) {
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
	}
	console.log("✅ Badges de gamificação registradas.");

	// 4. Challenges
	const adminId = adminUser ? adminUser.id : createdMemberIds[0];
	const initialChallenges = [
		{
			active: true,
			assessorId: adminId,
			deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			description:
				"Crie um componente acessível de Modal e Stepper interativo com validação de acessibilidade (a11y) e design mobile-first.",
			mkdocsUrl: "https://docs.orcestra.com/desafios/frontend-stepper",
			rulesMarkdown: `### Regras do Desafio
1. O componente deve utilizar padrões semânticos de HTML e ARIA attributes.
2. Responsividade completa: tela mobile (<640px) e desktop.
3. Testes unitários com Vitest ou React Testing Library cobrindo abertura/fechamento.
4. Código limpo seguindo o padrão Ultracite (sem any).`,
			title: "Desafio Frontend: Componentes com Radix & Tailwind v4",
			trackTheme: "FRONT",
		},
		{
			active: true,
			assessorId: adminId,
			deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
			description:
				"Implemente rotas protegidas em tRPC com verificação de sessão, middleware de rate-limiting e auditoria em PostgreSQL.",
			mkdocsUrl: "https://docs.orcestra.com/desafios/backend-auth",
			rulesMarkdown: `### Regras do Desafio
1. Criar middleware tRPC que valida se o usuário possui role de assessor ou admin.
2. Gravar logs de cada ação na tabela admin_logs.
3. Tratamento defensivo de erros com TRPCError apropriados.`,
			title: "Desafio Backend: API de Autenticação e Rate Limiting no Neon",
			trackTheme: "BACK",
		},
	];

	for (const c of initialChallenges) {
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
					id: `chal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
					mkdocsUrl: c.mkdocsUrl,
					rulesMarkdown: c.rulesMarkdown,
					title: c.title,
					trackTheme: c.trackTheme,
				})
				.returning();

			// Also create a sample pair for the first challenge with Carlos & Mariana
			if (createdMemberIds.length >= 2 && inserted[0]) {
				const existingPair = await db.query.pair.findFirst({
					where: { challengeId: inserted[0].id },
				});
				if (!existingPair) {
					await db.insert(pair).values({
						challengeId: inserted[0].id,
						currentStep: 2,
						id: `pair-sample-${Date.now()}`,
						member1Id: createdMemberIds[0],
						member2Id: createdMemberIds[1],
						prUrl:
							"https://github.com/orcestra/desafio-frontend-stepper/pull/1",
						repoUrl: "https://github.com/orcestra/desafio-frontend-stepper",
						status: "SUBMITTED",
						submissionNotes:
							"Concluímos o Stepper com animação suave e suporte completo a teclado!",
					});
					console.log(
						`✅ Dupla de demonstração alocada no desafio "${c.title}".`
					);
				}
			}
		}
	}

	console.log("🎉 Seed concluído com sucesso!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("❌ Erro durante o seed:", err);
	process.exit(1);
});
