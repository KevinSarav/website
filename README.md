# Website Showcase

Showcase website.

## Local Development

```bash
npm install
npm run dev
```

Use `npm run build` if you want to verify the production frontend build locally.

## Docker Deploy

1. Copy `.env.example` to `.env` and fill in production values.
2. Review Docker Compose env interpolation meanings in the official docs: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/
3. Start or update the stack:

```bash
docker compose up -d --build
```

The stack also starts two internal services for dynamic resume PDF generation:
- `gotenberg` for DOCX to PDF conversion.
- `docx-converter` for serving `/api/resume.pdf`.

`SITE_RESUME_DOWNLOAD_URL` is used as the source DOCX URL for both the `Open resume` button and server-side PDF conversion.
Set `PDF_FILENAME` in `.env`/`.env.sops` to control the downloaded PDF file name.

Frontend content values are runtime env (`SITE_*`) now. You can change them in `.env/.env.sops` and redeploy without rebuilding images.

## GitHub Packages (Private GHCR)

This repo is configured to publish private container images on every push to `main`:
- `ghcr.io/<owner>/website:latest`
- `ghcr.io/<owner>/docx-converter:latest`

Deployment then pulls those images on the server instead of building them there.

`WEBSITE_IMAGE` and `DOCX_CONVERTER_IMAGE` are injected by GitHub Actions during deploy (from workflow outputs), not from server `.env`.

### Required GitHub configuration

Set deployment Secrets:
- `DEPLOY_USER`
- `DEPLOY_HOST`
- `DEPLOY_PORT` (optional, defaults to `22`)
- `DEPLOY_PATH`
- `DEPLOY_SSH_PRIVATE_KEY`

Optional (needed for private image pull auth from server):
- `GHCR_USERNAME`
- `GHCR_TOKEN` (PAT with `read:packages`)

Optional (only needed if cleanup cannot delete versions with `GITHUB_TOKEN`):
- `GHCR_CLEANUP_TOKEN` (classic PAT with `delete:packages`)

### Cleanup policy

Cleanup runs as part of deploy workflow `.github/workflows/deploy-website.yml`. After a successful deploy, GitHub keeps only the newest 3 versions for each container package (`website` and `docx-converter`) and deletes older versions.

## Encrypt `.env` to `.env.sops` (Manual)

Use SOPS locally whenever `.env` changes:

```bash
sops --encrypt --input-type dotenv --output-type dotenv .env > .env.sops
chmod 600 .env.sops
```

If you rotate or add Age keys, update recipients in `.sops.yaml` under `creation_rules[].age`, then re-encrypt:

```bash
sops updatekeys .env.sops
```