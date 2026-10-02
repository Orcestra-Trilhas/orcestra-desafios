"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending) {
			if (session?.user) {
				const role = (session.user as { role?: string })?.role;
				if (role === "ADMIN") {
					router.replace("/admin");
				} else {
					router.replace("/dashboard");
				}
			} else {
				router.replace("/login");
			}
		}
	}, [session, isPending, router]);

	return <Loader />;
}
