// Mock projets pour la console club.
// SPEC §3 — entité Project : `status ∈ draft | active | funded | archived`,
// montants en cents. La variante visuelle "à venir" (cf. maquette
// `screen-projects-admin.jsx`) est portée via le flag dérivé `upcoming`
// sur un projet `active` dont la campagne n'est pas encore ouverte.
// TODO(api): remplacer par un fetcher Prisma une fois le modèle Project en place.

export type ProjectStatus = "draft" | "active" | "funded" | "archived";

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  status: ProjectStatus;
  upcoming?: boolean;
  raisedCents: number;
  targetCents: number;
  /** Libellé court affiché en tête de carte : "12j", "à ouvrir", null si N/A. */
  remainingLabel: string | null;
};

export type LinkedExperience = {
  id: string;
  title: string;
  priceEuros: number;
  bookingsCount: number;
  totalEuros: number;
  hue: "green" | "orange" | "yellow" | "teal";
};

export type ProjectUpdate = {
  id: string;
  date: string;
  title: string;
  body?: string;
  done?: boolean;
};

export type ProjectDetail = ProjectListItem & {
  description: string;
  supportersCount: number;
  viewsCount: number;
  viewsWeeklyDeltaPercent: number;
  linkedExperiences: LinkedExperience[];
  updates: ProjectUpdate[];
};

