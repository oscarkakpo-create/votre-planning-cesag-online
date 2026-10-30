# CESAG ONLINE — Synthèse de travail

## Objet

Ce document résume les décisions et règles établies pour le site public de planning CESAG ONLINE.

## Règles générales

- Les mises à jour de planning se font uniquement dans les fichiers JSON de `data/`.
- Les fichiers HTML, le design, la navigation, les ICS et la boîte à outils ne doivent pas être modifiés lors d’une simple mise à jour de planning.
- Les séances sont triées par date puis par heure.
- Les nouvelles séances utilisent le statut `pending` — « À confirmer ».
- Les liens Moodle, BBB et Teams fournis doivent être conservés exactement.
- Les cours communs doivent utiliser les mêmes liens dans les programmes concernés.

## Programmes suivis

- MBA AG — Gestion des entreprises
- MBA AG — Administration publique
- MBA AG AUF
- MBA AG Classique
- MBA GP Classique
- MBA GP AUF
- MBA MSCH

## Règles de liens retenues

- Simulation / Jeu d’entreprise avec Hervé Foyang : lien de référence MBA MSCH, commun avec AG et AG AUF.
- Gestion des parties prenantes : liens communs entre GP Classique et GP AUF lorsqu’il s’agit du même cours.
- Méthodologie de recherche qualitative GP Classique : Moodle `id=1003`, BBB `id=13907`.
- Approches innovantes GP : Moodle `id=995`, BBB `id=29927`.
- Les liens Teams sont réservés à la surveillance des examens lorsqu’ils sont fournis.

## Dernière semaine publiée

Semaine du **26 octobre au 1er novembre 2026**.

Les plannings publiés comprennent notamment les cours de gestion, administration publique, simulations d’entreprise, méthodologie, examens GP et séances MSCH.

## Fichiers et publications importantes

- `data/mba-gp-auf.json` : mise à jour du 26 octobre au 1er novembre, avec la séance d’Aspects juridiques déplacée au jeudi 29 octobre.
- `data/mba-gp.json` : mise à jour GP Classique pour la même semaine.
- `calendrier/cesag-global-26-10-au-01-11-2026.ics` : calendrier global contenant 20 séances et les liens dans les descriptifs.

## Liens publics des programmes

- [Gestion des entreprises](https://oscarkakpo-create.github.io/votre-planning-cesag-online/gestion-entreprises/)
- [Administration publique](https://oscarkakpo-create.github.io/votre-planning-cesag-online/administration-publique/)
- [MBA AG AUF](https://oscarkakpo-create.github.io/votre-planning-cesag-online/mba-ag-auf/)
- [MBA AG Classique](https://oscarkakpo-create.github.io/votre-planning-cesag-online/mba-ag-classique/)
- [MBA GP Classique](https://oscarkakpo-create.github.io/votre-planning-cesag-online/mba-gp/)
- [MBA GP AUF](https://oscarkakpo-create.github.io/votre-planning-cesag-online/mba-gp-auf/)
- [MBA MSCH](https://oscarkakpo-create.github.io/votre-planning-cesag-online/mba-msch/)

## Historique technique récent

- `920caa9` : mise à jour GP AUF.
- `c8cf68b` : mise à jour GP Classique.
- `bff3485` : ajout du calendrier ICS global du 26 octobre au 1er novembre.

