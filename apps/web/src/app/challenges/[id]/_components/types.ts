export type SubmissionType = "PR" | "REPO" | "DOCUMENT" | "IMAGE" | "TEXT";

export interface Evidence {
	alt: string;
	raw: string;
	url: string;
}

export interface SubmissionMember {
	gifUrl?: string | null;
	id: string;
	name: string;
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

export interface ChallengePairData {
	currentStep: number;
	feedback?: string | null;
	id: string;
	status: string;
}

export interface ChallengeData {
	canViewAllSolutions?: boolean;
	deadline: Date | string;
	description: string;
	id: string;
	mkdocsUrl?: string | null;
	myPair?: ChallengePairData | null;
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
