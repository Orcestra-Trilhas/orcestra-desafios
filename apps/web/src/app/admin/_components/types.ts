export interface AdminMetrics {
	activeChallenges: number;
	approvalRate: number;
	approvedPairs: number;
	changesRequested: number;
	stuckPairs: number;
	submittedPairs: number;
	totalChallenges: number;
	totalPairs: number;
}

export interface AssessorOption {
	department: string;
	id: string;
	name: string;
}

export interface AdminPairMember {
	id: string;
	name: string;
}

export interface AdminSubmission {
	challenge: {
		description?: string | null;
		pointsReward: number;
		rulesMarkdown?: string | null;
		title: string;
		trackTheme?: string | null;
	} | null;
	currentStep: number;
	feedback?: string | null;
	id: string;
	member1?: AdminPairMember | null;
	member2?: AdminPairMember | null;
	member3?: AdminPairMember | null;
	prUrl?: string | null;
	repoUrl?: string | null;
	status: string;
	submissionNotes?: string | null;
	submissionType?: string | null;
}

export interface AdminChallenge {
	active: boolean;
	assessor?: {
		name: string;
	} | null;
	deadline: Date | string;
	id: string;
	pairs?: Array<{ id: string }>;
	title: string;
	trackTheme: string;
}

export interface AdminLogItem {
	action: string;
	actor?: {
		name: string;
	} | null;
	createdAt: Date | string;
	details?: unknown;
	id: string;
}
