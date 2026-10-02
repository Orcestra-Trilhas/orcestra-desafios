"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
	useEffect(() => {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
			return;
		}

		navigator.serviceWorker
			.register("/sw.js", { scope: "/", updateViaCache: "none" })
			.catch(() => {
				// Silently fail if service worker registration is not supported or rejected
			});
	}, []);

	return null;
}
