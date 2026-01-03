"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { login } from "./actions";

function LoginForm() {
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/";

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(formData: FormData) {
		setIsLoading(true);
		setError(null);

		const result = await login(formData, redirectTo);

		if (!result.success) {
			setError(result.error);
			setIsLoading(false);
		}
		// If successful, the server action redirects, so no need to handle success here
	}

	return (
		<form action={handleSubmit}>
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="code">Code d&apos;accès</Label>
					<Input
						id="code"
						name="code"
						type="password"
						placeholder="Entrez le code"
						required
						autoFocus
						autoComplete="current-password"
					/>
				</div>
				{error && (
					<p className="text-sm text-destructive text-center">{error}</p>
				)}
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Connexion
				</Button>
			</div>
		</form>
	);
}

function LoginFormSkeleton() {
	return (
		<div className="grid gap-4">
			<div className="grid gap-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-10 w-full" />
			</div>
			<Skeleton className="h-10 w-full" />
		</div>
	);
}

export default function ConnexionPage() {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="text-center">
				<CardTitle className="text-xl">LBB Tools</CardTitle>
				<CardDescription>
					Entrez le code d&apos;accès pour continuer
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Suspense fallback={<LoginFormSkeleton />}>
					<LoginForm />
				</Suspense>
			</CardContent>
		</Card>
	);
}
