import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			cause: "No session",
			code: "UNAUTHORIZED",
			message: "Autenticação necessária",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const sessionUser = ctx.session.user as { id: string; role?: string };
	if (sessionUser.role === "ADMIN") {
		return next({ ctx });
	}

	const dbUser = await ctx.db.query.user.findFirst({
		where: { id: sessionUser.id },
	});

	if (dbUser?.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Acesso restrito para administradores",
		});
	}

	return next({ ctx });
});
