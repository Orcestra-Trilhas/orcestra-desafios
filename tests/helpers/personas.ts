import type { Session } from "@orcestra-desafios/auth";

export interface PersonaDefinition {
	department?: "DIPROJ" | "DIBIS" | "DICOM" | "TOPS";
	email: string;
	id: string;
	name: string;
	role: "ADMIN" | "MEMBER";
	session: Session;
}

export const adminPersona: PersonaDefinition = {
	department: "TOPS",
	email: "admin.sota@orcestra.com",
	id: "usr_admin_sota_001",
	name: "Administrador SOTA",
	role: "ADMIN",
	session: {
		session: {
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			id: "sess_admin_sota_001",
			ipAddress: "127.0.0.1",
			token: "tok_admin_sota_001",
			updatedAt: new Date(),
			userId: "usr_admin_sota_001",
		},
		user: {
			createdAt: new Date(),
			department: "TOPS",
			email: "admin.sota@orcestra.com",
			emailVerified: true,
			id: "usr_admin_sota_001",
			name: "Administrador SOTA",
			points: 100,
			role: "ADMIN",
			updatedAt: new Date(),
			whatsapp: "5511999990001",
		},
	},
};

export const memberPersona: PersonaDefinition = {
	department: "DIPROJ",
	email: "membro.sota@orcestra.com",
	id: "usr_membro_sota_002",
	name: "Membro SOTA",
	role: "MEMBER",
	session: {
		session: {
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			id: "sess_membro_sota_002",
			ipAddress: "127.0.0.1",
			token: "tok_membro_sota_002",
			updatedAt: new Date(),
			userId: "usr_membro_sota_002",
		},
		user: {
			createdAt: new Date(),
			department: "DIPROJ",
			email: "membro.sota@orcestra.com",
			emailVerified: true,
			id: "usr_membro_sota_002",
			name: "Membro SOTA",
			points: 25,
			role: "MEMBER",
			updatedAt: new Date(),
			whatsapp: "5511999990002",
		},
	},
};

export const assessorPersona: PersonaDefinition = {
	department: "DICOM",
	email: "assessor.sota@orcestra.com",
	id: "usr_assessor_sota_003",
	name: "Assessor Técnico SOTA",
	role: "ADMIN",
	session: {
		session: {
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			id: "sess_assessor_sota_003",
			ipAddress: "127.0.0.1",
			token: "tok_assessor_sota_003",
			updatedAt: new Date(),
			userId: "usr_assessor_sota_003",
		},
		user: {
			createdAt: new Date(),
			department: "DICOM",
			email: "assessor.sota@orcestra.com",
			emailVerified: true,
			id: "usr_assessor_sota_003",
			name: "Assessor Técnico SOTA",
			points: 80,
			role: "ADMIN",
			updatedAt: new Date(),
			whatsapp: "5511999990003",
		},
	},
};
