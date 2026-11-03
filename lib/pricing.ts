/**
 * ISP.coop pricing engine.
 *
 * A member's monthly price on a network is:
 *
 *   network fee            (passed straight through, paid by the member)
 * + overhead share         (this co-op's fixed costs ÷ this co-op's paid members)
 * + variable cost          (per-member costs: transit, payment fees, etc.)
 * + reserve contribution   (only while reserves are below target)
 *
 * The price is recalculated once per quarter. More members means a smaller
 * overhead share, so the price goes down. Fewer members means it goes up.
 * Reserves are a hard requirement: until the bank balance covers the target
 * number of months of fixed overhead, every member pays a reserve contribution.
 *
 * Each network is its own co-op, so every input here is for one co-op only.
 *
 * All amounts are integer cents to avoid floating point drift.
 */

export type PricingInputs = {
  /** Network operator's monthly fee per subscriber, in cents (pass-through). */
  networkFeeCents: number;
  /** This co-op's fixed overhead per month, in cents. */
  fixedOverheadMonthlyCents: number;
  /** Per-member variable cost per month, in cents. */
  variableCostPerMemberCents: number;
  /** Paid members of this co-op at the time of the recalculation. */
  paidMembers: number;
  /** Cash currently held in reserve, in cents. */
  currentReservesCents: number;
  /** Required reserve, expressed as months of fixed overhead. */
  reserveTargetMonths: number;
  /** Months over which a reserve shortfall is collected. */
  reserveRecoveryMonths: number;
};

export type PriceBreakdown = {
  networkFeeCents: number;
  overheadShareCents: number;
  variableCostCents: number;
  reserveContributionCents: number;
  totalMonthlyCents: number;
  reserveTargetCents: number;
  reserveShortfallCents: number;
};

/** Members below this count are priced as if this many were paying. */
export const MIN_PRICED_MEMBERS = 1;

export function computeMonthlyPrice(input: PricingInputs): PriceBreakdown {
  assertNonNegative(input);

  const members = Math.max(input.paidMembers, MIN_PRICED_MEMBERS);
  const overheadShareCents = Math.ceil(input.fixedOverheadMonthlyCents / members);

  const reserveTargetCents = input.fixedOverheadMonthlyCents * input.reserveTargetMonths;
  const reserveShortfallCents = Math.max(0, reserveTargetCents - input.currentReservesCents);
  const recoveryMonths = Math.max(1, input.reserveRecoveryMonths);
  const reserveContributionCents =
    reserveShortfallCents === 0 ? 0 : Math.ceil(reserveShortfallCents / recoveryMonths / members);

  const totalMonthlyCents =
    input.networkFeeCents +
    overheadShareCents +
    input.variableCostPerMemberCents +
    reserveContributionCents;

  return {
    networkFeeCents: input.networkFeeCents,
    overheadShareCents,
    variableCostCents: input.variableCostPerMemberCents,
    reserveContributionCents,
    totalMonthlyCents,
    reserveTargetCents,
    reserveShortfallCents,
  };
}

/** Price at a range of member counts, for the "price drops as we grow" chart. */
export function priceCurve(
  base: Omit<PricingInputs, "paidMembers">,
  memberCounts: number[],
): { members: number; totalMonthlyCents: number }[] {
  return memberCounts.map((members) => ({
    members,
    totalMonthlyCents: computeMonthlyPrice({ ...base, paidMembers: members }).totalMonthlyCents,
  }));
}

/** Quarter label for a date, e.g. "2027-Q1". */
export function quarterOf(date: Date): string {
  const q = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${date.getUTCFullYear()}-Q${q}`;
}

export function formatUSD(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function assertNonNegative(input: PricingInputs) {
  for (const [key, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`Pricing input "${key}" must be a non-negative number, got ${value}`);
    }
  }
}
