import { db } from "@/lib/db";
import { formatUSD, quarterOf } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  missing: "Please fill in every field.",
  coop: "That co-op isn't accepting members yet.",
  price: "This quarter's price hasn't been published yet. Check back soon.",
  exists: "That email is already an active member of this co-op.",
  payment: "We couldn't start checkout. Please try again.",
};

export default async function JoinPage({ searchParams }: { searchParams: { error?: string; coop?: string } }) {
  const quarter = quarterOf(new Date());
  const coops = await db.cooperative.findMany({
    where: { acceptingMembers: true },
    include: { quarterlyPrices: { where: { quarter } } },
    orderBy: { name: "asc" },
  });
  const error = searchParams.error ? ERRORS[searchParams.error] : null;

  return (
    <main className="wrap form-page">
      <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
        <p className="eyebrow">Membership</p>
        <h1 style={{ fontSize: "var(--step-3)" }}>Join your network's co-op</h1>
        <p className="muted">Before you join, make sure you're ready for a self-managed service:</p>
        <ul className="checklist">
          <li>Your address is on an open-access network we serve.</li>
          <li>You have your own router.</li>
          <li>You're comfortable getting help from the member forum instead of a phone line.</li>
          <li>You'll prepay each month. Your price can change at the start of each quarter.</li>
        </ul>
      </div>

      <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
        {error && <p className="alert" role="alert">{error}</p>}
        {coops.length === 0 ? (
          <div className="alert">
            <strong>Not open yet.</strong> Our first co-op, on Broadlinc, opens for members soon.
          </div>
        ) : (
          <form method="post" action="/api/join">
            <label htmlFor="coop">
              Network
              <select id="coop" name="coop" defaultValue={searchParams.coop ?? coops[0].slug} required>
                {coops.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.networkName} ({c.serviceTier})
                    {c.quarterlyPrices[0] ? ` · ${formatUSD(c.quarterlyPrices[0].totalMonthlyCents)}/mo` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="name">Full name<input id="name" name="name" autoComplete="name" required /></label>
            <label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required /></label>
            <label htmlFor="serviceAddress">
              Service address
              <input id="serviceAddress" name="serviceAddress" autoComplete="street-address" required />
            </label>
            <button className="btn" type="submit">Continue to payment</button>
          </form>
        )}
      </div>
    </main>
  );
}
