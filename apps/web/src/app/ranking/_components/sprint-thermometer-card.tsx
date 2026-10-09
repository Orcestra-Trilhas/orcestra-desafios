"use client";

import { memo } from "react";

export interface SprintThermometerData {
	completed: number;
	percentage: number;
	target: number;
	total: number;
}

interface SprintThermometerCardProps {
	thermometer: SprintThermometerData;
}

export const SprintThermometerCard = memo(function SprintThermometerCardRender({
	thermometer,
}: SprintThermometerCardProps) {
	return (
		<div className="space-y-3 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-5 dark:border-white">
			<div className="flex items-center justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2">
					<div className="h-3 w-3 shrink-0 rounded-full border-2 border-black bg-primary dark:border-white" />
					<span className="truncate font-black font-display text-xs uppercase tracking-wider">
						TERMÔMETRO GERAL DAS MISSÕES
					</span>
				</div>
				<span className="shrink-0 font-black font-mono text-[11px] sm:text-xs">
					{thermometer.completed} ENTREGAS ({thermometer.percentage}%)
				</span>
			</div>

			{/* Two-tone stark Bauhaus meter */}
			<div className="h-5 w-full overflow-hidden rounded-xs border-2 border-black bg-secondary p-0.5 dark:border-white">
				<div
					className="h-full border-black border-r-2 bg-primary transition-all duration-500 dark:border-white"
					style={{
						width: `${Math.min(Math.max(thermometer.percentage, 3), 100)}%`,
					}}
				/>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-muted-foreground uppercase sm:text-[11px]">
				<span>META COLETIVA: {thermometer.target} ENTREGAS APROVADAS</span>
				<span className="font-bold text-foreground">
					{thermometer.percentage >= 100
						? "[META ALCANÇADA]"
						: "[MISSÕES EM ANDAMENTO]"}
				</span>
			</div>
		</div>
	);
});
