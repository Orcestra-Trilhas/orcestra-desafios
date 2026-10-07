import { describe, expect, it } from "vitest";

import {
	calculateMemberKnowledgeScore,
	findSheetMember,
	getSheetMembers,
	parseMembersCsv,
} from "../../packages/api/src/services/members-sheet";

describe("Members Sheet Service & CSV Parser (Issue #3 & #4)", () => {
	it("deve carregar e processar membros da planilha oficial de acompanhamentos", () => {
		const members = getSheetMembers();
		expect(members.length).toBeGreaterThan(0);

		// Eduardo L. possui 90% de progresso em DevOps
		const eduardoL = members.find((m) => m.name.includes("Eduardo L"));
		expect(eduardoL).toBeDefined();
		expect(eduardoL?.progressPercent).toBe(90);
		expect(eduardoL?.trackPreferences).toEqual(["DEVOPS"]);

		// Faby possui 50% de progresso em Design (PROTOTIPACAO)
		const faby = members.find((m) => m.name === "Faby");
		expect(faby).toBeDefined();
		expect(faby?.progressPercent).toBe(50);
		expect(faby?.trackPreferences).toEqual(["PROTOTIPACAO"]);

		// Membro sem trilha definida na planilha (Ana) recebe todas as trilhas gerais
		const ana = members.find((m) => m.name === "Ana");
		expect(ana).toBeDefined();
		expect(ana?.trackPreferences).toEqual([
			"BACK",
			"FRONT",
			"PROTOTIPACAO",
			"DEVOPS",
		]);
	});

	it("deve mapear corretamente as trilhas e porcentagens ao fazer parse de CSV bruto", () => {
		const mockCsv = `
,Pessoas,Trilha,Progresso,,Satisfação
,DevSenior,Back-end,,80%,"5,0 ⭐"
,DevJunior,Back-end,,10%,Sem avaliações
,Designer,Design,,40%,Sem avaliações
,Operador,DevOps,,100%,Sem avaliações
,Indeciso,,,0%,Sem avaliações
`;
		const parsed = parseMembersCsv(mockCsv);
		expect(parsed).toHaveLength(5);

		expect(parsed[0]?.name).toBe("DevSenior");
		expect(parsed[0]?.trackPreferences).toEqual(["BACK"]);
		expect(parsed[0]?.progressPercent).toBe(80);

		expect(parsed[1]?.name).toBe("DevJunior");
		expect(parsed[1]?.trackPreferences).toEqual(["BACK"]);
		expect(parsed[1]?.progressPercent).toBe(10);

		expect(parsed[2]?.name).toBe("Designer");
		expect(parsed[2]?.trackPreferences).toEqual(["PROTOTIPACAO"]);
		expect(parsed[2]?.progressPercent).toBe(40);

		expect(parsed[3]?.name).toBe("Operador");
		expect(parsed[3]?.trackPreferences).toEqual(["DEVOPS"]);
		expect(parsed[3]?.progressPercent).toBe(100);

		expect(parsed[4]?.name).toBe("Indeciso");
		expect(parsed[4]?.trackPreferences).toEqual([
			"BACK",
			"FRONT",
			"PROTOTIPACAO",
			"DEVOPS",
		]);
		expect(parsed[4]?.progressPercent).toBe(0);
	});

	it("deve buscar membro por nome de forma insensível a maiúsculas e acentos", () => {
		const found1 = findSheetMember("eduardo l.");
		expect(found1).toBeDefined();
		expect(found1?.progressPercent).toBe(90);

		const found2 = findSheetMember("FABIO");
		expect(found2).toBeDefined();

		const notFound = findSheetMember("NomeInexistenteTotalmente123");
		expect(notFound).toBeNull();
	});

	it("deve calcular o knowledge score somando progresso do CSV e pontos na plataforma", () => {
		// Eduardo L: 90% no CSV + 200 pontos na plataforma = 290
		const scoreEdu = calculateMemberKnowledgeScore("Eduardo L.", 200);
		expect(scoreEdu).toBe(290);

		// Faby: 50% no CSV + 0 pontos na plataforma = 50
		const scoreFaby = calculateMemberKnowledgeScore("Faby", 0);
		expect(scoreFaby).toBe(50);

		// Desconhecido: 0% no CSV + 150 pontos na plataforma = 150
		const scoreUnknown = calculateMemberKnowledgeScore("MembroNovo", 150);
		expect(scoreUnknown).toBe(150);
	});
});

