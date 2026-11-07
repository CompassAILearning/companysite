// Serves src/render/sections.mjs as /admin/render.js so the CMS preview uses
// exactly the same rendering code as the live site.
import source from '../../render/sections.mjs?raw';

export const GET = () =>
  new Response(source, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
