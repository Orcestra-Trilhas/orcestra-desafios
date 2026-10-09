import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useCallback, useState } from "react";
import CloudinaryUploadButton from "@/components/cloudinary-upload-button";
import { getOptimizedMediaUrl } from "@/lib/cloudinary";
import { GIF_PRESETS, type GifPreset, type ProfileGift } from "./types";

interface ProfileGiftsMuralProps {
	currentUserId?: string;
	currentUserRole?: string;
	gifts: ProfileGift[];
	isOwner: boolean;
	isSendingGift: boolean;
	onDeleteGift: (giftId: string) => void;
	onSendGift: (mediaUrl: string, message: string) => void;
	recipientName?: string | null;
}

type GiftSource = "preset" | "upload" | "url";

function PresetButton({
	isSelected,
	onSelect,
	preset,
}: {
	isSelected: boolean;
	onSelect: (url: string) => void;
	preset: GifPreset;
}) {
	const handleClick = useCallback(() => {
		onSelect(preset.url);
	}, [onSelect, preset.url]);

	return (
		<button
			className={`btn-tactile rounded border-2 px-2 py-1 font-black font-display text-[10px] uppercase transition ${
				isSelected
					? "border-black bg-[#FACC15] text-[#121212] shadow-hard-sm dark:border-white dark:bg-[#F59E0B] dark:text-[#121212]"
					: "border-black/30 bg-background text-muted-foreground hover:border-black dark:border-white/30 dark:hover:text-foreground"
			}`}
			onClick={handleClick}
			type="button"
		>
			{preset.label}
		</button>
	);
}

