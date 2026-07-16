# Website Showcase

Showcase website.

## Local Development

```bash
npm install
npm run dev
```

Use `npm run build` if you want to verify the production frontend build locally.

Site runs on `http://localhost:5173` with `SITE_PUBLIC_URL=http://localhost:5173` (from `.env`).

## Deployment

Configuration in `.env` (committed to repo):
- `SITE_APP_NAME`, `SITE_MY_NAME`, `SITE_ROLE`, etc. — portfolio content
- `SITE_GDOC_RESUME_ID` — the Google Docs document ID (format: `https://docs.google.com/document/d/{ID}/...`). Share the doc as "Anyone with the link can view".
- `SITE_PUBLIC_URL` — optional for local development; deployment workflows now set this per target

### Option 1: Web Hosting (Recommended)

Deploy to a web hosting service like Cloudflare Pages, GitHub Pages, Netlify, etc.:

1. Connect your GitHub repo to your hosting platform
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Platform handles DNS, SSL, CDN automatically
5. Deploys on every push to `main`

GitHub Pages workflow behavior:
- Resolves `SITE_PUBLIC_URL` using `vars.SITE_PUBLIC_URL_PAGES`, otherwise `CNAME`, otherwise `{owner}.github.io/{repo}`.
- Resolves `VITE_BASE_PATH` as `/` for custom-domain deploys and `/{repo}/` for project-page deploys.
- Generates `public/runtime-config.js` using the resolved deployment URL (not localhost).

This is the simplest option — no server to manage.

### Option 2: Docker Self-Hosted (on your home machine)

Run the site as a Docker container on your own hardware:

1. Build and run locally:
   ```bash
   docker compose up -d --build
   ```

2. Access via public tunnel (e.g., zrok):
   - Get free tunnel: `zrok invite`
   - Start tunnel: `zrok share public http://localhost`
   - Share the generated URL

3. For automated deployments via GitHub Actions, set secrets:
   - `DEPLOY_USER` — SSH username on your server
   - `DEPLOY_HOST` — hostname/IP of your server
   - `DEPLOY_PATH` — path to clone repo on server
   - `DEPLOY_SSH_PRIVATE_KEY` — private SSH key for authentication

Docker workflow behavior:
- Resolves `SITE_PUBLIC_URL` using `vars.SITE_PUBLIC_URL_DOCKER` first, then `secrets.SITE_PUBLIC_URL_DOCKER`, then `CNAME`.
- Fails fast if no production URL can be resolved.
- Passes `SITE_PUBLIC_URL` into image build and runtime config generation.

### Environment Variables Per Deployment

- **Local dev**: optional `SITE_PUBLIC_URL=http://localhost:5173`
- **GitHub Pages**: set `vars.SITE_PUBLIC_URL_PAGES` (or keep `CNAME` in repo)
- **Docker self-hosted**: set `vars.SITE_PUBLIC_URL_DOCKER` (or `secrets.SITE_PUBLIC_URL_DOCKER`)