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
}