function GiftCardItem({
	canDelete,
	gift,
	onDelete,
}: {
	canDelete: boolean;
	gift: ProfileGift;
	onDelete: (id: string) => void;
}) {
	const senderName = gift.sender?.name ?? "Membro orc//desafios";
	const senderDept = gift.sender?.department ?? "MEMBRO";
	const senderAvatar = gift.sender?.gifUrl;
	const senderId = gift.sender?.id ?? gift.senderId;

	const handleDelete = useCallback(() => {
		onDelete(gift.id);
	}, [gift.id, onDelete]);

	return (
		<div className="relative flex flex-col justify-between overflow-hidden rounded-lg border-2 border-black bg-secondary/30 p-3 shadow-hard-sm dark:border-white">
			{/* Sender header */}
			<div className="mb-2 flex items-center justify-between border-black/10 border-b pb-2 dark:border-white/10">
				<Link
					className="group flex min-w-0 items-center gap-2"
					href={`/profile?id=${senderId}`}
				>
					{senderAvatar ? (
						<Image
							alt={senderName}
							className="h-6 w-6 shrink-0 rounded-full border border-black object-cover dark:border-white"
							height={24}
							src={getOptimizedMediaUrl(senderAvatar, {
								crop: "fill",
								height: 48,
								width: 48,
							})}
							unoptimized
							width={24}
						/>
					) : (
						<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black bg-[#FF4A1C] font-black text-[10px] text-white dark:border-white">
							{senderName.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="flex min-w-0 flex-col">
						<span className="truncate font-bold font-display text-xs uppercase leading-none group-hover:underline">
							{senderName}
						</span>
						<span className="font-mono text-[9px] text-muted-foreground uppercase">
							{senderDept}
						</span>
					</div>
				</Link>

				<span className="shrink-0 font-mono text-[10px] text-muted-foreground">
					{new Date(gift.createdAt).toLocaleDateString("pt-BR", {
						day: "2-digit",
						month: "short",
					})}
				</span>
			</div>

			{/* Media view */}
			<div className="relative my-1 flex max-h-56 min-h-[140px] items-center justify-center overflow-hidden rounded-md border-2 border-black bg-black/5 dark:border-white dark:bg-black/20">
				<Image
					alt="Presente"
					className="max-h-56 w-full object-contain"
					height={224}
					loading="lazy"
					src={getOptimizedMediaUrl(gift.mediaUrl, {
						crop: "limit",
						width: 600,
					})}
					unoptimized
					width={300}
				/>
			</div>

			{/* Message & Actions */}
			<div className="mt-2 space-y-2">
				{gift.message ? (
					<p className="rounded border border-black/20 bg-card p-2 font-medium font-sans text-xs italic dark:border-white/20">
						&ldquo;{gift.message}&rdquo;
					</p>
				) : null}

				{canDelete ? (
					<div className="flex justify-end pt-1">
						<button
							className="font-bold font-mono text-[10px] text-destructive uppercase tracking-wider hover:underline"
							onClick={handleDelete}
							type="button"
						>
							[ REMOVER ]
						</button>
					</div>
				) : null}
			</div>
		</div>
	);
}

function SendGiftForm({
	isSendingGift,
	onClose,
	onSubmitGift,
	recipientName,
}: {
	isSendingGift: boolean;
	onClose: () => void;
	onSubmitGift: (mediaUrl: string, message: string) => void;
	recipientName?: string | null;
}) {
	const [giftSource, setGiftSource] = useState<GiftSource>("preset");
	const [giftMediaUrl, setGiftMediaUrl] = useState("");
	const [giftMessage, setGiftMessage] = useState("");

	const handleSetPresetSource = useCallback(() => {
		setGiftSource("preset");
	}, []);

	const handleSetUploadSource = useCallback(() => {
		setGiftSource("upload");
	}, []);

	const handleSetUrlSource = useCallback(() => {
		setGiftSource("url");
	}, []);

	const handleClearMedia = useCallback(() => {
		setGiftMediaUrl("");
	}, []);

	const handleUrlInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setGiftMediaUrl(e.target.value);
		},
		[]
	);

	const handleMessageChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setGiftMessage(e.target.value);
		},
		[]
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			onSubmitGift(giftMediaUrl, giftMessage);
		},
		[giftMediaUrl, giftMessage, onSubmitGift]
	);

	const firstName =
		recipientName?.split(" ")[0]?.toUpperCase() ?? "ESTE MEMBRO";

	return (
		<form
			className="space-y-4 rounded-md border-2 border-black bg-secondary/30 p-4 shadow-hard-sm dark:border-white"
			onSubmit={handleSubmit}
		>
			<div className="border-black/10 border-b pb-2 dark:border-white/10">
				<span className="font-black font-display text-xs uppercase tracking-wider">
					ENVIAR PRESENTE PARA {firstName}
				</span>
			</div>

			{/* Source Selector Tabs */}
			<div className="space-y-1.5">
				<span className="block font-bold font-display text-xs uppercase tracking-wider">
					Tipo de Mídia / Imagem:
				</span>
				<div className="grid grid-cols-3 gap-1.5 rounded-md border-2 border-black bg-secondary/40 p-1 dark:border-white">
					<button
						className={`btn-tactile rounded py-1.5 font-black font-display text-[11px] uppercase transition ${
							giftSource === "preset"
								? "border-2 border-black bg-primary text-primary-foreground shadow-hard-xs dark:border-white"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSetPresetSource}
						type="button"
					>
						Sugeridos
					</button>
					<button
						className={`btn-tactile rounded py-1.5 font-black font-display text-[11px] uppercase transition ${
							giftSource === "upload"
								? "border-2 border-black bg-primary text-primary-foreground shadow-hard-xs dark:border-white"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSetUploadSource}
						type="button"
					>
						Enviar Foto
					</button>
					<button
						className={`btn-tactile rounded py-1.5 font-black font-display text-[11px] uppercase transition ${
							giftSource === "url"
								? "border-2 border-black bg-primary text-primary-foreground shadow-hard-xs dark:border-white"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
						onClick={handleSetUrlSource}
						type="button"
					>
						Link / URL
					</button>
				</div>
			</div>

			{/* Content by Source */}
			{giftSource === "preset" ? (
				<div className="space-y-1.5">
					<span
						className="block font-bold font-display text-[11px] uppercase tracking-wider"
						id="preset-label"
					>
						Escolha Rápida de GIF Reação:
					</span>
					<div className="flex flex-wrap gap-1.5" id="preset-buttons">
						{GIF_PRESETS.map((preset) => (
							<PresetButton
								isSelected={giftMediaUrl === preset.url}
								key={preset.label}
								onSelect={setGiftMediaUrl}
								preset={preset}
							/>
						))}
					</div>
				</div>
			) : null}

			{giftSource === "upload" ? (
				<div className="space-y-1.5">
					<CloudinaryUploadButton
						folder="orcestra-gifts"
						label="Arraste uma foto/GIF ou clique para selecionar"
						onUploadSuccess={setGiftMediaUrl}
						variant="dropzone"
					/>
				</div>
			) : null}

			{giftSource === "url" ? (
				<div className="space-y-1.5">
					<label
						className="font-bold font-display text-xs uppercase tracking-wider"
						htmlFor="giftMediaUrl"
					>
						URL do GIF ou Imagem
					</label>
					<input
						className="h-10 w-full rounded-md border-2 border-black bg-background px-3 font-mono text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
						id="giftMediaUrl"
						onChange={handleUrlInputChange}
						placeholder="https://media.giphy.com/... ou cole qualquer link de imagem"
						required
						type="url"
						value={giftMediaUrl}
					/>
				</div>
			) : null}

			{/* Live Preview */}
			{giftMediaUrl ? (
				<div className="relative overflow-hidden rounded-md border-2 border-black bg-background p-3 text-center shadow-hard-xs dark:border-white">
					<div className="flex items-center justify-between pb-2">
						<span className="font-bold font-mono text-[10px] text-muted-foreground uppercase">
							Prévia do Presente:
						</span>
						<button
							className="font-mono text-[10px] text-destructive uppercase hover:underline"
							onClick={handleClearMedia}
							type="button"
						>
							[Limpar Imagem]
						</button>
					</div>
					<Image
						alt="Prévia do Presente"
						className="mx-auto max-h-48 rounded border border-black/20 object-contain shadow-xs dark:border-white/20"
						height={192}
						src={getOptimizedMediaUrl(giftMediaUrl, {
							crop: "limit",
							width: 500,
						})}
						unoptimized
						width={250}
					/>
				</div>
			) : null}

			{/* Message input */}
			<div className="space-y-1.5">
				<label
					className="font-bold font-display text-xs uppercase tracking-wider"
					htmlFor="giftMessage"
				>
					Dedicatória / Mensagem (Opcional)
				</label>
				<textarea
					className="w-full rounded-md border-2 border-black bg-background p-2.5 font-medium text-xs transition focus:border-[#FF4A1C] focus:outline-hidden dark:border-white"
					id="giftMessage"
					maxLength={300}
					onChange={handleMessageChange}
					placeholder="Ex: Mandou bem demais resolvendo o bug do backend! Parabéns pelo empenho!"
					rows={2}
					value={giftMessage}
				/>
				<div className="text-right font-mono text-[10px] text-muted-foreground">
					{giftMessage.length}/300 caracteres
				</div>
			</div>

			{/* Submit button */}
			<div className="flex items-center justify-end gap-2 pt-1">
				<button
					className="btn-tactile rounded-md border-2 border-black bg-secondary px-3 py-2 font-bold font-display text-xs uppercase dark:border-white"
					onClick={onClose}
					type="button"
				>
					CANCELAR
				</button>
				<button
					className="btn-tactile rounded-md border-2 border-black bg-primary px-4 py-2 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 disabled:opacity-50 dark:border-white"
					disabled={isSendingGift || !giftMediaUrl.trim()}
					type="submit"
				>
					{isSendingGift ? "ENVIANDO..." : "ENVIAR PRESENTE"}
				</button>
			</div>
		</form>
	);
}

export function ProfileGiftsMural({
	currentUserId,
	currentUserRole,
	gifts,
	isOwner,
	isSendingGift,
	onDeleteGift,
	onSendGift,
	recipientName,
}: ProfileGiftsMuralProps) {
	const [showGiftForm, setShowGiftForm] = useState(false);

	const toggleGiftForm = useCallback(() => {
		setShowGiftForm((prev) => !prev);
	}, []);

	const closeGiftForm = useCallback(() => {
		setShowGiftForm(false);
	}, []);

	const handleSendGift = useCallback(
		(mediaUrl: string, message: string) => {
			onSendGift(mediaUrl, message);
			setShowGiftForm(false);
		},
		[onSendGift]
	);

	return (
		<div className="space-y-4 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:p-6 dark:border-white">
			<div className="flex flex-col justify-between gap-3 border-black/10 border-b-2 pb-3 sm:flex-row sm:items-center dark:border-white/10">
				<div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full border-2 border-black bg-primary dark:border-white" />
						<h2 className="font-black font-display text-sm uppercase tracking-wider">
							MURAL {"//"} PRESENTES
						</h2>
					</div>
					<p className="mt-0.5 font-medium text-muted-foreground text-xs">
						Deixe um GIF de comemoração, meme ou reconhecimento para este
						membro!
					</p>
				</div>

				<button
					className="btn-tactile inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-2 border-black bg-primary px-3.5 py-2 font-black font-display text-primary-foreground text-xs uppercase tracking-wider shadow-hard-sm hover:opacity-90 dark:border-white"
					onClick={toggleGiftForm}
					type="button"
				>
					{showGiftForm ? "✕ FECHAR FORMULÁRIO" : "+ DEIXAR UM PRESENTE"}
				</button>
			</div>

			{/* Expandable Gift Form */}
			{showGiftForm ? (
				<SendGiftForm
					isSendingGift={isSendingGift}
					onClose={closeGiftForm}
					onSubmitGift={handleSendGift}
					recipientName={recipientName}
				/>
			) : null}

			{/* Gifts Feed / Grid */}
			{gifts.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{gifts.map((g) => {
						const canDelete =
							isOwner ||
							g.senderId === currentUserId ||
							currentUserRole === "ADMIN";

						return (
							<GiftCardItem
								canDelete={canDelete}
								gift={g}
								key={g.id}
								onDelete={onDeleteGift}
							/>
						);
					})}
				</div>
			) : (
				<div className="rounded-md border-2 border-black border-dashed bg-secondary/20 p-6 text-center dark:border-white">
					<span className="block font-black font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						[ MURAL VAZIO ]
					</span>
					<p className="mt-2 font-mono text-muted-foreground text-xs uppercase">
						Nenhum presente no mural ainda.
					</p>
					<p className="mt-1 font-sans text-muted-foreground text-xs">
						Deixe um GIF animado ou imagem para celebrar e reconhecer o trabalho
						deste membro!
					</p>
				</div>
			)}
		</div>
	);
}
