"use client";

import { memo } from "react";
import type { AdminLogItem } from "./types";

interface LogsTabProps {
	logs: AdminLogItem[];
}

export const LogsTab = memo(function LogsTabRender({ logs }: LogsTabProps) {
	if (logs.length === 0) {
		return (
			<div className="rounded-md border-2 border-black border-dashed bg-card p-8 text-center dark:border-white">
				<p className="font-black font-display text-muted-foreground text-xs uppercase">
					Nenhum log de auditoria registrado ainda.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{logs.map((log) => (
				<div
					className="rounded-md border-2 border-black bg-secondary/30 p-3.5 font-mono text-xs dark:border-white"
					key={log.id}
				>
					<div className="flex items-center justify-between">
						<span className="font-black text-[#FF4A1C]">[{log.action}]</span>
						<span className="text-[10px] text-muted-foreground">
							{new Date(log.createdAt).toLocaleString("pt-BR")}
						</span>
					</div>
					<p className="mt-1 text-foreground">
						EXECUTOR: <span className="font-bold">{log.actor?.name}</span>
					</p>
					{log.details ? (
						<pre className="mt-2 overflow-x-auto rounded border border-black/20 bg-background p-2 font-mono text-[10px] text-muted-foreground dark:border-white/20">
							{JSON.stringify(log.details, null, 2)}
						</pre>
					) : null}
				</div>
			))}
		</div>
	);
});
