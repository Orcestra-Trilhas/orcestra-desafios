"use client";

import { ExternalLink, GitPullRequest } from "lucide-react";
import { memo, useCallback } from "react";
import { BauhausSkeleton, PopStamp } from "@/components/pop-elements";
import type { AdminSubmission } from "./types";

interface SubmissionsTabProps {
	isLoading: boolean;
	onSelectSubmission: (submission: AdminSubmission) => void;
	submissions: AdminSubmission[];
}

interface SubmissionItemProps {
	onSelect: (sub: AdminSubmission) => void;
	submission: AdminSubmission;
}

const SubmissionItem = memo(function SubmissionItemRender({
	submission: sub,
	onSelect,
}: SubmissionItemProps) {
	const handleAssessClick = useCallback(() => {
		onSelect(sub);
	}, [onSelect, sub]);

	const members = [sub.member1, sub.member2, sub.member3].filter(
		(m): m is NonNullable<typeof m> => Boolean(m)
	);

	return (
		<div className="flex flex-col justify-between gap-3 rounded-md border-2 border-border bg-card p-3.5 shadow-hard-sm sm:flex-row sm:items-center sm:p-4">
			<div className="min-w-0 flex-1 space-y-1.5">
				<div className="flex min-w-0 items-center gap-2">
					<span
						className="min-w-0 truncate font-black font-display text-sm uppercase sm:text-base"
						title={sub.challenge?.title}
					>
						{sub.challenge?.title}
					</span>
					<PopStamp
						status={
							sub.status as
								| "IN_PROGRESS"
								| "SUBMITTED"
								| "APPROVED"
								| "CHANGES_REQUESTED"
						}
					/>
				</div>

				<div className="flex min-w-0 max-w-full items-center gap-1.5 font-mono text-muted-foreground text-xs uppercase sm:gap-2">
					<span
						className="min-w-0 max-w-[260px] truncate sm:max-w-[380px]"
						title={`DUPLA: ${members.map((m) => m.name).join(" & ")}`}
					>
						DUPLA: {members.map((m) => m.name).join(" & ")}
					</span>
					<span className="shrink-0">{"//"}</span>
					<span className="shrink-0">TIPO: {sub.submissionType ?? "PR"}</span>
				</div>

				<div className="flex flex-wrap items-center gap-2 pt-0.5">
					{sub.prUrl ? (
						<a
							className="inline-flex items-center gap-1 font-bold font-mono text-primary text-xs hover:underline"
							href={sub.prUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							<GitPullRequest className="h-3 w-3" />
							<span>GITHUB PR</span>
						</a>
					) : null}
					{sub.repoUrl ? (
						<a
							className="inline-flex items-center gap-1 font-bold font-mono text-muted-foreground text-xs hover:underline"
							href={sub.repoUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							<ExternalLink className="h-3 w-3" />
							<span>REPOSITÓRIO</span>
						</a>
					) : null}
				</div>
			</div>

			<button
				className="btn-tactile w-full self-stretch rounded-md border-2 border-border bg-primary px-4 py-2 text-center font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 sm:w-auto sm:self-auto"
				onClick={handleAssessClick}
				type="button"
			>
				AVALIAR SOLUÇÃO &rarr;
			</button>
		</div>
	);
});

export const SubmissionsTab = memo(function SubmissionsTabRender({
	isLoading,
	submissions,
	onSelectSubmission,
}: SubmissionsTabProps) {
	if (isLoading) {
		return <BauhausSkeleton />;
	}

	if (submissions.length === 0) {
		return (
			<div className="rounded-md border-2 border-border border-dashed bg-card p-8 text-center">
				<p className="font-black font-display text-muted-foreground text-xs uppercase">
					Nenhuma submissão pendente na fila no momento.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{submissions.map((sub) => (
				<SubmissionItem
					key={sub.id}
					onSelect={onSelectSubmission}
					submission={sub}
				/>
			))}
		</div>
	);
});
