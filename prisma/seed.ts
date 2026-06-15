// Seed de développement — CLAUDE.md §10.
// Données réutilisant le catalogue front (lib/marketplace) pour la cohérence
// visuelle des écrans déjà développés.
//
// Pont auth : les User partagent l'UUID de auth.users. On crée donc d'abord les
// utilisateurs via l'API admin Supabase (le trigger handle_new_user insère la
// ligne public.User), puis on enrichit role/organisation via Prisma.
//
// Montants : tout en cents. TVA 20 % (HT/TVA/TTC). Commission Sociuly 6 % du TTC
// (sans TVA sur la commission — décision produit). net = TTC − fee.
// Club.geo : non settable via Prisma (Unsupported) → $executeRaw + ST_MakePoint.
//
// Idempotent : upserts sur clés uniques (slug, siret, email). Ré-exécutable.

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { makeQuoteRef } from "../lib/devis/quotes";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ─────── Helpers ───────

/** Crée (ou retrouve) l'utilisateur de connexion Supabase et renvoie son UUID. */
async function ensureAuthUser(email: string, fullName: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (data?.user) return data.user.id;
  // Déjà existant (ré-exécution) → on le retrouve.
  if (error) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const found = list?.users.find((u) => u.email === email);
    if (found) return found.id;
  }
  throw new Error(`Impossible de créer/retrouver l'utilisateur ${email}: ${error?.message}`);
}

/** HT/TVA/TTC + commission à partir d'une base HT (cents). TVA 20 %, fee 6 % TTC. */
function amounts(ht: number) {
  const vat = Math.round(ht * 0.2); // TVA 20 % (décision actée)
  const ttc = ht + vat;
  const fee = Math.round(ttc * 0.06); // commission Sociuly, sans TVA (décision actée)
  const net = ttc - fee;
  return { ht, vat, ttc, fee, net };
}

/** Parse "20–60 pers." → { min, max }. */
function capacity(label: string): { min: number; max: number } {
  const m = label.match(/(\d+)\D+(\d+)/);
  return m ? { min: Number(m[1]), max: Number(m[2]) } : { min: 10, max: 50 };
}

/** Slug ASCII à partir d'un libellé FR. */
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─────── Données clubs (dérivées du catalogue marketplace) ───────

type ClubSeed = {
  slug: string; name: string; clubType: "association_1901" | "club_pro" | "sasp" | "autre";
  federation: "FFF" | "FFR" | "FFHB" | "FFBB" | "FFT" | "autre";
  vatLiable: boolean; siret: string; city: string; postalCode: string;
  lat: number; lng: number; status: "active" | "pending_verification";
  canHostVipMatch?: boolean; hasVenue?: boolean; venueCapacity?: number;
  presidentEmail: string; presidentName: string;
  project: { title: string; targetCents: number; ratio: number };
};

