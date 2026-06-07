// Détail d'une expérience publiée — source de vérité front v1 pour la page
// /experiences/[slug]. Cf. SPEC.md §3 (Experience / ExperienceSegment) et §6
// (page détail + CTA « Demander un devis »).
//
// TODO(api): remplacer getExperienceBySlug par un fetch Prisma
// (Experience.status='published' + jointure Club + Project + Review). Garder la
// signature async et les enums alignés sur le schéma. Tous les montants sont en
// centimes (Int), jamais de float (SPEC §3).

import type { ExperienceHue } from "@/components/ds/patterns";
import { prisma } from "@/lib/prisma";
import { categoryFromModuleType, CATEGORY_LABEL, HUE_BY_CATEGORY } from "./experiences";
import { cityFromName } from "./geo";

// ─────── Modèle de prix (SPEC §3 — Experience.priceModel) ───────
export type PriceModel = "per_person" | "fixed";

// ─────── Lieu d'exécution (SPEC §3 — Experience/ExperienceModule.location) ───────
// `at_client` = chez l'entreprise (adresse à renseigner), `at_club` / `at_venue`
// = dans les installations du club, `flexible` = au choix de l'acheteur.
export type ExperienceLocation = "at_client" | "at_club" | "at_venue" | "flexible";

// ─────── Une photo de la galerie (mock : dégradé + calque SVG) ───────
export type GalleryPhoto = {
  id: string;
  /** Légende affichée dans le viewer (alt). */
  label: string;
  /** Dégradé CSS de fond (mock du futur Supabase Storage). */
  gradient: string;
  /** Calque décoratif optionnel (réservé à la photo principale). */
  feature?: boolean;
};

// ─────── Un créneau disponible (mock du JSON de disponibilités, SPEC §2) ───────
export type ExperienceSlot = {
  /** Date ISO yyyy-mm-dd. */
  date: string;
  /** Heure de début HH:mm. */
  time: string;
};

// ─────── Un avis (SPEC §3 — Review) ───────
export type ExperienceReview = {
  id: string;
  author: string;
  date: string;
  rating: number;
  body: string;
  tone: "green" | "orange" | "yellow" | "ink";
};

export type ExperienceClub = {
  slug: string;
  name: string;
  initials: string;
  /** Libellé public du type de club (SPEC §3 — Club.clubType). */
  typeLabel: string;
  experienceCount: number;
  responseTime: string;
  tone: "green" | "orange" | "yellow" | "ink";
};

export type ExperienceProject = {
  /** Slug du club hôte (le projet vit sur la fiche club en v1). */
  clubSlug: string;
  title: string;
  raisedCents: number;
  targetCents: number;
  /** Avancement 0..1 (collected / target). */
  goal: number;
};

export type ExperienceDetail = {
  /** Id catalogue (MarketplaceExperience.id) — clé des favoris localStorage. */
  id: string;
  slug: string;
  title: string;
  categoryLabel: string;
  cityLabel: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  hue: ExperienceHue;
  /** Format commercial (SPEC §3 — Experience.format). */
  format: string;
  /** Lieu d'exécution (SPEC §3) — pilote la collecte d'adresse dans le tunnel. */
  location: ExperienceLocation;
  /** Libellé public du lieu côté club (« Rhénus Sport · Strasbourg »). */
  venueLabel: string;
  capacityMin: number;
  capacityMax: number;
  priceModel: PriceModel;
  /** Prix au participant (per_person) en centimes. */
  pricePerPersonCents: number;
  /** Prix forfaitaire (fixed) en centimes. */
  basePriceCents: number;
  /** « À partir de » TTC en centimes (prix d'appel affiché). */
  fromPriceCents: number;
  facts: Array<[string, string, "users" | "calendar" | "pin" | "check"]>;
  description: string[];
  included: string[];
  photos: GalleryPhoto[];
  slots: ExperienceSlot[];
  club: ExperienceClub;
  project: ExperienceProject;
  reviews: ExperienceReview[];
};

