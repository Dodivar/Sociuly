import type { IconName } from "@/components/ds/icon";
import { prisma } from "@/lib/prisma";
import { resolveClub } from "./club";

// Cf. SPEC.md §3 — Booking.status. Sous-ensemble pertinent pour le tableau de
// bord club (commandes déjà contractualisées, après acceptation du devis).
export type BookingStatus =
  | "quote_accepted"
  | "deposit_paid"
  | "confirmed"
  | "in_progress"
  | "completed";

export type Booking = {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  organization: string;
  experience: string;
  guests: number;
  status: BookingStatus;
  amount: number;
  project: string;
};

export type Stat = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: IconName;
};

export type TaskTone = "urgent" | "warn" | "info";

export type Task = {
  id: string;
  label: string;
  hint?: string;
  tone: TaskTone;
};

export type Project = {
  name: string;
  raised: number;
  goal: number;
  daysLeft: number;
  weeklyDelta: number;
  spark: number[];
};

export type Club = {
  id: string;
  name: string;
  city: string;
  initials: string;
  season: {
    label: string;
    raised: number;
    goal: number;
    progress: number;
  };
};

export type NavBadges = Partial<Record<"experiences" | "devis" | "resa" | "projets" | "avis", number>>;

export type DashboardData = {
  greeting: string;
  summary: string;
  stats: Stat[];
  bookings: Booking[];
  bookingsTotal: number;
  project: Project;
  tasks: Task[];
  navBadges: NavBadges;
};

const ACTIVE_PROJECT = ["active", "funded"] as const;
const eur = (cents: number) => `€${Math.round(cents / 100).toLocaleString("fr-FR")}`;
const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();

export async function getClubSummary(clubIdParam: string): Promise<Club> {
  const club = await resolveClub(clubIdParam);
  if (!club) {
    return { id: clubIdParam, name: "Club", city: "", initials: "?",
      season: { label: "Saison 2026", raised: 0, goal: 0, progress: 0 } };
  }
  const projects = await prisma.project.findMany({
    where: { clubId: club.id, status: { in: [...ACTIVE_PROJECT] } },
    select: { collectedAmount: true, targetAmount: true },
  });
  const rawRaised = projects.reduce((s, p) => s + p.collectedAmount, 0);
  const rawGoal = projects.reduce((s, p) => s + p.targetAmount, 0);
  return {
    id: club.id,
    name: club.name,
    city: club.city,
    initials: initialsOf(club.name),
    season: {
      label: "Saison 2026",
      raised: Math.round(rawRaised / 100),
      goal: Math.round(rawGoal / 100),
      progress: rawGoal > 0 ? rawRaised / rawGoal : 0,
    },
  };
}

const WD = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const MO = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
const hhmm = (d: Date) =>
  `${String(d.getUTCHours()).padStart(2, "0")}h${String(d.getUTCMinutes()).padStart(2, "0")}`;

const EMPTY_DASHBOARD: DashboardData = {
  greeting: "Bonjour 👋", summary: "", stats: [], bookings: [], bookingsTotal: 0,
  project: { name: "", raised: 0, goal: 0, daysLeft: 0, weeklyDelta: 0, spark: [] },
  tasks: [], navBadges: {},
};

const LIVE_BOOKING = ["quote_accepted", "deposit_paid", "confirmed", "in_progress", "completed"] as const;

