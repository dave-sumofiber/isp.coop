import { db } from "@/lib/db";
import { appUrl, getStripe } from "@/lib/stripe";
import { quarterOf } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const serviceAddress = String(form.get("serviceAddress") ?? "").trim();
  const coopSlug = String(form.get("coop") ?? "").trim();

  if (!name || !email.includes("@") || !serviceAddress || !coopSlug) {
    return redirectTo(`/join?error=missing`);
  }

  const coop = await db.cooperative.findUnique({ where: { slug: coopSlug } });
  if (!coop || !coop.acceptingMembers) return redirectTo(`/join?error=coop`);

  const price = await db.quarterlyPrice.findUnique({
    where: { cooperativeId_quarter: { cooperativeId: coop.id, quarter: quarterOf(new Date()) } },
  });
  if (!price) return redirectTo(`/join?error=price`);

  const member = await db.member.upsert({
    where: { cooperativeId_email: { cooperativeId: coop.id, email } },
    update: { name, serviceAddress },
    create: { email, name, serviceAddress, cooperativeId: coop.id },
  });
  if (member.status === "ACTIVE") return redirectTo(`/join?error=exists`);

  const stripe = getStripe();
  if (!stripe) {
    // Dev mode: no payment provider configured.
    return redirectTo(`/welcome?member=${member.id}&dev=1`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    client_reference_id: member.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: price.totalMonthlyCents,
          recurring: { interval: "month" },
          product_data: { name: `${coop.name} membership (${coop.serviceTier})` },
        },
      },
    ],
    subscription_data: { metadata: { memberId: member.id, coop: coop.slug } },
    success_url: `${appUrl()}/welcome?member=${member.id}`,
    cancel_url: `${appUrl()}/join?coop=${coop.slug}`,
  });

  return redirectTo(session.url ?? "/join?error=payment");
}

function redirectTo(path: string) {
  const url = path.startsWith("http") ? path : `${appUrl()}${path}`;
  return Response.redirect(url, 303);
}
