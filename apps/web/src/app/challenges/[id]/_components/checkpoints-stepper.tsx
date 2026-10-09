import { PopBadge, PopStamp } from "@/components/pop-elements";
import type { ChallengePairData } from "./types";

interface CheckpointsStepperProps {
	isAdvancingStep: boolean;
	myPair?: ChallengePairData | null;
	onAdvanceStep1: () => void;
	onOpenSubmit: () => void;
}

function CheckpointStep1({
	currentStep,
	isAdvancingStep,
	onAdvanceStep1,
}: {
	currentStep: number;
	isAdvancingStep: boolean;
	onAdvanceStep1: () => void;
}) {
	const isCompleted = currentStep > 1;

	return (
		<div className="relative">
			<div
				className={`absolute -left-[27px] flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs shadow-hard-sm sm:-left-[35px] sm:h-8 sm:w-8 dark:border-white ${
					isCompleted
						? "bg-[#15803D] text-white"
						: "bg-[#FACC15] text-[#121212]"
				}`}
			>
				01
			</div>
			<div className="space-y-2">
				<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
					<h4 className="font-black font-display text-xs uppercase sm:text-sm">
						ALINHAMENTO DA DUPLA & SETUP INICIAL
					</h4>
					{isCompleted ? (
						<div>
							<PopBadge color="green">CONCLUÍDO</PopBadge>
						</div>
					) : null}
				</div>
				<p className="font-medium text-muted-foreground text-xs">
					Conversem no WhatsApp, alinhem quem fará qual parte e criem a branch
					de trabalho.
				</p>

				{currentStep === 1 ? (
					<button
						className="btn-tactile mt-2 w-full rounded-md border-2 border-black bg-[#121212] px-3.5 py-2 font-black font-display text-white text-xs uppercase shadow-hard-sm hover:bg-neutral-800 disabled:opacity-50 sm:w-auto sm:px-4 dark:border-white dark:bg-white dark:text-[#121212]"
						disabled={isAdvancingStep}
						onClick={onAdvanceStep1}
						type="button"
					>
						{isAdvancingStep
							? "AVANÇANDO..."
							: "CONCLUIR SETUP & LIBERAR SUBMISSÃO \u2192"}
					</button>
				) : null}
			</div>
		</div>
	);
}

function CheckpointStep2({
	canSubmitSolution,
	currentStep,
	isSubmittedOrApproved,
	onOpenSubmit,
	pairStatus,
}: {
	canSubmitSolution: boolean;
	currentStep: number;
	isSubmittedOrApproved: boolean;
	onOpenSubmit: () => void;
	pairStatus: string;
}) {
	let badgeColor = "bg-muted text-muted-foreground";
	if (isSubmittedOrApproved) {
		badgeColor = "bg-[#15803D] text-white";
	} else if (currentStep >= 2) {
		badgeColor = "bg-[#FF4A1C] text-white";
	}

	return (
		<div className="relative">
			<div
				className={`absolute -left-[27px] flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs shadow-hard-sm sm:-left-[35px] sm:h-8 sm:w-8 dark:border-white ${badgeColor}`}
			>
				02
			</div>
			<div className="space-y-2">
				<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
					<h4 className="font-black font-display text-xs uppercase sm:text-sm">
						SUBMISSÃO DA SOLUÇÃO (PR / ARQUIVO)
					</h4>
					{isSubmittedOrApproved ? (
						<div>
							<PopBadge color="green">SUBMETIDO</PopBadge>
						</div>
					) : null}
				</div>
				<p className="font-medium text-muted-foreground text-xs">
					Submeta o link do Pull Request no GitHub ou anexe evidências para
					validação técnica.
				</p>

				{canSubmitSolution ? (
					<button
						className="btn-tactile mt-2 w-full rounded-md border-2 border-black bg-primary px-3.5 py-2 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm hover:opacity-90 sm:w-auto sm:px-4 dark:border-white"
						onClick={onOpenSubmit}
						type="button"
					>
						{pairStatus === "SUBMITTED"
							? "EDITAR / REENVIAR SUBMISSÃO"
							: "SUBMETER SOLUÇÃO AGORA"}
					</button>
				) : null}
			</div>
		</div>
	);
}

