# Optional paid-data proxy (NOT deployed, not needed today)
The app uses TheSportsDB's public free key, which is not a secret, so no proxy is needed.
If Boaz later buys API-Football (needed for Israeli-league scorers and cards), deploy `worker.js` as a Cloudflare Worker:
1. `npx wrangler deploy worker/worker.js --name bulgol-proxy`
2. `npx wrangler secret put APIFOOTBALL_KEY` (key is stored only in Cloudflare, never in the repo or the browser)
3. Add the worker URL to CSP connect-src in index.html.
Security: GET only, an allow-list of 3 paths and allowed params, CORS locked to boazgolan-wq.github.io, edge cache (60 s live / 10 min results / 6 h fixtures) so the 100/day free quota or the paid quota holds no matter how many users.
