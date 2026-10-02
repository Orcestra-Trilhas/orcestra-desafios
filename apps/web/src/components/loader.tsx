export default function Loader() {
	return (
		<div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 pt-8">
			{/* Bauhaus geometric spinner: rotating square with circle inside */}
			<div className="h-10 w-10 animate-spin rounded-xs border-2 border-black bg-[#FF4A1C] shadow-hard-sm dark:border-white">
				<div className="m-1 h-3.5 w-3.5 rounded-full border-2 border-black bg-[#FACC15]" />
			</div>
			<span className="font-black font-display text-[10px] text-muted-foreground uppercase tracking-widest">
				CARREGANDO {"//"} ORC{"//"}DESAFIOS
			</span>
		</div>
	);
}
