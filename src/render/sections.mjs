// Shared renderer for the site AND the CMS live preview.
//
// Astro uses these functions to build the real pages (src/layouts/Base.astro, src/pages/[...slug].astro),
// and the CMS loads the same file as /admin/render.js for its preview pane, so the preview always
// matches the live site. Keep this file dependency-free plain JavaScript (no imports).
//
// ctx = { img(path) -> url, keys: boolean, currentPath?: string }
//   keys: add data-key-path attributes (click-to-edit in the CMS preview). Off on the live site.

// ---------------- options shown in the CMS ----------------

export const PALETTES = {
  'compass-blue': 'CompassAI Blue',
  'ocean-teal': 'Ocean Teal',
  'royal-purple': 'Royal Purple',
  graphite: 'Graphite',
};

export const FONTS = {
  figtree: { label: 'Figtree', family: 'Figtree', url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800&display=swap' },
  inter: { label: 'Inter', family: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
  poppins: { label: 'Poppins', family: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap' },
  'nunito-sans': { label: 'Nunito Sans', family: 'Nunito Sans', url: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800&display=swap' },
};

export const themeFont = (theme = {}) => FONTS[theme.font] || FONTS.figtree;
export const themePalette = (theme = {}) => (PALETTES[theme.palette] ? theme.palette : 'compass-blue');
export const themeStyle = (theme = {}) => `--font: '${themeFont(theme).family}', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;`;

// ---------------- helpers ----------------

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const list = (v) => (Array.isArray(v) ? v : []);
const paragraphs = (text) => String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const normPath = (p = '/') => {
  const clean = String(p).split('#')[0].split('?')[0].replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
};

const ICONS = {
  upload: '<path d="M28 5H12a3 3 0 0 0-3 3v32a3 3 0 0 0 3 3h12M28 5l10 10M28 5v10h10M38 15v12"/><path d="M15 22h8M15 28h5"/><path d="M34 44V31M29 36l5-5 5 5M27 44h14"/>',
  questions: '<path d="M24 38H8a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3h28a3 3 0 0 1 3 3v9"/><path d="M5 17h34M13 4v8M31 4v8"/><path d="M11 24h4M19 24h4M11 30h4"/><path d="M28 25h15a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-8l-5 4v-4h-2a2 2 0 0 1-2-2V27a2 2 0 0 1 2-2z"/><path d="M33.5 30a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5v.4M36 37.2v.1"/>',
  plan: '<path d="M30 43H11a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3h4M33 8h4a3 3 0 0 1 3 3v15"/><rect x="15" y="4" width="18" height="8" rx="2"/><path d="M14 20l2 2 4-4M24 20h9M14 29l2 2 4-4M24 29h5M14 37h6"/><path d="M38 30l1.8 4.2L44 36l-4.2 1.8L38 42l-1.8-4.2L32 36l4.2-1.8z"/>',
  phone: '<rect x="13" y="4" width="22" height="40" rx="4"/><path d="M21 9h6M22 39h4"/>',
  android: '<rect x="13" y="4" width="22" height="40" rx="4"/><path d="M13 36h22M22 40h4"/>',
  web: '<rect x="5" y="8" width="38" height="26" rx="3"/><path d="M17 42h14M24 34v8M5 15h38"/>',
  calendar: '<rect x="5" y="8" width="38" height="34" rx="3"/><path d="M5 17h38M14 4v8M34 4v8M12 25h4M22 25h4M32 25h4M12 33h4M22 33h4"/>',
  bell: '<path d="M12 34V22a12 12 0 0 1 24 0v12l4 4H8z"/><path d="M20 42a4 4 0 0 0 8 0"/>',
  star: '<path d="M24 5l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L24 33.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8z"/>',
};
const icon = (name) => `<svg class="step-icon" viewBox="0 0 48 48" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;

// Builds `data-key-path` attributes when ctx.keys is on.
const keyer = (ctx, prefix) => (path) =>
  ctx.keys ? ` data-key-path="${esc(prefix ? `${prefix}.${path}` : path)}"` : '';

const bgClass = (bg) => (bg === 'gray' ? ' bg-gray' : bg === 'tint' ? ' bg-tint' : bg === 'white' ? ' bg-white' : '');
const anchor = (s) => (s.anchor ? ` id="${esc(s.anchor)}"` : '');
const sectionHead = (s, k) =>
  s.heading || s.intro
    ? `<div class="section-head">${s.heading ? `<h2${k('heading')}>${esc(s.heading)}</h2>` : ''}${s.intro ? `<p${k('intro')}>${esc(s.intro)}</p>` : ''}</div>`
    : '';
const checklist = (items, k, path, extra = '') =>
  `<ul class="checklist ${extra}"${k(path)}>${list(items).map((t, i) => `<li${k(`${path}.${i}`)}>${esc(t)}</li>`).join('')}</ul>`;
const cards = (items, k, path) =>
  list(items)
    .map(
      (c, i) => `<article class="feature-card feature-${esc(c.color || 'blue')}"${k(`${path}.${i}`)}>
        <h3${k(`${path}.${i}.title`)}>${esc(c.title)}</h3>
        <p${k(`${path}.${i}.body`)}>${esc(c.body)}</p>
      </article>`,
    )
    .join('');

// ---------------- sections ----------------

const SECTIONS = {
  hero: (s, k, ctx) => `
    <section class="hero"${anchor(s)}>
      <div class="container hero-inner">
        <div class="hero-copy">
          <h1${k('headline')}>${esc(s.headline)}</h1>
          ${s.lead ? `<p class="lead"${k('lead')}>${esc(s.lead)}</p>` : ''}
          ${s.ctaLabel ? `<a href="${esc(s.ctaUrl || '#signup')}" class="btn btn-primary"${k('ctaLabel')}>${esc(s.ctaLabel)}
            <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></a>` : ''}
        </div>
        ${s.image ? `<div class="hero-media"><div class="video-card"><div class="video-frame"${k('image')}>
          <img src="${esc(ctx.img(s.image))}" alt="${esc(s.imageAlt)}" width="724" height="483">
          ${s.showVideoControls ? `<button class="play-btn" type="button" aria-label="Play video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></button>
          <div class="progress" aria-hidden="true"><span class="progress-knob"></span></div>` : ''}
        </div></div></div>` : ''}
      </div>
    </section>`,

  pageBanner: (s, k) => `
    <section class="page-hero"${anchor(s)}>
      <div class="container">
        ${s.eyebrow ? `<span class="eyebrow"${k('eyebrow')}>${esc(s.eyebrow)}</span>` : ''}
        <h1${k('headline')}>${esc(s.headline)}</h1>
        ${s.lead ? `<p class="lead"${k('lead')}>${esc(s.lead)}</p>` : ''}
      </div>
    </section>`,

  featureCards: (s, k) =>
    s.style === 'plain'
      ? `<section class="section${bgClass(s.background)}"${anchor(s)}>
          <div class="container">${sectionHead(s, k)}<div class="card-grid">${cards(s.cards, k, 'cards')}</div></div>
        </section>`
      : `<section class="features${bgClass(s.background)}"${anchor(s)}>
          <div class="container"><div class="features-panel">
            ${s.heading ? `<h2${k('heading')}>${esc(s.heading)}</h2>` : ''}
            ${s.intro ? `<p class="panel-intro"${k('intro')}>${esc(s.intro)}</p>` : ''}
            <div class="feature-grid">${cards(s.cards, k, 'cards')}</div>
          </div></div>
        </section>`,

  steps: (s, k) => `
    <section class="steps${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${s.heading ? `<h2${k('heading')}>${esc(s.heading)}</h2>` : ''}
        <ol class="step-list">
          ${list(s.items).map((it, i) => `<li class="step"${k(`items.${i}`)}>
            ${icon(it.icon)}
            <span class="step-label"${k(`items.${i}.label`)}>${esc(it.label)}</span>
            <span class="step-text"${k(`items.${i}.text`)}>${esc(it.text)}</span>
          </li>`).join('')}
        </ol>
      </div>
    </section>`,

  detailedSteps: (s, k) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${sectionHead(s, k)}
        <ol class="detail-steps">
          ${list(s.items).map((it, i) => `<li class="detail-step"${k(`items.${i}`)}>
            ${icon(it.icon)}
            <div>
              <h3><span${k(`items.${i}.label`)}>${esc(it.label)}</span> <span class="detail-title"${k(`items.${i}.title`)}>${esc(it.title)}</span></h3>
              ${it.body ? `<p${k(`items.${i}.body`)}>${esc(it.body)}</p>` : ''}
              ${list(it.bullets).length ? `<ul${k(`items.${i}.bullets`)}>${list(it.bullets).map((b, j) => `<li${k(`items.${i}.bullets.${j}`)}>${esc(b)}</li>`).join('')}</ul>` : ''}
            </div>
          </li>`).join('')}
        </ol>
      </div>
    </section>`,

  textImage: (s, k, ctx) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container two-col${s.imageSide === 'left' ? ' image-left' : ''}">
        <div>
          ${s.heading ? `<h2${k('heading')}>${esc(s.heading)}</h2>` : ''}
          ${s.body ? `<div${k('body')}>${paragraphs(s.body).map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
          ${list(s.checklist).length ? checklist(s.checklist, k, 'checklist', 'checklist-dark') : ''}
        </div>
        ${s.image ? `<div class="media-card"${k('image')}><img src="${esc(ctx.img(s.image))}" alt="${esc(s.imageAlt)}" width="724" height="483"></div>` : '<div></div>'}
      </div>
    </section>`,

  quotes: (s, k) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${sectionHead(s, k)}
        <div class="card-grid${list(s.quotes).length === 2 ? ' quote-grid' : ''}">
          ${list(s.quotes).map((q, i) => `<figure class="quote-card"${k(`quotes.${i}`)}>
            <blockquote${k(`quotes.${i}.quote`)}>${esc(q.quote)}</blockquote>
            <figcaption${k(`quotes.${i}.attribution`)}>— ${esc(q.attribution)}</figcaption>
          </figure>`).join('')}
        </div>
      </div>
    </section>`,

  team: (s, k, ctx) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${sectionHead(s, k)}
        <div class="team-grid">
          ${list(s.members).map((m, i) => `<div${k(`members.${i}`)}>
            ${m.photo ? `<img class="avatar" src="${esc(ctx.img(m.photo))}" alt="${esc(m.name)}" width="120" height="120">` : `<div class="avatar" aria-hidden="true">${esc(initials(m.name))}</div>`}
            <h3${k(`members.${i}.name`)}>${esc(m.name)}</h3>
            <p${k(`members.${i}.role`)}>${esc(m.role)}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>`,

  faq: (s, k, ctx) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${sectionHead(s, k)}
        <div class="faq">
          ${list(s.items).map((f, i) => `<details${ctx.keys ? ' open' : ''}${k(`items.${i}`)}>
            <summary${k(`items.${i}.question`)}>${esc(f.question)}</summary>
            <p${k(`items.${i}.answer`)}>${esc(f.answer)}</p>
          </details>`).join('')}
        </div>
      </div>
    </section>`,

  table: (s, k) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${sectionHead(s, k)}
        <div class="table-wrap"><table class="spec-table">
          <thead><tr>${['col1', 'col2', 'col3'].map((c) => `<th scope="col"${k(`columns.${c}`)}>${esc(s.columns?.[c])}</th>`).join('')}</tr></thead>
          <tbody>${list(s.rows).map((r, i) => `<tr${k(`rows.${i}`)}>
            <th scope="row"${k(`rows.${i}.col1`)}>${esc(r.col1)}</th><td${k(`rows.${i}.col2`)}>${esc(r.col2)}</td><td${k(`rows.${i}.col3`)}>${esc(r.col3)}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>
    </section>`,

  platforms: (s, k) => `
    <section class="section${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        ${sectionHead(s, k)}
        <div class="download-grid">
          ${list(s.items).map((p, i) => {
            const live = p.url && !p.comingSoon;
            const cls = `btn btn-${esc(p.style || 'primary')}${live ? '' : ' btn-disabled'}`;
            return `<div class="platform-card"${k(`items.${i}`)}>
              ${icon(p.icon)}
              ${p.comingSoon ? `<span class="badge-soon"${k(`items.${i}.comingSoon`)}>Coming soon</span>` : ''}
              <h3${k(`items.${i}.name`)}>${esc(p.name)}</h3>
              <p${k(`items.${i}.description`)}>${esc(p.description)}</p>
              ${live ? `<a href="${esc(p.url)}" class="${cls}"${k(`items.${i}.buttonLabel`)}>${esc(p.buttonLabel)}</a>`
                : `<span class="${cls}" aria-disabled="true"${k(`items.${i}.buttonLabel`)}>${esc(p.buttonLabel)}</span>`}
            </div>`;
          }).join('')}
        </div>
      </div>
    </section>`,

  signup: (s, k) => `
    <section class="signup"${anchor({ anchor: s.anchor || 'signup' })}>
      <div class="container">
        <div class="signup-card">
          ${s.heading ? `<h2${k('heading')}>${esc(s.heading)}</h2>` : ''}
          <div class="signup-inner">
            <div class="signup-pitch">
              ${checklist(s.checklist, k, 'checklist')}
              ${s.tagline ? `<p class="signup-tagline"${k('tagline')}>${esc(s.tagline)}</p>` : ''}
            </div>
            <form class="signup-form" id="signup-form" novalidate>
              <div class="form-row">
                <div class="field"><label for="first-name">First Name*</label>
                  <input id="first-name" name="firstName" type="text" placeholder="e.g. Jordon" autocomplete="given-name" required></div>
                <div class="field"><label for="last-name">Last Name*</label>
                  <input id="last-name" name="lastName" type="text" placeholder="e.g. Miller" autocomplete="family-name" required></div>
              </div>
              <div class="field"><label for="email">Campus Email or Personal Email*</label>
                <input id="email" name="email" type="email" placeholder="e.g. Jordonm@university.org" autocomplete="email" required></div>
              <div class="field"><label for="class-year">Academic Class Year</label>
                <select id="class-year" name="classYear">
                  <option>Freshman/First Year</option><option>Sophomore/Second Year</option><option>Junior/Third Year</option>
                  <option>Senior/Fourth Year</option><option>Graduate Student</option><option>Other</option>
                </select></div>
              <p class="form-error" role="alert" hidden></p>
              <button type="submit" class="btn btn-accent"${k('buttonLabel')}>${esc(s.buttonLabel || 'Submit')}</button>
              <p class="form-success" role="status"${k('successMessage')}${k('successMessage') ? '' : ' hidden'}>${esc(s.successMessage)}</p>
            </form>
          </div>
        </div>
      </div>
    </section>`,

  cta: (s, k) => `
    <section class="section cta-band${bgClass(s.background)}"${anchor(s)}>
      <div class="container">
        <div class="cta-card">
          ${s.heading ? `<h2${k('heading')}>${esc(s.heading)}</h2>` : ''}
          ${s.text ? `<p${k('text')}>${esc(s.text)}</p>` : ''}
          ${s.buttonLabel ? `<a href="${esc(s.buttonUrl || '#')}" class="btn btn-accent"${k('buttonLabel')}>${esc(s.buttonLabel)}</a>` : ''}
        </div>
      </div>
    </section>`,
};

export const SECTION_TYPES = Object.keys(SECTIONS);

export function renderSections(sections, ctx) {
  return list(sections)
    .map((s, i) => {
      const fn = SECTIONS[s?.type];
      if (!fn) return ctx.keys ? `<div class="container" style="padding:24px">Unknown section type: ${esc(s?.type)}</div>` : '';
      return fn(s, keyer(ctx, `sections.${i}`), ctx);
    })
    .join('\n');
}

// ---------------- header & footer ----------------

export function renderHeader(h = {}, ctx) {
  const k = keyer(ctx, '');
  const current = normPath(ctx.currentPath || '/');
  const layout = h.layout === 'centered' ? 'centered' : 'split';
  const links = list(h.links)
    .map((l, i) => {
      const active = !String(l.url || '').includes('#') && normPath(l.url) === current;
      return `<a href="${esc(l.url)}"${active ? ' class="active" aria-current="page"' : ''}${k(`links.${i}`)}>${esc(l.label)}</a>`;
    })
    .join('');
  const cta = h.cta?.show && h.cta?.label
    ? `<a href="${esc(h.cta.url || '#')}" class="btn btn-primary header-cta"${k('cta.label')}>${esc(h.cta.label)}</a>`
    : '';
  return `
  <header class="site-header header-${layout}">
    <div class="container header-inner">
      <a href="/" class="brand" aria-label="Home"${k('logo')}>
        <img src="${esc(ctx.img(h.logo || '/assets/img/logo.png'))}" alt="${esc(h.logoAlt || 'Home')}" width="300" height="60">
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span><span></span></button>
      <nav id="site-nav" class="site-nav" aria-label="Main"${k('links')}>${links}${cta}</nav>
    </div>
  </header>`;
}

export function renderFooter(f = {}, ctx) {
  const k = keyer(ctx, '');
  const layout = f.layout === 'simple' ? 'simple' : 'columns';
  const logo = `<img src="${esc(ctx.img(f.logo || '/assets/img/logo-footer.png'))}" alt="${esc(f.logoAlt || '')}" width="180" height="38"${k('logo')}>`;
  const tagline = f.tagline ? `<p${k('tagline')}>${esc(f.tagline)}</p>` : '';
  if (layout === 'simple') {
    const links = list(f.columns).flatMap((c, i) => list(c.links).map((l, j) => `<a href="${esc(l.url)}"${k(`columns.${i}.links.${j}`)}>${esc(l.label)}</a>`));
    return `
  <footer class="site-footer footer-simple">
    <div class="container">
      <div class="footer-brand">${logo}</div>
      <nav class="footer-inline" aria-label="Footer"${k('columns')}>${links.join('')}</nav>
      ${tagline}
    </div>
  </footer>`;
  }
  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">${logo}${tagline}</div>
      <nav class="footer-links" aria-label="Footer"${k('columns')}>
        ${list(f.columns).map((c, i) => `<div${k(`columns.${i}`)}>
          <h4${k(`columns.${i}.heading`)}>${esc(c.heading)}</h4>
          ${list(c.links).map((l, j) => `<a href="${esc(l.url)}"${k(`columns.${i}.links.${j}`)}>${esc(l.label)}</a>`).join('')}
        </div>`).join('')}
      </nav>
    </div>
  </footer>`;
}
