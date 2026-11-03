# ISP.coop

Internet Service Provider Cooperative: member-owned, prepaid fiber internet on open-access networks.

## How the business works

- **One co-op per network.** Each open-access network (Broadlinc first) is its own cooperative, with its own members, prices, reserves and votes.
- **Sponsor period.** SUMOFIBER manages and funds each co-op for its first two years, while the network is built out. Then governance is handed to a member-elected board.
- **Open-book pricing.** Price = network fee (pass-through) + this co-op's fixed costs ÷ its paid members + per-member costs + a reserve contribution while reserves are below target. Recalculated every quarter. See `lib/pricing.ts`.
- **Self-managed.** 100% prepaid, bring your own router, no live support. Help lives in the member forum.
- **One vote per paid member** of that co-op.

## Stack

Next.js 14 (App Router, TypeScript), Postgres via Prisma, Stripe Checkout subscriptions. Deploys to Railway.

## Running locally

```bash
cp .env.example .env      # set DATABASE_URL
npm install
npx prisma migrate deploy
npm run db:seed           # creates the Broadlinc co-op with placeholder numbers
npm run dev
```

Without `STRIPE_SECRET_KEY`, signup skips payment (dev mode).

## Deploying on Railway

1. New project → Deploy from GitHub → this repo.
2. Add a Postgres database; Railway sets `DATABASE_URL`.
3. Set `APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
4. In Stripe, point a webhook at `https://<your-domain>/api/stripe/webhook` for `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
5. Add a Railway cron service running `npm run prices:recalc` on the first day of each quarter (`0 7 1 1,4,7,10 *`).

Migrations run on every deploy (`prisma migrate deploy`).

## Opening a co-op for members

1. Set the co-op's `networkFeeCents`, `serviceTier` and `state`.
2. Add a `CostBasis` row for the current quarter and a `ReserveSnapshot`.
3. Run `npm run prices:recalc` to publish the quarter's price.
4. Set `acceptingMembers = true`.

## Not built yet

- Member login and account page
- Ballots UI (schema is in place)
- Forum (built in, or Discourse with SSO)
- Sponsor/board admin panel for co-ops, cost basis and reserves

## Tests

```bash
npm test   # pricing engine
```
