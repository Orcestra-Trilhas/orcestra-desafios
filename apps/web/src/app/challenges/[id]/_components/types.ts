export type SubmissionType = "PR" | "REPO" | "DOCUMENT" | "IMAGE" | "TEXT";

export interface Evidence {
	alt: string;
	raw: string;
	url: string;
}

export interface SubmissionMember {
	department?: string | null;
	gifUrl?: string | null;
	id: string;
	image?: string | null;
	name: string;
	whatsapp?: string | null;
}

export interface ChallengeSubmission {
	feedback?: string | null;
	id: string;
	isMyOwnPair: boolean;
	isSpoilerLocked: boolean;
	member1?: SubmissionMember | null;
	member2?: SubmissionMember | null;
	member3?: SubmissionMember | null;
	prUrl?: string | null;
	repoUrl?: string | null;
	status: string;
	submissionNotes?: string | null;
	updatedAt: Date | string;
}

export interface ChallengePairMember {
	department?: string | null;
	gifUrl?: string | null;
	id: string;
	image?: string | null;
	name: string;
	whatsapp?: string | null;
}

export interface ChallengePairItem {
	challengeId: string;
	createdAt?: Date | string;
	currentStep: number;
	feedback?: string | null;
	id: string;
	member1?: ChallengePairMember | null;
	member1Id: string;
	member2?: ChallengePairMember | null;
	member2Id?: string | null;
	member3?: ChallengePairMember | null;
	member3Id?: string | null;
	prUrl?: string | null;
	repoUrl?: string | null;
	reviewedAt?: Date | string | null;
	status: string;
	submissionNotes?: string | null;
	submissionType?: string | null;
	updatedAt?: Date | string;
}

export interface ChallengePairData {
	currentStep: number;
	feedback?: string | null;
	id: string;
	status: string;
}

export interface ChallengeData {
	active?: boolean;
	approvedPairs: number;
	canViewAllSolutions?: boolean;
	deadline: Date | string;
	description: string;
	id: string;
	mkdocsUrl?: string | null;
	myPair?: ChallengePairData | null;
	pairs?: ChallengePairItem[];
	pointsReward: number;
	rulesMarkdown?: string | null;
	submissions?: ChallengeSubmission[];
	submittedPairs: number;
	title: string;
	totalPairs: number;
	trackTheme: string;
}

export interface UserMeData {
	canChooseOtherTracks?: boolean;
	primaryTrack?: string | null;
	primaryTrackLabel?: string | null;
	primaryTrackProgress?: number;
	role?: string;
}
