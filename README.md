# CompassAI company site

Marketing site for **CourseCadence**, a product of CompassAI. Built with [Astro](https://astro.build)
(static output) and edited through [Sveltia CMS](https://sveltiacms.app) at `/admin`.

## Editing content (no code needed)

1. Go to `https://companysite-zeta.vercel.app/admin/` and sign in (see below).
2. Pick a page under **Pages** (or click **New Page**). The right-hand pane shows the page with
   the real header, footer and theme, and updates as you type. Click any text in the preview to
   jump to its field.
3. A page is a stack of **sections**. Use **Add** to insert a section type (hero, page banner,
   feature cards, steps, detailed steps, text with image, quotes, team, FAQ, table, platform
   cards, sign-up form, call-to-action band), drag sections to reorder them, and set each one's
   options (background, image side, card style).
4. Choose how to publish:
   - **Save and Publish** (in the Save button's menu): goes live in about a minute. Use it for quick fixes.
   - **Save**: keeps the change as a **draft** for someone to check first. Drafts move
     **In Review** → **Ready** → **Publish** on the **Workflow** page. Each draft gets its own Vercel
     preview link (on the GitHub pull request the CMS opens) so reviewers can see the real page.

### Site settings: theme, header, footer

Under **Site settings**, changes apply to every page:

- **Theme:** color palette (CompassAI Blue, Ocean Teal, Royal Purple, Graphite) and font.
- **Header:** logo, layout (logo left or centered), navigation links, optional header button.
- **Footer:** logo, layout (columns or simple centered), tagline and link columns.

**New pages** get their address from the page name when first created ("Pricing" → `/pricing`).
They don't appear in the navigation automatically: add a link under **Header** or **Footer**.

### Undoing a change

Open **History** in the CMS toolbar and pick a page (or Theme, Header, Footer). Every published version is listed, newest first:

- **Show changes** lists exactly which text changed (before → after).
- **Restore this version** puts the page back the way it was. This goes live straight away, and the
  restore itself appears in History so it can be undone too.

Emergency option: in Vercel → Deployments, **Instant Rollback** swaps the whole live site back to an
earlier deployment in seconds (the free Hobby plan only allows going back to the previous one).
The next published change replaces it, so follow up with a restore in History.

### Signing in

Editors need a free GitHub account with **write access** to `CompassAILearning/companysite`
(Repo → Settings → Collaborators).

- **Sign In Using Access Token** (current method): create a
  [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) with
  Resource owner *CompassAILearning*, Repository access *only `companysite`*, and permissions
  **Contents: Read and write** + **Pull requests: Read and write**. The token stays in your browser.
- **Sign In with GitHub:** not enabled yet. It needs the Sveltia CMS Authenticator deployed, then
  `base_url` and `auth_methods: [oauth, token]` in `public/admin/config.yml`.

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
src/content/pages/*.json      one file per page (index.json = home); each is a list of sections
src/content/settings/*.json   theme, header and footer used on every page
src/render/sections.mjs       HTML for every section type + header/footer (shared by site AND CMS preview)
src/pages/[...slug].astro     builds a page for each file in src/content/pages
src/pages/admin/render.js.ts  serves sections.mjs to the CMS as /admin/render.js
src/layouts/Base.astro        <head>, theme, header and footer
public/admin/                 CMS: config.yml (fields & section types), preview.js, history.js
public/css/styles.css         styles; palettes are the [data-palette] blocks at the end
public/js/main.js             mobile nav toggle + sign-up form validation
public/assets/img             images (CMS uploads land here too)
vercel.json                   build settings for Vercel
```

### Adding a new section type

1. Add a render function to `SECTIONS` in `src/render/sections.mjs` (use the `k()` helper on
   elements so they are click-to-edit in the preview).
2. Add a matching entry under `_sections.types` in `public/admin/config.yml`.
3. Add any CSS to `public/css/styles.css`.

The live site and the CMS preview both use `sections.mjs`, so there is nothing else to keep in sync.

### Adding a palette or font

- Palette: add a `[data-palette="name"]` block in `styles.css`, add it to `PALETTES` in
  `sections.mjs` and to the palette options in `config.yml`.
- Font: add it to `FONTS` in `sections.mjs` and to the font options in `config.yml`.

## Still to do

- Sign-up form validates in the browser only. Wire it to a real endpoint in `public/js/main.js`.
- Hero play button is a placeholder (no video yet).
- About, Getting Started and Download hold **filler copy**. Team names and photos, app store links,
  pricing, calendar integrations and system requirements are placeholders. Confirm them before launch.
- Footer legal links and Student Community point to `#`.
- Logo and hero image are rasters taken from the concept PDF. Replace them with the original SVG
  logo and a high-res photo.
