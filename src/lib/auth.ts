import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "lbb-auth-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Generate a secure token from the access code using Web Crypto API
async function generateToken(accessCode: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(accessCode + "-lbb-tools-auth");
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Timing-safe comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

export async function verifyAccessCode(code: string): Promise<boolean> {
	const expectedCode = process.env.ACCESS_CODE;
	if (!expectedCode) {
		console.error("ACCESS_CODE environment variable is not set");
		return false;
	}
	return timingSafeEqual(code, expectedCode);
}

export async function createAuthSession(): Promise<void> {
	const accessCode = process.env.ACCESS_CODE;
	if (!accessCode) {
		throw new Error("ACCESS_CODE environment variable is not set");
	}

	const token = await generateToken(accessCode);
	const cookieStore = await cookies();

	cookieStore.set(AUTH_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: COOKIE_MAX_AGE,
		path: "/",
	});
}

export async function destroyAuthSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
	const accessCode = process.env.ACCESS_CODE;
	if (!accessCode) {
		return false;
	}

	const cookieStore = await cookies();
	const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

	if (!token) {
		return false;
	}

	const expectedToken = await generateToken(accessCode);
	return timingSafeEqual(token, expectedToken);
}
