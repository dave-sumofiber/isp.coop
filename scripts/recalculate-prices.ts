import { recalculateQuarter } from "../lib/recalculate";
import { db } from "../lib/db";

recalculateQuarter()
  .then((r) => {
    for (const p of r.published) console.log(`${r.quarter} ${p.coop}: ${p.members} members, ${p.totalMonthlyCents}¢/mo`);
    if (r.skipped.length) console.warn(`No ${r.quarter} cost basis for: ${r.skipped.join(", ")}`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
