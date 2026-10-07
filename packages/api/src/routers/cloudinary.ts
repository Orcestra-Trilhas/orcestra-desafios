import { TRPCError } from "@trpc/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

function cleanEnvValue(value?: string): string | undefined {
	if (!value) {
		return undefined;
	}
	const trimmed = value.trim();
	// Remove outer quotes if present (e.g. "cloud_name" or 'cloud_name')
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1).trim();
	}
	return trimmed;
}

function getCloudinaryCredentials() {
	let cloudName = cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
	let apiKey = cleanEnvValue(process.env.CLOUDINARY_API_KEY);
	let apiSecret = cleanEnvValue(process.env.CLOUDINARY_API_SECRET);

	// Fallback to CLOUDINARY_URL if individual keys are missing
	const cloudinaryUrl = cleanEnvValue(process.env.CLOUDINARY_URL);
	if (!(cloudName && apiKey && apiSecret) && cloudinaryUrl) {
		try {
			const parsed = new URL(cloudinaryUrl);
			cloudName = parsed.hostname || cloudName;
			apiKey = parsed.username || apiKey;
			apiSecret = parsed.password || apiSecret;
		} catch {
			// Ignore URL parse error
		}
	}

	if (!(cloudName && apiKey && apiSecret)) {
		return null;
	}

	return { apiKey, apiSecret, cloudName };
}

export const cloudinaryRouter = router({
	getSignature: protectedProcedure
		.input(
			z.object({
				folder: z.string().default("orcestra-desafios"),
			})
		)
		.mutation(({ input }) => {
			const creds = getCloudinaryCredentials();

			if (!creds) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message:
						"Credenciais do Cloudinary não configuradas no servidor (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET ou CLOUDINARY_URL ausentes)",
				});
			}

			const timestamp = Math.round(Date.now() / 1000);
			const signature = cloudinary.utils.api_sign_request(
				{
					folder: input.folder,
					timestamp,
				},
				creds.apiSecret
			);

			return {
				apiKey: creds.apiKey,
				cloudName: creds.cloudName,
				folder: input.folder,
				signature,
				timestamp,
			};
		}),

	uploadDirect: protectedProcedure
		.input(
			z.object({
				base64: z.string().min(1, "Arquivo é obrigatório"),
				folder: z.string().default("orcestra-desafios"),
			})
		)
		.mutation(async ({ input }) => {
			const creds = getCloudinaryCredentials();

			if (!creds) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Credenciais do Cloudinary não configuradas no servidor",
				});
			}

			cloudinary.config({
				api_key: creds.apiKey,
				api_secret: creds.apiSecret,
				cloud_name: creds.cloudName,
				secure: true,
			});

			try {
				const res = await cloudinary.uploader.upload(input.base64, {
					folder: input.folder,
					resource_type: "auto",
				});

				return {
					publicId: res.public_id,
					secureUrl: res.secure_url,
					url: res.url,
				};
			} catch (err: unknown) {
				const message =
					err instanceof Error
						? err.message
						: "Falha ao processar upload no Cloudinary";
				// biome-ignore lint/style/useErrorCause: TRPCError accepts cause inside its configuration object
				throw new TRPCError({
					cause: err,
					code: "INTERNAL_SERVER_ERROR",
					message: `Erro no upload do Cloudinary: ${message}`,
				});
			}
		}),
});
