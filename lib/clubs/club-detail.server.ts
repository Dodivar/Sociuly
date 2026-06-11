// Accès Prisma à la fiche club publique (/clubs/[slug]) — module SERVEUR.
//
// Séparé de `club-detail.ts` (pur : types + helpers) pour qu'un Client Component
// (ClubTabs, ClubActions) puisse importer un type sans embarquer le driver `pg`.
// Tous les montants sont en centimes (Int), jamais de float (SPEC §3).
//
// Ré-exporte les types/helpers purs pour un point d'import unique côté serveur.

import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import {
  CATEGORY_LABEL,
  categoryFromModuleType,
  HUE_BY_CATEGORY,
} from "@/lib/marketplace/experiences";
import { eur } from "@/lib/marketplace/experience-detail";
import type {
  ClubDetail,
  ClubExperienceCard,
  ClubProjectCard,
  ClubReviewCard,
  ClubTeamMember,
} from "./club-detail";
import { initialsFrom } from "./club-detail";

export * from "./club-detail";

const CLUB_TYPE_LABEL: Record<string, string> = {
  association_1901: "Association",
  club_pro: "Club pro",
  sasp: "Club pro",
  autre: "Club partenaire",
};

const MEMBER_ROLE_LABEL: Record<string, string> = {
  president: "Président·e",
  manager: "Responsable expériences entreprises",
  treasurer: "Trésorier·ère",
  member: "Membre",
};

// Priorité du membre servant de contact « Contacter » : le manager gère les
// demandes de devis (SPEC §4), à défaut le président.
const CONTACT_ROLE_PRIORITY: Record<string, number> = {
  manager: 0,
  president: 1,
  treasurer: 2,
  member: 3,
};

const REVIEW_TONES = ["orange", "green", "yellow", "ink"] as const;

/** Description générée à partir des attributs réels (le modèle Club n'en stocke pas). */
function buildDescription(name: string, typeLabel: string, city: string, hasVenue: boolean): string {
  const venueClause = hasVenue
    ? " Le club ouvre ses installations et son staff aux entreprises : séminaires de cohésion, initiations encadrées et moments premium."
    : " Le club met son encadrement diplômé au service d'expériences premium pour les entreprises.";
  return `${typeLabel} basé·e à ${city}, ${name} conçoit et anime des expériences sur mesure pour les équipes.${venueClause} Chaque expérience finance directement un projet de saison du club.`;
}

