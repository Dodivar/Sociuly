// Cf. SPEC.md §4 — Review · §5 — règles "Reviews".
// TODO(api): remplacer par un fetch DB (Prisma) scopé sur le club du club_admin.
// Garder la signature async et l'enum aligné sur le schéma.
//
// Rappel des règles métier (SPEC §5), à ne pas enfreindre côté console club :
//   - L'avis est rédigé par l'ORGANISATION acheteuse (jamais un particulier, cf. §2),
//     uniquement entre `completedAt` et J+30. Note 1–5 obligatoire, commentaire
//     optionnel (≤ 600 caractères).
//   - PAS de réponse publique du club en v1 (prévu v2, cf. §2). On n'expose donc
//     aucune action "répondre" ici.
//   - Modération a posteriori par l'admin Sociuly. Le club peut seulement
//     SIGNALER un avis problématique → il passe en attente de modération admin.
//
// Modèle B2B : l'auteur d'un avis est toujours une `Organization`. Libellés de
// dates pré-formatés (FR) côté donnée car la vue est "use client".

// Statut d'un avis tel que vu par le club.
//   published = visible publiquement.
//   reported  = signalé par le club, en attente de modération admin Sociuly.
export type ReviewStatus = "published" | "reported";

// Motif de signalement transmis à l'admin Sociuly.
export type ReportReason =
  | "offensive" // propos injurieux, haineux ou discriminatoires
  | "false" // avis mensonger / factuellement inexact
  | "off_topic" // hors-sujet, ne concerne pas l'expérience
  | "personal_data" // données personnelles / diffamation
  | "spam" // spam, concurrence déloyale
  | "other"; // autre (préciser)

export type Review = {
  id: string;
  bookingNumber: string; // SOC-YYYY-NNNNN (1 avis max par booking, cf. §4)
  organizationName: string; // organisation acheteuse (auteur de l'avis)
  organizationInitials: string;
  experienceTitle: string;
  rating: number; // 1..5 (obligatoire)
  comment?: string; // ≤ 600 caractères, optionnel
  publishedAtLabel: string; // date pré-formatée FR
  publishedAtISO: string; // tri / fenêtre J+30 côté serveur
  status: ReviewStatus;
  isNew: boolean; // non encore consulté par le club (alimente le badge nav)
  reportReason?: ReportReason; // renseigné si status = reported
};

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export type ReviewKpis = {
  averageRating: number; // note moyenne (1 décimale)
  totalCount: number;
  newCount: number; // avis non encore consultés
  reportedCount: number; // avis en cours de modération
  distribution: RatingDistribution; // nombre d'avis par note
};

export type ReviewsData = {
  kpis: ReviewKpis;
  reviews: Review[];
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  offensive: "Propos injurieux ou haineux",
  false: "Avis mensonger ou inexact",
  off_topic: "Hors-sujet / sans rapport avec l'expérience",
  personal_data: "Données personnelles ou diffamation",
  spam: "Spam ou concurrence déloyale",
  other: "Autre motif",
};

