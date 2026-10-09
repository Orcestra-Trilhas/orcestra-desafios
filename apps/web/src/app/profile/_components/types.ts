export type Department = "DIPROJ" | "DIBIS" | "DICOM" | "TOPS";

export const DEPARTMENTS: readonly Department[] = [
	"DIPROJ",
	"DIBIS",
	"DICOM",
	"TOPS",
] as const;

export interface TrackDefinition {
	desc: string;
	id: string;
	label: string;
}

export const TRACKS: readonly TrackDefinition[] = [
	{
		desc: "React, Next.js, UI & Frontend Architecture",
		id: "FRONT",
		label: "FRONTEND",
	},
	{
		desc: "Node.js, Drizzle ORM, PostgreSQL & tRPC",
		id: "BACK",
		label: "BACKEND",
	},
	{
		desc: "Figma, UI/UX & Design Systems",
		id: "PROTOTIPACAO",
		label: "PROTÓTIPO",
	},
	{
		desc: "Docker, CI/CD, Neon Cloud & Vercel",
		id: "DEVOPS",
		label: "DEVOPS",
	},
] as const;

export interface GifPreset {
	label: string;
	url: string;
}

export const GIF_PRESETS: readonly GifPreset[] = [
	{
		label: "FOGUETE",
		url: "https://media.giphy.com/media/3ohnEqJ1XOfvWaSk7e/giphy.gif",
	},
	{
		label: "PALMAS",
		url: "https://media.giphy.com/media/nbvFVEldHM4EVyqO9b/giphy.gif",
	},
	{
		label: "ON FIRE",
		url: "https://media.giphy.com/media/nrXif9YExO9EI/giphy.gif",
	},
	{
		label: "PARABÉNS",
		url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
	},
	{
		label: "CAFÉ",
		url: "https://media.giphy.com/media/hPTZgtzfRIB5Nfb5rL/giphy.gif",
	},
	{
		label: "GENIAL",
		url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
	},
	{
		label: "LENDÁRIO",
		url: "https://media.giphy.com/media/okLCopqw6ElCDnIhuS/giphy.gif",
	},
	{
		label: "PARCERIA",
		url: "https://media.giphy.com/media/3o7TKJNFVZ0xTG2Rry/giphy.gif",
	},
] as const;

export interface ProfileBadge {
	description: string;
	id: string;
	name: string;
}

export interface ProfileSender {
	department?: string | null;
	gifUrl?: string | null;
	id: string;
	name?: string | null;
}

export interface ProfileGift {
	createdAt: Date | string;
	id: string;
	mediaUrl: string;
	message?: string | null;
	sender?: ProfileSender | null;
	senderId: string;
}

export interface ProfileData {
	badges?: (ProfileBadge | null)[];
	canChooseOtherTracks?: boolean;
	completedChallenges?: number;
	customTheme?: string | null;
	department?: string | null;
	gifts?: ProfileGift[];
	gifUrl?: string | null;
	id: string;
	isOwner?: boolean;
	name?: string | null;
	points?: number;
	primaryTrack?: string | null;
	primaryTrackLabel?: string | null;
	primaryTrackProgress?: number;
	role?: string | null;
	trackPreferencesList?: string[];
	whatsapp?: string | null;
}
