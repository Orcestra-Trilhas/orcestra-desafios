import type React from "react";
import { useCallback } from "react";
import { DEPARTMENTS, type Department } from "./types";

interface EditPersonalDataCardProps {
	department: Department;
	isPending: boolean;
	name: string;
	onChangeDepartment: (dep: Department) => void;
	onChangeName: (name: string) => void;
	onChangeWhatsapp: (wa: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	whatsapp: string;
}

export function EditPersonalDataCard({
	department,
	isPending,
	name,
	onChangeDepartment,
	onChangeName,
	onChangeWhatsapp,
	onSubmit,
	whatsapp,
}: EditPersonalDataCardProps) {
	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChangeName(e.target.value);
		},
		[onChangeName]
	);

	const handleDepartmentChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			onChangeDepartment(e.target.value as Department);
		},
		[onChangeDepartment]
	);

	const handleWhatsappChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChangeWhatsapp(e.target.value);
		},
		[onChangeWhatsapp]
	);

	return (
		<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
			<div className="border-black/10 border-b-2 pb-2 dark:border-white/10">
				<h2 className="font-black font-display text-sm uppercase tracking-wider">
					DADOS PESSOAIS & COMUNICAÇÃO
				</h2>
			</div>

			<form className="space-y-4" onSubmit={onSubmit}>
				<div className="space-y-1.5">
					<label
						className="font-bold font-display text-xs uppercase tracking-wider"
						htmlFor="name"
					>
						Nome Completo
					</label>
					<input
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-primary focus:outline-hidden dark:border-white"
						id="name"
						onChange={handleNameChange}
						required
						type="text"
						value={name}
					/>
				</div>

				<div className="space-y-1.5">
					<label
						className="font-bold font-display text-xs uppercase tracking-wider"
						htmlFor="department"
					>
						Diretoria
					</label>
					<select
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-primary focus:outline-hidden dark:border-white"
						id="department"
						onChange={handleDepartmentChange}
						value={department}
					>
						{DEPARTMENTS.map((d) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-1.5">
					<label
						className="font-bold font-display text-xs uppercase tracking-wider"
						htmlFor="whatsapp"
					>
						WhatsApp com DDD
					</label>
					<input
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-primary focus:outline-hidden dark:border-white"
						id="whatsapp"
						onChange={handleWhatsappChange}
						placeholder="5511999998888"
						type="tel"
						value={whatsapp}
					/>
				</div>

				<button
					className="btn-tactile w-full rounded-md border-2 border-black bg-primary py-2.5 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 disabled:opacity-50 dark:border-white"
					disabled={isPending}
					type="submit"
				>
					{isPending ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
				</button>
			</form>
		</div>
	);
}
