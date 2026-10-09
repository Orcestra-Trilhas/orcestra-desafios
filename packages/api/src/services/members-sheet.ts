import fs from "node:fs";
import path from "node:path";

export interface SheetMember {
	displayTrack: string;
	name: string;
	primaryTrack: string | null;
	progressPercent: number;
	rawTrack: string;
	satisfaction: string;
	trackPreferences: string[];
}

export const MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS = 85;

export function canMemberChooseOtherTracks(
	member: SheetMember | null | undefined
): boolean {
	if (!member?.primaryTrack) {
		return true;
	}
	return member.progressPercent >= MIN_PROGRESS_TO_CHOOSE_OTHER_TRACKS;
}

const DEFAULT_TRACKS = ["BACK", "FRONT", "PROTOTIPACAO", "DEVOPS"] as const;
const NEWLINE_SPLIT_REGEX = /\r?\n/;

function normalizeName(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function mapTrackToTheme(rawTrack: string): {
	displayTrack: string;
	primaryTrack: string | null;
	trackPreferences: string[];
} {
	const trimmed = rawTrack.trim().toLowerCase();
	if (trimmed.includes("back")) {
		return {
			displayTrack: "Back-end",
			primaryTrack: "BACK",
			trackPreferences: ["BACK"],
		};
	}
	if (trimmed.includes("front")) {
		return {
			displayTrack: "Front-end",
			primaryTrack: "FRONT",
			trackPreferences: ["FRONT"],
		};
	}
	if (trimmed.includes("devops")) {
		return {
			displayTrack: "DevOps",
			primaryTrack: "DEVOPS",
			trackPreferences: ["DEVOPS"],
		};
	}
	if (trimmed.includes("design") || trimmed.includes("prototip")) {
		return {
			displayTrack: "Design / Protótipo",
			primaryTrack: "PROTOTIPACAO",
			trackPreferences: ["PROTOTIPACAO"],
		};
	}
	return {
		displayTrack: "Geral (Todas as Trilhas)",
		primaryTrack: null,
		trackPreferences: [...DEFAULT_TRACKS],
	};
}

function parseProgress(rawProgress: string): number {
	const cleaned = rawProgress.replace("%", "").trim();
	const parsed = Number.parseInt(cleaned, 10);
	return Number.isNaN(parsed) ? 0 : parsed;
}

function locateCsvPath(): string | null {
	const candidates = [
		path.resolve(process.cwd(), "acompanhamentos.csv"),
		path.resolve(process.cwd(), "../../acompanhamentos.csv"),
		path.resolve(process.cwd(), "../acompanhamentos.csv"),
	];

	for (const candidate of candidates) {
		if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
			return candidate;
		}
	}
	return null;
}

export function parseMembersCsv(csvContent: string): SheetMember[] {
	const lines = csvContent.split(NEWLINE_SPLIT_REGEX);
	const members: SheetMember[] = [];

	for (const line of lines) {
		if (!line.trim()) {
			continue;
		}

		// O CSV possui formato: ,Pessoas,Trilha,Progresso,,Satisfação
		// Processa considerando que algumas colunas podem ter aspas
		const tokens: string[] = [];
		let current = "";
		let inQuotes = false;

		for (const char of line) {
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === "," && !inQuotes) {
				tokens.push(current.trim());
				current = "";
			} else {
				current += char;
			}
		}
		tokens.push(current.trim());

		// Assegura colunas mínimas
		const rawName = tokens[1] ?? "";
		const rawTrack = tokens[2] ?? "";
		const rawProgress = tokens[4] || tokens[3] || "0%";
		const rawSatisfaction = tokens[5] ?? "";

		// Ignora cabeçalhos ou linhas sem nome válido
		if (
			!rawName ||
			rawName.toLowerCase() === "pessoas" ||
			rawName.toLowerCase() === "nome"
		) {
			continue;
		}

		const { displayTrack, primaryTrack, trackPreferences } =
			mapTrackToTheme(rawTrack);
		const progressPercent = parseProgress(rawProgress);

		members.push({
			displayTrack,
			name: rawName,
			primaryTrack,
			progressPercent,
			rawTrack: rawTrack.trim(),
			satisfaction: rawSatisfaction.replace(/^"|"$/g, "").trim(),
			trackPreferences,
		});
	}

	return members;
}