const CLUBS: ClubSeed[] = [
  {
    slug: "sig-strasbourg", name: "SIG Strasbourg", clubType: "club_pro", federation: "FFBB", vatLiable: true,
    siret: "11111111111111", city: "Strasbourg", postalCode: "67000", lat: 48.5839, lng: 7.7455,
    status: "active", canHostVipMatch: true, hasVenue: true, venueCapacity: 6200,
    presidentEmail: "president@sig-strasbourg.fr", presidentName: "Martin Weiss",
    project: { title: "École de jeunes U17", targetCents: 1_500_000, ratio: 0.62 },
  },
  {
    slug: "rc-strasbourg", name: "RC Strasbourg", clubType: "association_1901", federation: "FFR", vatLiable: false,
    siret: "22222222222222", city: "Strasbourg", postalCode: "67200", lat: 48.6012, lng: 7.7905,
    status: "active", hasVenue: true, venueCapacity: 800,
    presidentEmail: "president@rc-strasbourg.fr", presidentName: "Claire Hoffmann",
    project: { title: "Vestiaires neufs", targetCents: 800_000, ratio: 0.78 },
  },
  {
    slug: "asnl-nancy", name: "ASNL Nancy", clubType: "club_pro", federation: "FFF", vatLiable: true,
    siret: "33333333333333", city: "Nancy", postalCode: "54000", lat: 48.7005, lng: 6.2008,
    status: "active", canHostVipMatch: true, hasVenue: true, venueCapacity: 20000,
    presidentEmail: "president@asnl-nancy.fr", presidentName: "Julien Rémy",
    project: { title: "Centre de formation", targetCents: 2_000_000, ratio: 0.30 },
  },
  {
    slug: "grand-nancy-asptt", name: "Grand Nancy ASPTT", clubType: "association_1901", federation: "FFT", vatLiable: false,
    siret: "44444444444444", city: "Nancy", postalCode: "54500", lat: 48.6701, lng: 6.1503,
    status: "active", hasVenue: true, venueCapacity: 500,
    presidentEmail: "president@gn-asptt.fr", presidentName: "Sophie Marchand",
    project: { title: "Matériel d'entraînement", targetCents: 450_000, ratio: 0.52 },
  },
  {
    slug: "metz-handball", name: "Metz Handball", clubType: "sasp", federation: "FFHB", vatLiable: true,
    siret: "55555555555555", city: "Metz", postalCode: "57000", lat: 49.1102, lng: 6.1903,
    status: "active", canHostVipMatch: true, hasVenue: true, venueCapacity: 4500,
    presidentEmail: "president@metz-handball.fr", presidentName: "Nadia Lefèvre",
    project: { title: "Académie jeunes", targetCents: 1_200_000, ratio: 0.68 },
  },
  {
    slug: "societe-nautique-metz", name: "Société Nautique Metz", clubType: "association_1901", federation: "autre", vatLiable: false,
    siret: "66666666666666", city: "Metz", postalCode: "57050", lat: 49.1251, lng: 6.1604,
    status: "active", hasVenue: true, venueCapacity: 120,
    presidentEmail: "president@sn-metz.fr", presidentName: "Paul Girard",
    project: { title: "Flotte de bateaux", targetCents: 950_000, ratio: 0.60 },
  },
  {
    // Club en attente de vérification (test console admin §10).
    slug: "cercle-escrime-metz", name: "Cercle d'Escrime Metz", clubType: "association_1901", federation: "autre", vatLiable: false,
    siret: "77777777777777", city: "Metz", postalCode: "57070", lat: 49.1051, lng: 6.1502,
    status: "pending_verification",
    presidentEmail: "president@ce-metz.fr", presidentName: "Léa Dubois",
    project: { title: "Équipements de protection", targetCents: 300_000, ratio: 0.10 },
  },
];

// ─────── Données expériences (catalogue) ───────

type ModuleType =
  | "presentation_coach" | "atelier_cohesion" | "initiation" | "exercice_adapte"
  | "mini_tournoi" | "match_vip" | "cocktail" | "visite_coulisses"
  | "masterclass_joueur" | "autre";

type ExpSeed = {
  slug: string; title: string; clubSlug: string; priceEur: number;
  format: "demi_journee" | "journee" | "soiree" | "sur_mesure";
  capacityLabel: string; rating: number; reviews: number;
  status: "published" | "draft";
  segments: Array<{ daypart: "matin" | "apres_midi" | "soir"; type: ModuleType; min: number }>;
};