/** Récupère la fiche club publique par slug (ou null si introuvable). */
export async function getClubBySlug(slug: string): Promise<ClubDetail | null> {
  // Build sans base (CI/preview) : aucune fiche → la page rend notFound().
  if (!isDatabaseConfigured) return null;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      members: { include: { user: { select: { fullName: true, email: true } } } },
      projects: true,
      experiences: {
        where: { status: "published" },
        include: {
          project: true,
          segments: { orderBy: { order: "asc" }, take: 1, include: { module: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        include: { organization: { select: { name: true } } },
      },
    },
  });
  if (!club) return null;

  const typeLabel = CLUB_TYPE_LABEL[club.clubType] ?? "Club partenaire";
  const cityLabel = `${club.city} (${club.postalCode})`;

  // Note moyenne / nombre d'avis réels.
  const reviewCount = club.reviews.length;
  const rating =
    reviewCount > 0
      ? club.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // Email de contact : manager en priorité, sinon président (SPEC §4).
  const contactMember = [...club.members].sort(
    (a, b) => (CONTACT_ROLE_PRIORITY[a.role] ?? 9) - (CONTACT_ROLE_PRIORITY[b.role] ?? 9),
  )[0];
  const contactEmail = contactMember?.user.email ?? null;

  // Expériences publiées → cartes (catégorie/teinte dérivées du 1er module).
  const experiences: ClubExperienceCard[] = club.experiences.map((exp) => {
    const category = categoryFromModuleType(exp.segments[0]?.module?.type ?? null);
    const goal =
      exp.project && exp.project.targetAmount > 0
        ? exp.project.collectedAmount / exp.project.targetAmount
        : 0;
    return {
      slug: exp.slug,
      title: exp.title,
      price: Math.round(exp.basePriceCents / 100),
      hue: HUE_BY_CATEGORY[category],
      categoryLabel: `${CATEGORY_LABEL[category]} · ${exp.capacityMin}–${exp.capacityMax} pers.`,
      rating: exp.ratingAvg ?? 0,
      reviews: exp.reviewsCount,
      funds: exp.project?.title ?? "Projet du club",
      goal,
    };
  });

  // Projets → cartes (tri : actifs d'abord, puis par montant collecté).
  const sortedProjects = [...club.projects].sort((a, b) => {
    const aActive = a.status === "active" ? 0 : 1;
    const bActive = b.status === "active" ? 0 : 1;
    return aActive - bActive || b.collectedAmount - a.collectedAmount;
  });
  const projects: ClubProjectCard[] = sortedProjects.map((p) => ({
    title: p.title,
    eyebrow: "Projet de saison",
    raisedCents: p.collectedAmount,
    targetCents: p.targetAmount,
    goal: p.targetAmount > 0 ? p.collectedAmount / p.targetAmount : 0,
    active: p.status === "active",
    funded: p.status === "funded" || p.collectedAmount >= p.targetAmount,
  }));

  // Projet phare : le 1er du tri (actif au montant le plus élevé).
  const featured = sortedProjects[0]
    ? {
        title: sortedProjects[0].title,
        raisedCents: sortedProjects[0].collectedAmount,
        targetCents: sortedProjects[0].targetAmount,
        goal:
          sortedProjects[0].targetAmount > 0
            ? sortedProjects[0].collectedAmount / sortedProjects[0].targetAmount
            : 0,
      }
    : null;

  // Avis → cartes (cycle de teintes).
  const reviews: ClubReviewCard[] = club.reviews.slice(0, 8).map((r, i) => ({
    id: r.id,
    name: r.organization.name,
    date: r.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    rating: r.rating,
    body: r.comment ?? "",
    tone: REVIEW_TONES[i % REVIEW_TONES.length],
  }));

  // Équipe → membres (président d'abord, puis manager…).
  const team: ClubTeamMember[] = [...club.members]
    .sort((a, b) => (CONTACT_ROLE_PRIORITY[a.role] ?? 9) - (CONTACT_ROLE_PRIORITY[b.role] ?? 9))
    .map((m) => ({
      name: m.user.fullName ?? "Membre du club",
      role: MEMBER_ROLE_LABEL[m.role] ?? "Membre",
      since: String(m.createdAt.getFullYear()),
      initials: initialsFrom(m.user.fullName ?? "Membre"),
    }));

  // Statistiques d'en-tête (réelles).
  const totalCollected = club.projects.reduce((sum, p) => sum + p.collectedAmount, 0);
  const stats = [
    { value: String(experiences.length), label: "expériences", sub: "au catalogue" },
    {
      value: eur(totalCollected),
      label: "collectés",
      sub: `pour ${club.projects.length} projet${club.projects.length > 1 ? "s" : ""}`,
    },
    {
      value: reviewCount > 0 ? `${rating.toFixed(1)} / 5` : "—",
      label: "satisfaction",
      sub: `${reviewCount} avis`,
    },
  ];

  const descriptorParts = [typeLabel];
  if (club.hasVenue && club.venueCapacity) {
    descriptorParts.push(`salle ${club.venueCapacity.toLocaleString("fr-FR")} places`);
  }
  if (club.canHostVipMatch) descriptorParts.push("matchs VIP");

  return {
    slug: club.slug,
    name: club.name,
    initials: initialsFrom(club.name),
    typeLabel,
    descriptor: descriptorParts.join(" · "),
    cityLabel,
    rating,
    reviewCount,
    verified: club.status === "active",
    description: buildDescription(club.name, typeLabel, club.city, club.hasVenue),
    contactEmail,
    stats,
    featuredProject: featured,
    experiences,
    projects,
    reviews,
    team,
    counts: {
      experiences: experiences.length,
      projects: club.projects.length,
      reviews: reviewCount,
    },
  };
}

/** Tous les slugs de clubs (generateStaticParams). */
export async function getAllClubSlugs(): Promise<string[]> {
  if (!isDatabaseConfigured) return [];
  const rows = await prisma.club.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}
