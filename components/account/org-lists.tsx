// Listes de l'espace entreprise /compte (server-safe) : devis, réservations,
// factures. Réutilisées par la vue d'ensemble (tronquées) et les pages dédiées.

import Link from "next/link";
import { Icon } from "@/components/ds/icon";
import { StatusChip, EmptyState } from "@/components/account/account-bits";
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_VISUAL,
  eurWhole,
  frDateShort,
  quoteAmounts,
  type Quote,
} from "@/lib/devis/quotes";
import {
  ORG_BOOKING_LABEL,
  ORG_INVOICE_LABEL,
  type OrgBooking,
  type OrgBookingStatus,
  type OrgInvoice,
  type OrgInvoiceStatus,
} from "@/lib/account/org";

const ROW_CSS = `
  .ol-list { list-style: none; margin: 0; padding: 0; }
  .ol-row {
    display: grid; align-items: center; gap: 12px;
    padding: 14px 18px; border-top: 1px solid var(--line);
  }
  .ol-row:first-child { border-top: none; }
  .ol-main { min-width: 0; }
  .ol-title { color: var(--ink); font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ol-amount {
    text-align: right; font-family: var(--display); font-weight: 700; font-size: 16px;
    font-variation-settings: var(--display-var); white-space: nowrap;
  }
  .ol-action { display: flex; justify-content: flex-end; }
`;

// ─────── Devis ───────
export function QuoteRows({ quotes, limit }: { quotes: Quote[]; limit?: number }) {
  const rows = limit ? quotes.slice(0, limit) : quotes;
  if (rows.length === 0) {
    return <EmptyState icon="chat" title="Aucun devis" text="Demandez un devis depuis une expérience pour le retrouver ici." />;
  }
  return (
    <ul className="ol-list">
      {rows.map((q) => {
        const v = QUOTE_STATUS_VISUAL[q.status];
        const { amountTTCCents } = quoteAmounts(q.lines, q.clubVatLiable);
        return (
          <li key={q.id} className="ol-row ol-row-quote">
            <div className="ol-cell-status">
              <StatusChip label={QUOTE_STATUS_LABEL[q.status]} bg={v.bg} fg={v.fg} border={v.border} />
            </div>
            <div className="ol-main">
              <div className="ol-title">{q.experienceTitle}</div>
              <div className="sy-mono" style={{ marginTop: 2 }}>{q.quoteNumber} · {q.clubName}</div>
            </div>
            <div className="sy-small sy-muted ol-date">{frDateShort(q.requestedDateISO)}</div>
            <div className="ol-amount">{eurWhole(amountTTCCents)}</div>
            <div className="ol-action">
              <Link href={`/devis/${q.ref}`} className="sy-btn sy-btn-soft sy-btn-sm">
                {q.status === "sent" ? "Répondre" : "Voir"} <Icon name="arrow" size={13} />
              </Link>
            </div>
            <style>{ROW_CSS}{`
              .ol-row-quote { grid-template-columns: 120px 1fr auto auto auto; }
              @media (max-width: 720px) {
                .ol-row-quote { grid-template-columns: 1fr auto; grid-template-areas: "status amount" "main main" "date action"; }
                .ol-row-quote .ol-cell-status { grid-area: status; }
                .ol-row-quote .ol-main { grid-area: main; }
                .ol-row-quote .ol-date { grid-area: date; align-self: center; }
                .ol-row-quote .ol-amount { grid-area: amount; }
                .ol-row-quote .ol-action { grid-area: action; }
              }
            `}</style>
          </li>
        );
      })}
    </ul>
  );
}

