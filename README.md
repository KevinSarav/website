# Professional Showcase Website

React + TypeScript + Vite showcase site.

## Tech
- React 18
- TypeScript
- Vite
- Docker + Nginx for production image
- zrok2 for public sharing

## Sensitive data handling
- Do not put secrets in frontend env files. Anything prefixed with `VITE_` is public in browser bundles.
- Use `.env.example` as a template only.
- Keep real `.env` local; it is ignored by git.
- Keep deployment and runtime secrets in local environment storage.

## Local development
1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`

## Production build
- `npm run build`
- `npm run preview`

## Docker run
1. Build and start:
   - `docker compose up -d --build`
2. Verify container is running:
   - `docker compose ps`

## Environment Configuration

All configuration is managed through environment variables in `.env` files:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your values (never commit this file)
3. For local development, optionally create `.env.local` to override values

**IMPORTANT:** `.env` files are in `.gitignore` and should never be committed to Git.

## Publish with zrok2 (via launchd agent)

The site can be published with a reserved share name using a persistent launchd agent.

**Setup (one-time):**
1. Ensure your `.env` file has `ZROK_SHARE_NAME` and `ZROK_TARGET_URL` configured
   - Set `ZROK_SHARE_NAME` to your reserved placeholder name
2. Install the launchd agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/share-agent.plist
   ```
3. Start website container:
   ```bash
   docker compose up -d --build
   ```

The share agent will now:
- Auto-start on boot via `RunAtLoad=true`
- Check health every 60 seconds via `StartInterval=60`
- Auto-restart on network changes via `KeepAlive.NetworkState=true`
- Keep your reserved share alive automatically

**View logs:**
```bash
tail -f ~/.local/share/logs/share.log
```

**Uninstall (if needed):**
```bash
launchctl unload ~/Library/LaunchAgents/share-agent.plist
```

## GitHub Actions CI/CD

Two workflows are included:

- **CI Workflow** (`.github/workflows/ci.yml`):
  - Runs linting and builds on every push and PR
  - Catches regressions before deployment
  - No secrets required

- **Docker Workflow** (`.github/workflows/docker-build.yml`):
  - Builds Docker images for every push
   - Pushes to configured container registry on main branch and tags
   - Uses repository runtime credentials
