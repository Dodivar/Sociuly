"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Btn, Input, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { eurSym as fmtEur, eurSymWhole as fmtEurWhole } from "@/lib/format";
import {
  LOCATION_LABEL,
  STATUS_LABEL,
  type BookingAdmin,
  type BookingStatus,
} from "@/lib/console/mock-reservations";

type Props = { bookings: BookingAdmin[] };

type TabId = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const TAB_DEFS: { id: TabId; label: string; match: (s: BookingStatus) => boolean }[] = [
  { id: "all",       label: "Toutes",     match: () => true },
  {
    id: "pending",
    label: "À traiter",
    match: (s) => s === "pending_quote" || s === "quote_accepted" || s === "deposit_paid",
  },
  { id: "confirmed", label: "Confirmées", match: (s) => s === "confirmed" || s === "in_progress" },
  { id: "completed", label: "Terminées",  match: (s) => s === "completed" },
  {
    id: "cancelled",
    label: "Annulées",
    match: (s) =>
      s === "cancelled_by_org" || s === "cancelled_by_club" || s === "refunded",
  },
];

type StatusVisual = { bg: string; fg: string; border?: string };
const STATUS_VISUAL: Record<BookingStatus, StatusVisual> = {
  pending_quote:     { bg: "var(--surface-2)",      fg: "var(--ink-2)" },
  quote_accepted:    { bg: "var(--highlight-soft)", fg: "#6e5111" },
  deposit_paid:      { bg: "var(--accent-soft)",    fg: "var(--accent-deep)" },
  confirmed:         { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  in_progress:       { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  completed:         { bg: "var(--surface-2)",      fg: "var(--ink-2)" },
  cancelled_by_org:  { bg: "var(--surface)",        fg: "var(--danger)", border: "var(--line-2)" },
  cancelled_by_club: { bg: "var(--surface)",        fg: "var(--danger)", border: "var(--line-2)" },
  refunded:          { bg: "var(--surface-2)",      fg: "var(--ink-2)" },
};

function StatusChip({ status }: { status: BookingStatus }) {
  const v = STATUS_VISUAL[status];
  return (
    <span
      className="sy-chip sy-chip-sm"
      style={{
        background: v.bg,
        color: v.fg,
        fontWeight: 600,
        border: v.border ? `1px solid ${v.border}` : undefined,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

type DialogState = { kind: "cancel" | "refuse"; id: string } | null;

export function ReservationsView({ bookings }: Props) {
  const [rows, setRows] = useState<BookingAdmin[]>(bookings);
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(bookings[0]?.id ?? null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const counts = useMemo(() => {
    const c: Record<TabId, number> = {
      all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
    };
    for (const b of rows) for (const t of TAB_DEFS) if (t.match(b.status)) c[t.id]++;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const def = TAB_DEFS.find((t) => t.id === tab)!;
    const q = query.trim().toLowerCase();
    return rows
      .filter((b) => def.match(b.status))
      .filter((b) =>
        q
          ? b.organizationName.toLowerCase().includes(q) ||
            b.experienceTitle.toLowerCase().includes(q) ||
            b.bookingNumber.toLowerCase().includes(q)
          : true,
      );
  }, [rows, tab, query]);

  const selected =
    rows.find((b) => b.id === selectedId) ?? filtered[0] ?? null;

  // TODO(api): remplacer ces transitions locales par des server actions
  // (capture/refund Stripe + email, cf. SPEC §5). La machine d'état autorisée :
  // deposit_paid → confirmed | cancelled_by_club ; confirmed → cancelled_by_club.
  // La gestion des devis (pending_quote → sent → accepted) vit dans /console/[clubId]/devis.
  function confirmBooking(id: string) {
    setRows((prev) =>
      prev.map((b) =>
        b.id === id && b.status === "deposit_paid"
          ? { ...b, status: "confirmed", confirmedAtLabel: "à l'instant" }
          : b,
      ),
    );
  }

  function applyDialog() {
    if (!dialog) return;
    const { id, kind } = dialog;
    setRows((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "cancelled_by_club",
              resolutionLabel:
                kind === "refuse"
                  ? "Demande refusée — client non débité"
                  : "Annulée par le club — remboursement intégral en cours",
            }
          : b,
      ),
    );
    setDialog(null);
  }

  return (
    <div className="rv-root" data-mobile-detail={mobileDetailOpen ? "1" : "0"}>
      <aside className="rv-list" aria-label="Liste des réservations">
        <header className="rv-list-header">
          <div className="rv-list-titlebar">
            <h2 className="sy-h2">Réservations</h2>
            {counts.pending > 0 && (
              <span className="sy-badge" aria-label={`${counts.pending} à valider`}>
                {counts.pending}
              </span>
            )}
          </div>
          <Input
            placeholder="Entreprise, expérience, n° SOC…"
            icon={<Icon name="search" size={14} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher une réservation"
            style={{ marginTop: 12, height: 38 }}
          />
          <div className="rv-tabs-scroll" style={{ marginTop: 12 }}>
            <Tabs
              variant="pill"
              items={TAB_DEFS.map((t) => ({ id: t.id, label: `${t.label} · ${counts[t.id]}` }))}
              active={tab}
              onChange={(id) => setTab(id as TabId)}
            />
          </div>
        </header>

        <div className="rv-list-body">
          {filtered.length === 0 ? (
            <div className="rv-list-empty">
              <div className="sy-mono">Aucune réservation</div>
              <p className="sy-small sy-muted" style={{ marginTop: 6 }}>
                Ajustez la recherche ou changez de filtre.
              </p>
            </div>
          ) : (
            filtered.map((b) => (
              <BookingListRow
                key={b.id}
                booking={b}
                active={b.id === selected?.id}
                onClick={() => {
                  setSelectedId(b.id);
                  setMobileDetailOpen(true);
                }}
              />
            ))
          )}
        </div>
      </aside>

      <section className="rv-detail" aria-label="Détail de la réservation">
        {selected ? (
          <BookingDetailPane
            booking={selected}
            onBack={() => setMobileDetailOpen(false)}
            onConfirm={() => confirmBooking(selected.id)}
            onRefuse={() => setDialog({ kind: "refuse", id: selected.id })}
            onCancel={() => setDialog({ kind: "cancel", id: selected.id })}
          />
        ) : (
          <EmptyDetail />
        )}
      </section>

      {dialog && (
        <ConfirmDialog
          kind={dialog.kind}
          onConfirm={applyDialog}
          onClose={() => setDialog(null)}
        />
      )}

      <style>{`
        .rv-root {
          display: flex;
          flex: 1;
          min-height: calc(100vh - 60px);
          align-items: stretch;
        }
        .rv-list {
          width: 360px;
          flex: 0 0 auto;
          border-right: 1px solid var(--line);
          background: var(--surface);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: calc(100vh - 60px);
        }
        .rv-list-header {
          padding: 20px 18px;
          border-bottom: 1px solid var(--line);
        }
        .rv-list-titlebar {
          display: flex; align-items: center; gap: 10px;
        }
        .rv-tabs-scroll { overflow-x: auto; }
        .rv-tabs-scroll::-webkit-scrollbar { height: 0; }
        .rv-list-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          flex: 1;
        }
        .rv-list-empty { padding: 28px 12px; text-align: center; }

        .rv-detail {
          flex: 1; min-width: 0;
          padding: 28px 36px;
        }

        @media (max-width: 1180px) {
          .rv-list { width: 320px; }
          .rv-detail { padding: 24px 24px; }
        }
        @media (max-width: 900px) {
          .rv-list { width: 286px; }
        }
        @media (max-width: 768px) {
          .rv-root { flex-direction: column; min-height: auto; }
          .rv-list {
            width: 100%;
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--line);
          }
          .rv-detail { padding: 18px 16px; }
          .rv-root[data-mobile-detail="1"] .rv-list { display: none; }
          .rv-root[data-mobile-detail="0"] .rv-detail { display: none; }
        }
      `}</style>
    </div>
  );
}

// ─────────────── List row ───────────────

function BookingListRow({
  booking, active, onClick,
}: {
  booking: BookingAdmin;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="rv-row"
      data-active={active ? "1" : "0"}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${booking.organizationName} — ${STATUS_LABEL[booking.status]}`}
    >
      <div className="rv-row-top">
        <StatusChip status={booking.status} />
        <span className="sy-mono sy-num rv-row-num">{booking.bookingNumber}</span>
      </div>
      <div className="sy-h4 rv-row-customer">{booking.organizationName}</div>
      <div className="sy-small sy-muted rv-row-presta">
        {booking.experienceTitle} · {booking.participants} pers.
      </div>
      <div className="rv-row-foot">
        <span className="sy-mono">{booking.dateShort} · {booking.timeRange}</span>
        <span className="sy-num rv-row-amount">{fmtEurWhole(booking.grossAmountTTCCents)}</span>
      </div>

      <style>{`
        .rv-row {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          color: inherit;
          font: inherit;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: background .15s ease, border-color .15s ease;
        }
        .rv-row:hover { background: var(--surface-2); }
        .rv-row:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
        .rv-row[data-active="1"] { background: var(--surface-2); border-color: var(--ink); }
        .rv-row-top {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .rv-row-num { color: var(--ink-3); }
        .rv-row-customer { margin-top: 2px; }
        .rv-row-presta {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rv-row-foot {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; margin-top: 4px;
        }
        .rv-row-amount {
          font-family: var(--display); font-weight: 700; font-size: 15px;
          font-variation-settings: var(--display-var);
        }
      `}</style>
    </button>
  );
}

// ─────────────── Detail pane ───────────────

function BookingDetailPane({
  booking, onBack, onConfirm, onRefuse, onCancel,
}: {
  booking: BookingAdmin;
  onBack: () => void;
  onConfirm: () => void;
  onRefuse: () => void;
  onCancel: () => void;
}) {
  const b = booking;
  const isPending = b.status === "deposit_paid";
  const isConfirmed = b.status === "confirmed" || b.status === "in_progress";
  const isClosed =
    b.status === "cancelled_by_org" ||
    b.status === "cancelled_by_club" ||
    b.status === "refunded";

  return (
    <>
      <button type="button" className="rv-back" onClick={onBack} aria-label="Retour à la liste">
        <Icon name="arrowLeft" size={14} />
        <span>Retour</span>
      </button>

      <div className="rv-titlebar">
        <div style={{ minWidth: 0 }}>
          <div className="rv-title-meta">
            <StatusChip status={b.status} />
            <span className="sy-mono sy-num">{b.bookingNumber}</span>
          </div>
          <h1 className="sy-h1 rv-title">{b.experienceTitle}</h1>
          <p className="sy-body rv-sub">
            Commandé par <strong style={{ color: "var(--ink)" }}>{b.organizationName}</strong>
            {b.projectTitle ? <> · finance <span style={{ color: "var(--accent-deep)" }}>{b.projectTitle}</span></> : null}
          </p>
        </div>

        <div className="rv-actions">
          {isPending && (
            <>
              <Btn variant="outline" onClick={onRefuse}>Refuser</Btn>
              <Btn variant="primary" icon={<Icon name="check" size={15} color="#fff" />} onClick={onConfirm}>
                Confirmer la date
              </Btn>
            </>
          )}
          {isConfirmed && (
            <>
              <a className="sy-btn sy-btn-soft" href={`mailto:${b.organizationEmail}`}>
                <Icon name="chat" size={14} /> Contacter
              </a>
              <Btn variant="outline" onClick={onCancel}>Annuler</Btn>
            </>
          )}
          {!isPending && !isConfirmed && (
            <a className="sy-btn sy-btn-soft" href={`mailto:${b.organizationEmail}`}>
              <Icon name="chat" size={14} /> Contacter l'entreprise
            </a>
          )}
        </div>
      </div>

      {isPending && (
        <div className="rv-hint">
          <Icon name="info" size={15} color="var(--accent-deep)" />
          <span>
            L'acompte est versé : en confirmant, vous bloquez la date pour l'entreprise.
            Le solde sera réglé avant l'événement. Annulation possible jusqu'au {b.cancellationDeadlineLabel}.
          </span>
        </div>
      )}
      {isClosed && b.resolutionLabel && (
        <div className="rv-hint rv-hint-muted">
          <Icon name="info" size={15} color="var(--ink-3)" />
          <span>{b.resolutionLabel}</span>
        </div>
      )}

      <div className="rv-cols">
        <div className="rv-col">
          <section className="sy-card">
            <div className="sy-mono">Détails de l'expérience</div>
            <dl className="rv-facts">
              <Fact label="Date">{b.dateLong}</Fact>
              <Fact label="Créneau">{b.timeRange} · {formatDuration(b.durationMinutes)}</Fact>
              <Fact label="Participants">{b.participants} personnes</Fact>
              <Fact label="Lieu">
                {LOCATION_LABEL[b.location]}
                {b.addressForService ? (
                  <span className="rv-fact-addr">
                    <Icon name="pin" size={13} color="var(--ink-3)" /> {b.addressForService}
                  </span>
                ) : null}
              </Fact>
            </dl>
          </section>

          {b.organizationNotes && (
            <section className="sy-card">
              <div className="sy-mono">Message de l'entreprise</div>
              <p className="sy-body" style={{ marginTop: 8, color: "var(--ink)" }}>
                « {b.organizationNotes} »
              </p>
            </section>
          )}
        </div>

        <div className="rv-col">
          <AmountCard booking={b} />

          <section className="sy-card">
            <div className="sy-mono">Entreprise</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <ContactLine label="Société" value={b.organizationName} />
              <ContactLine label="Contact" value={b.contactName} />
              <ContactLine label="Email" value={b.organizationEmail} href={`mailto:${b.organizationEmail}`} />
              {b.contactPhone && <ContactLine label="Téléphone" value={b.contactPhone} />}
            </div>
          </section>

          <section className="sy-card">
            <div className="sy-mono">Suivi</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <ContactLine label="Créée le" value={b.createdAtLabel} />
              {b.confirmedAtLabel && <ContactLine label="Confirmée le" value={b.confirmedAtLabel} />}
              {b.completedAtLabel && <ContactLine label="Réalisée le" value={b.completedAtLabel} />}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .rv-back {
          display: none;
          align-items: center; gap: 6px;
          padding: 6px 10px;
          margin-bottom: 12px;
          background: var(--surface-2);
          border: none; border-radius: 999px;
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink-2); cursor: pointer;
        }
        .rv-back:hover { background: var(--surface-3); color: var(--ink); }
        .rv-back:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }

        .rv-titlebar {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 18px;
        }
        .rv-title-meta { display: flex; align-items: center; gap: 10px; }
        .rv-title { margin-top: 12px; font-size: 32px; }
        .rv-sub { margin-top: 8px; }
        .rv-actions { display: flex; gap: 8px; flex-shrink: 0; }

        .rv-hint {
          margin-top: 18px;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px;
          background: var(--accent-soft); color: var(--ink-2);
          font-size: 13px; line-height: 1.4;
        }
        .rv-hint-muted { background: var(--surface-2); }

        .rv-cols {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 20px;
          align-items: start;
        }
        .rv-col { display: flex; flex-direction: column; gap: 16px; }

        .rv-facts { margin: 12px 0 0; display: flex; flex-direction: column; }
        .rv-fact {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 16px; padding: 10px 0; border-top: 1px solid var(--line);
        }
        .rv-fact:first-of-type { border-top: none; }
        .rv-fact dt { flex: 0 0 auto; }
        .rv-fact dd {
          margin: 0; text-align: right; color: var(--ink); font-weight: 500; font-size: 14px;
        }
        .rv-fact-addr {
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 4px; color: var(--ink-2); font-weight: 400; font-size: 13px;
        }

        @media (max-width: 1180px) { .rv-title { font-size: 28px; } }
        @media (max-width: 900px) {
          .rv-cols { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .rv-back { display: inline-flex; }
          .rv-titlebar { flex-direction: column; align-items: stretch; }
          .rv-actions { width: 100%; }
          .rv-actions > * { flex: 1; }
          .rv-title { font-size: 24px; }
        }
      `}</style>
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rv-fact">
      <dt className="sy-mono">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ContactLine({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
      <span className="sy-mono">{label}</span>
      {href ? (
        <a className="sy-link" href={href} style={{ fontSize: 14, fontWeight: 500, textAlign: "right" }}>
          {value}
        </a>
      ) : (
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", textAlign: "right" }}>
          {value}
        </span>
      )}
    </div>
  );
}

function AmountCard({ booking }: { booking: BookingAdmin }) {
  const b = booking;
  const balanceCents = b.grossAmountTTCCents - b.depositCents;
  const versementNote =
    b.status === "completed"
      ? (b.resolutionLabel ?? "Versement automatique J+1 après l'événement.")
      : b.status === "confirmed" || b.status === "in_progress"
        ? "Versement automatique le lendemain de l'événement (J+1)."
        : b.status === "deposit_paid" || b.status === "quote_accepted"
          ? "Le versement intervient après réalisation de l'expérience."
          : "Commande close — aucun versement au club.";

  return (
    <section className="sy-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* SPEC §5 — la commission Sociuly (6 % du TTC) est visible côté club (payout net),
          jamais surfacée à l'acheteur. TODO(§11) — ventilation HT/TVA : base liée à
          Club.vatLiable + TVA sur commission, décision comptable OUVERTE. */}
      <div style={{ padding: 18 }}>
        <div className="sy-mono">Montant</div>
        <Line label="Total TTC (entreprise)" value={fmtEur(b.grossAmountTTCCents)} />
        <Line label="Acompte versé (30 %)" value={fmtEur(b.depositCents)} muted />
        <Line label="Solde avant l'événement" value={fmtEur(balanceCents)} muted />
        <Line label="Commission Sociuly (6 %)" value={`−${fmtEur(b.feeAmountCents)}`} muted />
      </div>
      <div style={{ padding: 18, background: "var(--accent-soft)" }}>
        <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>Versé au club</div>
        <div
          className="sy-num"
          style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, lineHeight: 1,
            marginTop: 6, fontVariationSettings: "var(--display-var)",
          }}
        >
          {fmtEur(b.netAmountCents)}
        </div>
        <div className="sy-small" style={{ marginTop: 8, color: "var(--ink-2)" }}>
          {versementNote}
        </div>
      </div>
    </section>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className="sy-small"
      style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10 }}
    >
      <span className="sy-muted">{label}</span>
      <span className="sy-num" style={{ color: muted ? "var(--ink-2)" : "var(--ink)", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

// ─────────────── Confirm / refuse dialog ───────────────

function ConfirmDialog({
  kind, onConfirm, onClose,
}: {
  kind: "cancel" | "refuse";
  onConfirm: () => void;
  onClose: () => void;
}) {
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // Focus the dismissive action by default (safe choice for a destructive dialog).
    actionsRef.current?.querySelector("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isRefuse = kind === "refuse";
  const title = isRefuse ? "Refuser cette commande ?" : "Annuler cette réservation ?";
  const body = isRefuse
    ? "L'entreprise sera intégralement remboursée (acompte inclus) et recevra un email l'informant du refus. Cette action est définitive."
    : "L'entreprise sera intégralement remboursée et recevra un email d'excuse automatique.";

  return (
    <div
      className="rv-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rv-dialog-title"
      onClick={onClose}
    >
      <div className="sy-card rv-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 id="rv-dialog-title" className="sy-h2">{title}</h2>
        <p className="sy-body" style={{ marginTop: 8 }}>{body}</p>

        {!isRefuse && (
          <div className="rv-dialog-warn">
            <Icon name="flag" size={16} color="var(--danger)" />
            <span>
              <strong>Attention :</strong> 3 annulations par le club en 6 mois entraînent la
              suspension automatique de votre club (SPEC §4).
            </span>
          </div>
        )}

        <div className="rv-dialog-actions" ref={actionsRef}>
          <Btn variant="ghost" onClick={onClose}>
            {isRefuse ? "Revenir" : "Garder la réservation"}
          </Btn>
          <Btn variant="dark" onClick={onConfirm}>
            {isRefuse ? "Confirmer le refus" : "Confirmer l'annulation"}
          </Btn>
        </div>
      </div>

      <style>{`
        .rv-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(11, 21, 48, 0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .rv-dialog {
          width: 100%; max-width: 460px;
          box-shadow: var(--shadow-lg);
          border-color: var(--line);
        }
        .rv-dialog-warn {
          margin-top: 16px;
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; border-radius: 12px;
          background: var(--surface-2);
          font-size: 13px; line-height: 1.45; color: var(--ink-2);
        }
        .rv-dialog-warn strong { color: var(--ink); }
        .rv-dialog-actions {
          margin-top: 20px;
          display: flex; justify-content: flex-end; gap: 10px;
        }
        @media (max-width: 460px) {
          .rv-dialog-actions { flex-direction: column-reverse; }
          .rv-dialog-actions > * { width: 100%; }
        }
      `}</style>
    </div>
  );
}

// ─────────────── Empty state ───────────────

function EmptyDetail() {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", textAlign: "center",
        padding: 40, gap: 12,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 56, height: 56, borderRadius: 16, background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon name="calendar" size={24} color="var(--ink-3)" />
      </div>
      <h2 className="sy-h2">Aucune réservation sélectionnée</h2>
      <p className="sy-body" style={{ maxWidth: 360 }}>
        Sélectionnez une réservation dans la liste pour en voir le détail et la confirmer ou l'annuler.
      </p>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