const EXPERIENCES: ExpSeed[] = [
  {
    slug: "journee-immersion-sig", title: "Journée immersion · SIG Strasbourg", clubSlug: "sig-strasbourg",
    priceEur: 480, format: "journee", capacityLabel: "20–60 pers.", rating: 4.9, reviews: 62, status: "published",
    segments: [
      { daypart: "matin", type: "presentation_coach", min: 60 },
      { daypart: "matin", type: "atelier_cohesion", min: 90 },
      { daypart: "apres_midi", type: "initiation", min: 90 },
      { daypart: "apres_midi", type: "mini_tournoi", min: 90 },
      { daypart: "soir", type: "match_vip", min: 120 },
      { daypart: "soir", type: "cocktail", min: 90 },
    ],
  },
  {
    slug: "seminaire-cohesion-rhenus", title: "Séminaire cohésion · demi-journée", clubSlug: "sig-strasbourg",
    priceEur: 1200, format: "demi_journee", capacityLabel: "10–40 pers.", rating: 4.8, reviews: 47, status: "published",
    segments: [{ daypart: "matin", type: "atelier_cohesion", min: 120 }, { daypart: "matin", type: "exercice_adapte", min: 60 }],
  },
  {
    slug: "masterclass-joueur-pro-sig", title: "Masterclass joueur pro", clubSlug: "sig-strasbourg",
    priceEur: 1800, format: "demi_journee", capacityLabel: "10–40 pers.", rating: 5.0, reviews: 19, status: "published",
    segments: [{ daypart: "apres_midi", type: "masterclass_joueur", min: 120 }],
  },
  {
    slug: "cocktail-visite-coulisses-strasbourg", title: "Cocktail & visite des coulisses", clubSlug: "sig-strasbourg",
    priceEur: 1100, format: "soiree", capacityLabel: "15–50 pers.", rating: 4.5, reviews: 12, status: "draft",
    segments: [{ daypart: "soir", type: "visite_coulisses", min: 60 }, { daypart: "soir", type: "cocktail", min: 90 }],
  },
  {
    slug: "initiation-rugby-encadree", title: "Initiation rugby encadrée", clubSlug: "rc-strasbourg",
    priceEur: 900, format: "demi_journee", capacityLabel: "15–30 pers.", rating: 4.9, reviews: 38, status: "published",
    segments: [{ daypart: "apres_midi", type: "initiation", min: 120 }],
  },
  {
    slug: "atelier-cohesion-nancy", title: "Atelier cohésion d'équipe", clubSlug: "asnl-nancy",
    priceEur: 750, format: "demi_journee", capacityLabel: "10–35 pers.", rating: 4.6, reviews: 28, status: "published",
    segments: [{ daypart: "matin", type: "atelier_cohesion", min: 120 }],
  },
  {
    slug: "match-vip-hospitalites-nancy", title: "Match VIP & hospitalités", clubSlug: "asnl-nancy",
    priceEur: 2200, format: "soiree", capacityLabel: "20–60 pers.", rating: 4.6, reviews: 28, status: "published",
    segments: [{ daypart: "soir", type: "match_vip", min: 120 }, { daypart: "soir", type: "cocktail", min: 90 }],
  },
  {
    slug: "initiation-handball-nancy", title: "Initiation handball encadrée", clubSlug: "grand-nancy-asptt",
    priceEur: 680, format: "demi_journee", capacityLabel: "12–30 pers.", rating: 4.7, reviews: 22, status: "draft",
    segments: [{ daypart: "matin", type: "initiation", min: 90 }],
  },
  {
    slug: "mini-tournoi-nancy", title: "Mini-tournoi multisports", clubSlug: "grand-nancy-asptt",
    priceEur: 1350, format: "journee", capacityLabel: "25–80 pers.", rating: 4.4, reviews: 16, status: "draft",
    segments: [{ daypart: "apres_midi", type: "mini_tournoi", min: 180 }],
  },
  {
    slug: "masterclass-coach-metz", title: "Masterclass coach professionnel", clubSlug: "metz-handball",
    priceEur: 1650, format: "demi_journee", capacityLabel: "10–40 pers.", rating: 4.9, reviews: 31, status: "published",
    segments: [{ daypart: "matin", type: "masterclass_joueur", min: 120 }],
  },
  {
    slug: "cocktail-coulisses-metz", title: "Cocktail & coulisses de l'Arena", clubSlug: "metz-handball",
    priceEur: 980, format: "soiree", capacityLabel: "15–50 pers.", rating: 4.7, reviews: 18, status: "draft",
    segments: [{ daypart: "soir", type: "visite_coulisses", min: 60 }, { daypart: "soir", type: "cocktail", min: 90 }],
  },
  {
    slug: "cohesion-aviron-metz", title: "Cohésion sur l'eau · aviron", clubSlug: "societe-nautique-metz",
    priceEur: 1420, format: "demi_journee", capacityLabel: "8–24 pers.", rating: 4.8, reviews: 24, status: "published",
    segments: [{ daypart: "matin", type: "atelier_cohesion", min: 90 }, { daypart: "matin", type: "exercice_adapte", min: 60 }],
  },
  {
    // Club pending → reste draft (guard §4 : pas de publication tant que club non actif).
    slug: "initiation-escrime-metz", title: "Initiation escrime encadrée", clubSlug: "cercle-escrime-metz",
    priceEur: 820, format: "demi_journee", capacityLabel: "10–24 pers.", rating: 4.6, reviews: 14, status: "draft",
    segments: [{ daypart: "apres_midi", type: "initiation", min: 120 }],
  },
];

// ─────── Organisations acheteuses ───────

