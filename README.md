# CompassAI company site

Marketing site for **CourseCadence**, a product of CompassAI. Built with [Astro](https://astro.build)
(static output) and edited through [Sveltia CMS](https://sveltiacms.app) at `/admin`.

## Editing content (no code needed)

1. Go to `https://companysite-zeta.vercel.app/admin/` and sign in (see below).
2. Pick a page under **Pages**. The right-hand pane shows the page as it will look and updates as
   you type. Click any text in the preview to jump to its field.
3. Click **Save**. Your change becomes a **draft**, not yet live.
4. Move it to **In Review** to ask a colleague to check it. Each draft gets its own Vercel preview
   link (shown on the GitHub pull request the CMS opens) so reviewers can see the real page.
5. A reviewer moves it to **Ready** (this approves it) and clicks **Publish**. The change is merged
   into `main`, and Vercel puts it live in about a minute.

Drafts and their status are on the **Workflow** page in the CMS. Every published change is a git
commit, so it can be undone by reverting that commit on GitHub.

### Signing in

Editors need a free GitHub account with **write access** to `CompassAILearning/companysite`
(Repo → Settings → Collaborators).

- **Sign In with GitHub:** one click, once the login service is set up (`base_url` in
  `public/admin/config.yml`).
- **Sign In Using Access Token** (fallback): create a
  [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) with
  Resource owner *CompassAILearning*, Repository access *only `companysite`*, and permissions
  **Contents: Read and write** + **Pull requests: Read and write**. The token stays in your browser.

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
public/admin/           CMS page, config.yml (editable fields) and preview.js (live preview templates)
public/css, public/js   styles and the nav/form script
public/assets/img       images (CMS uploads land here too)
vercel.json             build settings for Vercel
```

To make a new piece of text editable: add it to the JSON file, render it in the `.astro` template,
add a matching field in `public/admin/config.yml` and show it in `public/admin/preview.js`.
Changes to page markup in `src/pages` should be mirrored in `preview.js` so the preview stays accurate.

## Still to do

- Sign-up form validates in the browser only. Wire it to a real endpoint in `public/js/main.js`.
- Hero play button is a placeholder (no video yet).
- About, Getting Started and Download hold **filler copy**. Team names and photos, app store links,
  pricing, calendar integrations and system requirements are placeholders. Confirm them before launch.
- Footer legal links and Student Community point to `#`.
- Logo and hero image are rasters taken from the concept PDF. Replace them with the original SVG
  logo and a high-res photo.
