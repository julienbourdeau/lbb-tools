"use server";

import { redirect } from "next/navigation";
import { verifyAccessCode, createAuthSession } from "@/lib/auth";

type LoginResult = {
	success: true;
} | {
	success: false;
	error: string;
};

export async function login(
	formData: FormData,
	redirectTo: string
): Promise<LoginResult> {
	const code = formData.get("code");

	if (!code || typeof code !== "string") {
		return {
			success: false,
			error: "Le code d'accès est requis",
		};
	}

	const isValid = await verifyAccessCode(code);

	if (!isValid) {
		return {
			success: false,
			error: "Code d'accès invalide",
		};
	}

	await createAuthSession();

	// Ensure redirect URL is relative and safe
	const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";
	redirect(safeRedirect);
}
