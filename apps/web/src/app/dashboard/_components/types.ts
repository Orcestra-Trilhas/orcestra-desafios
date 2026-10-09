export interface DashboardPartner {
	department: string;
	id: string;
	name: string;
	whatsapp: string | null;
}

export interface DashboardAssessor {
	department: string;
	id: string;
	name: string;
	whatsapp: string | null;
}

export interface DashboardChallenge {
	deadline: Date | string;
	id: string;
	pointsReward: number;
	title: string;
	trackTheme: string;
}

export interface DashboardPair {
	assessor: DashboardAssessor | null;
	challenge: DashboardChallenge | null;
	currentStep: number;
	id: string;
	partners: DashboardPartner[];
	status: string;
}
