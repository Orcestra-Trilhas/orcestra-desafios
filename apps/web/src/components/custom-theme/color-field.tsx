"use client";

import { memo, useCallback } from "react";

interface ColorFieldProps {
	description?: string;
	id: string;
	label: string;
	onChange: (value: string) => void;
	value: string;
}

export const ColorField = memo(function ColorFieldRender({
	description,
	id,
	label,
	onChange,
	value,
}: ColorFieldProps) {
	const handleColorChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	const handleTextChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	return (
		<div className="space-y-1.5">
			<label
				className="flex items-center justify-between font-black font-display text-xs uppercase tracking-wider"
				htmlFor={id}
			>
				<span>{label}</span>
				{description ? (
					<span className="font-normal font-sans text-[10px] text-muted-foreground normal-case">
						{description}
					</span>
				) : null}
			</label>
			<div className="flex items-center gap-2">
				<input
					aria-label={`Selecionador de cor para ${label}`}
					className="h-10 w-12 cursor-pointer rounded-md border-2 border-black bg-transparent p-1 shadow-hard-sm dark:border-white"
					id={id}
					onChange={handleColorChange}
					type="color"
					value={value}
				/>
				<input
					aria-label={`Valor hexadecimal para ${label}`}
					className="h-10 flex-1 rounded-md border-2 border-black bg-background px-3 font-bold font-mono text-xs uppercase tracking-widest shadow-hard-sm focus:border-primary focus:outline-hidden dark:border-white"
					onChange={handleTextChange}
					value={value}
				/>
			</div>
		</div>
	);
});

export interface ColorFieldWithContrastProps {
	autoContrast: boolean;
	bgDescription?: string;
	bgId: string;
	bgLabel: string;
	bgValue: string;
	computedFg: string;
	fgDescription?: string;
	fgId: string;
	fgLabel: string;
	fgValue: string;
	onBgChange: (value: string) => void;
	onFgChange: (value: string) => void;
	onToggleAutoContrast: (auto: boolean) => void;
}

export const ColorFieldWithContrast = memo(
	function ColorFieldWithContrastRender({
		autoContrast,
		bgDescription,
		bgId,
		bgLabel,
		bgValue,
		computedFg,
		fgDescription,
		fgId,
		fgLabel,
		fgValue,
		onBgChange,
		onFgChange,
		onToggleAutoContrast,
	}: ColorFieldWithContrastProps) {
		const toggleAuto = useCallback(() => {
			onToggleAutoContrast(!autoContrast);
		}, [autoContrast, onToggleAutoContrast]);

		return (
			<div className="space-y-3 rounded-md border-2 border-black/20 bg-muted/20 p-3 dark:border-white/20">
				<div className="flex items-center justify-between">
					<span className="font-black font-display text-xs uppercase tracking-wider">
						{bgLabel}
					</span>
					<button
						className={`rounded border border-black px-2 py-0.5 font-bold font-display text-[10px] uppercase shadow-hard-xs transition-colors dark:border-white ${
							autoContrast
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground hover:bg-muted"
						}`}
						onClick={toggleAuto}
						type="button"
					>
						{autoContrast ? "Contraste Automático" : "Texto Manual"}
					</button>
				</div>

				<ColorField
					description={bgDescription}
					id={bgId}
					label="Cor de Fundo"
					onChange={onBgChange}
					value={bgValue}
				/>

				{autoContrast ? (
					<div className="flex items-center justify-between rounded border border-black/10 bg-background/50 px-2.5 py-1.5 text-xs dark:border-white/10">
						<span className="text-[11px] text-muted-foreground">
							Cor do texto/ícone (calculada):
						</span>
						<span
							className="rounded border border-black px-2 py-0.5 font-bold font-mono text-[11px] shadow-hard-xs dark:border-white"
							style={{ backgroundColor: bgValue, color: computedFg }}
						>
							ABC 123 ({computedFg})
						</span>
					</div>
				) : (
					<ColorField
						description={fgDescription ?? "Cor personalizada do texto/ícone"}
						id={fgId}
						label={fgLabel}
						onChange={onFgChange}
						value={fgValue}
					/>
				)}
			</div>
		);
	}
);
