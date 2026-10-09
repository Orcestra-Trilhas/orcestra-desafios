import Image from "next/image";
import type React from "react";
import { useCallback, useState } from "react";
import CloudinaryUploadButton from "@/components/cloudinary-upload-button";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";
import { DEPARTMENTS, type Department } from "./types";

interface EditPersonalDataCardProps {
	department: Department;
	gifUrl: string;
	isPending: boolean;
	name: string;
	onChangeDepartment: (dep: Department) => void;
	onChangeGifUrl: (url: string) => void;
	onChangeName: (name: string) => void;
	onChangeWhatsapp: (wa: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onUploadAvatar: (url: string) => void;
	whatsapp: string;
}

export function EditPersonalDataCard({
	department,
	gifUrl,
	isPending,
	name,
	onChangeDepartment,
	onChangeGifUrl,
	onChangeName,
	onChangeWhatsapp,
	onSubmit,
	onUploadAvatar,
	whatsapp,
}: EditPersonalDataCardProps) {
	const [showManualUrl, setShowManualUrl] = useState(false);

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

	const handleClearGif = useCallback(() => {
		onChangeGifUrl("");
	}, [onChangeGifUrl]);

	const handleManualUrlChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChangeGifUrl(e.target.value);
		},
		[onChangeGifUrl]
	);

	const toggleManualUrl = useCallback(() => {
		setShowManualUrl((prev) => !prev);
	}, []);

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
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
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
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
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
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
						id="whatsapp"
						onChange={handleWhatsappChange}
						placeholder="5511999998888"
						type="tel"
						value={whatsapp}
					/>
				</div>

				{/* Custom Avatar / GIF via Cloudinary */}
				<div className="space-y-2 rounded-md border-2 border-black bg-secondary/30 p-3 dark:border-white">
					<div className="flex items-center justify-between">
						<label
							className="font-bold font-display text-xs uppercase tracking-wider"
							htmlFor="gifUrl"
						>
							Foto de Perfil / GIF
						</label>
						{gifUrl ? (
							<button
								className="font-mono text-[10px] text-destructive uppercase hover:underline"
								onClick={handleClearGif}
								type="button"
							>
								[Restaurar Padrão]
							</button>
						) : null}
					</div>

					<div className="flex items-center gap-3">
						{gifUrl ? (
							<Image
								alt="Prévia Avatar"
								className="h-16 w-16 rounded-md border-2 border-black object-cover shadow-hard-xs dark:border-white"
								height={64}
								src={getOptimizedMediaUrl(gifUrl, {
									crop: "fill",
									height: 128,
									width: 128,
								})}
								unoptimized
								width={64}
							/>
						) : (
							<div className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-black bg-[#FF4A1C] font-black font-display text-2xl text-white shadow-hard-xs dark:border-white">
								{name ? name.charAt(0).toUpperCase() : "M"}
							</div>
						)}

						<div className="flex-1 space-y-1">
							<CloudinaryUploadButton
								folder="orcestra-avatars"
								label="Enviar Nova Foto"
								onUploadSuccess={onUploadAvatar}
							/>
							<p className="font-mono text-[10px] text-muted-foreground">
								PNG, JPG, GIF ou WEBP (máx. 10MB)
							</p>
						</div>
					</div>

					{/* Advanced: Manual URL */}
					<div className="pt-1">
						<button
							className="font-mono text-[10px] text-muted-foreground uppercase underline hover:text-foreground"
							onClick={toggleManualUrl}
							type="button"
						>
							{showManualUrl
								? "▲ Ocultar link manual de imagem"
								: "▼ Inserir link de imagem/GIF diretamente"}
						</button>
						{showManualUrl ? (
							<div className="pt-2">
								<input
									className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
									id="gifUrl"
									onChange={handleManualUrlChange}
									placeholder="https://res.cloudinary.com/... ou URL de imagem"
									type="url"
									value={gifUrl}
								/>
							</div>
						) : null}
					</div>
				</div>

				<button
					className="btn-tactile w-full rounded-md border-2 border-black bg-[#FF4A1C] py-2.5 font-black font-display text-white text-xs uppercase tracking-wider shadow-hard-sm hover:bg-[#E03A10] disabled:opacity-50 dark:border-white"
					disabled={isPending}
					type="submit"
				>
					{isPending ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
				</button>
			</form>
		</div>
	);
}
