/* global CMS, html */
// Live preview templates for Sveltia CMS.
// They mirror the markup in src/pages/*.astro so the preview pane looks like the real site.
// `data-key-path` makes each element click-to-edit: clicking it jumps to that field.
// If you change a page's markup in src/, update the matching template here too.

CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800&display=swap');
CMS.registerPreviewStyle('/css/styles.css');
CMS.registerPreviewStyle(
  `body { background: #fff; }
   [data-key-path]:hover { outline: 2px dashed rgba(36, 98, 235, .5); outline-offset: 3px; cursor: pointer; }`,
  { raw: true },
);

const ICONS = {
  upload: html`<path d="M28 5H12a3 3 0 0 0-3 3v32a3 3 0 0 0 3 3h12M28 5l10 10M28 5v10h10M38 15v12"/><path d="M15 22h8M15 28h5"/><path d="M34 44V31M29 36l5-5 5 5M27 44h14"/>`,
  questions: html`<path d="M24 38H8a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3h28a3 3 0 0 1 3 3v9"/><path d="M5 17h34M13 4v8M31 4v8"/><path d="M11 24h4M19 24h4M11 30h4"/><path d="M28 25h15a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-8l-5 4v-4h-2a2 2 0 0 1-2-2V27a2 2 0 0 1 2-2z"/><path d="M33.5 30a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5v.4M36 37.2v.1"/>`,
  plan: html`<path d="M30 43H11a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3h4M33 8h4a3 3 0 0 1 3 3v15"/><rect x="15" y="4" width="18" height="8" rx="2"/><path d="M14 20l2 2 4-4M24 20h9M14 29l2 2 4-4M24 29h5M14 37h6"/><path d="M38 30l1.8 4.2L44 36l-4.2 1.8L38 42l-1.8-4.2L32 36l4.2-1.8z"/>`,
  phone: html`<rect x="13" y="4" width="22" height="40" rx="4"/><path d="M21 9h6M22 39h4"/>`,
  android: html`<rect x="13" y="4" width="22" height="40" rx="4"/><path d="M13 36h22M22 40h4"/>`,
  web: html`<rect x="5" y="8" width="38" height="26" rx="3"/><path d="M17 42h14M24 34v8M5 15h38"/>`,
};