function CheckpointStep3({
	feedback,
	pairStatus,
}: {
	feedback?: string | null;
	pairStatus: string;
}) {
	let badgeColor = "bg-muted text-muted-foreground";
	if (pairStatus === "APPROVED") {
		badgeColor = "bg-[#15803D] text-white";
	} else if (pairStatus === "CHANGES_REQUESTED") {
		badgeColor = "bg-[#DC2626] text-white";
	}

	return (
		<div className="relative">
			<div
				className={`absolute -left-[27px] flex h-7 w-7 items-center justify-center rounded-sm border-2 border-black font-black font-display text-xs shadow-hard-sm sm:-left-[35px] sm:h-8 sm:w-8 dark:border-white ${badgeColor}`}
			>
				03
			</div>
			<div className="space-y-2">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<h4 className="font-black font-display text-xs uppercase sm:text-sm">
						AVALIAÇÃO DO ASSESSOR RESPONSÁVEL
					</h4>
					<div>
						<PopStamp
							status={
								pairStatus as
									| "IN_PROGRESS"
									| "SUBMITTED"
									| "APPROVED"
									| "CHANGES_REQUESTED"
							}
						/>
					</div>
				</div>
				<p className="font-medium text-muted-foreground text-xs">
					O assessor do desafio analisará a qualidade técnica, padrões de código
					e pontuação.
				</p>

				{feedback ? (
					<div className="mt-3 rounded-md border-2 border-black bg-secondary/60 p-3 font-mono text-xs dark:border-white">
						<span className="block font-black font-display text-[#FF4A1C] uppercase tracking-wider">
							[FEEDBACK DO ASSESSOR]:
						</span>
						<p className="mt-1 whitespace-pre-wrap">{feedback}</p>
					</div>
				) : null}
			</div>
		</div>
	);
}

export function CheckpointsStepper({
	isAdvancingStep,
	myPair,
	onAdvanceStep1,
	onOpenSubmit,
}: CheckpointsStepperProps) {
	const currentStep = myPair ? myPair.currentStep : 1;
	const pairStatus = myPair ? myPair.status : "IN_PROGRESS";
	const isSubmittedOrApproved =
		pairStatus === "SUBMITTED" || pairStatus === "APPROVED";
	const canSubmitSolution = currentStep >= 2 && pairStatus !== "APPROVED";

	return (
		<div className="space-y-5 rounded-lg border-2 border-black bg-card p-4 shadow-hard sm:space-y-6 sm:p-6 dark:border-white">
			<div className="flex items-center justify-between border-black/10 border-b-2 pb-3 dark:border-white/10">
				<h3 className="font-black font-display text-xs uppercase tracking-wider sm:text-sm">
					CHECKPOINTS DA DUPLA
				</h3>
				{myPair ? (
					<PopStamp
						status={
							pairStatus as
								| "IN_PROGRESS"
								| "SUBMITTED"
								| "APPROVED"
								| "CHANGES_REQUESTED"
						}
					/>
				) : null}
			</div>

			{myPair ? (
				<div className="relative ml-2 space-y-7 border-black border-l-2 pl-4 sm:ml-4 sm:space-y-8 sm:pl-6 dark:border-white">
					<CheckpointStep1
						currentStep={currentStep}
						isAdvancingStep={isAdvancingStep}
						onAdvanceStep1={onAdvanceStep1}
					/>
					<CheckpointStep2
						canSubmitSolution={canSubmitSolution}
						currentStep={currentStep}
						isSubmittedOrApproved={isSubmittedOrApproved}
						onOpenSubmit={onOpenSubmit}
						pairStatus={pairStatus}
					/>
					<CheckpointStep3 feedback={myPair.feedback} pairStatus={pairStatus} />
				</div>
			) : (
				<div className="rounded-md border-2 border-black border-dashed bg-secondary/40 p-6 text-center dark:border-white">
					<p className="font-black font-display text-muted-foreground text-xs uppercase">
						Você ainda não foi alocado em uma dupla para este desafio.
					</p>
				</div>
			)}
		</div>
	);
}
