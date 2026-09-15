import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const ISSUE_BODY = process.env.ISSUE_BODY || "";
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;
const MESSAGE_FILE = process.env.BOT_MESSAGE_FILE;

const PROGRAM_SLUGS = {
  "Gestion des entreprises": "gestion-entreprises",
  "Administration publique": "administration-publique",
  "MBA AG AUF": "mba-ag-auf",
  "MBA AG Classique": "mba-ag-classique",
  "MBA GP": "mba-gp",
  "MBA GP AUF": "mba-gp-auf",
  "MBA MSCH": "mba-msch",
};

const ACTIONS = {
  "Reporter une séance (nouvelle date pas encore connue)": "reporter",
  "Déplacer une séance à une date/heure précise": "deplacer",
  "Confirmer une séance": "confirmer",
  "Annuler une séance": "annuler",
  "Ajouter une nouvelle séance": "ajouter",
};

const FIELD_LABELS = {
  programme: "Programme",
  action: "Que veux-tu faire ?",
  date_actuelle: "Date de la séance concernée (AAAA-MM-JJ)",
  titre: "Titre du cours",
  enseignant: "Enseignant (optionnel)",
  type_seance: "Type de séance (pour un ajout)",
  nouvelle_date: "Nouvelle date, si déjà connue (AAAA-MM-JJ)",
  heure_debut: "Heure de début (HH:MM)",
  heure_fin: "Heure de fin (HH:MM)",
  lien_moodle: "Lien Moodle (optionnel)",
  lien_salle: "Lien salle virtuelle BBB (optionnel)",
  note: "Observation ou note (optionnel)",
};

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function extractField(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("### " + escaped + "\\s*\\r?\\n\\r?\\n([\\s\\S]*?)(?=\\r?\\n### |$)");
  const m = body.match(re);
  if (!m) return "";
  const value = m[1].trim();
  return value === "_No response_" ? "" : value;
}

function readFields(body) {
  const out = {};
  for (const [key, label] of Object.entries(FIELD_LABELS)) out[key] = extractField(body, label);
  return out;
}

