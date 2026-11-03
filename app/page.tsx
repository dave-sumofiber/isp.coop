import { computeMonthlyPrice, formatUSD, priceCurve } from "@/lib/pricing";

// Example inputs for the explainer. Not a quote; real prices are set per co-op each quarter.
const EXAMPLE = {
  networkFeeCents: 3000,
  fixedOverheadMonthlyCents: 400_000,
  variableCostPerMemberCents: 300,
  currentReservesCents: 2_400_000,
  reserveTargetMonths: 6,
  reserveRecoveryMonths: 12,
};
const EXAMPLE_MEMBERS = 500;
const CURVE_POINTS = [100, 250, 500, 1000, 2500];

export default function Home() {
  const p = computeMonthlyPrice({ ...EXAMPLE, paidMembers: EXAMPLE_MEMBERS });
  const curve = priceCurve(EXAMPLE, CURVE_POINTS);
  const max = curve[0].totalMonthlyCents;

  return (
    <main>
      <div className="wrap hero">
        <div>
          <p className="eyebrow">Internet Service Provider Cooperative</p>
          <h1 style={{ marginTop: "1rem" }}>
            Fiber internet that gets <em>cheaper</em> every time a neighbor joins.
          </h1>
          <p className="lede">
            ISP.coop is member-owned internet on open-access fiber networks. Each network has its own
            co-op. The more members it has, the lower everyone pays.
          </p>
          <div className="actions">
            <a className="btn" href="/join">Become a member</a>
            <a className="btn btn-ghost" href="#pricing">See how pricing works</a>
          </div>
        </div>
        <div className="hero-card" aria-label="Launch network">
          <p className="eyebrow">First co-op</p>
          <div className="row"><span>Network</span><strong>Broadlinc</strong></div>
          <div className="row"><span>Managed by</span><strong>SUMOFIBER</strong></div>
          <div className="row"><span>Billing</span><strong>Prepaid monthly</strong></div>
          <div className="row"><span>Router</span><strong>Bring your own</strong></div>
          <div className="row"><span>Votes</span><strong>1 per paid member</strong></div>
        </div>
      </div>

      <div className="wrap"><div className="strand" role="presentation" /></div>

      <section id="how">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Join, prepay, plug in your own router.</h2>
          </div>
          <ol className="steps">
            <li>
              <h3>Pick your network</h3>
              <p className="muted">Each open-access network has its own co-op. You join the one that serves your address.</p>
            </li>
            <li>
              <h3>Prepay your membership</h3>
              <p className="muted">Service is 100% prepaid, billed monthly in advance. No contracts, no credit checks.</p>
            </li>
            <li>
              <h3>Bring your hardware</h3>
              <p className="muted">Use any router you like. Setup guides and help live in the member forum.</p>
            </li>
            <li>
              <h3>Vote and save</h3>
              <p className="muted">Every paid member gets one vote. Prices are recalculated every quarter.</p>
            </li>
          </ol>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="wrap pricing-grid">
          <div>
            <div className="section-head">
              <p className="eyebrow">Open-book pricing</p>
              <h2>Your bill is the real cost, split evenly.</h2>
              <p className="muted">
                There's no profit margin. Your price is the network's fee plus your share of the co-op's
                costs. Shared costs are divided by the number of members, so growth pushes the price down.
                If membership shrinks, the price goes up.
              </p>
            </div>
            <table className="ledger">
              <tbody>
                <tr><td>Network fee<span className="note">Paid to the network operator, passed straight through</span></td><td>{formatUSD(p.networkFeeCents)}</td></tr>
                <tr><td>Share of co-op costs<span className="note">Fixed costs ÷ {EXAMPLE_MEMBERS} members</span></td><td>{formatUSD(p.overheadShareCents)}</td></tr>
                <tr><td>Per-member costs<span className="note">Transit, payment processing</span></td><td>{formatUSD(p.variableCostCents)}</td></tr>
                <tr><td>Reserve contribution<span className="note">Charged only until the co-op holds 6 months of costs in the bank</span></td><td>{formatUSD(p.reserveContributionCents)}</td></tr>
              </tbody>
              <tfoot>
                <tr><td>Monthly price</td><td>{formatUSD(p.totalMonthlyCents)}</td></tr>
              </tfoot>
            </table>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: "1rem" }}>Monthly price by number of members</p>
            <div className="curve">
              {curve.map((c) => (
                <div className="curve-row" key={c.members}>
                  <span>{c.members.toLocaleString()} members</span>
                  <div className="curve-bar" style={{ width: `${(c.totalMonthlyCents / max) * 100}%` }} />
                  <span>{formatUSD(c.totalMonthlyCents)}</span>
                </div>
              ))}
            </div>
            <p className="example-flag">Example numbers for illustration. Each co-op publishes its real price every quarter.</p>
          </div>
        </div>
      </section>

      <section id="governance" className="band">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Governance</p>
            <h2>Built by SUMOFIBER, handed to the members.</h2>
            <p className="muted">
              Every co-op starts under SUMOFIBER, which funds and runs it while the network is built.
              Then members elect a board and take over.
            </p>
          </div>
          <div className="phases">
            <div className="phase current">
              <span className="pill">Now</span>
              <h3>Sponsor-managed</h3>
              <p className="muted">SUMOFIBER funds and operates the co-op for its first two years, while the network is built out.</p>
            </div>
            <div className="phase">
              <h3>Transition</h3>
              <p className="muted">Members nominate and elect a board. Reserves and accounts are reviewed before handover.</p>
            </div>
            <div className="phase">
              <h3>Member-governed</h3>
              <p className="muted">The elected board runs the co-op. Every paid member keeps one vote on major decisions.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap facts">
          <div>
            <h3>No phone support</h3>
            <p className="muted">Help comes from the member forum and setup guides. That keeps costs, and prices, low.</p>
          </div>
          <div>
            <h3>Reserves come first</h3>
            <p className="muted">Each co-op must hold cash reserves. Until it does, a small contribution is added to the price.</p>
          </div>
          <div>
            <h3>One member, one vote</h3>
            <p className="muted">Voting power doesn't depend on what you pay or how long you've been a member.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
