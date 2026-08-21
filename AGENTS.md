# Règles de mise à jour — Votre planning · CESAG ONLINE

## Objectif du dépôt
Ce dépôt contient un site FOAD déjà structuré et déjà designé.
Les pages HTML sont les gabarits officiels du site.
Lors d’une mise à jour hebdomadaire, le travail consiste uniquement à injecter les nouvelles données de planning dans les fichiers JSON.

## Règle principale
Quand l’utilisateur colle un planning brut, NE PAS refaire les pages HTML.
NE PAS modifier le design.
NE PAS déplacer les dossiers.
NE PAS recréer les cartes de séance à la main.

Pour une mise à jour normale de planning, modifier UNIQUEMENT le fichier JSON du programme concerné dans `/data/`.

## Ce que l’utilisateur peut envoyer
Le planning peut être fourni sous une forme simple comme :

Programme : MBA GP
Période : du lundi 24 août 2026 au dimanche 30 août 2026

Séance 1
- Date : 24/08/2026
- Module : Nom du module
- Horaire (GMT) : 18:00–20:00
- Enseignant : M. NOM
- Type : Cours
- Lien Moodle : https://...
- Salle virtuelle : https://...

Pour un examen, il peut également fournir :
- Durée
- Lien Teams de surveillance
- Consignes particulières

## Traitement obligatoire
À chaque nouveau planning transmis :

1. Identifier exactement le programme concerné.
2. Ouvrir uniquement le JSON correspondant dans `/data/`.
3. Remplacer les données de la semaine précédente par les nouvelles données fournies.
4. Mettre à jour :
   - `week_label`
   - `week_file_label`
   - `updated_label`
   - `sessions`
5. Convertir les dates au format ISO `AAAA-MM-JJ` dans le JSON.
6. Conserver les horaires en GMT au format `HH:MM`.
7. Trier toutes les séances par date puis par heure de début.
8. Utiliser uniquement les informations réellement fournies par l’utilisateur.
9. Ne jamais inventer de lien Moodle, BBB, Teams, enseignant, date, durée ou consigne.
10. Si une information facultative n’est pas fournie, omettre simplement le champ correspondant.
11. Vérifier que le JSON reste valide avant de terminer.
12. Ne modifier aucun autre programme.

## Correspondance des programmes
- MBA AG — Gestion des entreprises → `data/gestion-entreprises.json`
- MBA AG — Administration publique → `data/administration-publique.json`
- MBA AG AUF → `data/mba-ag-auf.json`
- MBA Gestion de Projets / MBA GP → `data/mba-gp.json`
- MBA GP AUF → `data/mba-gp-auf.json`
- MBA MSCH / Management Stratégique du Capital Humain → `data/mba-msch.json`

## Structure standard d’une séance de cours
```json
{
  "id": "s1",
  "date": "2026-08-24",
  "title": "Nom du module",
  "type": "Cours",
  "teacher": "M. NOM",
  "start": "18:00",
  "end": "20:00",
  "status": "pending",
  "moodle": "https://...",
  "room": "https://..."
}
```

## Structure standard d’un examen
```json
{
  "id": "s3",
  "date": "2026-08-26",
  "title": "Nom du module",
  "type": "Examen",
  "teacher": "M. NOM",
  "start": "18:00",
  "end": "20:00",
  "status": "pending",
  "duration": "120 minutes",
  "moodle": "https://...",
  "room": "https://...",
  "teams": "https://...",
  "notes": "Consignes particulières"
}
```

Champs de gestion (ajoutés/maintenus par le cockpit, à ne pas inventer manuellement) :
- `id` : identifiant stable de la séance (généré par le cockpit s’il manque).
- `status` : statut de la séance (voir plus bas). Par défaut `pending` pour toute nouvelle séance.
- `updated_at` : date/heure du dernier changement de statut. Si présent, la page programme affiche discrètement « Dernière mise à jour : … » sous la séance. Accepte une chaîne lisible (« 21 août 2026 à 09h30 ») ou un horodatage ISO (formaté automatiquement).
- `moved_from` / `moved_to` : liens entre une séance d’origine reportée/avancée et sa nouvelle occurrence.

Au niveau du programme, deux champs facultatifs pilotent le badge « nouveau » :
- `is_new` : `true` quand une nouvelle semaine vient d’être publiée.
- `published_at` : horodatage ISO de la publication.

## Comportement du site à préserver
Les pages HTML lisent automatiquement les JSON et doivent continuer à :
- afficher la période de la semaine ;
- afficher les séances dans l’ordre chronologique ;
- distinguer visuellement Cours et Examen ;
- afficher Moodle uniquement si le lien existe ;
- afficher la salle virtuelle uniquement si le lien existe ;
- afficher Teams uniquement si le lien existe ;
- afficher la durée et les consignes uniquement si elles existent ;
- générer l’ICS de la semaine ;
- générer l’ICS d’une séance ;
- conserver les trois rappels calendrier prévus ;
- permettre l’export PDF via l’impression du navigateur.

## Fichiers à ne pas modifier lors d’une mise à jour de planning
Sauf demande explicite de l’utilisateur, ne pas modifier :
- `/index.html`
- les `index.html` des programmes ;
- `/tff/`
- `/documents-tff/`
- `/futurelearn/`
- `/calendrier/`
- `/aide/`
- `/documents/`
- les styles CSS intégrés ;
- la logique JavaScript des pages.

