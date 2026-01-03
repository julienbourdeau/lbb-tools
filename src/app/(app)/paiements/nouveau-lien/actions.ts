"use server";

import { stripe } from "@/lib/stripe";

export type CreatePaymentLinkInput = {
  amount: string;
  email?: string;
  description?: string;
};

export type CreatePaymentLinkResult = {
  success: true;
  url: string;
  amount: number;
  email?: string;
  description?: string;
} | {
  success: false;
  error: string;
};

export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<CreatePaymentLinkResult> {
  try {
    const amountInCents = Math.round(parseFloat(input.amount) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: input.description || "Paiement",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      ...(input.email && { customer_email: input.email }),
      success_url: "https://lbb-tools.pages.dev/paiements/confirmation?session_id={CHECKOUT_SESSION_ID}",
    });

    if (!session.url) {
      return {
        success: false,
        error: "Impossible de créer l'URL de paiement",
      };
    }

    return {
      success: true,
      url: session.url,
      amount: amountInCents / 100,
      email: input.email || undefined,
      description: input.description || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
