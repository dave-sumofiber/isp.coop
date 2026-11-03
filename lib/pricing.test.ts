import { test } from "node:test";
import assert from "node:assert/strict";
import { computeMonthlyPrice, priceCurve, quarterOf } from "./pricing.ts";

const base = {
  networkFeeCents: 3000,
  fixedOverheadMonthlyCents: 500_000,
  variableCostPerMemberCents: 400,
  currentReservesCents: 3_000_000, // reserves fully funded (6 months × $5,000)
  reserveTargetMonths: 6,
  reserveRecoveryMonths: 12,
};

test("network fee passes straight through", () => {
  const p = computeMonthlyPrice({ ...base, paidMembers: 1000 });
  assert.equal(p.networkFeeCents, 3000);
  assert.equal(p.overheadShareCents, 500);
  assert.equal(p.totalMonthlyCents, 3000 + 500 + 400);
});

test("price drops as membership grows", () => {
  const curve = priceCurve(base, [100, 500, 1000, 5000]);
  for (let i = 1; i < curve.length; i++) {
    assert.ok(curve[i].totalMonthlyCents < curve[i - 1].totalMonthlyCents);
  }
});

test("price rises if membership shrinks", () => {
  const big = computeMonthlyPrice({ ...base, paidMembers: 2000 });
  const small = computeMonthlyPrice({ ...base, paidMembers: 1500 });
  assert.ok(small.totalMonthlyCents > big.totalMonthlyCents);
});

test("reserve contribution applies only while reserves are short", () => {
  const funded = computeMonthlyPrice({ ...base, paidMembers: 1000 });
  assert.equal(funded.reserveContributionCents, 0);

  const short = computeMonthlyPrice({ ...base, paidMembers: 1000, currentReservesCents: 1_800_000 });
  // shortfall $12,000 over 12 months over 1000 members = $1.00
  assert.equal(short.reserveShortfallCents, 1_200_000);
  assert.equal(short.reserveContributionCents, 100);
});

test("zero members does not divide by zero", () => {
  const p = computeMonthlyPrice({ ...base, paidMembers: 0 });
  assert.ok(Number.isFinite(p.totalMonthlyCents));
});

test("rejects negative inputs", () => {
  assert.throws(() => computeMonthlyPrice({ ...base, paidMembers: -1 }), RangeError);
});

test("quarter labels", () => {
  assert.equal(quarterOf(new Date("2027-01-15T00:00:00Z")), "2027-Q1");
  assert.equal(quarterOf(new Date("2027-11-03T00:00:00Z")), "2027-Q4");
});
