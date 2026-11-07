import { defineConfig } from 'astro/config';

export default defineConfig({
  // Pages build to /about/index.html etc., served as /about on Vercel.
  build: { format: 'directory' },
});
