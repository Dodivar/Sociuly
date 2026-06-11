import Link from "next/link";
import { Icon } from "@/components/ds/icon";
import { StatCard, PanelCard } from "@/components/account/account-bits";
import { QuoteRows, BookingRows } from "@/components/account/org-lists";
import { getOrgBookings, getOrganizationSummary } from "@/lib/account/org";
import { eurWhole } from "@/lib/devis/quotes";
import { getQuotesForOrg } from "@/lib/devis/quotes.server";

// Vue d'ensemble de l'espace entreprise — /compte (SPEC §6).

export default async function ComptePage() {
  const [org, quotes, bookings] = await Promise.all([
    getOrganizationSummary(),
    getQuotesForOrg(),
    getOrgBookings(),
  ]);

  const pendingQuotes = quotes.filter((q) => q.status === "sent").length;
  const upcoming = bookings.filter((b) => b.status === "quote_accepted" || b.status === "deposit_paid" || b.status === "confirmed");
  const totalEngagedCents = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.amountTTCCents, 0);
  const projects = new Set(bookings.map((b) => b.projectTitle).filter(Boolean));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <p className="sy-body" style={{ color: "var(--ink-2)" }}>
        Bonjour {org.primaryContact.name.split(" ")[0]} 👋 — voici l'activité de {org.name}.
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon="chat" label="Devis en attente" value={String(pendingQuotes)} hint="à examiner" />
        <StatCard icon="calendar" label="Expériences à venir" value={String(upcoming.length)} />
        <StatCard icon="euro" label="Total engagé" value={eurWhole(totalEngagedCents)} hint="toutes expériences" />
        <StatCard icon="trophy" label="Projets soutenus" value={String(projects.size)} hint="clubs locaux" />
      </div>

      {/* Devis récents */}
      <PanelCard
        title="Vos devis"
        action={<Link href="/compte/devis" className="sy-btn sy-btn-soft sy-btn-sm">Tout voir <Icon name="arrow" size={13} /></Link>}
      >
        <QuoteRows quotes={quotes} limit={3} />
      </PanelCard>

      {/* Réservations à venir */}
      <PanelCard
        title="Prochaines expériences"
        action={<Link href="/compte/reservations" className="sy-btn sy-btn-soft sy-btn-sm">Tout voir <Icon name="arrow" size={13} /></Link>}
      >
        <BookingRows bookings={upcoming} limit={3} />
      </PanelCard>

      {/* CTA */}
      <div
        className="sy-card"
        style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "var(--surface-2)" }}
      >
        <div>
          <div className="sy-h3">Un nouveau séminaire en vue ?</div>
          <div className="sy-small sy-muted" style={{ marginTop: 2 }}>
            Parcourez les expériences des clubs et demandez un devis sur mesure.
          </div>
        </div>
        <Link href="/experiences" style={{ textDecoration: "none" }}>
          <span className="sy-btn sy-btn-primary">Découvrir les expériences <Icon name="arrow" size={14} color="#fff" /></span>
        </Link>
      </div>
    </div>
  );
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
