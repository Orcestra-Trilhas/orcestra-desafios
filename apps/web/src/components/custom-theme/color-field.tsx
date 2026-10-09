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
