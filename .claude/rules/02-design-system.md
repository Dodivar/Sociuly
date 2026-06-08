# Design System — règles à respecter

## Principe fondamental

Le projet dispose d'un Design System maison. Ne pas introduire de bibliothèques UI externes
(shadcn/ui, Radix, MUI, Chakra, Ant Design, etc.). Tout composant UI passe par le DS ou l'étend.

## Composants disponibles

Tous les primitives se trouvent dans `components/ds/` :

| Fichier | Exports |
|---|---|
| `components.tsx` | `Btn`, `IconBtn`, `Chip`, `Card`, `Avatar`, `Progress`, `Tabs`, `Stars`, `Field`, `Input`, `Textarea`, `SearchBar` |
| `patterns.tsx` | `Logo`, `PrestationCard`, `SectionHeader`, `SiteFooter`, `TopNav` |
| `icon.tsx` | `Icon` (SVG inline, prop `name`) |
| `impact.tsx` | `ImpactHero`, `ImpactMini`, `MarketMap` |
| `landing/impact-map.tsx` | `ImpactMap` (carte MapLibre/OpenFreeMap lazy-loadée) |

Avant de créer un nouveau composant, vérifier qu'il n'existe pas déjà dans le DS.

## Tokens CSS (variables)

Le thème est défini via des variables CSS dans `app/globals.css`. Utiliser toujours les
tokens, jamais de valeurs brutes pour les couleurs ou les rayons.

```
Couleurs :   --bg  --surface  --surface-2  --ink  --ink-3
             --primary  --primary-soft  --primary-deep
             --accent  --accent-soft  --accent-deep
             --highlight  --highlight-soft
             --line  --line-2
Typographie: --display  --body  --mono (familles de polices)
             --display-var (font-variation-settings pour Bricolage)
Espace :     --radius-sm  --radius-md  --radius-lg  --radius-xl
Ombres :     --shadow-sm  --shadow-md
```

## Classes utilitaires `sy-*`

Le DS expose des classes CSS globales. Les utiliser à la place de styles inline quand elles
couvrent le besoin :

| Catégorie | Classes |
|---|---|
| Typographie | `sy-display` `sy-display-sm` `sy-h1` `sy-h2` `sy-h3` `sy-h4` `sy-body` `sy-body-l` `sy-small` `sy-mono` `sy-mono-strong` `sy-num` `sy-muted` |
| Layout | `sy-grid-3` `sy-grid-4` `sy-divider-vert` |
| Composants CSS | `sy-btn` `sy-btn-primary` `sy-btn-outline` … `sy-card` `sy-card-elevated` … `sy-chip` … `sy-progress` … |

## Styles inline vs classes

- **Classes `sy-*`** : sémantique DS (typographie, composants, tokens).
- **Styles inline** : layout local (grid, padding, marges spécifiques à une page), overrides
  ponctuels. Ne pas dupliquer ce qui est déjà dans une classe.
- **`<style>` JSX local** : acceptable pour les media queries propres à une page (voir `app/page.tsx`).
  Préférer extraire dans `globals.css` si la règle est réutilisée.

## Polices

Bricolage Grotesque (display / titres), Geist (body / UI), Instrument Serif (décoratif),
JetBrains Mono (mono). Chargées via Google Fonts dans `app/layout.tsx`.
Ne pas charger d'autres polices sans décision explicite.

## Merge de classes

Utiliser `cx()` depuis `@/lib/cx`. Ne pas importer `clsx`, `cn`, ou `classnames`.

```ts
import { cx } from "@/lib/cx";
const cls = cx("sy-btn", variant === "primary" && "sy-btn-primary", className);
```

## Ajout de composants DS

Pour ajouter un primitif au DS :
1. L'implémenter dans `components/ds/components.tsx` (ou le fichier approprié).
2. Utiliser uniquement les tokens CSS existants.
3. Suivre le pattern `cx()` pour les variantes.
4. Exporter depuis le même fichier — pas de nouveau fichier pour un seul composant.

## Accessibilité

- Tout élément interactif non-`<button>` / non-`<a>` doit avoir `role` + `tabIndex` + `onKeyDown`.
  Voir l'exemple `Chip` avec `onClick` dans `components/ds/components.tsx`.
- Tout `<img>` a un attribut `alt`.
- Les `<input>` sont toujours enveloppés dans un `<Field>` avec `label`.
