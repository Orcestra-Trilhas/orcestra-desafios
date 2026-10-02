import { createAuth } from "@orcestra-desafios/auth";
import { createDb } from "@orcestra-desafios/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
