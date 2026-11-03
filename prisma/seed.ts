import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Launch co-op. Fee, tier, state and dates are placeholders until the Broadlinc agreement is signed.
  const coop = await prisma.cooperative.upsert({
    where: { slug: "broadlinc" },
    update: {},
    create: {
      slug: "broadlinc",
      name: "ISP.coop Broadlinc",
      networkName: "Broadlinc",
      state: "TBD",
      networkFeeCents: 0, // TODO: from Broadlinc agreement
      serviceTier: "TBD",
      acceptingMembers: false,
      governancePhase: "SPONSOR_MANAGED",
      sponsorName: "SUMOFIBER",
    },
  });

  await prisma.costBasis.upsert({
    where: { cooperativeId_quarter: { cooperativeId: coop.id, quarter: "2027-Q1" } },
    update: {},
    create: {
      cooperativeId: coop.id,
      quarter: "2027-Q1",
      fixedOverheadMonthlyCents: 0, // TODO
      variableCostPerMemberCents: 0, // TODO
      reserveTargetMonths: 6,
      reserveRecoveryMonths: 12,
    },
  });

  console.log("Seeded ISP.coop Broadlinc with placeholder numbers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
