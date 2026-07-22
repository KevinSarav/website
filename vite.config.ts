import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const configuredBase = (process.env.VITE_BASE_PATH ?? "").trim();
  const base = configuredBase.length > 0 ? configuredBase : "/";
  const mastodonVerifiedLink = (env.MASTODON_VERIFIED_LINK ?? "").trim();

  return {
    plugins: [
      react(),
      {
        name: "inject-mastodon-rel-me",
        transformIndexHtml(html) {
          if (!mastodonVerifiedLink || html.includes('rel="me"')) {
            return html;
          }
          return [
            {
              tag: "link",
              attrs: {
                rel: "me",
                href: mastodonVerifiedLink,
              },
              injectTo: "head",
            },
          ];
        },
      },
    ],
    base,
  };
});
