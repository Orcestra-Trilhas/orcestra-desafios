import type { Auth, Session } from "@orcestra-desafios/auth";
import type { Database } from "@orcestra-desafios/db";

export interface Context {
	auth?: Auth;
	db: Database;
	session: Session | null;
}
