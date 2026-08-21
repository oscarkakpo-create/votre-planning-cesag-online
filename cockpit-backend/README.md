# Cockpit — enregistrement sécurisé (backend)

Le cockpit `/cockpit/` peut enregistrer les statuts de deux façons :

1. **Télécharger le JSON** puis committer (aucune installation, mais manuel).
2. **Backend sécurisé** (recommandé pour un usage régulier) : une petite fonction
   serveur garde le jeton GitHub **côté serveur** et exige un mot de passe admin.
   Le navigateur n'expose **aucun secret**.

Ce dossier contient le backend (`worker.js`) à déployer sur **Cloudflare Workers**
(gratuit, pas besoin de domaine).

---

## Étape 1 — Créer le jeton GitHub (fine-grained)

1. GitHub → **Settings** (profil) → **Developer settings** → **Personal access tokens**
   → **Fine-grained tokens** → **Generate new token**.
2. **Repository access** → *Only select repositories* → `votre-planning-cesag-online`.
3. **Permissions** → **Repository permissions** → **Contents** → **Read and write**.
4. Générer, **copier le jeton** (il ne sera plus affiché).

> Le jeton n'est saisi QUE dans Cloudflare (étape 3). Jamais dans le site.

## Étape 2 — Créer le Worker Cloudflare

1. Créer un compte gratuit sur **https://dash.cloudflare.com** si besoin.
2. Menu **Workers & Pages** → **Create application** → **Create Worker**.
3. Donner un nom (ex. `cockpit-cesag`) → **Deploy**.
4. **Edit code** : effacer le contenu par défaut, coller **tout** le fichier
   [`worker.js`](./worker.js), puis **Deploy**.
5. Noter l'URL du Worker, du type :
   `https://cockpit-cesag.<votre-sous-domaine>.workers.dev`

## Étape 3 — Configurer les variables

Dans le Worker → **Settings** → **Variables and Secrets** → **Add** :

| Nom | Type | Valeur |
|---|---|---|
| `GITHUB_TOKEN` | **Secret** | le jeton de l'étape 1 |
| `ADMIN_PASSWORD` | **Secret** | un mot de passe de votre choix |
| `REPO` | Text | `oscarkakpo-create/votre-planning-cesag-online` |
| `BRANCH` | Text | la branche servie par Pages (voir note) |
| `ALLOW_ORIGIN` | Text | `https://oscarkakpo-create.github.io` |

**Deploy** pour enregistrer.

> **Note branche (`BRANCH`)** — le Worker doit écrire sur la branche que **GitHub
> Pages** publie, sinon le site public ne changera pas. Aujourd'hui Pages construit
> depuis `claude/github-files-upload-k6evwl`. **Recommandé :** dans le dépôt →
> Settings → Pages → Branch : `main`, puis mettre `BRANCH = main` ici. Les deux
> doivent correspondre.

## Étape 4 — Brancher le cockpit

1. Ouvrir `/cockpit/`.
2. Faire une modification (ex. Confirmer une séance).
3. Cliquer **🔒 Publier (sécurisé)**.
4. Coller l'**URL du Worker** et le **mot de passe admin** (`ADMIN_PASSWORD`).
5. Valider → les JSON sont écrits dans le dépôt ; le site se met à jour après le
   build Pages (≈ 1 min). L'URL et le mot de passe restent en mémoire de session
   (effacés à la fermeture de l'onglet).

---

## Sécurité — ce qui est couvert / à améliorer

- ✅ Le **jeton GitHub n'est jamais** dans le navigateur ni dans le code public.
- ✅ Toute écriture exige le **mot de passe admin** (vérifié côté serveur, sur HTTPS).
- ✅ Le Worker n'accepte que les **slugs de programmes valides** et un **JSON valide**.
- ✅ **CORS** limité à l'origine du site (`ALLOW_ORIGIN`).
- ⚠️ La **page** `/cockpit/` reste consultable par quiconque connaît l'URL (elle
  n'affiche que des données publiques ; seules les **écritures** sont protégées).
  Pour verrouiller aussi l'affichage, mettre le site derrière **Cloudflare Access**
  (nécessite un **domaine personnalisé** proxifié par Cloudflare).
- 💡 Améliorations possibles : limiter le débit (rate limiting), journaliser les
  écritures, remplacer le mot de passe par Cloudflare Access (JWT) devant le Worker.