// ─────── Helpers ───────
export const eur = (cents: number) =>
  `${(cents / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;

/** Centimes → euros lisibles avec décimales (factures / récap). */
export const eurDecimal = (cents: number) =>
  `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const HUE_GRADIENTS: Record<ExperienceHue, string[]> = {
  green:  ["linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)", "linear-gradient(135deg, #1f5b58 0%, #14332b 100%)"],
  orange: ["linear-gradient(165deg, #c0451f 0%, #7d2c12 100%)", "linear-gradient(135deg, #e8623d 0%, #c0451f 100%)"],
  yellow: ["linear-gradient(165deg, #b8861a 0%, #6e5111 100%)", "linear-gradient(135deg, #f1c14a 0%, #b8861a 100%)"],
  sand:   ["linear-gradient(165deg, #8a6b3e 0%, #5a4525 100%)", "linear-gradient(135deg, #b2935f 0%, #8a6b3e 100%)"],
  teal:   ["linear-gradient(165deg, #1f5b58 0%, #14332b 100%)", "linear-gradient(135deg, #2a7a76 0%, #1f5b58 100%)"],
  rust:   ["linear-gradient(165deg, #8c4a25 0%, #5a2f17 100%)", "linear-gradient(135deg, #b9622f 0%, #8c4a25 100%)"],
};

const ACCENT_GRADIENTS = [
  "linear-gradient(135deg, #e8623d 0%, #c0451f 100%)",
  "linear-gradient(135deg, #f1c14a 0%, #b8861a 100%)",
  "linear-gradient(135deg, #1f5b58 0%, #14332b 100%)",
  "linear-gradient(135deg, #8a6b3e 0%, #5a4525 100%)",
];

/** Construit 6 photos mock cohérentes avec la teinte de l'expérience. */
function buildGallery(title: string, hue: ExperienceHue): GalleryPhoto[] {
  const [hero] = HUE_GRADIENTS[hue];
  const photos: GalleryPhoto[] = [
    { id: "p0", label: `Photo principale · ${title}`, gradient: hero, feature: true },
  ];
  ACCENT_GRADIENTS.forEach((g, i) =>
    photos.push({ id: `p${i + 1}`, label: `${title} · vue ${i + 2}`, gradient: g }),
  );
  photos.push({ id: "p5", label: `${title} · ambiance`, gradient: HUE_GRADIENTS[hue][1] });
  return photos;
}

/** Génère quelques créneaux à venir à partir de la 1re disponibilité catalogue. */
function buildSlots(availableFrom: string): ExperienceSlot[] {
  const base = new Date(`${availableFrom}T00:00:00`);
  const times = ["09:00", "14:00", "16:00"];
  const slots: ExperienceSlot[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i * 7);
    slots.push({ date: d.toISOString().slice(0, 10), time: times[i % times.length] });
  }
  return slots;
}

const REVIEW_POOL: ExperienceReview[] = [
  { id: "r1", author: "Élodie M. · DRH", date: "avril 2026", rating: 5, tone: "orange",
    body: "Séminaire de cohésion impeccable pour nos 32 collaborateurs. Le club a tout organisé, et notre budget a directement soutenu leur école de jeunes." },
  { id: "r2", author: "Hugo M. · CEO", date: "mars 2026", rating: 5, tone: "green",
    body: "Une journée mémorable pour nos 38 collaborateurs. Organisation millimétrée par le club, et notre budget a soutenu leur école de jeunes." },
  { id: "r3", author: "Sarah B. · Office Manager", date: "mars 2026", rating: 5, tone: "yellow",
    body: "Coordination parfaite du premier contact au jour J. L'équipe encadrante était au top, nos managers en parlent encore." },
  { id: "r4", author: "Karim T. · COO", date: "février 2026", rating: 4, tone: "ink",
    body: "Très belle expérience, logistique sans faille. Un léger retard au démarrage mais vite rattrapé. On recommande." },
  { id: "r5", author: "Léa V. · Responsable RH", date: "février 2026", rating: 5, tone: "green",
    body: "Format premium qui change des séminaires classiques. Les coachs étaient pédagogues et bienveillants avec tout le monde." },
  { id: "r6", author: "Thomas R. · Directeur", date: "janvier 2026", rating: 5, tone: "orange",
    body: "Nos équipes ont adoré l'immersion dans les coulisses du club. Un vrai moment fédérateur, et utile pour le club." },
  { id: "r7", author: "Nadia S. · Talent Manager", date: "janvier 2026", rating: 4, tone: "yellow",
    body: "Belle expérience, bon rapport qualité-prix au vu de l'encadrement. Devis clair et sans surprise." },
  { id: "r8", author: "Antoine D. · CFO", date: "décembre 2025", rating: 5, tone: "ink",
    body: "Tout était fluide, de la demande de devis au paiement. Savoir que ça finance un projet local a beaucoup plu en interne." },
];

