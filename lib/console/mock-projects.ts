<<<<<<< HEAD
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

export type LinkedPrestation = {
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
  linkedPrestations: LinkedPrestation[];
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
    linkedPrestations: [
      { id: "lp1", title: "Barbecue convivial",     priceEuros: 280, bookingsCount: 8, totalEuros: 2_240, hue: "green"  },
      { id: "lp2", title: "Olympiades entreprise",  priceEuros: 720, bookingsCount: 1, totalEuros: 720,   hue: "orange" },
      { id: "lp3", title: "Buvette événement",      priceEuros: 350, bookingsCount: 2, totalEuros: 700,   hue: "teal"   },
      { id: "lp4", title: "Initiation volley",      priceEuros: 150, bookingsCount: 3, totalEuros: 450,   hue: "yellow" },
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
        body: "4 prestations liées — objectif €4 000 sur 30 jours.",
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
    linkedPrestations: [
      { id: "lp5", title: "Buvette match à domicile", priceEuros: 220, bookingsCount: 3, totalEuros: 660, hue: "teal" },
      { id: "lp6", title: "Tournoi loisirs adulte",   priceEuros: 390, bookingsCount: 1, totalEuros: 390, hue: "orange" },
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
        body: "2 prestations liées — objectif €1 500 sur 60 jours.",
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
    linkedPrestations: [
      { id: "lp7", title: "Anniversaire enfant",   priceEuros: 180, bookingsCount: 4, totalEuros: 720,   hue: "yellow" },
      { id: "lp8", title: "Olympiades entreprise", priceEuros: 720, bookingsCount: 1, totalEuros: 720,   hue: "orange" },
      { id: "lp9", title: "Barbecue convivial",    priceEuros: 280, bookingsCount: 6, totalEuros: 1_680, hue: "green"  },
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
        body: "3 prestations liées — objectif €10 000 sur 90 jours.",
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
    linkedPrestations: [],
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
    linkedPrestations: [
      { id: "lp10", title: "Buvette événement", priceEuros: 350, bookingsCount: 12, totalEuros: 4_200, hue: "teal"   },
      { id: "lp11", title: "Barbecue convivial", priceEuros: 280, bookingsCount: 15, totalEuros: 4_200, hue: "green" },
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
        body: "2 prestations liées — objectif €8 500 sur 60 jours.",
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
    linkedPrestations: [],
    updates: [],
  },
];

export async function getProjects(_clubId: string): Promise<ProjectDetail[]> {
  return PROJECTS;
=======
export type ProjectStatus = "live" | "funded" | "draft" | "upcoming";

export type ProjectPrestation = {
  id: string;
  title: string;
  priceCents: number;
  bookings: number;
  totalCents: number;
  hue: "green" | "orange" | "teal" | "yellow";
};

export type TimelineItem = {
  date: string;
  title: string;
  body?: string;
  done: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  raisedCents: number;
  goalCents: number;
  bookings: number;
  daysLeft: number | null;
  views: number;
  viewsDelta: string;
  prestations: ProjectPrestation[];
  timeline: TimelineItem[];
};

export async function getProjects(_clubId: string): Promise<Project[]> {
  return [
    {
      id: "p1",
      title: "Tournoi national Espagne U17",
      description:
        "Emmenez nos U17 défendre les couleurs du club au tournoi international d'Alicante, du 12 au 16 juillet.",
      status: "live",
      raisedCents: 248000,
      goalCents: 400000,
      bookings: 14,
      daysLeft: 12,
      views: 1248,
      viewsDelta: "+22%",
      prestations: [
        { id: "pp1", title: "Barbecue convivial", priceCents: 28000, bookings: 8, totalCents: 224000, hue: "green" },
        { id: "pp2", title: "Olympiades entreprise", priceCents: 72000, bookings: 1, totalCents: 72000, hue: "orange" },
        { id: "pp3", title: "Buvette événement", priceCents: 35000, bookings: 2, totalCents: 70000, hue: "teal" },
        { id: "pp4", title: "Initiation volley", priceCents: 15000, bookings: 3, totalCents: 45000, hue: "yellow" },
      ],
      timeline: [
        { date: "22 mai · 14h", title: "€420 collectés cette semaine", body: "Merci à tous nos soutiens — il nous reste 12 jours pour atteindre l'objectif.", done: true },
        { date: "14 mai", title: "Choix de l'hébergement à Alicante", body: "Réservation confirmée — auberge centre-ville, à 800m de la salle.", done: true },
        { date: "02 mai", title: "Projet ouvert au financement", body: "4 prestations liées — objectif €4 000 sur 30 jours.", done: false },
      ],
    },
    {
      id: "p2",
      title: "Maillots de saison 2026",
      description: "Renouvellement complet des tenues pour toutes les équipes du club.",
      status: "live",
      raisedCents: 105000,
      goalCents: 150000,
      bookings: 7,
      daysLeft: 38,
      views: 632,
      viewsDelta: "+8%",
      prestations: [
        { id: "pp5", title: "Stage fitness week-end", priceCents: 22000, bookings: 5, totalCents: 110000, hue: "teal" },
      ],
      timeline: [
        { date: "18 mai", title: "Devis fournisseur validé", body: "Commande confirmée dès 100% atteint.", done: true },
        { date: "10 mai", title: "Projet lancé", done: false },
      ],
    },
    {
      id: "p3",
      title: "Rénovation vestiaires",
      description: "Mise aux normes et modernisation des vestiaires hommes et femmes.",
      status: "live",
      raisedCents: 320000,
      goalCents: 1000000,
      bookings: 21,
      daysLeft: 74,
      views: 2104,
      viewsDelta: "+5%",
      prestations: [
        { id: "pp6", title: "Journée cohésion entreprise", priceCents: 85000, bookings: 2, totalCents: 170000, hue: "orange" },
        { id: "pp7", title: "Barbecue convivial", priceCents: 28000, bookings: 6, totalCents: 168000, hue: "green" },
      ],
      timeline: [
        { date: "05 mai", title: "Permis de travaux déposé", body: "Réponse attendue sous 30 jours.", done: true },
        { date: "01 mai", title: "Projet ouvert au financement", done: false },
      ],
    },
    {
      id: "p4",
      title: "Stage été · U13",
      description: "Stage de perfectionnement technique pour les U13 — 3 jours à la montagne.",
      status: "upcoming",
      raisedCents: 12000,
      goalCents: 220000,
      bookings: 1,
      daysLeft: null,
      views: 88,
      viewsDelta: "",
      prestations: [],
      timeline: [
        { date: "En préparation", title: "Projet en cours de configuration", done: false },
      ],
    },
    {
      id: "p5",
      title: "Mini-bus du club",
      description: "Acquisition d'un minibus 9 places pour les déplacements.",
      status: "funded",
      raisedCents: 850000,
      goalCents: 850000,
      bookings: 62,
      daysLeft: 0,
      views: 5840,
      viewsDelta: "",
      prestations: [
        { id: "pp8", title: "Barbecue convivial", priceCents: 28000, bookings: 30, totalCents: 840000, hue: "green" },
      ],
      timeline: [
        { date: "12 avr.", title: "Objectif atteint 🎉", body: "Le bus a été commandé. Livraison prévue fin juin.", done: true },
        { date: "01 mars", title: "Projet lancé", done: true },
      ],
    },
    {
      id: "p6",
      title: "Tournoi national U13",
      description: "Brouillon — informations à compléter.",
      status: "draft",
      raisedCents: 0,
      goalCents: 0,
      bookings: 0,
      daysLeft: null,
      views: 0,
      viewsDelta: "",
      prestations: [],
      timeline: [],
    },
  ];
>>>>>>> e82c7c61783bbc408216ebbc5e45947e667bc44b
}
