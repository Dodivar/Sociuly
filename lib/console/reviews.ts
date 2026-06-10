// Cf. SPEC.md §4 — Review · §5 — règles "Reviews".
// Avis servis par Prisma (Review du club + booking/experience/organization).
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