// Lieu d'exécution dérivé de la catégorie (SPEC §3). Les expériences de cohésion
// se déroulent typiquement chez l'entreprise (adresse à renseigner) ; les matchs
// VIP / coulisses / masterclass au stade ; les initiations / tournois au club.
const LOCATION_BY_CATEGORY: Record<string, ExperienceLocation> = {
  match_vip: "at_venue",
  coulisses: "at_venue",
  masterclass: "at_venue",
  tournoi: "at_club",
  initiation: "at_club",
  cohesion: "at_client",
};

const CITY_NICE: Record<string, string> = {
  strasbourg: "Strasbourg (67)",
  nancy: "Nancy (54)",
  metz: "Metz (57)",
};

const FORMAT_LABEL: Record<string, string> = {
  demi_journee: "Demi-journée",
  journee: "Journée",
  soiree: "Soirée",
  sur_mesure: "Sur mesure",
};

const CLUB_TYPE_LABEL: Record<string, string> = {
  association_1901: "association",
  club_pro: "club pro",
  sasp: "club pro",
  autre: "club partenaire",
};

// Forme du JSON Experience.availability (SPEC §2 — règles récurrentes indicatives).
type AvailabilityShape = {
  weekdays?: number[];
  timeSlots?: string[];
  leadTimeDays?: number;
  blackoutDates?: string[];
};

/**
 * Expanse les règles de disponibilité récurrentes (JSON) en ~6 créneaux à venir.
 * Repli sur `buildSlots(createdAt)` si l'expérience n'a pas encore de règles.
 */
