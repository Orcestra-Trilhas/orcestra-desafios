import { defineRelations } from "drizzle-orm";

// biome-ignore lint/performance/noNamespaceImport: Drizzle defineRelations requires full schema namespace
import * as schema from "./schema";

export const relations = {
	...defineRelations(schema),
	...schema.authRelations,
	...schema.challengeRelations,
};