// Avis reçus (mock). Le club mock = SIG Strasbourg → expériences cohérentes.
const REVIEWS: Review[] = [
  {
    id: "r1",
    bookingNumber: "SOC-2026-00037",
    organizationName: "Klaxoon SAS",
    organizationInitials: "KX",
    experienceTitle: "Journée immersion · SIG",
    rating: 5,
    comment:
      "Une journée exceptionnelle pour nos 40 collaborateurs. L'accueil de l'équipe SIG était " +
      "parfait, les ateliers parfaitement calibrés pour des débutants comme pour des sportifs. " +
      "On reviendra l'an prochain pour le séminaire annuel.",
    publishedAtLabel: "28 mai 2026",
    publishedAtISO: "2026-05-28",
    status: "published",
    isNew: true,
  },
  {
    id: "r2",
    bookingNumber: "SOC-2026-00031",
    organizationName: "Caisse d'Épargne Grand Est",
    organizationInitials: "CE",
    experienceTitle: "Atelier cohésion d'équipe",
    rating: 5,
    comment:
      "Format idéal pour ressouder une équipe après une période chargée. Encadrants au top, " +
      "logistique sans accroc. Le devis était clair et le solde simple à régler.",
    publishedAtLabel: "26 mai 2026",
    publishedAtISO: "2026-05-26",
    status: "published",
    isNew: true,
  },
  {
    id: "r3",
    bookingNumber: "SOC-2026-00026",
    organizationName: "Lohr Group",
    organizationInitials: "LG",
    experienceTitle: "Match VIP & hospitalités",
    rating: 4,
    comment:
      "Soirée mémorable en tribune VIP, hospitalités à la hauteur. Petit bémol sur le " +
      "stationnement à l'arrivée, mais l'expérience reste très recommandable.",
    publishedAtLabel: "19 mai 2026",
    publishedAtISO: "2026-05-19",
    status: "published",
    isNew: false,
  },
  {
    id: "r4",
    bookingNumber: "SOC-2026-00022",
    organizationName: "Crédit Mutuel Grand Est",
    organizationInitials: "CM",
    experienceTitle: "Masterclass joueur pro",
    rating: 5,
    comment:
      "Nos managers ont adoré l'échange avec le joueur pro. Contenu inspirant et très bien " +
      "transposable au management d'équipe. Merci au club !",
    publishedAtLabel: "12 mai 2026",
    publishedAtISO: "2026-05-12",
    status: "published",
    isNew: false,
  },
  {
    id: "r5",
    bookingNumber: "SOC-2026-00018",
    organizationName: "Decathlon Campus",
    organizationInitials: "DC",
    experienceTitle: "Initiation basket encadrée",
    rating: 4,
    publishedAtLabel: "5 mai 2026",
    publishedAtISO: "2026-05-05",
    status: "published",
    isNew: false,
  },
  {
    id: "r6",
    bookingNumber: "SOC-2026-00014",
    organizationName: "Électricité de Strasbourg",
    organizationInitials: "ÉS",
    experienceTitle: "Cocktail & visite des coulisses",
    rating: 5,
    comment:
      "Privatisation impeccable, traiteur excellent, ambiance unique. Un grand merci pour la " +
      "réactivité sur les derniers ajustements de dernière minute.",
    publishedAtLabel: "29 avr. 2026",
    publishedAtISO: "2026-04-29",
    status: "published",
    isNew: false,
  },
  {
    id: "r7",
    bookingNumber: "SOC-2026-00009",
    organizationName: "Compte anonyme",
    organizationInitials: "?",
    experienceTitle: "Atelier cohésion d'équipe",
    rating: 1,
    comment:
      "Service catastrophique, rien à voir avec ce qui était promis. À fuir absolument, ce club " +
      "ne mérite pas d'être référencé.",
    publishedAtLabel: "21 avr. 2026",
    publishedAtISO: "2026-04-21",
    status: "reported",
    isNew: false,
    reportReason: "false",
  },
  {
    id: "r8",
    bookingNumber: "SOC-2026-00005",
    organizationName: "Mutuelle Alsace",
    organizationInitials: "MA",
    experienceTitle: "Journée immersion · SIG",
    rating: 3,
    comment:
      "Bonne expérience dans l'ensemble mais le timing de la pause déjeuner était trop serré " +
      "pour notre groupe de 50 personnes.",
    publishedAtLabel: "15 avr. 2026",
    publishedAtISO: "2026-04-15",
    status: "published",
    isNew: false,
  },
];

function computeKpis(reviews: Review[]): ReviewKpis {
  const totalCount = reviews.length;
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  let newCount = 0;
  let reportedCount = 0;

  for (const r of reviews) {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
    ratingSum += r.rating;
    if (r.isNew) newCount += 1;
    if (r.status === "reported") reportedCount += 1;
  }

  // Moyenne arrondie à 1 décimale ; 0 si aucun avis (évite NaN).
  const averageRating = totalCount === 0 ? 0 : Math.round((ratingSum / totalCount) * 10) / 10;

  return { averageRating, totalCount, newCount, reportedCount, distribution };
}

export async function getReviewsData(_clubId: string): Promise<ReviewsData> {
  // TODO(api): SELECT scoping `clubId`, tri publishedAt desc, jointures Booking/Organization.
  return {
    kpis: computeKpis(REVIEWS),
    reviews: REVIEWS,
  };
}