export async function getDashboardData(clubIdParam: string): Promise<DashboardData> {
  const club = await resolveClub(clubIdParam);
  if (!club) return EMPTY_DASHBOARD;
  const clubId = club.id;
  const since30 = new Date(Date.now() - 30 * 86_400_000);

  const [president, bookings, draftQuotes, reviewsAgg, reviews30, project] = await Promise.all([
    prisma.clubMember.findFirst({ where: { clubId, role: "president" }, include: { user: { select: { fullName: true } } } }),
    prisma.booking.findMany({
      where: { clubId, status: { in: [...LIVE_BOOKING] } },
      orderBy: { requestedDate: "asc" },
      include: {
        experience: { include: { project: { select: { title: true } }, segments: { select: { durationMinutes: true } } } },
        organization: { select: { name: true } },
        quote: { select: { participants: true } },
      },
    }),
    prisma.quote.findMany({ where: { clubId, status: "draft" }, include: { organization: { select: { name: true } } } }),
    prisma.review.aggregate({ where: { clubId }, _avg: { rating: true } }),
    prisma.review.count({ where: { clubId, createdAt: { gte: since30 } } }),
    prisma.project.findFirst({ where: { clubId, status: { in: [...ACTIVE_PROJECT] } }, orderBy: { collectedAmount: "desc" } }),
  ]);

  const firstName = president?.user.fullName?.split(" ")[0] ?? "";
  const revenue30 = bookings
    .filter((b) => b.completedAt && b.completedAt >= since30)
    .reduce((s, b) => s + b.netAmountCents, 0);
  const avgRating = reviewsAgg._avg.rating;
  const projectProgress = project && project.targetAmount > 0 ? project.collectedAmount / project.targetAmount : 0;

  const dashBookings: Booking[] = bookings.slice(0, 4).map((b) => {
    const totalMin = b.experience.segments.reduce((s, sg) => s + sg.durationMinutes, 0);
    const start = hhmm(b.requestedDate);
    const end = hhmm(new Date(b.requestedDate.getTime() + totalMin * 60_000));
    return {
      id: b.id,
      date: String(b.requestedDate.getUTCDate()).padStart(2, "0"),
      dayLabel: `${WD[b.requestedDate.getUTCDay()]} ${MO[b.requestedDate.getUTCMonth()]}`,
      time: totalMin > 0 ? `${start}–${end}` : start,
      organization: b.organization.name,
      experience: b.experience.title,
      guests: b.quote?.participants ?? 0,
      status: b.status as BookingStatus,
      amount: Math.round(b.grossAmountTTCCents / 100),
      project: b.experience.project?.title ?? "",
    };
  });

  const tasks: Task[] = draftQuotes.slice(0, 4).map((q) => ({
    id: q.id,
    label: `Envoyer le devis ${q.organization.name}`,
    hint: "urgent",
    tone: "urgent",
  }));
  if (project) {
    tasks.push({ id: `proj-${project.id}`, label: `Mettre à jour le projet ${project.title}`, tone: "info" });
  }

  const navBadges: NavBadges = {};
  if (draftQuotes.length) navBadges.devis = draftQuotes.length;
  if (reviews30) navBadges.avis = reviews30;

  return {
    greeting: firstName ? `Bonjour ${firstName} 👋` : "Bonjour 👋",
    summary: `${draftQuotes.length} devis à envoyer · ${eur(revenue30)} encaissés (30 j)${project ? ` pour ${project.title}` : ""}.`,
    stats: [
      { id: "rev", label: "Revenus · 30j", value: eur(revenue30), delta: "", deltaPositive: true, icon: "euro" },
      { id: "resa", label: "Commandes", value: String(bookings.length), delta: "", deltaPositive: true, icon: "calendar" },
      { id: "note", label: "Note moyenne", value: avgRating ? avgRating.toFixed(1) : "—", delta: "", deltaPositive: true, icon: "star" },
      { id: "proj", label: project?.title ?? "Projet", value: `${Math.round(projectProgress * 100)}%`, delta: "", deltaPositive: true, icon: "trophy" },
    ],
    bookings: dashBookings,
    bookingsTotal: bookings.length,
    // TODO(schéma): daysLeft (pas d'échéance projet), weeklyDelta et spark (pas
    // d'historique) ne sont pas modélisés → valeurs par défaut.
    project: {
      name: project?.title ?? "",
      raised: project ? Math.round(project.collectedAmount / 100) : 0,
      goal: project ? Math.round(project.targetAmount / 100) : 0,
      daysLeft: 0,
      weeklyDelta: 0,
      spark: [],
    },
    tasks,
    navBadges,
  };
}
