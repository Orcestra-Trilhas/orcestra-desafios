interface CollectiveThermometerCardProps {
	submittedCount: number;
	thermometerPercent: number;
	totalPairs: number;
}

export function CollectiveThermometerCard({
	submittedCount,
	thermometerPercent,
	totalPairs,
}: CollectiveThermometerCardProps) {
	return (
		<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-5 dark:border-white">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-full border-2 border-black bg-[#FF4A1C] dark:border-white" />
					<span className="font-black font-display text-[11px] uppercase tracking-wider sm:text-xs">
						TERMÔMETRO COLETIVO {"//"} META DA EJ
					</span>
				</div>
				<span className="font-black font-mono text-[11px] sm:text-xs">
					{submittedCount} DE {totalPairs} DUPLAS ({thermometerPercent}%)
				</span>
			</div>

			<div className="h-4 w-full overflow-hidden rounded-xs border-2 border-black bg-secondary p-0.5 dark:border-white">
				<div
					className="h-full border-black border-r-2 bg-[#FF4A1C] transition-all duration-500 dark:border-white"
					style={{ width: `${Math.min(thermometerPercent, 100)}%` }}
				/>
			</div>

			<p className="font-mono text-[10px] text-muted-foreground uppercase sm:text-[11px]">
				CADA ENTREGA SOMA PARA A PONTUAÇÃO COLETIVA DA EJ NAS MISSÕES.
			</p>
		</div>
	);
}
