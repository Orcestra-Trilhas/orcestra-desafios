import { OrcIcon } from "./orc-logo";

export default function Loader({
	text = "CARREGANDO // ORC//DESAFIOS",
}: {
	text?: string;
}) {
	return (
		<div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 pt-8">
			<div className="relative flex items-center justify-center">
				{/* Aro giratório neo-brutalista */}
				<div
					aria-hidden="true"
					className="absolute -inset-2 animate-spin rounded-md border-2 border-primary/40 border-dashed"
				/>
				{/* Ícone oficial do mascote Orc'estra com a cor do tema ativo */}
				<OrcIcon className="h-12 w-12 animate-pulse shadow-hard" size="lg" />
			</div>
			<span className="font-black font-display text-[10px] text-muted-foreground uppercase tracking-widest">
				{text}
			</span>
		</div>
	);
}
