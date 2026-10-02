"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface CloudinaryUploadButtonProps {
	accept?: string;
	className?: string;
	folder?: string;
	label?: string;
	onUploadSuccess: (url: string) => void;
	variant?: "button" | "dropzone";
}

export default function CloudinaryUploadButton({
	onUploadSuccess,
	folder = "orcestra-desafios",
	label = "Upload de Imagem / GIF",
	accept = "image/*",
	className = "",
	variant = "button",
}: CloudinaryUploadButtonProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const getSignature = useMutation(
		trpc.cloudinary.getSignature.mutationOptions()
	);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		// 10MB limit
		if (file.size > 10 * 1024 * 1024) {
			toast.error("O arquivo deve ter no máximo 10MB");
			return;
		}

		setIsUploading(true);

		try {
			// 1. Get signed auth from tRPC
			const sigData = await getSignature.mutateAsync({ folder });

			// 2. Upload directly to Cloudinary
			const formData = new FormData();
			formData.append("file", file);
			formData.append("api_key", sigData.apiKey);
			formData.append("timestamp", String(sigData.timestamp));
			formData.append("signature", sigData.signature);
			formData.append("folder", sigData.folder);

			const res = await fetch(
				`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
				{
					body: formData,
					method: "POST",
				}
			);

			if (!res.ok) {
				throw new Error("Falha no upload para o Cloudinary");
			}

			const data = await res.json();
			if (data.secure_url) {
				toast.success("Upload realizado com sucesso no Cloudinary! ☁️");
				onUploadSuccess(data.secure_url);
			} else {
				throw new Error("Resposta inválida do Cloudinary");
			}
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Erro ao enviar imagem";
			toast.error(message);
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div>
			<input
				accept={accept}
				className="hidden"
				onChange={handleFileChange}
				ref={fileInputRef}
				type="file"
			/>

			{variant === "dropzone" ? (
				<button
					className={`btn-tactile group flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-black border-dashed bg-secondary/30 p-4 text-center transition hover:bg-secondary/60 dark:border-white ${className}`}
					disabled={isUploading}
					onClick={() => fileInputRef.current?.click()}
					type="button"
				>
					{isUploading ? (
						<div className="flex flex-col items-center gap-1.5 py-2">
							<div className="h-5 w-5 animate-spin rounded-xs border-2 border-black bg-[#FF4A1C] dark:border-white" />
							<span className="font-mono text-muted-foreground text-xs uppercase">
								ENVIANDO PARA A NUVEM...
							</span>
						</div>
					) : (
						<div className="flex flex-col items-center gap-1 py-1">
							<span className="font-black font-display text-foreground text-xs uppercase">
								{label}
							</span>
							<span className="font-mono text-[10px] text-muted-foreground">
								PNG, JPG OU GIF (MÁX. 10MB)
							</span>
						</div>
					)}
				</button>
			) : (
				<button
					className={`btn-tactile inline-flex cursor-pointer items-center gap-1.5 rounded-md border-2 border-black bg-secondary px-3 py-1.5 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted disabled:opacity-50 dark:border-white ${className}`}
					disabled={isUploading}
					onClick={() => fileInputRef.current?.click()}
					type="button"
				>
					{isUploading ? (
						<>
							<div className="h-3 w-3 animate-spin rounded-xs border border-black bg-[#FF4A1C]" />
							<span>ENVIANDO...</span>
						</>
					) : (
						<>
							<span>+ {label}</span>
						</>
					)}
				</button>
			)}
		</div>
	);
}
