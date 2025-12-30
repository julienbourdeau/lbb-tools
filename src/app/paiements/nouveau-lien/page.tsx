"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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

export default function NouveauLienPage() {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: "",
			email: "",
			description: "",
		},
	})

	function onSubmit(values: FormValues) {
		console.log(values)
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

							<Button type="submit">Créer le lien</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
