# ISP.coop to-do

The live site is a pitch site only. This file holds the plan for the working member site.
The first version of the backend was written and then removed; it is in git history at commit `e4f0873`
(`git show e4f0873:prisma/schema.prisma` etc.) if you want to restore it.

## Decisions needed

- [ ] **Handover trigger.** Board takes over after 2 years, or when the network is fully built? If they differ, whichever comes first or whichever comes later?
- [ ] **Nonprofit vs. equity.** Dave's funding was described as equity, but a nonprofit co-op generally can't issue ownership. Consider a sponsor loan or management agreement repaid from co-op revenue. Ask counsel before pitching networks.
- [ ] **Entity structure.** One Utah statutory cooperative per network, or one parent with a co-op per network? Confirm with counsel.
- [ ] **Launch network.** Nothing agreed yet; Broadlinc is a pitch target. Need network fee per subscriber, service tiers, state, launch date once a network signs.
- [ ] **IP addressing.** During the sponsor period, assign each co-op space from SUMOFIBER (AS54329). At handover, transfer it under ARIN's transfer policy or have the co-op buy its own. ARIN gives no special treatment to nonprofits or co-ops.

## Business rules the app must enforce

- Each open-access network is its own co-op: its own members, price, reserves and ballots.
- SUMOFIBER manages and funds each co-op during the sponsor period, then hands it to a member-elected board.
- 100% prepaid, subscription based. Members bring their own router. No live support; help is in the member forum.
- One vote per paid (active) member of that co-op.
- Price is recalculated every quarter:
  - network fee (passed straight through)
  - + this co-op's fixed monthly costs ÷ its paid members
  - + per-member variable costs (transit, payment processing)
  - + reserve contribution, only while reserves are below target (default 6 months of fixed costs, shortfall collected over 12 months)
- Price goes down as membership grows and up if it shrinks.
- The pricing formula is already in `lib/pricing.ts`, with tests.

## Data model (Postgres)

- **Cooperative:** slug, name, network name, state, network fee, service tier, accepting members, governance phase (sponsor-managed / transition / member-governed), sponsor name, sponsor term start and end, network-built date, handover date.
- **Member:** co-op, name, email, service address, status (pending / active / lapsed / cancelled), Stripe customer and subscription IDs, paid-through date. Email is unique per co-op.
- **CostBasis:** co-op + quarter, fixed monthly costs, per-member costs, reserve target months, recovery months.
- **QuarterlyPrice:** co-op + quarter, member count used, each line of the breakdown, total.
- **ReserveSnapshot:** co-op, balance, date, note.
- **Ballot / BallotOption / Vote:** ballots belong to one co-op; one vote per member per ballot.

## Build list

- [ ] Add Railway Postgres and Prisma; restore schema and first migration from history.
- [ ] Member signup per co-op with Stripe Checkout (monthly subscription, billed in advance).
- [ ] Stripe webhook: checkout completed → active; invoice paid → extend paid-through; payment failed → lapsed; subscription deleted → cancelled.
- [ ] Quarterly price job (Railway cron, first day of each quarter) that publishes each co-op's price.
- [ ] Member login and account page (status, current price, next price change).
- [ ] Ballots and voting.
- [ ] Member forum: built in, or Discourse with SSO (faster to launch).
- [ ] Admin panel for SUMOFIBER during the sponsor period: co-ops, network fees, cost basis, reserves, ballots. Hand the same panel to the board later.
- [ ] Public price history page per co-op (open-book pricing).
- [ ] Router setup guides for each network.
