import Link from "next/link";
import type React from "react";

export interface LeaderboardMember {
	id: string;
	name: string;
}

export interface LeaderboardItem {
	department?: string | null;
	id?: string;
	members?: LeaderboardMember[];
	name?: string;
	points?: number;
	score?: number;
}

export function renderMemberLinks(
	item: LeaderboardItem,
	short = false
): React.ReactNode {
	if (
		"members" in item &&
		Array.isArray(item.members) &&
		item.members.length > 0
	) {
		return item.members.map((m, idx) => (
			<span key={m.id || idx}>
				<Link
					className="hover:text-[#FF4A1C] hover:underline"
					href={`/profile?id=${m.id}`}
				>
					{short ? m.name.split(" ")[0] : m.name}
				</Link>
				{idx < (item.members?.length ?? 0) - 1 ? " & " : ""}
			</span>
		));
	}
	if (item.id && item.name) {
		return (
			<Link
				className="hover:text-[#FF4A1C] hover:underline"
				href={`/profile?id=${item.id}`}
			>
				{short ? item.name.split(" ")[0] : item.name}
			</Link>
		);
	}
	return item.name || "MEMBRO";
}
