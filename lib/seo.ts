// ─────────────────────────────────────────────────────────────────────────────
// Entity types
// ─────────────────────────────────────────────────────────────────────────────

export type Club = {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  city: string;
  department: string;
  sport: string;
  category: string;
  email: string;
  phone?: string;
  image: string;
  logoInitials: string;
  foundedYear: number;
  rating: number;
  reviewCount: number;
  memberCount: number;
  prestationCount: number;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

export type Prestation = {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  category: string;
  city: string;
  department: string;
  image: string;
  rating: number;
  reviewCount: number;
  clubSlug: string;
  clubName: string;
  duration: string;
  capacity: string;
  nextDate?: string; // ISO 8601 — première disponibilité
  included: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock data store — remplacer par des requêtes DB réelles en Phase B
// ─────────────────────────────────────────────────────────────────────────────

const CLUBS: Club[] = [
  {
    slug: "usb-volley",
    name: "USB Volley",
    description:
      "USB Volley est une association sportive strasbourgeoise fondée en 1998. Nous proposons des activités de volley-ball pour tous les niveaux, de l'initiation aux compétitions régionales. Nos bénévoles investis organisent également des prestations événementielles pour financer nos projets de saison.",
    shortDescription:
      "Club de volley-ball de Strasbourg proposant des prestations événementielles pour financer ses projets sportifs.",
    city: "Strasbourg",
    department: "67",
    sport: "Volley-ball",
    category: "Sport collectif",
    email: "contact@usb-volley.fr",
    phone: "+33 3 88 12 34 56",
    image: "https://sociuly.com/og/clubs/usb-volley.jpg",
    logoInitials: "UV",
    foundedYear: 1998,
    rating: 4.9,
    reviewCount: 47,
    memberCount: 120,
    prestationCount: 42,
    address: "12 rue du Stade",
    postalCode: "67000",
    latitude: 48.5734,
    longitude: 7.7521,
  },
  {
    slug: "ac-montrouge-football",
    name: "AC Montrouge Football",
    description:
      "Club de football amateur de Montrouge, l'AC Montrouge Football rassemble plus de 200 licenciés. Nos équipes participent aux championnats régionaux Île-de-France. Pour financer nos infrastructures, nous proposons des prestations d'animation sportive.",
    shortDescription:
      "Club de football de Montrouge avec 200 licenciés, proposant des animations sportives et team-building événementiels.",
    city: "Montrouge",
    department: "92",
    sport: "Football",
    category: "Sport collectif",
    email: "contact@acmontrouge.fr",
    phone: "+33 1 46 55 12 34",
    image: "https://sociuly.com/og/clubs/ac-montrouge.jpg",
    logoInitials: "AM",
    foundedYear: 2003,
    rating: 4.7,
    reviewCount: 31,
    memberCount: 210,
    prestationCount: 28,
    address: "5 avenue de la République",
    postalCode: "92120",
    latitude: 48.8176,
    longitude: 2.3209,
  },
];

const PRESTATIONS: Prestation[] = [
  {
    slug: "barbecue-convivial-usb-volley",
    title: "Barbecue convivial du club",
    description:
      "Notre équipe de bénévoles vient cuisiner chez vous : grillades préparées sur place, salades de saison, ambiance conviviale assurée. Idéal pour les anniversaires, les événements d'entreprise ou les fêtes de quartier. Tout le matériel est fourni, les bénévoles s'occupent du service du début à la fin.",
    shortDescription:
      "BBQ clé en main avec bénévoles USB Volley : grillades, salades et service complet pour 10 à 60 personnes à Strasbourg.",
    price: 280,
    category: "BBQ & buvettes",
    city: "Strasbourg",
    department: "67",
    image: "https://sociuly.com/og/prestations/barbecue-usb-volley.jpg",
    rating: 4.9,
    reviewCount: 47,
    clubSlug: "usb-volley",
    clubName: "USB Volley",
    duration: "3 heures",
    capacity: "10–60 personnes",
    nextDate: "2026-06-14T16:00:00+02:00",
    included: [
      "Matériel de cuisson",
      "Tables et nappes",
      "6 bénévoles",
      "Service de A à Z",
      "Vaisselle compostable",
    ],
  },
  {
    slug: "olympiades-entreprise-ac-montrouge",
    title: "Olympiades d'entreprise",
    description:
      "Journée team-building sportive animée par nos éducateurs. Ateliers multi-sports, compétitions amicales et remise de trophées. Une expérience conviviale qui renforce la cohésion d'équipe tout en finançant notre saison sportive.",
    shortDescription:
      "Journée olympiades d'entreprise par AC Montrouge : ateliers multi-sports, team-building et trophées pour 20 à 100 participants.",
    price: 650,
    category: "Olympiades entreprise",
    city: "Montrouge",
    department: "92",
    image: "https://sociuly.com/og/prestations/olympiades-ac-montrouge.jpg",
    rating: 4.7,
    reviewCount: 18,
    clubSlug: "ac-montrouge-football",
    clubName: "AC Montrouge Football",
    duration: "1 journée",
    capacity: "20–100 personnes",
    nextDate: "2026-07-05T09:00:00+02:00",
    included: [
      "Éducateurs sportifs",
      "Matériel sportif",
      "Arbitrage",
      "Trophées",
      "Photos souvenirs",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Accesseurs de données — remplacer par DB / ORM en Phase B
// ─────────────────────────────────────────────────────────────────────────────

export async function getClubBySlug(slug: string): Promise<Club | null> {
  return CLUBS.find((c) => c.slug === slug) ?? null;
}

export async function getPrestationBySlug(
  slug: string
): Promise<Prestation | null> {
  return PRESTATIONS.find((p) => p.slug === slug) ?? null;
}

export async function getAllClubSlugs(): Promise<string[]> {
  return CLUBS.map((c) => c.slug);
}

export async function getAllPrestationSlugs(): Promise<string[]> {
  return PRESTATIONS.map((p) => p.slug);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers partagés
// ─────────────────────────────────────────────────────────────────────────────

/** URL de base — définir NEXT_PUBLIC_BASE_URL en production. */
export const BASE_URL =
  (process.env.NEXT_PUBLIC_BASE_URL ?? "https://sociuly.com").replace(/\/$/, "");

/** Tronque à maxLen caractères en ajoutant "…" si nécessaire. */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}
