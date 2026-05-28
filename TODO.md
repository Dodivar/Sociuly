# Sociuly — Prochaines étapes frontend

Basé sur `app/` (état actuel) vs. `designs/` + `SPEC.md` §6.
Périmètre : **frontend uniquement**. N'inclut pas l'intégration Stripe ou Supabase.

---

## 📄 Pages à implémenter

### A. Pages déjà maquettées (priorité 1 — référence visuelle existante)

- [ ] **`/associations/[slug]`** — profil club public
  Référence : `designs/screen-asso.jsx` (cover + identité vérifiée + onglets prestations/projets/équipe)
- [ ] **`/console/[clubId]/projets`** — gestion projets de saison (master/detail + timeline)
  Référence : `designs/screen-projects-admin.jsx`
- [ ] **`/admin`** — console Sociuly (validation KYC, modération, finances, signalements)
  Référence : `designs/wire-admin.jsx`

### B. Pages console club restantes (la sidebar les liste, elles 404 actuellement)

Voir `components/console/club-sidebar.tsx` (lignes 19-27) — 6 entrées sans page :

- [ ] `/console/[clubId]/prestations` — liste + édition prestations (avec statut `draft/published/paused`)
- [ ] `/console/[clubId]/reservations` — liste filtrable, vue détail booking, actions confirm/cancel
- [ ] `/console/[clubId]/revenus` — encaissements, versements à venir, historique
- [ ] `/console/[clubId]/avis` — modération avis reçus
- [ ] `/console/[clubId]/equipe` — membres + invitations (rôles `president/treasurer/member`)
- [ ] `/console/[clubId]/prestations/nouvelle` — formulaire création (cf. `designs/wire-create-service.jsx`)

### C. Pages à concevoir AVANT codage (SPEC.md §6 — pas encore maquettées)

- [ ] **`/inscription-club`** — onboarding asso (SIRET, fédération, contact président)
- [ ] **`/compte`** — espace client : mes réservations, mes avis à déposer, mes coordonnées
- [ ] **`/cgu`**, **`/confidentialite`**, **`/mentions-legales`** — pages légales statiques

> ⚠️ Pour ces 3 blocs : remonter au designer avant d'écrire du code (cf. SPEC §6 « Pages manquantes à concevoir — signaler avant code »).

---

## 🖱 Interactions à développer sur les pages existantes

### Landing `/`
- [ ] Recherche du hero → submit vers `/prestations?q=…`
- [ ] Lien réel sur les 6 tuiles catégories (filtrer marketplace par catégorie)
- [ ] FAQ : interaction `<details>` (déjà natif, vérifier ouverture/fermeture animée)
- [ ] Carte d'impact (`ImpactMap`) : tooltip ville au hover, lien vers marketplace filtrée par ville

### Marketplace `/prestations`
- [ ] **Filtres réellement câblés** : aujourd'hui `components/marketplace/filters.tsx` (lignes 23-32) ne fait que du local state — porter vers `searchParams` URL et filtrer la liste
- [ ] Filtres manquants par rapport au SPEC §6 : prix (slider), rayon km, date
- [ ] Sélecteur de ville (autocomplete Strasbourg/Nancy/Metz) + bouton géoloc navigateur
- [ ] Carte interactive : markers cliquables, sync hover liste ↔ carte, popup mini-card
- [ ] Pagination ou scroll infini (la grille est aujourd'hui figée à 6 cartes statiques)
- [ ] Favoris : toggle ❤️ avec persistance (localStorage v1)
- [ ] Tri (Pertinence / Prix / Note / Distance) connecté aux résultats

### Détail prestation `/prestations/[slug]`
- [ ] Galerie images (thumbnails + viewer)
- [ ] Booking rail sticky : sélecteur date/heure, nb participants, recalcul prix live → CTA vers `/reserver/[slug]?date=…`
- [ ] Lien actif vers profil asso + projet financé
- [ ] Avis : pagination « voir plus »
- [ ] Partage (lien copié, mailto)

### Tunnel `/reserver/[ref]`
- [ ] Navigation entre les 4 étapes du `BookingStepper` (avant/arrière, blocage si étape invalide)
- [ ] Validation par étape (date dispo, adresse si `at_client`, infos client)
- [ ] État persistant entre étapes (form context ou query params)
- [ ] `TipSelector` : sélection + impact sur récap latéral
- [ ] CTA paiement → placeholder (UI seulement, à brancher plus tard)

### Confirmation `/reserver/[ref]/confirmation`
- [ ] Bouton « Ajouter au calendrier » (génération `.ics`)
- [ ] Partage (mailto + WhatsApp)
- [ ] CTA « Voir mes réservations » → `/compte` (à créer)

### Console dashboard `/console/[clubId]/dashboard`
- [ ] Cellules `BookingsPanel` : ligne cliquable → modale/drawer détail
- [ ] Actions par booking : confirmer, refuser, annuler (UI seulement)
- [ ] Filtres bookings (statut, date)
- [ ] `TasksCard` : check/uncheck d'une tâche
- [ ] Liens du `DashboardHeader` actifs (créer prestation, voir projets…)

### Layout global / navigation
- [ ] `TopNav` : menu mobile (burger), état connecté vs anonyme, dropdown profil
- [ ] Sidebar console : variante mobile (cf. media-query existante `components/console/club-sidebar.tsx` lignes 164-175, à tester réellement)
- [ ] Footer : liens vers les pages légales (à créer)

---

## 🧭 Ordre suggéré

Cohérent avec SPEC §12 :

1. **Débloquer la console club** (section B) — la sidebar 404 actuellement.
2. **Brancher les interactions marketplace + détail + booking** — parcours client critique.
3. **Concevoir puis builder** onboarding & compte (section C).
4. **Profil asso public** et **admin Sociuly** (section A).
