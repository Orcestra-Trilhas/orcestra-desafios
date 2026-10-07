import { v2 as cloudinary } from "cloudinary";
import { vi } from "vitest";

export function setupMockCloudinary() {
	process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
	process.env.CLOUDINARY_API_KEY = "123456789012345";
	process.env.CLOUDINARY_API_SECRET = "abcdefghijklmnopqrstuvwxyz12345";

	const uploadSpy = vi
		.spyOn(cloudinary.uploader, "upload")
		.mockImplementation((_file, options) => {
			const folder = (options?.folder as string) || "orcestra-desafios";
			const randomId = Math.random().toString(36).slice(7);
			return Promise.resolve({
				asset_id: `asset_${randomId}`,
				bytes: 1024,
				created_at: new Date().toISOString(),
				etag: `etag_${randomId}`,
				format: "png",
				height: 100,
				original_filename: "mock_image",
				placeholder: false,
				public_id: `${folder}/${randomId}`,
				resource_type: "image",
				secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v123456/${folder}/${randomId}.png`,
				signature: `sig_${randomId}`,
				tags: [],
				type: "upload",
				url: `http://res.cloudinary.com/test-cloud/image/upload/v123456/${folder}/${randomId}.png`,
				version: 123_456,
				width: 100,
			} as unknown as ReturnType<
				typeof cloudinary.uploader.upload
			> extends Promise<infer T>
				? T
				: never);
		});

	return {
		restore: () => {
			uploadSpy.mockRestore();
		},
		uploadSpy,
	};
}
