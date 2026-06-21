import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      {
        name: 'html-env-replace',
        transformIndexHtml(html: string) {
          const owner = env.VITE_SITE_OWNER || 'Your Name';
          const email = env.VITE_CONTACT_EMAIL || 'contact_placeholder';

          return html
            .replace(/%VITE_SITE_OWNER%/g, owner)
            .replace(/%VITE_CONTACT_EMAIL%/g, email);
        },
      },
    ],
    define: {
      '__VITE_SITE_OWNER__': JSON.stringify(env.VITE_SITE_OWNER || 'Your Name'),
      '__VITE_CONTACT_EMAIL__': JSON.stringify(env.VITE_CONTACT_EMAIL || 'contact_placeholder'),
      '__VITE_LOCATION__': JSON.stringify(env.VITE_LOCATION || 'Your Location'),
    },
  };
});
