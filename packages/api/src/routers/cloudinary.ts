import { TRPCError } from "@trpc/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

export const cloudinaryRouter = router({
	getSignature: protectedProcedure
		.input(
			z.object({
				folder: z.string().default("orcestra-desafios"),
			})
		)
		.mutation(({ input }) => {
			const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
			const apiKey = process.env.CLOUDINARY_API_KEY;
			const apiSecret = process.env.CLOUDINARY_API_SECRET;

			if (!(cloudName && apiKey && apiSecret)) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Credenciais do Cloudinary não configuradas no servidor",
				});
			}

			const timestamp = Math.round(new Date().getTime() / 1000);
			const signature = cloudinary.utils.api_sign_request(
				{
					folder: input.folder,
					timestamp,
				},
				apiSecret
			);

			return {
				apiKey,
				cloudName,
				folder: input.folder,
				signature,
				timestamp,
			};
		}),
});
