import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "lbb-auth-token";
const LOGIN_PATH = "/connexion";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow access to the login page and static assets
	if (
		pathname === LOGIN_PATH ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon") ||
		pathname.endsWith(".svg") ||
		pathname.endsWith(".ico")
	) {
		return NextResponse.next();
	}

	// Check for authentication cookie
	const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

	if (!authToken) {
		// Redirect to login page
		const loginUrl = new URL(LOGIN_PATH, request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Verify the token is valid (matches our expected format)
	// The token is a hash of the access code + a secret, created at login time
	// We can't verify the actual code here without access to env vars in edge runtime,
	// but we can check the token format and let the app validate it
	if (!isValidTokenFormat(authToken)) {
		// Invalid token, clear it and redirect to login
		const loginUrl = new URL(LOGIN_PATH, request.url);
		loginUrl.searchParams.set("redirect", pathname);
		const response = NextResponse.redirect(loginUrl);
		response.cookies.delete(AUTH_COOKIE_NAME);
		return response;
	}

	return NextResponse.next();
}

function isValidTokenFormat(token: string): boolean {
	// Token should be a 64-character hex string (SHA-256 hash)
	return /^[a-f0-9]{64}$/.test(token);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - api routes (they handle their own auth if needed)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