function frenchDate(d) {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function nowISO() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function fail(message) {
  writeFileSync(MESSAGE_FILE, message, "utf8");
  appendFileSync(GITHUB_OUTPUT, `ok=false\n`);
  process.exit(0);
}

function succeed(message, file) {
  writeFileSync(MESSAGE_FILE, message, "utf8");
  appendFileSync(GITHUB_OUTPUT, `ok=true\nfile=${file}\n`);
  process.exit(0);
}

const f = readFields(ISSUE_BODY);

const slug = PROGRAM_SLUGS[f.programme];
if (!slug) fail(`Programme non reconnu : « ${f.programme || "(vide)"} ». Vérifie le champ « Programme ».`);

const actionCode = ACTIONS[f.action];
if (!actionCode) fail(`Action non reconnue : « ${f.action || "(vide)"} ».`);

if (!f.date_actuelle || !/^\d{4}-\d{2}-\d{2}$/.test(f.date_actuelle)) {
  fail("La date indiquée est manquante ou mal formatée. Utilise le format AAAA-MM-JJ, ex. 2026-09-17.");
}
if (!f.titre) fail("Le titre du cours est requis pour identifier la bonne séance.");

const dataPath = `data/${slug}.json`;
let data;
try {
  data = JSON.parse(readFileSync(dataPath, "utf8"));
} catch (e) {
  fail(`Impossible de lire ${dataPath} : ${e.message}`);
}
data.sessions = data.sessions || [];

function nextId() {
  let max = 0;
  for (const s of data.sessions) {
    const m = /^s(\d+)$/.exec(s.id || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `s${max + 1}`;
}

function prefixedTitle(t) {
  const label = data.program_short || "";
  if (!label) return t;
  return t.startsWith(label) ? t : `${label} ${t}`;
}

function findSession() {
  const sameDate = data.sessions.filter((s) => s.date === f.date_actuelle);
  if (sameDate.length === 0) {
    return { error: `Aucune séance trouvée le ${f.date_actuelle} dans ${data.program_name || slug}.` };
  }
  const needle = f.titre.toLowerCase();
  const byTitle = sameDate.filter((s) => {
    const t = (s.title || "").toLowerCase();
    return t.includes(needle) || needle.includes(t);
  });
  const pool = byTitle.length ? byTitle : sameDate;
  if (pool.length > 1) {
    const list = pool.map((s) => `- ${s.title} (${s.teacher || "?"})`).join("\n");
    return { error: `Plusieurs séances correspondent au ${f.date_actuelle}. Précise le titre exact :\n${list}` };
  }
  if (byTitle.length === 0) {
    const list = sameDate.map((s) => `- ${s.title}`).join("\n");
    return { error: `Aucune séance dont le titre contient « ${f.titre} » le ${f.date_actuelle}. Séances ce jour-là :\n${list}` };
  }
  return { session: pool[0] };
}

const touchedAt = nowISO();
let summary = "";

if (actionCode === "ajouter") {
  if (!f.heure_debut || !f.heure_fin) fail("Heure de début et heure de fin sont requises pour ajouter une séance.");
  const s = {
    id: nextId(),
    date: f.date_actuelle,
    title: prefixedTitle(f.titre),
    type: f.type_seance || "Cours",
    teacher: f.enseignant || "",
    start: f.heure_debut,
    end: f.heure_fin,
    status: "pending",
    updated_at: touchedAt,
  };
  if (f.lien_moodle) s.moodle = f.lien_moodle;
  if (f.lien_salle) s.room = f.lien_salle;
  if (f.note) s.notes = f.note;
  data.sessions.push(s);
  summary = `Séance ajoutée le ${f.date_actuelle} : « ${s.title} » (${s.teacher || "enseignant non précisé"}).`;
} else {
  const found = findSession();
  if (found.error) fail(found.error);
  const s = found.session;

  if (actionCode === "confirmer") {
    s.status = "confirmed";
    s.updated_at = touchedAt;
    summary = `Séance confirmée : « ${s.title} » du ${s.date}.`;
  } else if (actionCode === "annuler") {
    s.status = "cancelled";
    s.updated_at = touchedAt;
    if (f.note) s.notes = f.note;
    summary = `Séance annulée : « ${s.title} » du ${s.date}.`;
  } else if (actionCode === "reporter") {
    s.status = "rescheduled";
    s.updated_at = touchedAt;
    s.notes = f.note || "Séance reportée — nouvelle date à confirmer.";
    summary = `Séance marquée reportée : « ${s.title} » du ${s.date}. Nouvelle date à ajouter plus tard (nouvelle issue « Déplacer »).`;
  } else if (actionCode === "deplacer") {
    if (!f.nouvelle_date || !/^\d{4}-\d{2}-\d{2}$/.test(f.nouvelle_date)) fail("La nouvelle date est requise (AAAA-MM-JJ) pour déplacer une séance.");
    if (!f.heure_debut || !f.heure_fin) fail("Nouvelle heure de début et de fin requises pour déplacer une séance.");
    const later = f.nouvelle_date >= s.date;
    const newId = nextId();
    const copy = JSON.parse(JSON.stringify(s));
    copy.id = newId;
    copy.date = f.nouvelle_date;
    copy.start = f.heure_debut;
    copy.end = f.heure_fin;
    copy.status = "pending";
    copy.updated_at = touchedAt;
    copy.moved_from = s.id;
    delete copy.moved_to;
    if (f.note) copy.notes = f.note;
    else delete copy.notes;
    s.status = later ? "rescheduled" : "advanced";
    s.updated_at = touchedAt;
    s.moved_to = newId;
    data.sessions.push(copy);
    summary = `Séance ${later ? "reportée" : "avancée"} : « ${s.title} » du ${s.date} → ${f.nouvelle_date} ${f.heure_debut}-${f.heure_fin}.`;
  }
}

data.updated_label = frenchDate(new Date());
data.sessions.sort((a, b) => `${a.date}${a.start || ""}`.localeCompare(`${b.date}${b.start || ""}`));

writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
succeed(summary, dataPath);
