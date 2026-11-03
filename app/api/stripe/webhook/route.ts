import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe not configured", { status: 503 });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.client_reference_id) {
        await db.member.update({
          where: { id: s.client_reference_id },
          data: {
            status: "ACTIVE",
            stripeCustomerId: typeof s.customer === "string" ? s.customer : s.customer?.id,
            stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : s.subscription?.id,
          },
        });
      }
      break;
    }
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
      const periodEnd = inv.lines.data[0]?.period?.end;
      if (subId && periodEnd) {
        await db.member.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "ACTIVE", paidThrough: new Date(periodEnd * 1000) },
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
      if (subId) {
        await db.member.updateMany({ where: { stripeSubscriptionId: subId }, data: { status: "LAPSED" } });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db.member.updateMany({ where: { stripeSubscriptionId: sub.id }, data: { status: "CANCELLED" } });
      break;
    }
  }

  return Response.json({ received: true });
}
