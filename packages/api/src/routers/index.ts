import { publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { challengeRouter } from "./challenge";
import { cloudinaryRouter } from "./cloudinary";
import { rankingRouter } from "./ranking";
import { userRouter } from "./user";

export const appRouter = router({
	admin: adminRouter,
	challenge: challengeRouter,
	cloudinary: cloudinaryRouter,
	healthCheck: publicProcedure.query(() => "OK"),
	ranking: rankingRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