function slotsFromAvailability(raw: unknown, createdAt: Date): ExperienceSlot[] {
  const av = (raw ?? null) as AvailabilityShape | null;
  if (!av || !av.weekdays?.length) return buildSlots(createdAt.toISOString().slice(0, 10));
  const times = av.timeSlots?.length ? av.timeSlots : ["09:00"];
  const blackout = new Set(av.blackoutDates ?? []);
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + (av.leadTimeDays ?? 7));
  const slots: ExperienceSlot[] = [];
  for (let guard = 0; guard < 180 && slots.length < 6; guard++) {
    const iso = cursor.toISOString().slice(0, 10);
    if (av.weekdays.includes(cursor.getDay()) && !blackout.has(iso)) {
      slots.push({ date: iso, time: times[slots.length % times.length] });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots.length ? slots : buildSlots(createdAt.toISOString().slice(0, 10));
}

/** Récupère le détail d'une expérience publiée par slug (ou null si introuvable). */
export async function getExperienceBySlug(slug: string): Promise<ExperienceDetail | null> {
  const exp = await prisma.experience.findUnique({
    where: { slug },
    include: {
      club: true,
      project: true,
      segments: { orderBy: { order: "asc" }, include: { module: true } },
      photos: { orderBy: { order: "asc" } },
    },
  });
  if (!exp || exp.status !== "published") return null;

  const category = categoryFromModuleType(exp.segments[0]?.module?.type ?? null);
  const hue = HUE_BY_CATEGORY[category];
  const city = cityFromName(exp.club.city);
  const formatLabel = FORMAT_LABEL[exp.format] ?? "Sur mesure";
  const location =
    (exp.segments[0]?.module?.location as ExperienceLocation | undefined) ??
    LOCATION_BY_CATEGORY[category] ??
    "flexible";
  const venueLabel = `${exp.club.name} · ${CITY_NICE[city] ?? exp.club.city}`;
  const toneByHue: ExperienceClub["tone"] =
    hue === "green" || hue === "teal" ? "green" : hue === "yellow" ? "yellow" : "orange";

  const priceModel = exp.priceModel as PriceModel;
  const pricePerPersonCents = priceModel === "per_person" ? exp.basePriceCents : 0;
  const fromPriceCents =
    priceModel === "per_person" ? exp.basePriceCents * exp.capacityMin : exp.basePriceCents;

  // Avis réels (Review liés aux Booking de cette expérience). Repli démo si aucun.
  const dbReviews = await prisma.review.findMany({
    where: { booking: { experienceId: exp.id } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { organization: { select: { name: true } } },
  });
  const tones = ["orange", "green", "yellow", "ink"] as const;
  const reviews: ExperienceReview[] = dbReviews.length
    ? dbReviews.map((r, i) => ({
        id: r.id,
        author: r.organization.name,
        date: r.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
        rating: r.rating,
        body: r.comment ?? "",
        tone: tones[i % tones.length],
      }))
    : REVIEW_POOL.slice(0, 4);

  const experienceCount = await prisma.experience.count({
    where: { clubId: exp.clubId, status: "published" },
  });

  return {
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    categoryLabel: CATEGORY_LABEL[category],
    cityLabel: CITY_NICE[city] ?? exp.club.city,
    rating: exp.ratingAvg ?? 0,
    reviewCount: exp.reviewsCount,
    verified: exp.club.status === "active",
    hue,
    format: formatLabel,
    location,
    venueLabel,
    capacityMin: exp.capacityMin,
    capacityMax: exp.capacityMax,
    priceModel,
    pricePerPersonCents,
    basePriceCents: exp.basePriceCents,
    fromPriceCents,
    facts: [
      ["Capacité", `${exp.capacityMin}–${exp.capacityMax} pers.`, "users"],
      ["Format", formatLabel === "Journée" ? "Journée (≈ 6h)" : formatLabel, "calendar"],
      ["Lieu", venueLabel, "pin"],
      ["Inclus", "Encadrement diplômé", "check"],
    ],
    description: exp.description
      ? [exp.description]
      : [
          `Une expérience premium conçue et animée par ${exp.club.name}. Vos équipes sont accueillies et encadrées par le staff du club, dans un cadre sportif unique — un format clé en main, du premier échange au jour J.`,
          "Tout est organisé par le club, de l'encadrement diplômé à la logistique. Et chaque expérience finance directement un projet de saison du club.",
        ],
    included: [
      "Encadrement par le staff du club", "Animation et matériel sur place",
      "Coordination logistique complète", "Adaptation à vos contraintes",
      "Photos & vidéo de l'événement", "Devis ferme sous 48h",
    ],
    // TODO(galerie): mapper exp.photos (Supabase Storage) quand des images sont
    // uploadées ; en attendant, dégradés cohérents avec la teinte.
    photos: buildGallery(exp.title, hue),
    slots: slotsFromAvailability(exp.availability, exp.createdAt),
    club: {
      slug: exp.club.slug,
      name: exp.club.name,
      initials: exp.club.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase(),
      typeLabel: CLUB_TYPE_LABEL[exp.club.clubType] ?? "club partenaire",
      experienceCount,
      // TODO(schéma): temps de réponse club non modélisé — valeur par défaut.
      responseTime: "répond en 24h",
      tone: toneByHue,
    },
    project: exp.project
      ? {
          clubSlug: exp.club.slug,
          title: exp.project.title,
          raisedCents: exp.project.collectedAmount,
          targetCents: exp.project.targetAmount,
          goal:
            exp.project.targetAmount > 0
              ? exp.project.collectedAmount / exp.project.targetAmount
              : 0,
        }
      : { clubSlug: exp.club.slug, title: "", raisedCents: 0, targetCents: 0, goal: 0 },
    reviews,
  };
}

/** Tous les slugs publiés (generateStaticParams). */
export async function getAllExperienceSlugs(): Promise<string[]> {
  const rows = await prisma.experience.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
