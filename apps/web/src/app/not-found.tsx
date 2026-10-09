"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";

export default function NotFound() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/");
	}, [router]);

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<Loader text="REDIRECIONANDO // DESAFIOS" />
			<div className="mt-4 text-center">
				<Link
					className="btn-tactile rounded-md border-2 border-black bg-primary px-4 py-2 font-black font-display text-primary-foreground text-xs uppercase shadow-hard-sm dark:border-white"
					href="/"
				>
					IR PARA OS DESAFIOS &rarr;
				</Link>
			</div>
		</div>
	);
}