// ─────── Réservations ───────
const BOOKING_VISUAL: Record<OrgBookingStatus, { bg: string; fg: string; border?: string }> = {
  quote_accepted: { bg: "var(--highlight-soft)", fg: "#6e5111" },
  deposit_paid:   { bg: "var(--accent-soft)",    fg: "var(--accent-deep)" },
  confirmed:      { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  completed:      { bg: "var(--surface-2)",      fg: "var(--ink-2)" },
  cancelled:      { bg: "var(--surface)",        fg: "var(--danger)", border: "var(--line-2)" },
};

export function BookingRows({ bookings, limit }: { bookings: OrgBooking[]; limit?: number }) {
  const rows = limit ? bookings.slice(0, limit) : bookings;
  if (rows.length === 0) {
    return <EmptyState icon="calendar" title="Aucune réservation" text="Vos expériences confirmées apparaîtront ici une fois un devis accepté." />;
  }
  return (
    <ul className="ol-list">
      {rows.map((b) => {
        const v = BOOKING_VISUAL[b.status];
        return (
          <li key={b.id} className="ol-row ol-row-booking">
            <div className="ol-cell-status">
              <StatusChip label={ORG_BOOKING_LABEL[b.status]} bg={v.bg} fg={v.fg} border={v.border} />
            </div>
            <div className="ol-main">
              <div className="ol-title">{b.experienceTitle}</div>
              <div className="sy-mono" style={{ marginTop: 2 }}>{b.bookingNumber} · {b.clubName} · {b.participants} pers.</div>
            </div>
            <div className="sy-small sy-muted ol-date">{b.dateLabel}</div>
            <div className="ol-amount">{eurWhole(b.amountTTCCents)}</div>
            <div className="ol-action">
              {b.status === "quote_accepted" && b.payHref ? (
                <Link href={b.payHref} className="sy-btn sy-btn-primary sy-btn-sm">
                  <Icon name="lock" size={13} color="#fff" /> Régler l'acompte
                </Link>
              ) : b.status === "completed" && !b.reviewed ? (
                <span className="sy-btn sy-btn-soft sy-btn-sm">
                  <Icon name="star" size={13} /> Laisser un avis
                </span>
              ) : (
                <span className="sy-small sy-muted">—</span>
              )}
            </div>
            <style>{ROW_CSS}{`
              .ol-row-booking { grid-template-columns: 140px 1fr auto auto auto; }
              @media (max-width: 760px) {
                .ol-row-booking { grid-template-columns: 1fr auto; grid-template-areas: "status amount" "main main" "date action"; }
                .ol-row-booking .ol-cell-status { grid-area: status; }
                .ol-row-booking .ol-main { grid-area: main; }
                .ol-row-booking .ol-date { grid-area: date; align-self: center; }
                .ol-row-booking .ol-amount { grid-area: amount; }
                .ol-row-booking .ol-action { grid-area: action; }
              }
            `}</style>
          </li>
        );
      })}
    </ul>
  );
}

// ─────── Factures ───────
const INVOICE_VISUAL: Record<OrgInvoiceStatus, { bg: string; fg: string }> = {
  paid:    { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  pending: { bg: "var(--highlight-soft)", fg: "#6e5111" },
};

export function InvoiceRows({ invoices, limit }: { invoices: OrgInvoice[]; limit?: number }) {
  const rows = limit ? invoices.slice(0, limit) : invoices;
  if (rows.length === 0) {
    return <EmptyState icon="download" title="Aucune facture" text="Vos factures seront disponibles ici après le paiement de vos acomptes." />;
  }
  return (
    <ul className="ol-list">
      {rows.map((inv) => {
        const v = INVOICE_VISUAL[inv.status];
        return (
          <li key={inv.id} className="ol-row ol-row-invoice">
            <div className="ol-main">
              <div className="ol-title">{inv.invoiceNumber}</div>
              <div className="sy-mono" style={{ marginTop: 2 }}>{inv.experienceTitle} · {inv.clubName}</div>
            </div>
            <div className="sy-small sy-muted ol-date">{inv.dateLabel}</div>
            <div className="ol-cell-status">
              <StatusChip label={ORG_INVOICE_LABEL[inv.status]} bg={v.bg} fg={v.fg} />
            </div>
            <div className="ol-amount">{eurWhole(inv.amountTTCCents)}</div>
            <div className="ol-action">
              {/* TODO(api): PDF réel (@react-pdf/renderer + Supabase Storage). */}
              <a href={inv.pdfUrl} className="sy-btn sy-btn-soft sy-btn-sm" aria-label={`Télécharger la facture ${inv.invoiceNumber}`}>
                <Icon name="download" size={13} /> PDF
              </a>
            </div>
            <style>{ROW_CSS}{`
              .ol-row-invoice { grid-template-columns: 1fr auto 96px auto auto; }
              @media (max-width: 760px) {
                .ol-row-invoice { grid-template-columns: 1fr auto; grid-template-areas: "main amount" "date status" "action action"; }
                .ol-row-invoice .ol-main { grid-area: main; }
                .ol-row-invoice .ol-date { grid-area: date; align-self: center; }
                .ol-row-invoice .ol-cell-status { grid-area: status; justify-self: end; }
                .ol-row-invoice .ol-amount { grid-area: amount; }
                .ol-row-invoice .ol-action { grid-area: action; }
                .ol-row-invoice .ol-action .sy-btn { width: 100%; justify-content: center; }
              }
            `}</style>
          </li>
        );
      })}
    </ul>
  );
}
