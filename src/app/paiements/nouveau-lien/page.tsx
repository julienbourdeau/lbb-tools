"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Copy, ExternalLink, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createPaymentLink, type CreatePaymentLinkResult } from "./actions"

const formSchema = z.object({
	amount: z
		.string()
		.min(1, "Le montant est requis")
		.refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
			message: "Le montant doit être un nombre positif",
		}),
	email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
	description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type PaymentLinkItem = {
	id: string
	result: CreatePaymentLinkResult
	isNew: boolean
}

export default function NouveauLienPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [paymentLinks, setPaymentLinks] = useState<PaymentLinkItem[]>([])

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "",
			email: "",
			description: "",
		},
	})

	async function onSubmit(values: FormValues) {
		setIsLoading(true)
		try {
			const response = await createPaymentLink({
				amount: values.amount,
				email: values.email || undefined,
				description: values.description || undefined,
			})
			const newItem: PaymentLinkItem = {
				id: crypto.randomUUID(),
				result: response,
				isNew: true,
			}
			setPaymentLinks((prev) => [newItem, ...prev])

			// Remove the "isNew" flag after animation completes
			setTimeout(() => {
				setPaymentLinks((prev) =>
					prev.map((item) =>
						item.id === newItem.id ? { ...item, isNew: false } : item
					)
				)
			}, 1500)
		} finally {
			setIsLoading(false)
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text)
	}

	return (
		<div className="max-w-md">
			<Card>
				<CardHeader>
					<CardTitle>Nouveau lien de paiement</CardTitle>
					<CardDescription>
						Créez un nouveau lien de paiement pour vos clients.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Montant (EUR) *</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="client@example.com"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optionnel. Le lien sera envoyé à cette adresse.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Description du paiement..."
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Optionnel. Visible par le client.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Créer le lien
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{paymentLinks.map((item) => {
				const result = item.result
				return (
					<Card
						key={item.id}
						className={`mt-6 transition-colors duration-1000 ${
							item.isNew ? "bg-yellow-100 dark:bg-yellow-900/30" : ""
						}`}
					>
						{result.success ? (
							<>
								<CardHeader>
									<CardTitle className="text-green-600">Lien créé avec succès</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground mb-1">Lien de paiement</p>
										<div className="flex items-center gap-2">
											<Input value={result.url} readOnly className="font-mono text-sm" />
											<Button
												variant="outline"
												size="icon"
												onClick={() => copyToClipboard(result.url)}
												title="Copier le lien"
											>
												<Copy className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												size="icon"
												asChild
												title="Ouvrir le lien"
											>
												<a href={result.url} target="_blank" rel="noopener noreferrer">
													<ExternalLink className="h-4 w-4" />
												</a>
											</Button>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 pt-2 border-t">
										<div>
											<p className="text-sm font-medium text-muted-foreground">Montant</p>
											<p className="text-lg font-semibold">{result.amount.toFixed(2)} EUR</p>
										</div>
										{result.email && (
											<div>
												<p className="text-sm font-medium text-muted-foreground">Email</p>
												<p className="text-sm">{result.email}</p>
											</div>
										)}
										{result.description && (
											<div className="col-span-2">
												<p className="text-sm font-medium text-muted-foreground">Description</p>
												<p className="text-sm">{result.description}</p>
											</div>
										)}
									</div>
								</CardContent>
							</>
						) : (
							<>
								<CardHeader>
									<CardTitle className="text-red-600">Erreur</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-red-600">{result.error}</p>
								</CardContent>
							</>
						)}
					</Card>
				)
			})}
		</div>
	)
}
