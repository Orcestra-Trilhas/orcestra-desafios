"use client";

import { useEffect } from "react";

const RELOAD_DEBOUNCE_MS = 15_000;
const CHUNK_ERROR_PATTERN =
	/loading chunk|failed to fetch dynamically imported module|chunkloaderror|loading css chunk/i;

function handleChunkError() {
	if (typeof window === "undefined") {
		return;
	}

	const lastReload = sessionStorage.getItem("last_chunk_reload");
	const now = Date.now();

	if (lastReload && now - Number(lastReload) < RELOAD_DEBOUNCE_MS) {
		// If already reloaded within debounce window, reset to root to clear stale route state
		sessionStorage.removeItem("last_chunk_reload");
		window.location.href = "/";
		return;
	}

	sessionStorage.setItem("last_chunk_reload", String(now));
	window.location.reload();
}

function isChunkErrorMessage(message: string | undefined): boolean {
	if (!message) {
		return false;
	}
	return CHUNK_ERROR_PATTERN.test(message);
}

export default function PwaRegistration() {
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		// 1. Intercept Chunk Loading Failures (Deployment Skew on Vercel)
		const handleError = (event: ErrorEvent) => {
			if (
				isChunkErrorMessage(event.message) ||
				isChunkErrorMessage(event.error?.message)
			) {
				event.preventDefault();
				handleChunkError();
			}
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			const reason = event.reason as Error | undefined;
			if (
				isChunkErrorMessage(reason?.message) ||
				isChunkErrorMessage(String(event.reason))
			) {
				event.preventDefault();
				handleChunkError();
			}
		};

		window.addEventListener("error", handleError);
		window.addEventListener("unhandledrejection", handleRejection);

		// 2. Service Worker Registration & Seamless Updates
		if (!("serviceWorker" in navigator)) {
			return () => {
				window.removeEventListener("error", handleError);
				window.removeEventListener("unhandledrejection", handleRejection);
			};
		}

		let refreshing = false;

		const handleControllerChange = () => {
			if (refreshing) {
				return;
			}
			refreshing = true;
			window.location.reload();
		};

		navigator.serviceWorker.addEventListener(
			"controllerchange",
			handleControllerChange
		);

		navigator.serviceWorker
			.register("/sw.js", { scope: "/", updateViaCache: "none" })
			.then((registration) => {
				// Listen for newly installed updates
				registration.addEventListener("updatefound", () => {
					const newWorker = registration.installing;
					if (!newWorker) {
						return;
					}

					newWorker.addEventListener("statechange", () => {
						if (
							newWorker.state === "installed" &&
							navigator.serviceWorker.controller
						) {
							// Activate new version immediately
							newWorker.postMessage({ type: "SKIP_WAITING" });
						}
					});
				});

				// Auto-check for updates when tab becomes visible (especially on mobile wake)
				const handleVisibilityChange = async () => {
					if (document.visibilityState === "visible") {
						try {
							await registration.update();
						} catch {
							// Ignore network/offline errors during background update check
						}
					}
				};

				document.addEventListener("visibilitychange", handleVisibilityChange);

				return () => {
					document.removeEventListener(
						"visibilitychange",
						handleVisibilityChange
					);
				};
			})
			.catch(() => {
				// Silently fail if service worker registration is not supported or rejected
			});

		return () => {
			window.removeEventListener("error", handleError);
			window.removeEventListener("unhandledrejection", handleRejection);
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				handleControllerChange
			);
		};
	}, []);

	return null;
}
