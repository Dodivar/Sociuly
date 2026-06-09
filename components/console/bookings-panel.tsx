"use client";

import { useMemo, useState } from "react";
import { Btn, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import type { Booking, BookingStatus } from "@/lib/console/dashboard";

const TABS = ["Toutes", "En attente", "Confirmées"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, (s: BookingStatus) => boolean> = {
  "Toutes":      () => true,
  "En attente":  (s) => s === "quote_accepted" || s === "deposit_paid",
  "Confirmées":  (s) => s === "confirmed" || s === "in_progress",
};

const STATUS_STYLE: Record<BookingStatus, { bg: string; fg: string; label: string }> = {
  quote_accepted: { bg: "var(--highlight-soft)", fg: "#6e5111",             label: "Devis accepté" },
  deposit_paid:   { bg: "var(--accent-soft)",    fg: "var(--accent-deep)",  label: "Acompte versé" },
  confirmed:      { bg: "var(--primary-soft)",   fg: "var(--primary-deep)", label: "Confirmée" },
  in_progress:    { bg: "var(--primary-soft)",   fg: "var(--primary-deep)", label: "En cours" },
  completed:      { bg: "var(--surface-2)",      fg: "var(--ink-2)",        label: "Terminée" },
};

type Props = {
  bookings: Booking[];
  totalCount: number;
};

export function BookingsPanel({ bookings, totalCount }: Props) {
  const [tab, setTab] = useState<Tab>("Toutes");
  const filtered = useMemo(
    () => bookings.filter((b) => TAB_FILTER[tab](b.status)),
    [bookings, tab],
  );

  return (
    <section
      className="sy-card bp-card"
      style={{ padding: 0, overflow: "hidden" }}
      aria-label="Prochaines réservations"
    >
      <div className="bp-header">
        <div>
          <div className="sy-mono">Commandes à venir</div>
          <h3 className="sy-h2" style={{ marginTop: 4 }}>Prochaines expériences</h3>
        </div>
        <Tabs
          variant="pill"
          items={[...TABS]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: "32px 22px", textAlign: "center", borderTop: "1px solid var(--line)",
          }}
        >
          <div className="sy-mono">Aucune réservation dans cette vue</div>
        </div>
      ) : (
        <ul className="bp-list">
          {filtered.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </ul>
      )}

      <div
        style={{
          padding: "14px 22px", borderTop: "1px solid var(--line)", textAlign: "center",
        }}
      >
        <Btn variant="ghost" size="sm" iconRight={<Icon name="arrow" size={13} />}>
          Voir les {totalCount} réservations
        </Btn>
      </div>

      <style>{`
        .bp-header {
          padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .bp-list { list-style: none; margin: 0; padding: 0; }
        .bp-row {
          display: grid;
          grid-template-columns: 64px 1.4fr 1.4fr 1fr 120px 100px;
          gap: 16px;
          align-items: center;
          padding: 14px 18px;
          border-top: 1px solid var(--line);
        }
        @media (max-width: 1180px) {
          .bp-row { grid-template-columns: 64px 1.4fr 1.4fr 120px 100px; }
          .bp-row .bp-project { display: none; }
        }
        @media (max-width: 720px) {
          .bp-row {
            grid-template-columns: 56px 1fr auto;
            grid-template-areas:
              "date who amount"
              "date presta status";
            row-gap: 6px;
          }
          .bp-row .bp-date    { grid-area: date; }
          .bp-row .bp-who     { grid-area: who; }
          .bp-row .bp-presta  { grid-area: presta; }
          .bp-row .bp-status  { grid-area: status; justify-self: end; }
          .bp-row .bp-amount  { grid-area: amount; text-align: right; }
        }
      `}</style>
    </section>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const s = STATUS_STYLE[booking.status];
  return (
    <li className="bp-row">
      <div
        className="bp-date"
        style={{
          width: 50, height: 50, borderRadius: 10, background: "var(--surface-2)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}
      >
        <div className="sy-mono" style={{ fontSize: 9 }}>{booking.dayLabel}</div>
        <div
          className="sy-num"
          style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, lineHeight: 1,
          }}
        >
          {booking.date}
        </div>
      </div>

      <div className="bp-who">
        <div className="sy-h4">{booking.organization}</div>
        <div className="sy-mono" style={{ marginTop: 2 }}>{booking.time}</div>
      </div>

      <div className="bp-presta">
        <div className="sy-small" style={{ color: "var(--ink)", fontWeight: 500 }}>
          {booking.experience}
        </div>
        <div className="sy-mono" style={{ marginTop: 2 }}>{booking.guests} pers.</div>
      </div>

      <div className="bp-project">
        <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>→ projet</div>
        <div className="sy-small" style={{ marginTop: 2 }}>{booking.project}</div>
      </div>

      <div className="bp-status">
        <span
          className="sy-chip"
          style={{ background: s.bg, color: s.fg, fontWeight: 600 }}
        >
          {s.label}
        </span>
      </div>

      <div
        className="bp-amount sy-num"
        style={{
          textAlign: "right",
          fontFamily: "var(--display)", fontWeight: 700, fontSize: 18,
          fontVariationSettings: "var(--display-var)",
        }}
      >
        €{booking.amount.toLocaleString("fr-FR")}
      </div>
    </li>
  );
}
