"use client";

import { useMutation } from "@tanstack/react-query";
import { Camera, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Falha ao ler o arquivo selecionado"));
			}
		};
		reader.onerror = () => {
			reject(reader.error ?? new Error("Erro ao ler arquivo"));
		};
		reader.readAsDataURL(file);
	});
}

async function performDirectUpload(
	file: File,
	folder: string,
	getSignature: (input: { folder: string }) => Promise<{
		apiKey: string;
		cloudName: string;
		folder: string;
		signature: string;
		timestamp: number;
	}>
): Promise<{ errorDetail: string | null; url: string | null }> {
	try {
		const sigData = await getSignature({ folder });

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

		if (res.ok) {
			const data = (await res.json()) as { secure_url?: string };
			if (data.secure_url) {
				return { errorDetail: null, url: data.secure_url };
			}
		}

		const errorData = (await res.json().catch(() => null)) as {
			error?: { message?: string };
		} | null;
		return {
			errorDetail:
				errorData?.error?.message ??
				`Erro HTTP ${res.status}: ${res.statusText}`,
			url: null,
		};
	} catch (clientErr: unknown) {
		const errorDetail =
			clientErr instanceof Error
				? clientErr.message
				: "Falha na conexão direta com o Cloudinary";
		return { errorDetail, url: null };
	}
}

async function performServerUpload(
	file: File,
	folder: string,
	uploadDirect: (input: { base64: string; folder: string }) => Promise<{
		publicId: string;
		secureUrl: string;
		url: string;
	}>,
	directErrorDetail: string | null
): Promise<string> {
	try {
		const base64 = await readFileAsDataUrl(file);
		const serverRes = await uploadDirect({
			base64,
			folder,
		});
		if (serverRes.secureUrl) {
			return serverRes.secureUrl;
		}
		throw new Error("Servidor não retornou URL válida.");
	} catch (serverErr: unknown) {
		const serverMsg =
			serverErr instanceof Error ? serverErr.message : "Falha no servidor";
		const finalMessage = directErrorDetail
			? `${directErrorDetail} | Servidor: ${serverMsg}`
			: serverMsg;
		throw new Error(finalMessage, { cause: serverErr });
	}
}

export interface UseCloudinaryUploadOptions {
	folder?: string;
	maxSizeMb?: number;
	onUploadSuccess: (url: string) => void;
}

export function useCloudinaryUpload({
	folder = "orcestra-desafios",
	maxSizeMb = 10,
	onUploadSuccess,
}: UseCloudinaryUploadOptions) {
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const getSignature = useMutation(
		trpc.cloudinary.getSignature.mutationOptions()
	);
	const uploadDirect = useMutation(
		trpc.cloudinary.uploadDirect.mutationOptions()
	);

	const uploadFile = async (file: File) => {
		const maxSizeBytes = maxSizeMb * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			toast.error(`O arquivo deve ter no máximo ${maxSizeMb}MB`);
			return;
		}

		setIsUploading(true);

		try {
			const directResult = await performDirectUpload(file, folder, (input) =>
				getSignature.mutateAsync(input)
			);
			let finalUrl = directResult.url;

			if (!finalUrl) {
				finalUrl = await performServerUpload(
					file,
					folder,
					(input) => uploadDirect.mutateAsync(input),
					directResult.errorDetail
				);
			}

			toast.success("Upload realizado com sucesso!");
			onUploadSuccess(finalUrl);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Erro ao enviar imagem";
			toast.error(message);
		} finally {
			setIsUploading(false);
			if (typeof document !== "undefined" && fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await uploadFile(file);
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			await uploadFile(file);
		}
	};

	const openFileDialog = () => {
		fileInputRef.current?.click();
	};

	return {
		fileInputRef,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileChange,
		isDragging,
		isUploading,
		openFileDialog,
		uploadFile,
	};
}

export interface CloudinaryUploadButtonProps {
	accept?: string;
	className?: string;
	disabled?: boolean;
	folder?: string;
	label?: string;
	maxSizeMb?: number;
	onUploadSuccess: (url: string) => void;
	variant?: "button" | "dropzone" | "avatar";
}

