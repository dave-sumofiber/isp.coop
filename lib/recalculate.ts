import { db } from "./db";
import { computeMonthlyPrice, quarterOf } from "./pricing";

/**
 * Recalculate and publish this quarter's price for every co-op that has a cost basis.
 * Each co-op is priced on its own members, costs and reserves.
 * Run once at the start of each quarter (Railway cron: npm run prices:recalc).
 */
export async function recalculateQuarter(now = new Date()) {
  const quarter = quarterOf(now);
  const coops = await db.cooperative.findMany({
    include: {
      costBases: { where: { quarter } },
      reserves: { orderBy: { asOf: "desc" }, take: 1 },
    },
  });

  const published: { coop: string; quarter: string; members: number; totalMonthlyCents: number }[] = [];
  const skipped: string[] = [];

  for (const coop of coops) {
    const basis = coop.costBases[0];
    if (!basis) {
      skipped.push(coop.slug);
      continue;
    }
    const paidMembers = await db.member.count({ where: { cooperativeId: coop.id, status: "ACTIVE" } });

    const p = computeMonthlyPrice({
      networkFeeCents: coop.networkFeeCents,
      fixedOverheadMonthlyCents: basis.fixedOverheadMonthlyCents,
      variableCostPerMemberCents: basis.variableCostPerMemberCents,
      paidMembers,
      currentReservesCents: coop.reserves[0]?.balanceCents ?? 0,
      reserveTargetMonths: basis.reserveTargetMonths,
      reserveRecoveryMonths: basis.reserveRecoveryMonths,
    });

    const data = {
      paidMembersAtCalc: paidMembers,
      networkFeeCents: p.networkFeeCents,
      overheadShareCents: p.overheadShareCents,
      variableCostCents: p.variableCostCents,
      reserveContributionCents: p.reserveContributionCents,
      totalMonthlyCents: p.totalMonthlyCents,
    };
    await db.quarterlyPrice.upsert({
      where: { cooperativeId_quarter: { cooperativeId: coop.id, quarter } },
      update: data,
      create: { cooperativeId: coop.id, quarter, ...data },
    });
    published.push({ coop: coop.slug, quarter, members: paidMembers, totalMonthlyCents: p.totalMonthlyCents });
  }

  return { quarter, published, skipped };
}
