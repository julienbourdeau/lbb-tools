import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "LBB Tools",
	description: "Outils internes LBB",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<header className="flex h-14 items-center gap-2 border-b px-4">
							<SidebarTrigger />
						</header>
						<main className="flex-1 p-4">
							{children}
						</main>
					</SidebarInset>
				</SidebarProvider>
			</body>
		</html>
	);
}
