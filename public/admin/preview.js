/* global CMS */
// Live preview for Sveltia CMS. Loaded as an ES module (see index.html).
//
// The markup comes from ./render.js, which is src/render/sections.mjs served by Astro
// (src/pages/admin/render.js.ts): the exact same code that builds the live site.
// Elements carry data-key-path attributes, so clicking text in the preview jumps to its field.

import * as R from './render.js';

const { useState, useEffect, createElement: h } = CMS.React;

Object.values(R.FONTS).forEach((f) => CMS.registerPreviewStyle(f.url));
CMS.registerPreviewStyle('/css/styles.css');
CMS.registerPreviewStyle(
  `body { margin: 0; }
   .site-header { position: static; }
   [data-key-path]:hover { outline: 2px dashed rgba(36, 98, 235, .5); outline-offset: 3px; cursor: pointer; }
   .preview-note { font: 13px/1.4 system-ui, sans-serif; color: #6b7a85; text-align: center; padding: 10px; background: #f1f4f6; }`,
  { raw: true },
);

// ---------- helpers ----------
const toJS = (entry) => entry?.get?.('data')?.toJS?.() ?? {};
const imgResolver = (getAsset) => (path) => (path ? getAsset(path)?.url || path : '');

// Loads saved site settings (theme/header/footer) so page previews show the real header and footer.
const useSettings = (getCollection) => {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.all(
      ['theme', 'header', 'footer'].map((name) =>
        getCollection('settings', name).then(toJS).catch(() => ({})),
      ),
    ).then(([theme, header, footer]) => alive && setSettings({ theme, header, footer }));
    return () => { alive = false; };
  }, []);
  return settings;
};

const usePage = (getCollection, slug) => {
  const [page, setPage] = useState(null);
  useEffect(() => {
    let alive = true;
    getCollection('pages', slug).then(toJS).catch(() => ({})).then((p) => alive && setPage(p));
    return () => { alive = false; };
  }, [slug]);
  return page;
};

// Wraps rendered HTML in the theme (palette + font), like <html> does on the live site.
const Themed = ({ theme = {}, html }) =>
  h('div', {
    className: 'theme-root',
    'data-palette': R.themePalette(theme),
    style: { '--font': `'${R.themeFont(theme).family}', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` },
    dangerouslySetInnerHTML: { __html: html },
  });

const loading = h('p', { className: 'preview-note' }, 'Loading preview…');

// ---------- Pages ----------
const PagePreview = ({ entry, getAsset, getCollection }) => {
  const settings = useSettings(getCollection);
  if (!settings) return loading;
  const page = toJS(entry);
  const slug = entry.get('slug');
  const currentPath = !slug || slug === 'index' ? '/' : `/${slug}`;
  const img = imgResolver(getAsset);
  const html =
    R.renderHeader(settings.header, { img, keys: false, currentPath }) +
    `<main>${R.renderSections(page.sections, { img, keys: true })}</main>` +
    R.renderFooter(settings.footer, { img, keys: false });
  return h(Themed, { theme: settings.theme, html });
};

// ---------- Theme: show the home page in the chosen palette/font ----------
const ThemePreview = ({ entry, getAsset, getCollection }) => {
  const settings = useSettings(getCollection);
  const home = usePage(getCollection, 'index');
  if (!settings || !home) return loading;
  const img = imgResolver(getAsset);
  const html =
    `<div class="preview-note">Previewing the theme on the Home page</div>` +
    R.renderHeader(settings.header, { img, keys: false, currentPath: '/' }) +
    `<main>${R.renderSections(home.sections, { img, keys: false })}</main>` +
    R.renderFooter(settings.footer, { img, keys: false });
  return h(Themed, { theme: toJS(entry), html });
};

// ---------- Header ----------
const HeaderPreview = ({ entry, getAsset, getCollection }) => {
  const settings = useSettings(getCollection);
  const home = usePage(getCollection, 'index');
  if (!settings || !home) return loading;
  const img = imgResolver(getAsset);
  const html =
    R.renderHeader(toJS(entry), { img, keys: true, currentPath: '/' }) +
    `<div class="preview-note">The header appears on every page</div>` +
    `<main>${R.renderSections((home.sections || []).slice(0, 1), { img, keys: false })}</main>`;
  return h(Themed, { theme: settings.theme, html });
};

// ---------- Footer ----------
const FooterPreview = ({ entry, getAsset, getCollection }) => {
  const settings = useSettings(getCollection);
  if (!settings) return loading;
  const img = imgResolver(getAsset);
  const html =
    `<div class="preview-note">The footer appears on every page</div>` +
    R.renderFooter(toJS(entry), { img, keys: true });
  return h(Themed, { theme: settings.theme, html });
};

CMS.registerPreviewTemplate('pages', PagePreview);
CMS.registerPreviewTemplate('theme', ThemePreview);
CMS.registerPreviewTemplate('header', HeaderPreview);
CMS.registerPreviewTemplate('footer', FooterPreview);
