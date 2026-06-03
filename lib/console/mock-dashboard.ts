import type { IconName } from "@/components/ds/icon";

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

// TODO(api): remplacer par un fetch DB / RPC. Garder la signature async.
export async function getClubSummary(clubId: string): Promise<Club> {
  return {
    id: clubId,
    name: "SIG Strasbourg",
    city: "Strasbourg",
    initials: "SIG",
    season: {
      label: "Saison 2026",
      raised: 24800,
      goal: 40000,
      progress: 0.62,
    },
  };
}

// TODO(api): remplacer par un fetch DB / RPC.
export async function getDashboardData(_clubId: string): Promise<DashboardData> {
  return {
    greeting: "Bonjour Laure 👋",
    summary:
      "2 devis à envoyer · €12 480 contractualisés cette semaine pour l'école de jeunes U17.",
    stats: [
      { id: "rev",   label: "Revenus · 30j",      value: "€38 200", delta: "+22%",  deltaPositive: true, icon: "euro" },
      { id: "resa",  label: "Commandes",          value: "9",       delta: "+3",    deltaPositive: true, icon: "calendar" },
      { id: "note",  label: "Note moyenne",       value: "4.9",     delta: "+0.1",  deltaPositive: true, icon: "star" },
      { id: "proj",  label: "École de jeunes U17", value: "62%",    delta: "+8 pt", deltaPositive: true, icon: "trophy" },
    ],
    bookings: [
      { id: "b1", date: "16", dayLabel: "LUN JUIN", time: "09h00–17h00", organization: "Klaxoon SAS",      experience: "Journée immersion · SIG",      guests: 40, status: "deposit_paid",  amount: 4800, project: "École de jeunes U17" },
      { id: "b2", date: "23", dayLabel: "MAR JUIN", time: "18h00–22h00", organization: "Lohr Group",       experience: "Match VIP & hospitalités",     guests: 30, status: "confirmed",    amount: 2400, project: "Mini-bus du club" },
      { id: "b3", date: "27", dayLabel: "SAM JUIN", time: "14h00–17h00", organization: "Caisse d'Épargne",  experience: "Atelier cohésion d'équipe",    guests: 24, status: "confirmed",    amount: 1200, project: "Maillots saison" },
      { id: "b4", date: "04", dayLabel: "SAM JUIL", time: "10h00–13h00", organization: "Decathlon Campus",  experience: "Initiation basket encadrée",   guests: 36, status: "quote_accepted", amount: 900, project: "Tournoi U17"   },
    ],
    bookingsTotal: 9,
    project: {
      name: "École de jeunes U17",
      raised: 24800,
      goal: 40000,
      daysLeft: 12,
      weeklyDelta: 2480,
      spark: [12, 18, 8, 22, 30, 14, 26, 38, 24, 42, 50, 36, 48, 56],
    },
    tasks: [
      { id: "t1", label: "Envoyer le devis Klaxoon (40 pers.)", hint: "urgent", tone: "urgent" },
      { id: "t2", label: "Répondre à 2 demandes de devis",                       tone: "warn"   },
      { id: "t3", label: "Mettre à jour le projet école de jeunes U17",          tone: "info"   },
    ],
    // `avis` = nombre de nouveaux avis non consultés (cf. mock-reviews.ts).
    navBadges: { devis: 2, avis: 2 },
  };
}
