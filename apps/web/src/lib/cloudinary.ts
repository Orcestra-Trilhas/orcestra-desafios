export interface CloudinaryTransformOptions {
	crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
	format?: "auto" | "webp" | "avif" | "png" | "jpg";
	height?: number;
	quality?: "auto" | "auto:good" | "auto:eco" | number;
	width?: number;
}

/**
 * Transforms a Cloudinary URL on-the-fly with optimal format (f_auto: WebP/AVIF),
 * automatic compression (q_auto), and responsive dimensions.
 * If the URL is not a Cloudinary image or already contains transformations,
 * it returns the original URL safely.
 */
export function getOptimizedMediaUrl(
	url: string | null | undefined,
	options: CloudinaryTransformOptions = {}
): string {
	if (!url) {
		return "";
	}

	const cloudinaryUploadSegment = "/image/upload/";
	const uploadIndex = url.indexOf(cloudinaryUploadSegment);
	if (uploadIndex === -1) {
		return url;
	}

	const prefix = url.slice(0, uploadIndex + cloudinaryUploadSegment.length);
	const rest = url.slice(uploadIndex + cloudinaryUploadSegment.length);

	if (rest.startsWith("f_auto") || rest.startsWith("q_auto")) {
		return url;
	}

	const {
		crop = "fill",
		format = "auto",
		height,
		quality = "auto",
		width,
	} = options;

	const transforms: string[] = [`f_${format}`, `q_${quality}`];

	if (width) {
		transforms.push(`w_${width}`);
	}
	if (height) {
		transforms.push(`h_${height}`);
	}
	if (width && height && crop) {
		transforms.push(`c_${crop}`);
	}

	const transformString = transforms.join(",");
	return `${prefix}${transformString}/${rest}`;
}