const ORGS = [
  { slug: "atlas-industries", name: "Atlas Industries", siret: "90000000000001", sizeBucket: "eti" as const,
    buyerEmail: "achat@atlas-industries.fr", buyerName: "Camille Roux", city: "Strasbourg", postalCode: "67000" },
  { slug: "novarue", name: "Novarue", siret: "90000000000002", sizeBucket: "pme" as const,
    buyerEmail: "rh@novarue.fr", buyerName: "Hugo Bernard", city: "Nancy", postalCode: "54000" },
  { slug: "credit-regional", name: "Crédit Régional", siret: "90000000000003", sizeBucket: "ge" as const,
    buyerEmail: "evenementiel@credit-regional.fr", buyerName: "Inès Faure", city: "Metz", postalCode: "57000" },
];

// ════════════════════════════ Main ════════════════════════════

async function main() {
  console.log("→ Admin Sociuly");
  const adminId = await ensureAuthUser("admin@sociuly.fr", "Sociuly Admin");
  await prisma.user.upsert({
    where: { id: adminId },
    create: { id: adminId, email: "admin@sociuly.fr", fullName: "Sociuly Admin", role: "sociuly_admin" },
    update: { role: "sociuly_admin", fullName: "Sociuly Admin" },
  });

  console.log("→ Organisations + acheteurs");
  const orgIdBySlug = new Map<string, string>();
  for (const o of ORGS) {
    const buyerId = await ensureAuthUser(o.buyerEmail, o.buyerName);
    const org = await prisma.organization.upsert({
      where: { siret: o.siret },
      create: {
        siret: o.siret, name: o.name, slug: o.slug, sizeBucket: o.sizeBucket,
        billingCity: o.city, billingPostalCode: o.postalCode, primaryContactUserId: buyerId,
      },
      update: { name: o.name, primaryContactUserId: buyerId },
    });
    await prisma.user.upsert({
      where: { id: buyerId },
      create: { id: buyerId, email: o.buyerEmail, fullName: o.buyerName, role: "org_buyer", organizationId: org.id },
      update: { role: "org_buyer", organizationId: org.id, fullName: o.buyerName },
    });
    orgIdBySlug.set(o.slug, org.id);
  }

  console.log("→ Clubs + présidents + projets");
  const clubIdBySlug = new Map<string, string>();
  const projectIdByClub = new Map<string, string>();
  for (const c of CLUBS) {
    const isActive = c.status === "active";
    const club = await prisma.club.upsert({
      where: { siret: c.siret },
      create: {
        slug: c.slug, name: c.name, clubType: c.clubType, vatLiable: c.vatLiable, siret: c.siret,
        city: c.city, postalCode: c.postalCode, status: c.status,
        siretVerified: true,
        corporateReady: isActive, bankDetailsVerified: isActive,
        insuranceRcPro: isActive, certifiedInstructor: isActive, canInvoice: isActive,
        hasVenue: c.hasVenue ?? false, venueCapacity: c.venueCapacity, canHostVipMatch: c.canHostVipMatch ?? false,
        federation: c.federation,
        federationNumber: c.clubType === "association_1901" ? "FED-" + c.siret.slice(0, 6) : null,
        // Documents KYC : tous présents pour les clubs actifs ; pour le club en
        // attente, RIB + pièce d'identité manquants (dossier incomplet à valider).
        documents: {
          create: [
            { type: "statuts", label: "Statuts / K-bis (PDF)", status: "uploaded", storageKey: `${c.slug}/statuts.pdf` },
            { type: "rna", label: "RNA / Récépissé", status: "uploaded", storageKey: `${c.slug}/rna.pdf` },
            { type: "rib", label: "RIB", status: isActive ? "uploaded" : "missing", storageKey: isActive ? `${c.slug}/rib.pdf` : null },
            { type: "president_id", label: "Pièce identité prés.", status: isActive ? "uploaded" : "missing", storageKey: isActive ? `${c.slug}/id.pdf` : null },
          ],
        },
      },
      update: { name: c.name, status: c.status, federation: c.federation },
    });
    clubIdBySlug.set(c.slug, club.id);

    // geo PostGIS (hors Prisma Client).
    await prisma.$executeRaw`
      UPDATE "Club" SET geo = ST_SetSRID(ST_MakePoint(${c.lng}, ${c.lat}), 4326)::geography
      WHERE id = ${club.id}::uuid`;

    // Président → ClubMember.
    const presId = await ensureAuthUser(c.presidentEmail, c.presidentName);
    await prisma.user.upsert({
      where: { id: presId },
      create: { id: presId, email: c.presidentEmail, fullName: c.presidentName, role: "club_admin" },
      update: { role: "club_admin", fullName: c.presidentName },
    });
    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: club.id, userId: presId } },
      create: { clubId: club.id, userId: presId, role: "president" },
      update: { role: "president" },
    });

    // Projet du club (pas d'unique métier → findFirst/create idempotent).
    const collected = Math.round(c.project.targetCents * c.project.ratio);
    const projectStatus =
      collected >= c.project.targetCents ? "funded" : c.status === "active" ? "active" : "draft";
    const existingProject = await prisma.project.findFirst({
      where: { clubId: club.id, title: c.project.title },
    });
    const projectSlug = `${c.slug}--${slugify(c.project.title)}`;
    const project = existingProject
      ? await prisma.project.update({
          where: { id: existingProject.id },
          data: { targetAmount: c.project.targetCents, collectedAmount: collected, status: projectStatus },
        })
      : await prisma.project.create({
          data: {
            clubId: club.id, slug: projectSlug, title: c.project.title,
            targetAmount: c.project.targetCents, collectedAmount: collected, status: projectStatus,
            viewsCount: Math.round(200 + Math.random() * 1200),
            updates: {
              create: [
                { title: "Projet lancé", body: `Objectif : ${Math.round(c.project.targetCents / 100)} € pour « ${c.project.title} ».`, done: true,
                  createdAt: new Date("2026-02-01T09:00:00Z") },
                { title: "Mi-parcours atteint", body: "Merci aux entreprises partenaires pour leur soutien.", done: collected * 2 >= c.project.targetCents,
                  createdAt: new Date("2026-04-15T09:00:00Z") },
              ],
            },
          },
        });
    projectIdByClub.set(c.slug, project.id);
  }

  console.log("→ Expériences + modules + segments");
  const expIdBySlug = new Map<string, string>();
  for (const e of EXPERIENCES) {
    const clubId = clubIdBySlug.get(e.clubSlug)!;
    const projectId = projectIdByClub.get(e.clubSlug)!;
    const cap = capacity(e.capacityLabel);
    const exp = await prisma.experience.upsert({
      where: { slug: e.slug },
      create: {
        clubId, slug: e.slug, title: e.title, format: e.format,
        capacityMin: cap.min, capacityMax: cap.max, basePriceCents: e.priceEur * 100,
        status: e.status, projectId, ratingAvg: e.rating, reviewsCount: e.reviews, isTemplate: true,
        // Dispos indicatives récurrentes (SPEC §2) — mar/jeu/sam, 14 j de délai.
        availability: { weekdays: [2, 4, 6], timeSlots: ["09:00", "14:00"], leadTimeDays: 14, blackoutDates: [] },
      },
      update: { title: e.title, status: e.status, ratingAvg: e.rating, reviewsCount: e.reviews },
    });
    expIdBySlug.set(e.slug, exp.id);

    // Segments (recrée proprement à chaque run).
    await prisma.experienceSegment.deleteMany({ where: { experienceId: exp.id } });
    let order = 0;
    for (const s of e.segments) {
      // Module réutilisable du club (un par type, findFirst/create idempotent).
      const moduleName = `${e.clubSlug}-${s.type}`;
      const existingMod = await prisma.experienceModule.findFirst({ where: { clubId, name: moduleName } });
      const mod = existingMod
        ? existingMod
        : await prisma.experienceModule.create({
            data: { clubId, name: moduleName, type: s.type, status: "active", durationMinutes: s.min },
          });
      await prisma.experienceSegment.create({
        data: { experienceId: exp.id, order: order++, daypart: s.daypart, moduleId: mod.id, durationMinutes: s.min },
      });
    }
  }

  console.log("→ Devis, réservations, facture, avis");
  const atlas = orgIdBySlug.get("atlas-industries")!;
  const novarue = orgIdBySlug.get("novarue")!;
  const sig = clubIdBySlug.get("sig-strasbourg")!;
  const asnl = clubIdBySlug.get("asnl-nancy")!;
  const expSig = expIdBySlug.get("journee-immersion-sig")!;
  const expNancy = expIdBySlug.get("atelier-cohesion-nancy")!;

  // Devis 1 — envoyé (Atlas → SIG). ref figé = lien de démo SAMPLE_SENT_QUOTE_REF.
  const a1 = amounts(48_000); // 480 € HT (576 € TTC)
  await prisma.quote.upsert({
    where: { quoteNumber: "DEV-2026-00001" },
    create: {
      ref: "qr_7h2Kp9vLmZ",
      quoteNumber: "DEV-2026-00001", organizationId: atlas, clubId: sig, experienceId: expSig,
      requestedDate: new Date("2026-06-23T18:00:00Z"), requestedTime: "18:00",
      participants: 30, location: "at_venue",
      amountHTCents: a1.ht, vatCents: a1.vat, amountTTCCents: a1.ttc, feeAmountCents: a1.fee, netAmountCents: a1.net,
      status: "sent", validUntil: new Date("2026-07-15"),
      lines: {
        create: [
          { order: 0, label: "Journée immersion (6h)", detail: "Programme complet · 6 temps forts", quantity: 30, unitPriceCents: 1_200 },
          { order: 1, label: "Cocktail dînatoire", detail: "Traiteur partenaire du club", quantity: 30, unitPriceCents: 400 },
        ],
      },
      events: {
        create: [
          { actor: "org", author: "Camille Roux", kind: "request", createdAt: new Date("2026-05-20T09:00:00Z"),
            body: "Soirée de fin d'année pour l'équipe (30 pers.). Cocktail dînatoire + accès aux loges." },
          { actor: "club", author: "Martin Weiss (SIG Strasbourg)", kind: "sent", createdAt: new Date("2026-05-22T10:00:00Z"),
            body: "Bonjour, voici votre devis pour la soirée du 23 juin. Au plaisir !" },
        ],
      },
    },
    update: {},
  });

  // Devis 2 — accepté + Booking confirmé + complété + facture + avis (Atlas → SIG).
  const a2 = amounts(96_000); // 960 € HT (1152 € TTC)
  const q2 = await prisma.quote.upsert({
    where: { quoteNumber: "DEV-2026-00002" },
    create: {
      ref: makeQuoteRef(),
      quoteNumber: "DEV-2026-00002", organizationId: atlas, clubId: sig, experienceId: expSig,
      requestedDate: new Date("2026-05-20T09:00:00Z"), requestedTime: "09:00",
      participants: 40, location: "at_venue",
      amountHTCents: a2.ht, vatCents: a2.vat, amountTTCCents: a2.ttc, feeAmountCents: a2.fee, netAmountCents: a2.net,
      status: "accepted", validUntil: new Date("2026-06-01"),
      lines: {
        create: [
          { order: 0, label: "Journée immersion (6h)", detail: "Programme complet · 6 temps forts", quantity: 40, unitPriceCents: 2_400 },
        ],
      },
      events: {
        create: [
          { actor: "org", author: "Camille Roux", kind: "request", createdAt: new Date("2026-05-10T09:00:00Z"),
            body: "Séminaire annuel, 40 collaborateurs. Salle au calme pour le débrief de l'après-midi." },
          { actor: "club", author: "Martin Weiss (SIG Strasbourg)", kind: "sent", createdAt: new Date("2026-05-12T10:00:00Z"),
            body: "Devis pour la journée immersion du 20 mai. Accessibilité PMR confirmée." },
          { actor: "org", author: "Camille Roux", kind: "decision", createdAt: new Date("2026-05-13T11:00:00Z"),
            body: "Parfait, c'est validé. Je procède à l'acompte." },
        ],
      },
    },
    update: {},
  });
  const completedAt = new Date("2026-05-20T20:00:00Z");
  const b2 = await prisma.booking.upsert({
    where: { bookingNumber: "SOC-2026-00001" },
    create: {
      bookingNumber: "SOC-2026-00001", quoteId: q2.id, organizationId: atlas, clubId: sig, experienceId: expSig,
      grossAmountTTCCents: a2.ttc, vatCents: a2.vat, feeAmountCents: a2.fee, netAmountCents: a2.net,
      depositCents: Math.round(a2.ttc * 0.3), status: "completed",
      requestedDate: new Date("2026-05-20T09:00:00Z"), completedAt,
    },
    update: { status: "completed" },
  });
  const inv = amounts(96_000);
  await prisma.invoice.upsert({
    where: { bookingId: b2.id },
    create: {
      invoiceNumber: "FAC-2026-00001", bookingId: b2.id,
      amountHTCents: inv.ht, vatCents: inv.vat, amountTTCCents: inv.ttc,
    },
    update: {},
  });
  await prisma.review.upsert({
    where: { bookingId: b2.id },
    create: {
      bookingId: b2.id, organizationId: atlas, clubId: sig, rating: 5, status: "published",
      comment: "Journée exceptionnelle, équipe ravie. Organisation au top.",
    },
    update: {},
  });
  // Versement effectué (J+1 après completedAt) pour le booking terminé.
  await prisma.payout.upsert({
    where: { bookingId: b2.id },
    create: {
      bookingId: b2.id,
      grossAmountTTCCents: a2.ttc, feeAmountCents: a2.fee, netAmountCents: a2.net,
      status: "paid",
      scheduledFor: new Date(completedAt.getTime() + 86_400_000),
      paidAt: new Date(completedAt.getTime() + 86_400_000),
      stripeTransferId: "tr_demo_0001",
    },
    update: {},
  });

  // Devis 3 — accepté + Booking deposit_paid (Novarue → ASNL).
  const a3 = amounts(75_000); // 750 € HT (900 € TTC)
  const q3 = await prisma.quote.upsert({
    where: { quoteNumber: "DEV-2026-00003" },
    create: {
      ref: makeQuoteRef(),
      quoteNumber: "DEV-2026-00003", organizationId: novarue, clubId: asnl, experienceId: expNancy,
      requestedDate: new Date("2026-09-10T09:00:00Z"), requestedTime: "09:00",
      participants: 24, location: "at_client", serviceAddress: "12 rue Saint-Dizier, 54000 Nancy",
      amountHTCents: a3.ht, vatCents: a3.vat, amountTTCCents: a3.ttc, feeAmountCents: a3.fee, netAmountCents: a3.net,
      status: "accepted", validUntil: new Date("2026-08-01"),
      lines: {
        create: [
          { order: 0, label: "Atelier cohésion d'équipe (3h)", detail: "Encadrement diplômé · matériel inclus", quantity: 24, unitPriceCents: 3_125 },
        ],
      },
      events: {
        create: [
          { actor: "org", author: "Hugo Bernard", kind: "request", createdAt: new Date("2026-07-01T09:00:00Z"),
            body: "Atelier d'intégration des nouveaux arrivants, format dynamique, dans nos locaux." },
          { actor: "club", author: "Julien Rémy (ASNL Nancy)", kind: "sent", createdAt: new Date("2026-07-03T10:00:00Z"),
            body: "Voici notre proposition d'atelier cohésion." },
          { actor: "org", author: "Hugo Bernard", kind: "decision", createdAt: new Date("2026-07-05T11:00:00Z"),
            body: "Validé, merci !" },
        ],
      },
    },
    update: {},
  });
  const b3 = await prisma.booking.upsert({
    where: { bookingNumber: "SOC-2026-00002" },
    create: {
      bookingNumber: "SOC-2026-00002", quoteId: q3.id, organizationId: novarue, clubId: asnl, experienceId: expNancy,
      grossAmountTTCCents: a3.ttc, vatCents: a3.vat, feeAmountCents: a3.fee, netAmountCents: a3.net,
      depositCents: Math.round(a3.ttc * 0.3), status: "deposit_paid",
      requestedDate: new Date("2026-09-10T09:00:00Z"),
    },
    update: { status: "deposit_paid" },
  });
  // Versement à venir (booking pas encore réalisé).
  await prisma.payout.upsert({
    where: { bookingId: b3.id },
    create: {
      bookingId: b3.id,
      grossAmountTTCCents: a3.ttc, feeAmountCents: a3.fee, netAmountCents: a3.net,
      status: "awaiting_completion",
      scheduledFor: new Date("2026-09-11T00:00:00Z"),
    },
    update: {},
  });

  // Compteurs de numérotation alignés sur les numéros déjà posés ci-dessus, pour
  // que les Server Actions (envoi de devis, acceptation) ne réémettent pas un
  // numéro en collision (DEV/SOC/FAC — cf. lib/devis/numbering.server.ts).
  const counters: { scope: string; year: number; value: number }[] = [
    { scope: "quote", year: 2026, value: 3 }, // DEV-2026-00001..00003
    { scope: "booking", year: 2026, value: 2 }, // SOC-2026-00001..00002
    { scope: "invoice", year: 2026, value: 1 }, // 1 facture seedée
  ];
  for (const c of counters) {
    await prisma.counter.upsert({
      where: { scope_year: { scope: c.scope, year: c.year } },
      create: c,
      update: { value: c.value },
    });
  }

  console.log("✓ Seed terminé.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