## Cas particulier : plusieurs programmes dans le même message
Si l’utilisateur transmet plusieurs plannings à la fois, mettre à jour uniquement les JSON des programmes explicitement présents dans son message. Chaque programme reste indépendant.

## Contrôle final avant commit
Avant de valider une mise à jour :
- vérifier que toutes les dates correspondent à la période affichée ;
- vérifier que les séances sont triées ;
- vérifier que les liens sont copiés sans modification ;
- vérifier que chaque JSON est syntaxiquement valide ;
- confirmer que seuls les fichiers JSON nécessaires ont été modifiés.

## Cockpit d’administration (`/cockpit/`)
Le dépôt fournit un cockpit d’administration à l’adresse `/cockpit/`. Il permet de :
- voir les séances de tous les programmes ou de filtrer par programme ;
- publier un nouveau planning (badge NOUVEAU) ;
- confirmer une séance le jour J ;
- l’annuler, la reporter ou l’avancer ;
- ajouter une séance ;
- revenir à l’accueil, au programme concerné ou au site public.

Le cockpit **ne fait que produire du JSON** : il ne modifie ni le design ni le HTML. Le site public continue de lire les mêmes fichiers `/data/*.json`. Les changements faits dans le cockpit sont d’abord un **brouillon local** (localStorage du navigateur) ; pour qu’ils apparaissent en ligne, il faut **publier** :
- soit **Télécharger le(s) JSON** puis committer le fichier dans `/data/` ;
- soit **Publier sur GitHub** (API Contents) avec un jeton personnel saisi au moment de l’usage.

## Statuts des séances
Valeurs possibles du champ `status` :
- `pending` → **À confirmer** (badge doré) — statut par défaut de toute nouvelle séance ;
- `confirmed` → **Confirmée** (badge vert) ;
- `advanced` → **Avancée** (badge bleu) ;
- `rescheduled` → **Reportée** (badge orange) ;
- `cancelled` → **Annulée** (badge rouge).

Si `status` est absent, la séance est traitée comme `pending`.

Répercussion sur le site public :
- le badge de statut s’affiche sur la carte de séance ;
- une séance `cancelled` masque les boutons Moodle / BBB / Teams et affiche « Séance annulée » ;
- les séances `cancelled`, `rescheduled` et `advanced` sont **exclues des ICS** (semaine et séance unique), ce qui évite tout doublon avec la nouvelle occurrence.

## Publication d’une nouvelle semaine
Lorsqu’une nouvelle semaine est publiée :
- chaque nouvelle séance est créée avec `"status": "pending"` (elle apparaît comme **À confirmer**) ;
- au niveau du programme, `"is_new": true` et `"published_at": "<ISO>"` sont ajoutés → badge **NOUVEAU** sur la page programme et sur l’accueil.

## Le jour J (confirmation manuelle)
Le jour de la séance, l’administrateur ouvre le cockpit et clique **Confirmer** :
- `status` passe à `confirmed` ;
- `updated_at` est enregistré automatiquement ;
- l’affichage public reflète le nouveau statut après publication du JSON.
Le bouton **À confirmer** permet de revenir à `pending` (correction d’une confirmation faite par erreur).

## Report / Avancement / Annulation
- **Reporter** : la séance d’origine passe à `rescheduled` (reste visible comme REPORTÉE, exclue des ICS) ; une **nouvelle occurrence** `pending` est créée avec le nouveau créneau (`moved_from` pointant l’origine).
- **Avancer** : idem avec `advanced` sur l’origine ; la nouvelle occurrence est intégrée normalement au planning.
- **Annuler** : la séance passe à `cancelled`, une observation courte peut être saisie, les liens Moodle/BBB/Teams sont masqués et la séance est exclue des ICS.
Ne jamais dupliquer une séance à la main : la nouvelle occurrence est créée par le cockpit et l’origine conserve son statut.

## Sécurité du cockpit
- Le cockpit n’est pas destiné aux étudiants (`noindex`), mais rien n’empêche techniquement d’ouvrir son URL : **prévoir une vraie protection d’accès avant mise en production** (hébergement protégé, Basic Auth, Cloudflare Access, Netlify password, etc.).
- Ne jamais écrire de mot de passe, secret ou jeton dans le code. Le jeton GitHub est saisi au moment de l’usage et conservé uniquement dans le `sessionStorage` de l’onglet.
- Ne pas exposer de fonction d’écriture publique sur les JSON sans protection : l’écriture réelle nécessite le jeton personnel de l’administrateur.

## Design
Lors des mises à jour normales (planning, statuts), **ne pas modifier le design ni la structure** des pages. Le cockpit et les pages programmes partagent la charte existante (vert `#0B4D2E`, or `#C9962A`). Les évolutions de design ne se font que sur demande explicite.

## Consigne à retenir
Lors d’une mise à jour hebdomadaire, l’utilisateur ne doit pas avoir à parler de JSON ou de HTML. Il colle simplement son planning. Le dépôt doit absorber ce contenu en modifiant uniquement les données nécessaires, sans toucher à l’apparence du site.