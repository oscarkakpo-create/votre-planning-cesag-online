# Règles de mise à jour — Agenda FOAD CESAG ONLINE

## Principe
Les fichiers HTML constituent le design officiel du site.
Ne pas modifier leur structure, leurs couleurs, leurs styles ou leur logique sauf demande explicite.

À chaque nouveau planning transmis par l'utilisateur :
1. Identifier le programme concerné.
2. Modifier UNIQUEMENT le fichier JSON correspondant dans `/data/`.
3. Mettre à jour `week_label`, `week_file_label`, `updated_label` et `sessions`.
4. Trier les séances par date puis heure.
5. Ne jamais inventer une date, un enseignant, un lien, une durée ou une salle.
6. Pour un cours : renseigner `moodle` et `room` si fournis.
7. Pour un examen : renseigner aussi `duration`, `teams` et `notes` lorsqu'ils sont fournis.
8. Conserver les horaires en GMT.
9. Ne jamais modifier les autres programmes.
10. Ne jamais modifier `index.html` pendant une simple mise à jour de planning.

## Correspondance des fichiers
- MBA AG — Gestion des entreprises → `data/gestion-entreprises.json`
- MBA AG — Administration publique → `data/administration-publique.json`
- MBA AG AUF → `data/mba-ag-auf.json`
- MBA Gestion de Projets → `data/mba-gp.json`
- MBA GP AUF → `data/mba-gp-auf.json`
- MBA MSCH → `data/mba-msch.json`

## Structure d'une séance
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

Pour un examen, ajouter si disponible :
```json
{
  "duration": "120 minutes",
  "teams": "https://...",
  "notes": "Consignes particulières"
}
```