function DropzoneContent({
	isDragging,
	isUploading,
	label,
	maxSizeMb,
}: {
	isDragging: boolean;
	isUploading: boolean;
	label: string;
	maxSizeMb: number;
}) {
	if (isUploading) {
		return (
			<div className="flex flex-col items-center gap-2 py-3">
				<Loader2 className="h-6 w-6 animate-spin text-[#FF4A1C]" />
				<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
					ENVIANDO PARA A NUVEM...
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-1.5 py-1">
			<div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-black bg-secondary shadow-hard-xs dark:border-white">
				{isDragging ? (
					<Upload className="h-5 w-5 text-[#FF4A1C]" />
				) : (
					<ImageIcon className="h-5 w-5" />
				)}
			</div>
			<span className="font-black font-display text-foreground text-xs uppercase tracking-wider">
				{isDragging ? "SOLTE A IMAGEM AQUI" : <span>{label}</span>}
			</span>
			<span className="font-mono text-[10px] text-muted-foreground">
				ARRASTE OU CLIQUE PARA ENVIAR (MÁX. {maxSizeMb}MB)
			</span>
		</div>
	);
}

function AvatarButtonContent({
	isUploading,
	label,
}: {
	isUploading: boolean;
	label: string;
}) {
	if (isUploading) {
		return (
			<div className="flex items-center gap-1.5 px-2 py-1">
				<Loader2 className="h-4 w-4 animate-spin text-[#FF4A1C]" />
				<span>ENVIANDO...</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1.5 px-2 py-1">
			<Camera className="h-4 w-4" />
			<span>{label || "ALTERAR FOTO"}</span>
		</div>
	);
}

function DefaultButtonContent({
	isUploading,
	label,
}: {
	isUploading: boolean;
	label: string;
}) {
	if (isUploading) {
		return (
			<>
				<Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF4A1C]" />
				<span>ENVIANDO...</span>
			</>
		);
	}

	return (
		<>
			<Upload className="h-3.5 w-3.5" />
			<span>+ {label}</span>
		</>
	);
}

export default function CloudinaryUploadButton({
	onUploadSuccess,
	folder = "orcestra-desafios",
	label = "Upload de Imagem / GIF",
	accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp",
	className = "",
	disabled = false,
	maxSizeMb = 10,
	variant = "button",
}: CloudinaryUploadButtonProps) {
	const {
		fileInputRef,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileChange,
		isDragging,
		isUploading,
		openFileDialog,
	} = useCloudinaryUpload({
		folder,
		maxSizeMb,
		onUploadSuccess,
	});

	const isDisabled = disabled || isUploading;

	const commonInput = (
		<input
			accept={accept}
			className="hidden"
			disabled={isDisabled}
			onChange={handleFileChange}
			ref={fileInputRef}
			type="file"
		/>
	);

	if (variant === "dropzone") {
		const dropzoneBorder = isDragging
			? "border-[#FF4A1C] bg-[#FF4A1C]/10 scale-[1.01]"
			: "border-black border-dashed bg-secondary/30 hover:bg-secondary/60 dark:border-white";

		return (
			<div>
				{commonInput}
				<button
					aria-label={label}
					className={`btn-tactile group flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 p-5 text-center transition ${dropzoneBorder} ${className}`}
					disabled={isDisabled}
					onClick={openFileDialog}
					onDragEnter={handleDragOver}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					type="button"
				>
					<DropzoneContent
						isDragging={isDragging}
						isUploading={isUploading}
						label={label}
						maxSizeMb={maxSizeMb}
					/>
				</button>
			</div>
		);
	}

	if (variant === "avatar") {
		return (
			<div>
				{commonInput}
				<button
					aria-label="Alterar foto de perfil"
					className={`btn-tactile group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-black bg-secondary p-1 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted disabled:opacity-50 dark:border-white ${className}`}
					disabled={isDisabled}
					onClick={openFileDialog}
					onDragEnter={handleDragOver}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					type="button"
				>
					<AvatarButtonContent isUploading={isUploading} label={label} />
				</button>
			</div>
		);
	}

	return (
		<div>
			{commonInput}
			<button
				aria-label={label}
				className={`btn-tactile inline-flex cursor-pointer items-center gap-1.5 rounded-md border-2 border-black bg-secondary px-3 py-1.5 font-black font-display text-xs uppercase shadow-hard-sm hover:bg-muted disabled:opacity-50 dark:border-white ${className}`}
				disabled={isDisabled}
				onClick={openFileDialog}
				onDragEnter={handleDragOver}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				type="button"
			>
				<DefaultButtonContent isUploading={isUploading} label={label} />
			</button>
		</div>
	);
}
