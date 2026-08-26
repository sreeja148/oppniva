# Deploying Oppniva (step-by-step)

This file contains quick, copy/paste commands to deploy Oppniva to Vercel and run required migration steps.

Prerequisites (local)
- Node 24+, `pnpm`, `vercel` (optional CLI)
- A production Postgres DB (Neon/Railway/Heroku) for persistent data, or you can leave `DATABASE_URL` empty to run the in-memory demo.

1) Prepare repository locally
```bash
# clone (if needed) and enter repo
git clone https://github.com/sreeja148/oppniva.git
cd oppniva

# install node and pnpm (if not installed)
corepack enable
corepack prepare pnpm@latest --activate
pnpm install

# generate Prisma client
npx prisma generate
```

2) Add `.env` (example)
Create a file named `.env` in the repo root with at least the following lines for a demo:
```
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="demo_secret_for_local"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=
```

3) Build & test locally
```bash
# development server
pnpm dev

# or production build
pnpm build
pnpm start
```

4) Deploy to Vercel (UI)
- Log in at https://vercel.com
- Click "New Project" → Import Git Repository → choose `sreeja148/oppniva`
- Configure Build: Install = `pnpm install`, Build = `pnpm build && npx prisma generate`
- Add Environment Variables (Project Settings → Environment Variables):
  - `DATABASE_URL` (production DB)
  - `SESSION_SECRET` (secure random string)
  - `NEXT_PUBLIC_SITE_URL` (https://your-deployment.vercel.app)
  - `GEMINI_API_KEY` (optional)

5) Deploy to Vercel (CLI)
```bash
npm i -g vercel
vercel login
vercel --prod
```

6) Run migrations (IMPORTANT if using a postgres DB)
- On your machine (with `DATABASE_URL` set to production DB):
```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```
- Or ensure the GitHub Action `.github/workflows/prisma_migrate.yml` is enabled and that `DATABASE_URL` is present in repo secrets.

7) Verify & smoke-test
- Open the deployed URL and test registration/login with demo credentials:
  - Email: `demo+judge@example.com`
  - Password: `password123`
- Run E2E (update URL in scripts if testing against production):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\e2e_flow.ps1
```

8) Rollback plan
- If deployment causes issues, you can redeploy a previous commit in Vercel UI or revert the `main` branch on GitHub and push.

Notes
- If you use a production DB, remove `prisma/dev.db` from the repo and ensure `prisma/migrations` are committed.
- For preview deployments or PRs, secrets are not available for forks. Ask collaborators to push branches directly to this repo to run CI with secrets.
