import type { Context as ApiContext } from "@orcestra-desafios/api/context";
import type { NextRequest } from "next/server";

import { auth, db } from "./services";

export async function createContext(req: NextRequest): Promise<ApiContext> {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	return {
		auth,
		db,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
