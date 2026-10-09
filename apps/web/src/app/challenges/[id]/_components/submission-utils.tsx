import Image from "next/image";
import type React from "react";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";
import type { Evidence } from "./types";

export function extractEvidenceUrls(notes: string): Evidence[] {
	const regex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
	const matches: Evidence[] = [];
	let match = regex.exec(notes);
	while (match !== null) {
		matches.push({
			alt: match[1] || "Evidência",
			raw: match[0],
			url: match[2],
		});
		match = regex.exec(notes);
	}
	return matches;
}

export function renderSubmissionNotes(notes: string): React.ReactNode {
	const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
	const parts: React.ReactNode[] = [];
	let lastIndex = 0;
	let match = imgRegex.exec(notes);

	while (match !== null) {
		const [fullMatch, altText, imgUrl] = match;
		const textBefore = notes.slice(lastIndex, match.index);
		if (textBefore.trim()) {
			parts.push(
				<p
					className="whitespace-pre-wrap leading-relaxed"
					key={`text-${lastIndex}`}
				>
					{textBefore.trim()}
				</p>
			);
		}
		parts.push(
			<div
				className="my-2 overflow-hidden rounded-md border-2 border-black bg-black/5 dark:border-white dark:bg-black/20"
				key={`img-${match.index}`}
			>
				<Image
					alt={altText || "Evidência da Solução"}
					className="max-h-72 w-full object-contain"
					height={288}
					loading="lazy"
					src={getOptimizedMediaUrl(imgUrl, {
						crop: "limit",
						width: 800,
					})}
					unoptimized
					width={400}
				/>
			</div>
		);
		lastIndex = match.index + fullMatch.length;
		match = imgRegex.exec(notes);
	}

	const remainingText = notes.slice(lastIndex);
	if (remainingText.trim()) {
		parts.push(
			<p
				className="whitespace-pre-wrap leading-relaxed"
				key={`text-${lastIndex}`}
			>
				{remainingText.trim()}
			</p>
		);
	}

	return parts.length > 0 ? (
		parts
	) : (
		<p className="whitespace-pre-wrap">{notes}</p>
	);
}
