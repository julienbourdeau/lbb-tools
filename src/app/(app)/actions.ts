"use server";

import { redirect } from "next/navigation";
import { destroyAuthSession } from "@/lib/auth";

export async function logout(): Promise<void> {
	await destroyAuthSession();
	redirect("/connexion");
}