// ---------- helpers ----------
const data = (entry) => entry.get('data')?.toJS?.() ?? {};
const list = (v) => (Array.isArray(v) ? v : []);
const img = (getAsset, path) => (path ? getAsset(path)?.url || path : '');
const icon = (name) => html`<svg class="step-icon" viewBox="0 0 48 48" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const PageHero = ({ hero = {} }) => html`
  <section class="page-hero">
    <div class="container">
      ${hero.eyebrow && html`<span class="eyebrow" data-key-path="hero.eyebrow">${hero.eyebrow}</span>`}
      <h1 data-key-path="hero.headline">${hero.headline}</h1>
      <p class="lead" data-key-path="hero.lead">${hero.lead}</p>
    </div>
  </section>`;

const CtaBand = ({ cta = {}, alt }) => html`
  <section class=${`section cta-band${alt ? ' section-alt' : ''}`}>
    <div class="container">
      <div class="cta-card">
        <h2 data-key-path="cta.heading">${cta.heading}</h2>
        <p data-key-path="cta.text">${cta.text}</p>
        <span class="btn btn-accent" data-key-path="cta.buttonLabel">${cta.buttonLabel}</span>
      </div>
    </div>
  </section>`;

const Cards = (cards, path) =>
  list(cards).map(
    (c, i) => html`
      <article key=${i} class=${`feature-card feature-${c.color || 'blue'}`} data-key-path=${`${path}.${i}`}>
        <h3 data-key-path=${`${path}.${i}.title`}>${c.title}</h3>
        <p data-key-path=${`${path}.${i}.body`}>${c.body}</p>
      </article>`,
  );

const Checklist = (items, path, extraClass = '') => html`
  <ul class=${`checklist ${extraClass}`} data-key-path=${path}>
    ${list(items).map((t, i) => html`<li key=${i} data-key-path=${`${path}.${i}`}>${t}</li>`)}
  </ul>`;

// ---------- Home ----------
const HomePreview = ({ entry, getAsset }) => {
  const { hero = {}, features = {}, steps = {}, signup = {} } = data(entry);
  return html`
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <h1 data-key-path="hero.headline">${hero.headline}</h1>
          <p class="lead" data-key-path="hero.lead">${hero.lead}</p>
          <span class="btn btn-primary" data-key-path="hero.ctaLabel">${hero.ctaLabel}</span>
        </div>
        <div class="hero-media">
          <div class="video-card">
            <div class="video-frame" data-key-path="hero.image">
              <img src=${img(getAsset, hero.image)} alt=${hero.imageAlt || ''} />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-panel">
          <h2 data-key-path="features.heading">${features.heading}</h2>
          <div class="feature-grid">${Cards(features.cards, 'features.cards')}</div>
        </div>
      </div>
    </section>

    <section class="steps">
      <div class="container">
        <h2 data-key-path="steps.heading">${steps.heading}</h2>
        <ol class="step-list">
          ${list(steps.items).map(
            (s, i) => html`
              <li key=${i} class="step" data-key-path=${`steps.items.${i}`}>
                ${icon(s.icon)}
                <span class="step-label" data-key-path=${`steps.items.${i}.label`}>${s.label}</span>
                <span class="step-text" data-key-path=${`steps.items.${i}.text`}>${s.text}</span>
              </li>`,
          )}
        </ol>
      </div>
    </section>

    <section class="signup">
      <div class="container">
        <div class="signup-card">
          <h2 data-key-path="signup.heading">${signup.heading}</h2>
          <div class="signup-inner">
            <div class="signup-pitch">
              ${Checklist(signup.checklist, 'signup.checklist')}
              <p class="signup-tagline" data-key-path="signup.tagline">${signup.tagline}</p>
            </div>
            <div class="signup-form">
              <p style=${{ margin: "0 0 16px", color: "#6b7a85" }}>Sign-up form (fields aren't editable here)</p>
              <span class="btn btn-accent" data-key-path="signup.buttonLabel">${signup.buttonLabel}</span>
              <p class="form-success" data-key-path="signup.successMessage">After signing up: ${signup.successMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
};

// ---------- About ----------
const AboutPreview = ({ entry, getAsset }) => {
  const { hero, mission = {}, values = {}, stories = {}, team = {}, cta } = data(entry);
  const paragraphs = (mission.body || '').split(/\n\s*\n/).filter(Boolean);
  return html`
    <${PageHero} hero=${hero} />
    <section class="section">
      <div class="container two-col">
        <div>
          <h2 data-key-path="mission.heading">${mission.heading}</h2>
          <div data-key-path="mission.body">${paragraphs.map((p, i) => html`<p key=${i}>${p}</p>`)}</div>
        </div>
        <div class="media-card" data-key-path="mission.image"><img src=${img(getAsset, mission.image)} alt="" /></div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        <div class="section-head">
          <h2 data-key-path="values.heading">${values.heading}</h2>
          <p data-key-path="values.intro">${values.intro}</p>
        </div>
        <div class="card-grid">${Cards(values.cards, 'values.cards')}</div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 data-key-path="stories.heading">${stories.heading}</h2>
          <p data-key-path="stories.intro">${stories.intro}</p>
        </div>
        <div class="card-grid quote-grid">
          ${list(stories.quotes).map(
            (q, i) => html`
              <figure key=${i} class="quote-card" data-key-path=${`stories.quotes.${i}`}>
                <blockquote data-key-path=${`stories.quotes.${i}.quote`}>${q.quote}</blockquote>
                <figcaption data-key-path=${`stories.quotes.${i}.attribution`}>— ${q.attribution}</figcaption>
              </figure>`,
          )}
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        <div class="section-head">
          <h2 data-key-path="team.heading">${team.heading}</h2>
          <p data-key-path="team.intro">${team.intro}</p>
        </div>
        <div class="team-grid">
          ${list(team.members).map(
            (m, i) => html`
              <div key=${i} data-key-path=${`team.members.${i}`}>
                ${m.photo
                  ? html`<img class="avatar" src=${img(getAsset, m.photo)} alt="" />`
                  : html`<div class="avatar">${initials(m.name)}</div>`}
                <h3 data-key-path=${`team.members.${i}.name`}>${m.name}</h3>
                <p data-key-path=${`team.members.${i}.role`}>${m.role}</p>
              </div>`,
          )}
        </div>
      </div>
    </section>
    <${CtaBand} cta=${cta} />`;
};

// ---------- Getting Started ----------
const GettingStartedPreview = ({ entry, getAsset }) => {
  const { hero, steps, needs = {}, faq = {}, cta } = data(entry);
  return html`
    <${PageHero} hero=${hero} />
    <section class="section section-alt">
      <div class="container">
        <ol class="detail-steps">
          ${list(steps).map(
            (s, i) => html`
              <li key=${i} class="detail-step" data-key-path=${`steps.${i}`}>
                ${icon(s.icon)}
                <div>
                  <h3><span data-key-path=${`steps.${i}.label`}>${s.label}</span> <span style=${{ color: "inherit" }} data-key-path=${`steps.${i}.title`}>${s.title}</span></h3>
                  <p data-key-path=${`steps.${i}.body`}>${s.body}</p>
                  ${list(s.bullets).length > 0 &&
                  html`<ul data-key-path=${`steps.${i}.bullets`}>${list(s.bullets).map((b, j) => html`<li key=${j} data-key-path=${`steps.${i}.bullets.${j}`}>${b}</li>`)}</ul>`}
                </div>
              </li>`,
          )}
        </ol>
      </div>
    </section>
    <section class="section">
      <div class="container two-col">
        <div>
          <h2 data-key-path="needs.heading">${needs.heading}</h2>
          ${Checklist(needs.items, 'needs.items', 'checklist-dark')}
        </div>
        <div class="media-card" data-key-path="needs.image"><img src=${img(getAsset, needs.image)} alt="" /></div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container">
        <div class="section-head"><h2 data-key-path="faq.heading">${faq.heading}</h2></div>
        <div class="faq">
          ${list(faq.items).map(
            (f, i) => html`
              <details key=${i} open data-key-path=${`faq.items.${i}`}>
                <summary data-key-path=${`faq.items.${i}.question`}>${f.question}</summary>
                <p data-key-path=${`faq.items.${i}.answer`}>${f.answer}</p>
              </details>`,
          )}
        </div>
      </div>
    </section>
    <${CtaBand} cta=${cta} alt=${true} />`;
};

// ---------- Download ----------
const DownloadPreview = ({ entry, getAsset }) => {
  const { hero, platforms, requirements = {}, sync = {}, cta } = data(entry);
  return html`
    <${PageHero} hero=${hero} />
    <section class="section section-alt">
      <div class="container">
        <div class="download-grid">
          ${list(platforms).map(
            (p, i) => html`
              <div key=${i} class="platform-card" data-key-path=${`platforms.${i}`}>
                ${icon(p.icon)}
                ${p.comingSoon && html`<span class="badge-soon" data-key-path=${`platforms.${i}.comingSoon`}>Coming soon</span>`}
                <h3 data-key-path=${`platforms.${i}.name`}>${p.name}</h3>
                <p data-key-path=${`platforms.${i}.description`}>${p.description}</p>
                <span class=${`btn btn-${p.style || 'primary'}${p.url && !p.comingSoon ? '' : ' btn-disabled'}`} data-key-path=${`platforms.${i}.buttonLabel`}>${p.buttonLabel}</span>
              </div>`,
          )}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 data-key-path="requirements.heading">${requirements.heading}</h2>
          <p data-key-path="requirements.intro">${requirements.intro}</p>
        </div>
        <div class="table-wrap">
          <table class="spec-table">
            <thead><tr><th>Platform</th><th>Minimum version</th><th>Notes</th></tr></thead>
            <tbody>
              ${list(requirements.rows).map(
                (r, i) => html`
                  <tr key=${i} data-key-path=${`requirements.rows.${i}`}>
                    <th data-key-path=${`requirements.rows.${i}.platform`}>${r.platform}</th>
                    <td data-key-path=${`requirements.rows.${i}.minimum`}>${r.minimum}</td>
                    <td data-key-path=${`requirements.rows.${i}.notes`}>${r.notes}</td>
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section section-alt">
      <div class="container two-col">
        <div>
          <h2 data-key-path="sync.heading">${sync.heading}</h2>
          ${Checklist(sync.items, 'sync.items', 'checklist-dark')}
        </div>
        <div class="media-card" data-key-path="sync.image"><img src=${img(getAsset, sync.image)} alt="" /></div>
      </div>
    </section>
    <${CtaBand} cta=${cta} alt=${true} />`;
};

// ---------- Footer ----------
const FooterPreview = ({ entry }) => {
  const { footerTagline, footerColumns } = data(entry);
  return html`
    <div style=${{ height: "40px" }}></div>
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <img src="/assets/img/logo-footer.png" alt="CompassAI" width="180" />
          <p data-key-path="footerTagline">${footerTagline}</p>
        </div>
        <nav class="footer-links">
          ${list(footerColumns).map(
            (col, i) => html`
              <div key=${i} data-key-path=${`footerColumns.${i}`}>
                <h4 data-key-path=${`footerColumns.${i}.heading`}>${col.heading}</h4>
                ${list(col.links).map((l, j) => html`<a key=${j} data-key-path=${`footerColumns.${i}.links.${j}`}>${l.label}</a>`)}
              </div>`,
          )}
        </nav>
      </div>
    </footer>`;
};

CMS.registerPreviewTemplate('home', HomePreview);
CMS.registerPreviewTemplate('about', AboutPreview);
CMS.registerPreviewTemplate('getting-started', GettingStartedPreview);
CMS.registerPreviewTemplate('download', DownloadPreview);
CMS.registerPreviewTemplate('site', FooterPreview);
