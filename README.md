# ISP.coop

Pitch site for the Internet Service Provider Cooperative: member-owned, prepaid fiber internet on open-access networks, launching on Broadlinc.

This is a static marketing site. The plan for the working member site (signup, billing, voting, forum) is in [`to-do.md`](to-do.md).

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Railway

New project → Deploy from GitHub → this repo. No database or environment variables needed. `railway.json` sets the build, start command and health check (`/api/health`).

## Tests

```bash
npm test   # pricing formula used in the example chart
```
