interface ChallengeRulesCardProps {
	rulesMarkdown?: string | null;
}

export function ChallengeRulesCard({ rulesMarkdown }: ChallengeRulesCardProps) {
	if (!rulesMarkdown) {
		return null;
	}

	return (
		<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-5 dark:border-white">
			<div className="flex items-center gap-2 border-black/10 border-b-2 pb-2 dark:border-white/10">
				<div className="h-3 w-3 rounded-sm border-2 border-black bg-[#FACC15] dark:border-white" />
				<h3 className="font-black font-display text-xs uppercase tracking-wider sm:text-sm">
					INSTRUÇÕES & REGRAS DO DESAFIO
				</h3>
			</div>
			<div className="whitespace-pre-wrap rounded-md border-2 border-black/20 bg-secondary/50 p-3.5 font-mono text-[11px] leading-relaxed sm:p-4 sm:text-xs dark:border-white/20">
				{rulesMarkdown}
			</div>
		</div>
	);
}
