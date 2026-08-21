/**
 * CESAG ONLINE — Cockpit : proxy d'écriture sécurisé (Cloudflare Worker)
 * ---------------------------------------------------------------------
 * Le cockpit (page statique) NE contient aucun secret. Il envoie les JSON
 * modifiés à ce Worker, qui vérifie un mot de passe puis écrit dans GitHub
 * avec un jeton conservé UNIQUEMENT côté serveur (variable d'environnement).
 *
 * Variables à définir (Cloudflare → Worker → Settings → Variables) :
 *   GITHUB_TOKEN   (Secret) : PAT fine-grained, permission « Contents: Read and write »
 *                             sur le dépôt oscarkakpo-create/votre-planning-cesag-online
 *   ADMIN_PASSWORD (Secret) : mot de passe que l'admin saisira dans le cockpit
 *   REPO   (Text) : "oscarkakpo-create/votre-planning-cesag-online"
 *   BRANCH (Text) : la branche servie par GitHub Pages (ex. "main")
 *   ALLOW_ORIGIN (Text) : "https://oscarkakpo-create.github.io"
 *
 * Corps attendu (POST, JSON) :
 *   { "password": "…", "files": [ { "slug": "mba-gp-auf", "content": "<JSON string>" }, … ] }
 */
export default {
  async fetch(request, env) {
    const allow = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "invalid_json" }, 400, cors); }

    // Auth : comparaison simple du mot de passe (sur HTTPS)
    if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
      return json({ error: "unauthorized" }, 401, cors);
    }

    const files = Array.isArray(body.files) ? body.files : [];
    if (!files.length) return json({ error: "no_files" }, 400, cors);
    if (files.length > 10) return json({ error: "too_many_files" }, 400, cors);

    const repo = env.REPO;
    const branch = env.BRANCH || "main";
    if (!repo || !env.GITHUB_TOKEN) return json({ error: "server_misconfigured" }, 500, cors);

    const results = [];
    for (const f of files) {
      const slug = String(f.slug || "");
      // Liste blanche stricte : uniquement les slugs de programmes connus
      if (!/^[a-z0-9-]{1,60}$/.test(slug)) { results.push({ slug, ok: false, error: "bad_slug" }); continue; }

      // Le contenu doit être un JSON valide
      let content = f.content;
      try { JSON.parse(content); } catch { results.push({ slug, ok: false, error: "invalid_json_content" }); continue; }

      const path = `data/${slug}.json`;
      const base = `https://api.github.com/repos/${repo}/contents/${path}`;
      const gh = (url, init) => fetch(url, {
        ...init,
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "User-Agent": "cesag-cockpit-worker",
          "Accept": "application/vnd.github+json",
          ...(init && init.headers),
        },
      });

      try {
        // 1) récupérer le SHA courant (s'il existe)
        let sha = null;
        const get = await gh(`${base}?ref=${encodeURIComponent(branch)}`, { method: "GET" });
        if (get.status === 200) sha = (await get.json()).sha;
        else if (get.status !== 404) { results.push({ slug, ok: false, error: `get_${get.status}` }); continue; }

        // 2) écrire le fichier
        const put = await gh(base, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `cockpit: mise à jour des statuts (${slug})`,
            content: b64(content),
            branch,
            ...(sha ? { sha } : {}),
          }),
        });
        results.push({ slug, ok: put.ok, status: put.status });
      } catch (e) {
        results.push({ slug, ok: false, error: "fetch_failed" });
      }
    }

    return json({ ok: results.every((r) => r.ok), branch, results }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

// Base64 robuste pour l'UTF-8 (accents, etc.)
function b64(str) {
  const bytes = new TextEncoder().encode(String(str));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
