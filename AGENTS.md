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
  "date": "2026-08-24",
  "title": "Nom du module",
  "type": "Cours",
  "teacher": "M. NOM",
  "start": "18:00",
  "end": "20:00",
  "moodle": "https://...",
  "room": "https://..."
}
```

## Structure standard d’un examen
```json
{
  "date": "2026-08-26",
  "title": "Nom du module",
  "type": "Examen",
  "teacher": "M. NOM",
  "start": "18:00",
  "end": "20:00",
  "duration": "120 minutes",
  "moodle": "https://...",
  "room": "https://...",
  "teams": "https://...",
  "notes": "Consignes particulières"
}
```

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

## Consigne à retenir
Lors d’une mise à jour hebdomadaire, l’utilisateur ne doit pas avoir à parler de JSON ou de HTML. Il colle simplement son planning. Le dépôt doit absorber ce contenu en modifiant uniquement les données nécessaires, sans toucher à l’apparence du site.