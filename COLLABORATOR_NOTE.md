# Quick note for collaborators

If you want to run this repository locally or create preview builds, follow these steps.

Clone & checkout branch (recommended if using `main-ours`):
```bash
git clone --branch main https://github.com/sreeja148/oppniva.git
cd oppniva
```

If you need the `main-ours` branch specifically:
```bash
git fetch origin
git checkout -b main-ours origin/main-ours
```

Run locally (demo / in-memory store):
```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
npx prisma generate
cp .env.example .env
# Edit .env if needed (SESSION_SECRET etc.)
pnpm dev
```

Notes about CI / previews
- GitHub Actions and Vercel previews do not expose repository secrets to workflows triggered from forks. If you open a PR from a fork, CI that needs secrets (like database migrations) will fail. To run full CI:
  - Push branches directly to `sreeja148/oppniva` (you need Write access), or
  - Open a PR from your branch inside this repo (not a fork) so the runner has access to secrets.

Demo credentials to try the app quickly
- Email: `demo+judge@example.com`
- Password: `password123`

If you hit any errors, paste the terminal output here and I will help troubleshoot.
