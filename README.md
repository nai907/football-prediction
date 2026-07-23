Football prediction game
A full-stack web application that allows users to guess the scores of past English Premier League season 2025/2026 football matches.
Built with Vue.js (frontend) and Vercel serverless functions (backend).

Features:
- Random matchday selection
- Submit match score predictions
- Simple leaderboard system (polled every 8s)
- API integration with football data provider
- Responsive User Interface

Tech Stack:
Frontend
- Vue.js
- HTML/CSS
- JavaScript

Backend
- Vercel serverless functions (Node.js)
- Fetch API
- SQLite (better-sqlite3, stored in /tmp on Vercel — resets on cold start/redeploy)

Project structure
- `public/` — static frontend (served by Vercel automatically)
- `api/` — serverless functions (`/api/matches`, `/api/leaderboard`)
- `legacy/` — original Express + Socket.io + MySQL implementation, kept for reference

Local development
1. `npm install`
2. Copy `.env.example` to `.env` and add your football-data.org API token
3. `npx vercel dev` (requires the Vercel CLI; run `npm i -g vercel` first, or use `npx`)

Deploy to Vercel
1. `npx vercel login`
2. `npx vercel` from the project root, follow the prompts
3. In the Vercel dashboard, set the `FOOTBALL_API_TOKEN` (and optionally `FOOTBALL_TEAM_ID`) environment variable for the project
4. `npx vercel --prod` to deploy to production

Note: the leaderboard uses a SQLite file written to Vercel's ephemeral /tmp storage, so it will reset between cold starts and deployments. This is a known tradeoff, not a bug — see conversation/project notes if this needs to persist long-term (e.g. swap in Turso/PlanetScale).
