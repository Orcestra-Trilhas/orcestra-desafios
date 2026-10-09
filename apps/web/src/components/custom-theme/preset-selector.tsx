"use client";

import { Check } from "lucide-react";
import { memo, useCallback } from "react";
import { type CustomThemeConfig, THEME_PRESETS } from "@/lib/custom-theme";

interface PresetSelectorProps {
	onSelect: (preset: CustomThemeConfig) => void;
	selectedName: string;
}

interface PresetItemButtonProps {
	isSelected: boolean;
	onSelect: (preset: CustomThemeConfig) => void;
	preset: CustomThemeConfig;
}

const PresetItemButton = memo(function PresetItemButtonRender({
	preset,
	isSelected,
	onSelect,
}: PresetItemButtonProps) {
	const handleClick = useCallback(() => {
		onSelect(preset);
	}, [onSelect, preset]);

	return (
		<button
			className={`btn-tactile flex items-center justify-between rounded-md border-2 border-black p-2.5 text-left font-black font-display text-xs uppercase shadow-hard-sm transition dark:border-white ${
				isSelected
					? "bg-primary text-primary-foreground shadow-hard"
					: "bg-secondary text-secondary-foreground hover:bg-muted"
			}`}
			onClick={handleClick}
			type="button"
		>
			<div className="flex min-w-0 items-center gap-2">
				<span
					className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black dark:border-white"
					style={{ backgroundColor: preset.background }}
				>
					<span
						className="h-2 w-2 rounded-full"
						style={{ backgroundColor: preset.primary }}
					/>
				</span>
				<span className="truncate">{preset.name}</span>
			</div>
			{isSelected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
		</button>
	);
});

export const PresetSelector = memo(function PresetSelectorRender({
	selectedName,
	onSelect,
}: PresetSelectorProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="font-black font-display text-muted-foreground text-xs uppercase tracking-wider">
					PALETAS DE INSPIRAÇÃO (3 DARK & 3 LIGHT)
				</span>
				<span className="font-mono text-[10px] text-muted-foreground uppercase">
					Clique para testar
				</span>
			</div>

			{/* 3 Dark Presets */}
			<div className="space-y-1.5">
				<div className="flex items-center gap-1.5 font-black font-display text-[10px] text-muted-foreground uppercase tracking-wider">
					<span className="inline-block h-2 w-2 rounded-full border border-black bg-[#121212] dark:border-white" />
					<span>TEMAS ESCUROS (DARK)</span>
				</div>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					{Object.entries(THEME_PRESETS)
						.filter(([_, p]) => p.baseMode === "dark")
						.map(([key, preset]) => (
							<PresetItemButton
								isSelected={selectedName === preset.name}
								key={key}
								onSelect={onSelect}
								preset={preset}
							/>
						))}
				</div>
			</div>

			{/* 3 Light Presets */}
			<div className="space-y-1.5 pt-1">
				<div className="flex items-center gap-1.5 font-black font-display text-[10px] text-muted-foreground uppercase tracking-wider">
					<span className="inline-block h-2 w-2 rounded-full border border-black bg-white" />
					<span>TEMAS CLAROS (LIGHT)</span>
				</div>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					{Object.entries(THEME_PRESETS)
						.filter(([_, p]) => p.baseMode === "light")
						.map(([key, preset]) => (
							<PresetItemButton
								isSelected={selectedName === preset.name}
								key={key}
								onSelect={onSelect}
								preset={preset}
							/>
						))}
				</div>
			</div>
		</div>
	);
});
