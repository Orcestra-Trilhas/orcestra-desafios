"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (isPending) {
			return;
		}

		if (!session?.user) {
			router.replace("/login");
			return;
		}

		const userWithRole = session.user as { role?: string };
		if (userWithRole.role === "ADMIN") {
			router.replace("/admin");
		} else {
			router.replace("/dashboard");
		}
	}, [session, isPending, router]);

	return <Loader />;
}
