"use client";

import { memo, useCallback } from "react";

export const DEPARTMENTS = [
	{ id: "DIPROJ", label: "DIPROJ" },
	{ id: "DIBIS", label: "DIBIS" },
	{ id: "DICOM", label: "DICOM" },
	{ id: "TOPS", label: "TOPS" },
] as const;

export const TRACKS = [
	{ id: "FRONT", label: "FRONTEND" },
	{ id: "BACK", label: "BACKEND" },
	{ id: "PROTOTIPACAO", label: "PROTÓTIPO" },
	{ id: "DEVOPS", label: "DEVOPS" },
] as const;

const TRACK_ACTIVE_STYLES: Record<string, string> = {
	BACK: "border-black bg-[#1E40AF] text-white shadow-hard-sm dark:border-white dark:bg-[#2563EB]",
	DEVOPS:
		"border-black bg-[#FACC15] text-[#121212] shadow-hard-sm dark:border-white dark:bg-[#F59E0B]",
	FRONT:
		"border-black bg-[#EA580C] text-white shadow-hard-sm dark:border-white dark:bg-[#EA580C]",
	PROTOTIPACAO:
		"border-black bg-[#15803D] text-white shadow-hard-sm dark:border-white dark:bg-[#16A34A]",
};

interface FilterPillProps {
	activeStyle?: string;
	id: string;
	isSelected: boolean;
	label: string;
	onSelect: (id: string) => void;
}

const FilterPill = memo(function FilterPillRender({
	id,
	label,
	isSelected,
	onSelect,
	activeStyle,
}: FilterPillProps) {
	const handleClick = useCallback(() => {
		onSelect(id);
	}, [onSelect, id]);

	return (
		<button
			className={`btn-tactile rounded-md border-2 px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:px-3 sm:text-xs ${
				isSelected
					? (activeStyle ??
						"border-black bg-primary text-primary-foreground shadow-hard-sm dark:border-white")
					: "border-black/30 bg-card text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
			}`}
			onClick={handleClick}
			type="button"
		>
			{label}
		</button>
	);
});

interface RankingFiltersProps {
	filterType: "ALL" | "DEPARTMENT" | "TRACK";
	filterValue: string;
	onFilterTypeChange: (type: "ALL" | "DEPARTMENT" | "TRACK") => void;
	onFilterValueChange: (val: string) => void;
	onViewModeChange: (mode: "PAIRS" | "MEMBERS") => void;
	viewMode: "PAIRS" | "MEMBERS";
}

export const RankingFilters = memo(function RankingFiltersRender({
	filterType,
	filterValue,
	onFilterTypeChange,
	onFilterValueChange,
	viewMode,
	onViewModeChange,
}: RankingFiltersProps) {
	const handleSelectAll = useCallback(() => {
		onFilterTypeChange("ALL");
		onFilterValueChange("");
	}, [onFilterTypeChange, onFilterValueChange]);

	const handleSelectDept = useCallback(() => {
		onFilterTypeChange("DEPARTMENT");
		onFilterValueChange("DIPROJ");
	}, [onFilterTypeChange, onFilterValueChange]);

	const handleSelectTrack = useCallback(() => {
		onFilterTypeChange("TRACK");
		onFilterValueChange("FRONT");
	}, [onFilterTypeChange, onFilterValueChange]);

	const handleSelectPairs = useCallback(() => {
		onViewModeChange("PAIRS");
	}, [onViewModeChange]);

	const handleSelectMembers = useCallback(() => {
		onViewModeChange("MEMBERS");
	}, [onViewModeChange]);

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
				{/* Category Tabs */}
				<div className="flex items-center gap-1 overflow-x-auto rounded-md border-2 border-black bg-secondary p-1 dark:border-white">
					<button
						className={`btn-tactile shrink-0 rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
							filterType === "ALL"
								? "border-2 border-black bg-primary text-primary-foreground shadow-hard-sm dark:border-white"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSelectAll}
						type="button"
					>
						GERAL
					</button>

					<button
						className={`btn-tactile shrink-0 rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
							filterType === "DEPARTMENT"
								? "border-2 border-black bg-primary text-primary-foreground shadow-hard-sm dark:border-white"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSelectDept}
						type="button"
					>
						DIRETORIA
					</button>

					<button
						className={`btn-tactile shrink-0 rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
							filterType === "TRACK"
								? "border-2 border-black bg-primary text-primary-foreground shadow-hard-sm dark:border-white"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSelectTrack}
						type="button"
					>
						TRILHA TÉCNICA
					</button>
				</div>

				{/* View Mode Toggle */}
				<div className="flex items-center gap-1 self-start rounded-md border-2 border-black bg-secondary p-1 sm:self-auto dark:border-white">
					<button
						className={`btn-tactile rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
							viewMode === "PAIRS"
								? "border-2 border-black bg-foreground text-background shadow-hard-sm dark:border-white"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSelectPairs}
						type="button"
					>
						DUPLAS
					</button>

					<button
						className={`btn-tactile rounded px-2.5 py-1 font-black font-display text-[11px] uppercase transition sm:text-xs ${
							viewMode === "MEMBERS"
								? "border-2 border-black bg-foreground text-background shadow-hard-sm dark:border-white"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSelectMembers}
						type="button"
					>
						MEMBROS
					</button>
				</div>
			</div>

			{/* Sub-filters for Department */}
			{filterType === "DEPARTMENT" ? (
				<div className="flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
					{DEPARTMENTS.map((dept) => (
						<FilterPill
							activeStyle="border-black bg-[#1E40AF] text-white shadow-hard-sm dark:border-white dark:bg-[#2563EB]"
							id={dept.id}
							isSelected={filterValue === dept.id}
							key={dept.id}
							label={dept.label}
							onSelect={onFilterValueChange}
						/>
					))}
				</div>
			) : null}

			{/* Sub-filters for Track */}
			{filterType === "TRACK" ? (
				<div className="flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
					{TRACKS.map((t) => (
						<FilterPill
							activeStyle={TRACK_ACTIVE_STYLES[t.id]}
							id={t.id}
							isSelected={filterValue === t.id}
							key={t.id}
							label={t.label}
							onSelect={onFilterValueChange}
						/>
					))}
				</div>
			) : null}
		</div>
	);
});
