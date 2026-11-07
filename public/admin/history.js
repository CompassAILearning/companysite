/* global CMS, html */
// "History" page for the CMS: lists published versions of each page and lets an editor
// restore an earlier version with one click. Restoring commits the old content to `main`,
// so Vercel redeploys the site with it (the restore itself also shows up in History and can be undone).
//
// It reuses the editor's CMS sign-in. Sveltia doesn't expose the token to custom pages, so it is
// read from localStorage key `sveltia-cms.user` (checked against Sveltia 0.256.1). If a Sveltia
// upgrade changes that, this page shows a "sign out and back in" message rather than failing silently.

(() => {
  const REPO = 'CompassAILearning/companysite';
  const BRANCH = 'main';
  const PAGES = [
    { file: 'src/content/home.json', label: 'Home' },
    { file: 'src/content/about.json', label: 'About' },
    { file: 'src/content/getting-started.json', label: 'Getting Started' },
    { file: 'src/content/download.json', label: 'Download' },
    { file: 'src/content/site.json', label: 'Footer' },
  ];
  const PER_PAGE = 15;

  const { useState, useEffect, useCallback } = CMS.React;

  // ---------- GitHub helpers ----------
  const getToken = () => {
    try {
      return JSON.parse(localStorage.getItem('sveltia-cms.user') || 'null')?.token || null;
    } catch {
      return null;
    }
  };

  const gh = async (path, options = {}) => {
    const token = getToken();
    if (!token) throw new Error('NO_TOKEN');
    const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `GitHub error ${res.status}`);
    }
    return res.json();
  };

  const decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
  const encode = (text) => {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  };

  const fileAt = async (file, ref) => {
    const res = await gh(`/contents/${file}?ref=${encodeURIComponent(ref)}`);
    return res ? { text: decode(res.content), sha: res.sha } : null;
  };

  // ---------- diff helpers ----------
  const flatten = (value, prefix = '', out = {}) => {
    if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}${prefix ? ' › ' : ''}#${i + 1}`, out));
    else if (value && typeof value === 'object')
      Object.entries(value).forEach(([k, v]) => flatten(v, `${prefix}${prefix ? ' › ' : ''}${k}`, out));
    else out[prefix] = value;
    return out;
  };

  const diff = (beforeText, afterText) => {
    let a = {};
    let b = {};
    try { a = beforeText ? flatten(JSON.parse(beforeText)) : {}; } catch { /* ignore */ }
    try { b = afterText ? flatten(JSON.parse(afterText)) : {}; } catch { /* ignore */ }
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    return keys
      .filter((k) => a[k] !== b[k])
      .map((k) => ({ field: k, before: a[k], after: b[k] }));
  };

  const when = (iso) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  // ---------- UI ----------
  const S = {
    page: { padding: '24px', maxWidth: '980px', fontSize: '14px', lineHeight: 1.5 },
    tabs: { display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 20px' },
    tab: (active) => ({
      padding: '6px 14px', borderRadius: '999px', cursor: 'pointer',
      border: '1px solid var(--sui-primary-border-color, #888)',
      background: active ? 'var(--sui-primary-accent-color, #2462eb)' : 'transparent',
      color: active ? '#fff' : 'inherit', fontWeight: 600,
    }),
    row: {
      border: '1px solid var(--sui-primary-border-color, #8884)', borderRadius: '10px',
      padding: '14px 16px', marginBottom: '10px',
    },
    meta: { opacity: 0.75, fontSize: '13px' },
    actions: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
    btn: {
      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
      border: '1px solid var(--sui-primary-border-color, #888)', background: 'transparent', color: 'inherit',
    },
    primary: { background: 'var(--sui-primary-accent-color, #2462eb)', color: '#fff', border: '0' },
    badge: {
      display: 'inline-block', padding: '1px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
      background: '#5ee6b833', marginLeft: '8px',
    },
    diffTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px' },
    cell: { borderTop: '1px solid #8883', padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'pre-wrap' },
    notice: (kind) => ({
      padding: '10px 14px', borderRadius: '8px', margin: '12px 0',
      background: kind === 'error' ? '#e5484d22' : '#5ee6b822',
    }),
  };

  const Changes = ({ file, sha, parentSha }) => {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
      (async () => {
        try {
          const [after, before] = await Promise.all([fileAt(file, sha), parentSha ? fileAt(file, parentSha) : null]);
          setRows(diff(before?.text, after?.text));
        } catch (e) {
          setError(e.message);
        }
      })();
    }, [file, sha, parentSha]);
    if (error) return html`<div style=${S.notice('error')}>${error}</div>`;
    if (!rows) return html`<p style=${S.meta}>Loading changes…</p>`;
    if (!rows.length) return html`<p style=${S.meta}>No text changes in this version.</p>`;
    return html`
      <table style=${S.diffTable}>
        <thead><tr><th style=${{ textAlign: 'left' }}>Field</th><th style=${{ textAlign: 'left' }}>Before</th><th style=${{ textAlign: 'left' }}>After</th></tr></thead>
        <tbody>
          ${rows.map((r, i) => html`
            <tr key=${i}>
              <td style=${{ ...S.cell, fontWeight: 600 }}>${r.field}</td>
              <td style=${{ ...S.cell, color: '#c43c41' }}>${r.before ?? '—'}</td>
              <td style=${{ ...S.cell, color: '#1d8a5c' }}>${r.after ?? '—'}</td>
            </tr>`)}
        </tbody>
      </table>`;
  };

  const Version = ({ page, commit, isCurrent, onRestored }) => {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const author = commit.commit.author?.name || commit.author?.login || 'Unknown';
    const message = commit.commit.message.split('\n')[0];
    const parentSha = commit.parents?.[0]?.sha;

    const restore = async () => {
      if (!confirm(`Restore the ${page.label} page to this version from ${when(commit.commit.author.date)}?\n\nThis goes live straight away (no review). You can undo it from this History page.`)) return;
      setBusy(true);
      setError('');
      try {
        const [old, current] = await Promise.all([fileAt(page.file, commit.sha), fileAt(page.file, BRANCH)]);
        if (!old) throw new Error('That version of the file could not be found.');
        if (current && old.text === current.text) throw new Error('The page already matches this version.');
        await gh(`/contents/${page.file}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: `Restore ${page.label} page to version ${commit.sha.slice(0, 7)} (${when(commit.commit.author.date)})`,
            content: encode(old.text),
            sha: current?.sha,
            branch: BRANCH,
          }),
        });
        onRestored(`${page.label} restored. The live site updates in about a minute.`);
      } catch (e) {
        setError(e.message === 'NO_TOKEN' ? 'You are signed out. Sign in again and retry.' : e.message);
      } finally {
        setBusy(false);
      }
    };

    return html`
      <div style=${S.row}>
        <div>
          <strong>${message}</strong>
          ${isCurrent && html`<span style=${S.badge}>Live now</span>`}
        </div>
        <div style=${S.meta}>${when(commit.commit.author.date)} · ${author}</div>
        <div style=${S.actions}>
          <button type="button" style=${S.btn} onClick=${() => setOpen(!open)}>${open ? 'Hide changes' : 'Show changes'}</button>
          ${!isCurrent && html`
            <button type="button" style=${{ ...S.btn, ...S.primary }} disabled=${busy} onClick=${restore}>
              ${busy ? 'Restoring…' : 'Restore this version'}
            </button>`}
          <a style=${{ ...S.btn, textDecoration: 'none' }} href=${commit.html_url} target="_blank" rel="noopener">View on GitHub</a>
        </div>
        ${error && html`<div style=${S.notice('error')}>${error}</div>`}
        ${open && html`<${Changes} file=${page.file} sha=${commit.sha} parentSha=${parentSha} />`}
      </div>`;
  };

  const HistoryPage = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [commits, setCommits] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const page = PAGES[pageIndex];

    const load = useCallback(async () => {
      setCommits(null);
      setError('');
      try {
        const list = await gh(`/commits?sha=${BRANCH}&path=${encodeURIComponent(page.file)}&per_page=${PER_PAGE}`);
        setCommits(list || []);
      } catch (e) {
        setError(
          e.message === 'NO_TOKEN'
            ? 'Could not read your sign-in. Sign out of the CMS and sign back in, then reopen History.'
            : e.message,
        );
      }
    }, [page.file]);

    useEffect(() => { load(); }, [load]);

    return html`
      <div style=${S.page}>
        <h2 style=${{ margin: 0 }}>Page history</h2>
        <p style=${S.meta}>
          Every published change to a page is listed here, newest first. Use <b>Show changes</b> to see what was edited,
          and <b>Restore this version</b> to put a page back the way it was. A restore goes live straight away.
        </p>
        <div style=${S.tabs}>
          ${PAGES.map((p, i) => html`
            <button key=${p.file} type="button" style=${S.tab(i === pageIndex)} onClick=${() => { setNotice(''); setPageIndex(i); }}>${p.label}</button>`)}
        </div>
        ${notice && html`<div style=${S.notice('ok')}>${notice}</div>`}
        ${error && html`<div style=${S.notice('error')}>${error}</div>`}
        ${!error && !commits && html`<p style=${S.meta}>Loading…</p>`}
        ${commits && !commits.length && html`<p style=${S.meta}>No published versions yet.</p>`}
        ${commits && commits.map((c, i) => html`
          <${Version}
            key=${c.sha}
            page=${page}
            commit=${c}
            isCurrent=${i === 0}
            onRestored=${(msg) => { setNotice(msg); load(); }}
          />`)}
        ${commits && commits.length === PER_PAGE && html`
          <p style=${S.meta}>Showing the latest ${PER_PAGE} versions. Older ones are on
            <a href=${`https://github.com/${REPO}/commits/${BRANCH}/${page.file}`} target="_blank" rel="noopener">GitHub</a>.</p>`}
      </div>`;
  };

  CMS.registerCustomPage({ id: 'history', label: 'History', icon: 'history', component: HistoryPage });
})();
