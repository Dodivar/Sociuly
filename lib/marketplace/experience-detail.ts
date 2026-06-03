// Détail d'une expérience publiée — source de vérité front v1 pour la page
// /experiences/[slug]. Cf. SPEC.md §3 (Experience / ExperienceSegment) et §6
// (page détail + CTA « Demander un devis »).
//
// TODO(api): remplacer getExperienceBySlug par un fetch Prisma
// (Experience.status='published' + jointure Club + Project + Review). Garder la
// signature async et les enums alignés sur le schéma. Tous les montants sont en
// centimes (Int), jamais de float (SPEC §3).

import type { ExperienceHue } from "@/components/ds/patterns";
import { getMarketplaceExperiences, type MarketplaceExperience } from "./experiences";

// ─────── Modèle de prix (SPEC §3 — Experience.priceModel) ───────
export type PriceModel = "per_person" | "fixed";

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

/** Slug club dérivé du nom (mock — sera Club.slug en base). */
function clubSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Parse « 20–60 pers. » → [20, 60]. */
function parseCapacity(label: string): [number, number] {
  const nums = label.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) return [nums[0], nums[1]];
  if (nums.length === 1) return [nums[0], nums[0]];
  return [10, 40];
}

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
    body: "Belle prestation, bon rapport qualité-prix au vu de l'encadrement. Devis clair et sans surprise." },
  { id: "r8", author: "Antoine D. · CFO", date: "décembre 2025", rating: 5, tone: "ink",
    body: "Tout était fluide, de la demande de devis au paiement. Savoir que ça finance un projet local a beaucoup plu en interne." },
];

// Tarif au participant (centimes) pour les expériences phares « per_person ».
const PER_PERSON_RATE: Record<string, number> = {
  "journee-immersion-sig": 12_000,
  "seminaire-cohesion-rhenus": 4_500,
  "atelier-cohesion-nancy": 3_800,
  "cohesion-aviron-metz": 6_500,
};

const CLUB_META: Record<string, { responseTime: string; experienceCount: number; typeLabel: string }> = {
  "sig-strasbourg": { responseTime: "répond en 2h", experienceCount: 12, typeLabel: "club pro" },
};

const FORMAT_BY_CATEGORY: Record<string, string> = {
  match_vip: "Journée",
  cohesion: "Demi-journée",
  initiation: "Demi-journée",
  tournoi: "Journée",
  masterclass: "Soirée",
  coulisses: "Soirée",
};

function toDetail(x: MarketplaceExperience, reviewCount: number): ExperienceDetail {
  const [capacityMin, capacityMax] = parseCapacity(x.capacityLabel);
  const cslug = clubSlug(x.club);
  const meta = CLUB_META[cslug] ?? { responseTime: "répond en 24h", experienceCount: 4, typeLabel: "club partenaire" };

  const perPerson = PER_PERSON_RATE[x.slug];
  const priceModel: PriceModel = perPerson ? "per_person" : "fixed";
  const basePriceCents = x.price * 100;
  const pricePerPersonCents = perPerson ?? 0;
  const fromPriceCents = priceModel === "per_person" ? perPerson * capacityMin : basePriceCents;

  const format = FORMAT_BY_CATEGORY[x.category] ?? "Sur mesure";
  const toneByHue: ExperienceClub["tone"] =
    x.hue === "green" || x.hue === "teal" ? "green" : x.hue === "yellow" ? "yellow" : "orange";

  return {
    slug: x.slug,
    title: x.title,
    categoryLabel: x.category,
    cityLabel: `${CITY_NICE[x.city] ?? x.city}`,
    rating: x.rating,
    reviewCount,
    verified: true,
    hue: x.hue,
    format,
    capacityMin,
    capacityMax,
    priceModel,
    pricePerPersonCents,
    basePriceCents,
    fromPriceCents,
    facts: [
      ["Capacité", x.capacityLabel, "users"],
      ["Format", format === "Journée" ? "Journée (≈ 6h)" : format, "calendar"],
      ["Lieu", `${x.club} · ${CITY_NICE[x.city] ?? x.city}`, "pin"],
      ["Inclus", "Encadrement diplômé", "check"],
    ],
    description: [
      `Une expérience premium conçue et animée par ${x.club}. Vos équipes sont accueillies et encadrées par le staff du club, dans un cadre sportif unique — un format clé en main, du premier échange au jour J.`,
      "Tout est organisé par le club, de l'encadrement diplômé à la logistique. Et chaque expérience finance directement un projet de saison du club.",
    ],
    included: [
      "Encadrement par le staff du club", "Animation et matériel sur place",
      "Coordination logistique complète", "Adaptation à vos contraintes",
      "Photos & vidéo de l'événement", "Devis ferme sous 48h",
    ],
    photos: buildGallery(x.title, x.hue),
    slots: buildSlots(x.availableFrom),
    club: {
      slug: cslug,
      name: x.club,
      initials: x.club.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase(),
      typeLabel: meta.typeLabel,
      experienceCount: meta.experienceCount,
      responseTime: meta.responseTime,
      tone: toneByHue,
    },
    project: {
      clubSlug: cslug,
      title: x.funds,
      raisedCents: Math.round(x.goal * 40_000 * 100),
      targetCents: 40_000 * 100,
      goal: x.goal,
    },
    reviews: REVIEW_POOL.slice(0, Math.min(REVIEW_POOL.length, Math.max(2, reviewCount % REVIEW_POOL.length || REVIEW_POOL.length))),
  };
}

const CITY_NICE: Record<string, string> = {
  strasbourg: "Strasbourg (67)",
  nancy: "Nancy (54)",
  metz: "Metz (57)",
};

/** Récupère le détail d'une expérience par slug (ou null si introuvable). */
export async function getExperienceBySlug(slug: string): Promise<ExperienceDetail | null> {
  const all = await getMarketplaceExperiences();
  const x = all.find((e) => e.slug === slug);
  if (!x) return null;
  return toDetail(x, x.reviews);
}

/** Tous les slugs publiés (generateStaticParams). */
export async function getAllExperienceSlugs(): Promise<string[]> {
  const all = await getMarketplaceExperiences();
  return all.map((e) => e.slug);
}
