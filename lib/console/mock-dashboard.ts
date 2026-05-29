import type { IconName } from "@/components/ds/icon";

export type BookingStatus = "pending" | "confirmed" | "done";

export type Booking = {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  customer: string;
  presta: string;
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

export type NavBadges = Partial<Record<"presta" | "resa" | "projets" | "avis", number>>;

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
    name: "USB Volley",
    city: "Rennes",
    initials: "UV",
    season: {
      label: "Saison 2026",
      raised: 18400,
      goal: 30000,
      progress: 0.62,
    },
  };
}

// TODO(api): remplacer par un fetch DB / RPC.
export async function getDashboardData(_clubId: string): Promise<DashboardData> {
  return {
    greeting: "Bonjour Margaux 👋",
    summary:
      "3 réservations à valider · €1 240 collectés cette semaine pour le tournoi U17.",
    stats: [
      { id: "rev",   label: "Revenus · 30j",   value: "€4 280", delta: "+18%",  deltaPositive: true, icon: "euro" },
      { id: "resa",  label: "Réservations",    value: "22",     delta: "+5",    deltaPositive: true, icon: "calendar" },
      { id: "note",  label: "Note moyenne",    value: "4.9",    delta: "+0.1",  deltaPositive: true, icon: "star" },
      { id: "proj",  label: "Projet U17",      value: "62%",    delta: "+8 pt", deltaPositive: true, icon: "trophy" },
    ],
    bookings: [
      { id: "b1", date: "14", dayLabel: "SAM JUIN", time: "16h00–19h00", customer: "Camille Léger",   presta: "Barbecue convivial",       guests: 24, status: "pending",   amount: 280, project: "Tournoi U17" },
      { id: "b2", date: "21", dayLabel: "SAM JUIN", time: "14h00–17h00", customer: "Lycée Bréquigny", presta: "Olympiades inter-classes", guests: 80, status: "confirmed", amount: 720, project: "Tournoi U17" },
      { id: "b3", date: "28", dayLabel: "SAM JUIN", time: "11h00–14h00", customer: "Famille Dupuy",   presta: "Anniversaire enfant",      guests: 18, status: "confirmed", amount: 180, project: "Maillots"    },
      { id: "b4", date: "05", dayLabel: "SAM JUIL", time: "18h00–22h00", customer: "Mairie de Rennes", presta: "Buvette fête de quartier", guests: 120, status: "confirmed", amount: 350, project: "Vestiaires"  },
    ],
    bookingsTotal: 22,
    project: {
      name: "Tournoi U17",
      raised: 2480,
      goal: 4000,
      daysLeft: 12,
      weeklyDelta: 420,
      spark: [12, 18, 8, 22, 30, 14, 26, 38, 24, 42, 50, 36, 48, 56],
    },
    tasks: [
      { id: "t1", label: "Valider la résa du 14 juin", hint: "urgent", tone: "urgent" },
      { id: "t2", label: "Répondre à 2 messages",                       tone: "warn"   },
      { id: "t3", label: "Mettre à jour le projet U17",                 tone: "info"   },
    ],
    navBadges: { resa: 3 },
  };
}
