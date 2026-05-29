# Sociuly — Dossier de handoff

Ce dossier contient les **maquettes hi-fi** et la **spécification produit & technique** de Sociuly.

## Par où commencer

1. **`SPEC.md`** — Document de référence : périmètre, stack, modèle de données, règles métier, écrans. **À lire en premier, en entier.**
2. **`Sociuly Site Hi-Fi.html`** — Prototype interactif des 9 écrans desktop. Ouvrir dans un navigateur ; un dock en bas de page permet de naviguer entre les pages.
3. **`Sociuly Design System.html`** — Documentation visuelle des tokens et composants (couleurs, typo, boutons, cartes…).
4. **`Sociuly Wireframes Selected.html`** + **`Sociuly Wireframes v2.html`** — Wireframes basse-fi (pour comprendre l'intention avant le hi-fi).

## Source de vérité

- **Visuel** : les fichiers `.html` ouverts dans un navigateur.
- **Composants** : `ds-tokens.jsx` (tokens), `ds-components.jsx` (atomiques), `ds-patterns.jsx` (composites).
- **Écrans** : `screen-*.jsx`.
- **Produit & technique** : `SPEC.md`.

**En cas de conflit entre les maquettes et le SPEC.md** : remonter la question avant de coder, ne pas trancher seul.

## Avant tout `npm init`

La section 3 du `SPEC.md` propose une stack par défaut (Next.js + Postgres + Prisma + Stripe Connect + Resend). **Ces choix doivent être confirmés** par le fondateur. Voir aussi la section 11 (Décisions ouvertes) pour les arbitrages métier en suspens.

## Contact

Fondateur : *à compléter*
Designer : *à compléter*

---

*Document généré le 26 mai 2026 à partir des maquettes Sociuly v1.*