let cachedMembers: SheetMember[] | null = null;

export function getSheetMembers(): SheetMember[] {
	if (cachedMembers && cachedMembers.length > 0) {
		return cachedMembers;
	}

	const csvPath = locateCsvPath();
	if (csvPath) {
		try {
			const content = fs.readFileSync(
				/*turbopackIgnore: true*/ csvPath,
				"utf-8"
			);
			cachedMembers = parseMembersCsv(content);
			return cachedMembers;
		} catch {
			// fallback para lista estática
		}
	}

	// Fallback padrão com os membros da planilha da EJ
	cachedMembers = [
		{
			displayTrack: "Geral (Todas as Trilhas)",
			name: "Ana",
			primaryTrack: null,
			progressPercent: 0,
			rawTrack: "",
			satisfaction: "Sem avaliações",
			trackPreferences: [...DEFAULT_TRACKS],
		},
		{
			displayTrack: "DevOps",
			name: "Artur",
			primaryTrack: "DEVOPS",
			progressPercent: 0,
			rawTrack: "DevOps",
			satisfaction: "Sem avaliações",
			trackPreferences: ["DEVOPS"],
		},
		{
			displayTrack: "Back-end",
			name: "Carlos",
			primaryTrack: "BACK",
			progressPercent: 0,
			rawTrack: "Back-end",
			satisfaction: "Sem avaliações",
			trackPreferences: ["BACK"],
		},
		{
			displayTrack: "Front-end",
			name: "DaniProj",
			primaryTrack: "FRONT",
			progressPercent: 0,
			rawTrack: "Front-end",
			satisfaction: "Sem avaliações",
			trackPreferences: ["FRONT"],
		},
		{
			displayTrack: "DevOps",
			name: "Eduardo L.",
			primaryTrack: "DEVOPS",
			progressPercent: 90,
			rawTrack: "DevOps",
			satisfaction: "4,8 ⭐",
			trackPreferences: ["DEVOPS"],
		},
		{
			displayTrack: "Design / Protótipo",
			name: "Faby",
			primaryTrack: "PROTOTIPACAO",
			progressPercent: 50,
			rawTrack: "Design",
			satisfaction: "4,5 ⭐",
			trackPreferences: ["PROTOTIPACAO"],
		},
		{
			displayTrack: "Design / Protótipo",
			name: "Geovanna",
			primaryTrack: "PROTOTIPACAO",
			progressPercent: 8,
			rawTrack: "Design",
			satisfaction: "5,0 ⭐",
			trackPreferences: ["PROTOTIPACAO"],
		},
		{
			displayTrack: "Back-end",
			name: "Lucas N.",
			primaryTrack: "BACK",
			progressPercent: 25,
			rawTrack: "Back-end",
			satisfaction: "4,6 ⭐",
			trackPreferences: ["BACK"],
		},
	];

	return cachedMembers;
}

export function findSheetMember(name: string): SheetMember | null {
	const members = getSheetMembers();
	const target = normalizeName(name);

	// 1. Correspondência exata normalizada
	const exact = members.find((m) => normalizeName(m.name) === target);
	if (exact) {
		return exact;
	}

	// 2. Correspondência parcial (ex: "Eduardo" para "Eduardo L." ou nome que começa com o termo)
	const partial = members.find((m) => {
		const mNorm = normalizeName(m.name);
		return mNorm.startsWith(target) || target.startsWith(mNorm);
	});

	return partial ?? null;
}

export function calculateMemberKnowledgeScore(
	name: string,
	platformPoints = 0
): number {
	const member = findSheetMember(name);
	const progressScore = member ? member.progressPercent : 0;
	// Progresso da planilha (peso base 0 a 100) + pontos obtidos na plataforma
	return progressScore + platformPoints;
}
