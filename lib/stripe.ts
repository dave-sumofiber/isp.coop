import Stripe from "stripe";

/** Returns a Stripe client, or null when STRIPE_SECRET_KEY is not set (dev mode). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}