const PROJECTS: ProjectDetail[] = [
  {
    id: "p1",
    slug: "tournoi-national-espagne-u17",
    title: "Tournoi national Espagne U17",
    status: "active",
    raisedCents: 248_000,
    targetCents: 400_000,
    remainingLabel: "12j",
    description:
      "Emmenez nos U17 défendre les couleurs du club au tournoi international d'Alicante, du 12 au 16 juillet.",
    supportersCount: 14,
    viewsCount: 1_248,
    viewsWeeklyDeltaPercent: 22,
    linkedExperiences: [
      { id: "lp1", title: "Atelier cohésion d'équipe",       priceEuros: 1200, bookingsCount: 4, totalEuros: 4_800, hue: "green"  },
      { id: "lp2", title: "Match VIP & hospitalités",        priceEuros: 2400, bookingsCount: 1, totalEuros: 2_400, hue: "orange" },
      { id: "lp3", title: "Initiation basket encadrée",      priceEuros: 900,  bookingsCount: 2, totalEuros: 1_800, hue: "teal"   },
      { id: "lp4", title: "Cocktail & visite des coulisses", priceEuros: 1100, bookingsCount: 1, totalEuros: 1_100, hue: "yellow" },
    ],
    updates: [
      {
        id: "u1", date: "22 mai · 14h",
        title: "€420 collectés cette semaine",
        body: "Merci à tous nos soutiens — il nous reste 12 jours pour atteindre l'objectif.",
        done: true,
      },
      {
        id: "u2", date: "14 mai",
        title: "Choix de l'hébergement à Alicante",
        body: "Réservation confirmée — auberge centre-ville, à 800m de la salle.",
        done: true,
      },
      {
        id: "u3", date: "02 mai",
        title: "Projet ouvert au financement",
        body: "4 expériences liées — objectif €4 000 sur 30 jours.",
      },
    ],
  },
  {
    id: "p2",
    slug: "maillots-de-saison-2026",
    title: "Maillots de saison 2026",
    status: "active",
    raisedCents: 105_000,
    targetCents: 150_000,
    remainingLabel: "38j",
    description:
      "Un jeu de maillots flambant neuf pour toutes les équipes du club, floqué aux couleurs de la saison.",
    supportersCount: 9,
    viewsCount: 612,
    viewsWeeklyDeltaPercent: 11,
    linkedExperiences: [
      { id: "lp5", title: "Initiation basket encadrée", priceEuros: 900,  bookingsCount: 3, totalEuros: 2_700, hue: "teal"   },
      { id: "lp6", title: "Atelier cohésion d'équipe",  priceEuros: 1200, bookingsCount: 1, totalEuros: 1_200, hue: "orange" },
    ],
    updates: [
      {
        id: "m1", date: "10 mai",
        title: "Choix du fournisseur",
        body: "Devis validé chez Macron Store — livraison prévue mi-août.",
        done: true,
      },
      {
        id: "m2", date: "28 avr.",
        title: "Projet ouvert au financement",
        body: "2 expériences liées — objectif €1 500 sur 60 jours.",
      },
    ],
  },
  {
    id: "p3",
    slug: "renovation-vestiaires",
    title: "Rénovation vestiaires",
    status: "active",
    raisedCents: 320_000,
    targetCents: 1_000_000,
    remainingLabel: "74j",
    description:
      "Refaire à neuf les deux vestiaires du gymnase : peinture, casiers, bancs et nouvelles douches.",
    supportersCount: 22,
    viewsCount: 1_980,
    viewsWeeklyDeltaPercent: 6,
    linkedExperiences: [
      { id: "lp7", title: "Masterclass joueur pro",    priceEuros: 1800, bookingsCount: 2, totalEuros: 3_600, hue: "yellow" },
      { id: "lp8", title: "Match VIP & hospitalités",  priceEuros: 2400, bookingsCount: 1, totalEuros: 2_400, hue: "orange" },
      { id: "lp9", title: "Atelier cohésion d'équipe", priceEuros: 1200, bookingsCount: 3, totalEuros: 3_600, hue: "green"  },
    ],
    updates: [
      {
        id: "v1", date: "20 mai",
        title: "Premiers devis reçus",
        body: "3 artisans contactés, fourchette estimée à €9 800.",
        done: true,
      },
      {
        id: "v2", date: "12 avr.",
        title: "Projet ouvert au financement",
        body: "3 expériences liées — objectif €10 000 sur 90 jours.",
      },
    ],
  },
  {
    id: "p4",
    slug: "stage-ete-u13",
    title: "Stage été · U13",
    status: "active",
    upcoming: true,
    raisedCents: 12_000,
    targetCents: 220_000,
    remainingLabel: "à ouvrir",
    description:
      "Une semaine de stage intensif fin août pour les U13, avec deux entraîneurs invités et trois sorties sportives.",
    supportersCount: 1,
    viewsCount: 84,
    viewsWeeklyDeltaPercent: 4,
    linkedExperiences: [],
    updates: [
      {
        id: "s1", date: "30 mai",
        title: "Projet créé",
        body: "Ouverture du financement prévue dès la fin de saison.",
      },
    ],
  },
  {
    id: "p5",
    slug: "mini-bus-du-club",
    title: "Mini-bus du club",
    status: "funded",
    raisedCents: 850_000,
    targetCents: 850_000,
    remainingLabel: null,
    description:
      "Un mini-bus 9 places pour transporter nos équipes en déplacement, fierté de toute la saison écoulée.",
    supportersCount: 38,
    viewsCount: 3_412,
    viewsWeeklyDeltaPercent: 0,
    linkedExperiences: [
      { id: "lp10", title: "Cocktail & visite des coulisses", priceEuros: 1100, bookingsCount: 4, totalEuros: 4_400, hue: "teal"  },
      { id: "lp11", title: "Atelier cohésion d'équipe",       priceEuros: 1200, bookingsCount: 3, totalEuros: 3_600, hue: "green" },
    ],
    updates: [
      {
        id: "b1", date: "15 mars",
        title: "Objectif atteint",
        body: "Merci à toutes et tous, le bus est commandé pour la saison prochaine.",
        done: true,
      },
      {
        id: "b2", date: "10 jan.",
        title: "Projet ouvert au financement",
        body: "2 expériences liées — objectif €8 500 sur 60 jours.",
      },
    ],
  },
  {
    id: "p6",
    slug: "tournoi-national-u13",
    title: "Tournoi national U13",
    status: "draft",
    raisedCents: 0,
    targetCents: 0,
    remainingLabel: null,
    description:
      "Brouillon — préparer le tournoi national U13 de la saison prochaine.",
    supportersCount: 0,
    viewsCount: 0,
    viewsWeeklyDeltaPercent: 0,
    linkedExperiences: [],
    updates: [],
  },
];

export async function getProjects(_clubId: string): Promise<ProjectDetail[]> {
  return PROJECTS;
}
