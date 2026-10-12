import { describe, expect, it } from "vitest";

import {
	calculateMemberKnowledgeScore,
	canMemberChooseOtherTracks,
	findSheetMember,
	getSheetMembers,
	MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS,
	parseMembersCsv,
} from "../../packages/api/src/services/members-sheet";

describe("Members Sheet Service & CSV Parser (Issue #3 & #4)", () => {
	it("deve carregar e processar membros da planilha oficial de acompanhamentos com regra de 85%", () => {
		expect(MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS).toBe(85);

		const members = getSheetMembers();
		expect(members.length).toBeGreaterThan(0);

		// Eduardo L. possui 90% de progresso em DevOps (>= 85% -> pode escolher outras trilhas)
		const eduardoL = members.find((m) => m.name.includes("Eduardo L"));
		expect(eduardoL).toBeDefined();
		expect(eduardoL?.progressPercent).toBe(90);
		expect(eduardoL?.primaryTrack).toBe("DEVOPS");
		expect(eduardoL?.trackPreferences).toEqual(["DEVOPS"]);
		expect(canMemberChooseOtherTracks(eduardoL)).toBe(true);

		// Faby possui 50% de progresso em Design (PROTOTIPACAO) (< 85% -> NÃO pode escolher outras)
		const faby = members.find((m) => m.name === "Faby");
		expect(faby).toBeDefined();
		expect(faby?.progressPercent).toBe(50);
		expect(faby?.primaryTrack).toBe("PROTOTIPACAO");
		expect(faby?.trackPreferences).toEqual(["PROTOTIPACAO"]);
		expect(canMemberChooseOtherTracks(faby)).toBe(false);

		// Carlos possui 0% de progresso em Back-end (< 85% -> NÃO pode escolher outras)
		const carlos = members.find((m) => m.name === "Carlos");
		expect(carlos).toBeDefined();
		expect(carlos?.progressPercent).toBe(0);
		expect(carlos?.primaryTrack).toBe("BACK");
		expect(canMemberChooseOtherTracks(carlos)).toBe(false);

		// Membro sem trilha definida na planilha (Bryan) recebe todas as trilhas gerais e canChooseOtherTracks = true
		const bryan = members.find((m) => m.name === "Bryan");
		expect(bryan).toBeDefined();
		expect(bryan?.primaryTrack).toBeNull();
		expect(bryan?.trackPreferences).toEqual([
			"BACK",
			"FRONT",
			"PROTOTIPACAO",
			"DEVOPS",
		]);
		expect(canMemberChooseOtherTracks(bryan)).toBe(true);

		// Ana Teresa escolheu a trilha Front-end (< 85% -> NÃO pode escolher outras ainda)
		const ana = members.find((m) => m.name === "Ana Teresa");
		expect(ana).toBeDefined();
		expect(ana?.primaryTrack).toBe("FRONT");
		expect(ana?.trackPreferences).toEqual(["FRONT"]);
		expect(canMemberChooseOtherTracks(ana)).toBe(false);
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

		const foundAna = findSheetMember("Ana Teresa");
		expect(foundAna).toBeDefined();
		expect(foundAna?.primaryTrack).toBe("FRONT");

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

	it("deve mapear Daniel Almeida Frota como Dandan", () => {
		// Daniel Almeida Frota deve mapear estritamente para Dandan (Back-end)
		const dandan1 = findSheetMember("Daniel Almeida Frota");
		expect(dandan1).toBeDefined();
		expect(dandan1?.name).toBe("Dandan");
		expect(dandan1?.primaryTrack).toBe("BACK");

		const dandan2 = findSheetMember("daniel frota");
		expect(dandan2).toBeDefined();
		expect(dandan2?.name).toBe("Dandan");

		const dandan3 = findSheetMember("Daniel");
		expect(dandan3).toBeDefined();
		expect(dandan3?.name).toBe("Dandan");

		const dandan4 = findSheetMember("Dandan");
		expect(dandan4).toBeDefined();
		expect(dandan4?.name).toBe("Dandan");
	});

	it("deve mapear Danielle de Sousa Pinheiro como DaniProj e qualquer outra Dani como DanyTOps", () => {
		// Danielle de Sousa Pinheiro deve mapear estritamente para DaniProj (Front-end)
		const daniProj1 = findSheetMember("Danielle de Sousa Pinheiro");
		expect(daniProj1).toBeDefined();
		expect(daniProj1?.name).toBe("DaniProj");
		expect(daniProj1?.primaryTrack).toBe("FRONT");

		const daniProj2 = findSheetMember("danielle pinheiro");
		expect(daniProj2).toBeDefined();
		expect(daniProj2?.name).toBe("DaniProj");

		const daniProj3 = findSheetMember("DaniProj");
		expect(daniProj3).toBeDefined();
		expect(daniProj3?.name).toBe("DaniProj");

		// Qualquer outra Dani (sem Sousa Pinheiro e sem Frota) deve mapear para DanyTOps (Back-end)
		const danyTops1 = findSheetMember("Danielle");
		expect(danyTops1).toBeDefined();
		expect(danyTops1?.name).toBe("DanyTOps");
		expect(danyTops1?.primaryTrack).toBe("BACK");

		const danyTops2 = findSheetMember("Dany");
		expect(danyTops2).toBeDefined();
		expect(danyTops2?.name).toBe("DanyTOps");

		const danyTops3 = findSheetMember("DanyTOps");
		expect(danyTops3).toBeDefined();
		expect(danyTops3?.name).toBe("DanyTOps");
	});
});
