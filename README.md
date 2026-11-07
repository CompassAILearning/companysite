# CompassAI company site

Marketing site for **CourseCadence**, a product of CompassAI. Built with [Astro](https://astro.build)
(static output) and edited through [Sveltia CMS](https://sveltiacms.app) at `/admin`.

## Editing content (no code needed)

1. Go to `https://companysite-zeta.vercel.app/admin/`.
2. Click **Sign In Using Access Token** and paste a GitHub token (see below).
3. Pick a page under **Pages**, edit the fields and click **Save**.
4. The save commits to `main`. Vercel rebuilds and the change goes live in about a minute.

Every change is a git commit, so any edit can be undone by reverting that commit on GitHub.

### Getting an access token

You need **write access** to `CompassAILearning/companysite`. Then create a
[fine-grained personal access token](https://github.com/settings/personal-access-tokens/new):

- **Resource owner:** CompassAILearning
- **Repository access:** Only select repositories → `companysite`
- **Repository permissions:** Contents → **Read and write**

The token is stored in your browser only. The login dialog also links to a pre-filled token page.

## Development

```sh
npm install
npm run dev        # http://localhost:4321  (admin: /admin/index.html)
npm run build      # outputs to dist/
```

In Chrome or Edge you can also edit local files with the CMS: open `/admin/index.html` on the dev server
and choose **Work with Local Repository**.

## Structure

```
src/content/*.json      all page text: what the CMS edits
src/pages/*.astro       page templates (home, about, getting-started, download)
src/layouts/Base.astro  shared header + footer
src/components/         icons, page banner, call-to-action band
public/admin/           CMS page + config.yml (which fields editors can change)
public/css, public/js   styles and the nav/form script
public/assets/img       images (CMS uploads land here too)
vercel.json             build settings for Vercel
```

To make a new piece of text editable: add it to the JSON file, render it in the `.astro` template
and add a matching field in `public/admin/config.yml`.

## Still to do

- Sign-up form validates in the browser only. Wire it to a real endpoint in `public/js/main.js`.
- Hero play button is a placeholder (no video yet).
- About, Getting Started and Download hold **filler copy**. Team names and photos, app store links,
  pricing, calendar integrations and system requirements are placeholders. Confirm them before launch.
- Footer legal links and Student Community point to `#`.
- Logo and hero image are rasters taken from the concept PDF. Replace them with the original SVG
  logo and a high-res photo.
- Optional: "Sign in with GitHub" button instead of tokens (see `base_url` in `public/admin/config.yml`).
