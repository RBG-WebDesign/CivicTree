# CivicTree Demo Punch List

The current MVP is intentionally optimized for a pitch demo. These are the demo-only pieces and their production replacements.

- Base64 and local proof images: replace with object storage, signed uploads, image moderation, and retention rules.
- Mock geolocation fallback: replace with real browser permissions, server-side distance checks, and location spoofing defenses.
- No real auth or sessions: replace persona switching with account login, roles, sessions, and authorization checks.
- No SMS delivery: replace dormant OTP routes with Twilio or another verified messaging provider.
- No real payments: replace demo balances and cash out with Stripe Connect or an equivalent payout ledger.
- CSS map and fixed coordinates: replace with real map tiles, geocoding, clustering, and task service areas.
- LocalStorage persistence: replace with Postgres and Prisma-backed state transitions.
- Client-side admin review: replace with server mutations, audit logs, reviewer identity, and abuse controls.
- Simulated sponsor budget: replace with campaign funding records, invoice/payment status, and budget holds.
- Dormant `/api/*` and `prisma/` paths: wire them to production data services or remove dead endpoints before launch.
