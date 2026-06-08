"use client";

import { useState, type ReactNode } from "react";
import { Btn, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { StatCard } from "@/components/console/stat-card";
import { eurSym as fmtEur, eurSymWhole as fmtEurWhole } from "@/lib/format";
import {
  ENCAISSEMENT_LABEL,
  UPCOMING_STATUS_LABEL,
  type Encaissement,
  type PayoutHistoryRow,
  type RevenueData,
  type UpcomingPayout,
  type UpcomingPayoutStatus,
} from "@/lib/console/mock-revenues";

type Props = { data: RevenueData };

type TabId = "upcoming" | "history" | "encaissements";

const UPCOMING_VISUAL: Record<UpcomingPayoutStatus, { bg: string; fg: string }> = {
  awaiting_completion: { bg: "var(--highlight-soft)", fg: "#6e5111" },
  dispute_window: { bg: "var(--accent-soft)", fg: "var(--accent-deep)" },
};

export function RevenueView({ data }: Props) {
  const [tab, setTab] = useState<TabId>("upcoming");

  // TODO(api): brancher sur un export comptable réel (CSV/PDF, cf. SPEC §8 RGPD).
  function onExport() {
    /* stub — export indisponible tant que la couche données n'est pas branchée */
  }

  return (
    <>
      <header className="rev-head">
        <div>
          <h1 className="sy-h1">Revenus</h1>
          <p className="sy-small sy-muted" style={{ marginTop: 4 }}>
            Encaissements, versements à venir et historique des virements de votre club.
          </p>
        </div>
        <Btn variant="outline" icon={<Icon name="download" size={15} />} onClick={onExport}>
          Exporter
        </Btn>
      </header>

      <div className="rev-body">
        <div className="sy-grid-4">
          <StatCard
            icon="euro"
            label="Encaissé · 30 j"
            value={fmtEurWhole(data.kpis.encaisseTTC.amountCents)}
            delta={data.kpis.encaisseTTC.deltaLabel}
            deltaPositive={data.kpis.encaisseTTC.deltaPositive}
          />
          <StatCard
            icon="coin"
            label="Net versé · 30 j"
            value={fmtEurWhole(data.kpis.netVerse.amountCents)}
            delta={data.kpis.netVerse.deltaLabel}
            deltaPositive={data.kpis.netVerse.deltaPositive}
          />
          <StatCard
            icon="bolt"
            label="Versements à venir"
            value={fmtEurWhole(data.kpis.versementsAVenir.amountCents)}
            delta={data.kpis.versementsAVenir.deltaLabel}
            deltaPositive={data.kpis.versementsAVenir.deltaPositive}
          />
          <StatCard
            icon="info"
            label="Commission Sociuly · 30 j"
            value={fmtEurWhole(data.kpis.commission.amountCents)}
            delta={data.kpis.commission.deltaLabel}
            deltaPositive={data.kpis.commission.deltaPositive}
          />
        </div>

        <NextPayoutBanner data={data} />

        <section className="sy-card rev-ledger" style={{ padding: 0, overflow: "hidden" }}>
          <div className="rev-ledger-head">
            <div>
              <div className="sy-mono">Suivi financier</div>
              <h2 className="sy-h2" style={{ marginTop: 2 }}>
                {tab === "upcoming"
                  ? "Versements à venir"
                  : tab === "history"
                    ? "Historique des versements"
                    : "Encaissements"}
              </h2>
            </div>
            <div className="rev-tabs-scroll">
              <Tabs
                variant="pill"
                items={[
                  { id: "upcoming", label: `Versements à venir · ${data.upcoming.length}` },
                  { id: "history", label: "Historique" },
                  { id: "encaissements", label: "Encaissements" },
                ]}
                active={tab}
                onChange={(id) => setTab(id as TabId)}
              />
            </div>
          </div>

          {tab === "upcoming" && <UpcomingTable rows={data.upcoming} />}
          {tab === "history" && <HistoryTable rows={data.history} />}
          {tab === "encaissements" && <EncaissementsTable rows={data.encaissements} />}
        </section>
      </div>

      <style>{`
        .rev-head {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
          padding: 20px 32px;
          border-bottom: 1px solid var(--line);
          background: var(--surface);
        }
        .rev-body { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }

        .rev-ledger-head {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 18px 22px; border-bottom: 1px solid var(--line);
        }
        .rev-tabs-scroll { overflow-x: auto; }
        .rev-tabs-scroll::-webkit-scrollbar { height: 0; }

        /* Tables responsives : grille en desktop, cartes empilées < 768px. */
        .rev-table { display: flex; flex-direction: column; }
        .rev-thead, .rev-row {
          display: grid; align-items: center; gap: 14px;
          padding: 13px 22px;
        }
        .rev-thead {
          border-bottom: 1px solid var(--line);
          color: var(--ink-3);
        }
        .rev-row { border-top: 1px solid var(--line); }
        .rev-row:first-of-type { border-top: none; }
        .rev-cell-amount {
          font-family: var(--display); font-weight: 700; font-size: 15px;
          font-variation-settings: var(--display-var); text-align: right;
        }
        .rev-cell-num { text-align: right; }
        .rev-empty { padding: 28px 22px; text-align: center; }

        .rev-up-row, .rev-up-head    { grid-template-columns: 2fr 1fr 1.1fr 1fr 1fr; }
        .rev-hist-row, .rev-hist-head { grid-template-columns: 1fr 2fr 1fr 1fr 1.1fr; }
        .rev-enc-row, .rev-enc-head   { grid-template-columns: 1fr 2fr 1.1fr 1fr; }

        .rev-prim {
          color: var(--ink); font-weight: 600; font-size: 14px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rev-sub { color: var(--ink-3); font-size: 12.5px; margin-top: 2px; }

        @media (max-width: 1024px) {
          .rev-body { padding: 22px 24px; }
        }
        @media (max-width: 768px) {
          .rev-head { padding: 16px 18px; flex-direction: column; }
          .rev-head > button { width: 100%; }
          .rev-body { padding: 16px 16px; }
          .rev-ledger-head { flex-direction: column; align-items: stretch; }
          .rev-thead { display: none; }
          .rev-row {
            grid-template-columns: 1fr !important;
            gap: 6px; padding: 14px 18px;
          }
          .rev-row > .rev-cell::before {
            content: attr(data-label);
            display: block;
            font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em;
            text-transform: uppercase; color: var(--ink-3); margin-bottom: 2px;
          }
          .rev-cell-amount, .rev-cell-num { text-align: left; }
        }
      `}</style>
    </>
  );
}

function NextPayoutBanner({ data }: { data: RevenueData }) {
  const { nextPayout } = data;
  return (
    <section className="sy-card sy-card-accent rev-next">
      <div className="rev-next-main">
        <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>
          Prochain versement
        </div>
        <div className="sy-num rev-next-amount">{fmtEur(nextPayout.amountCents)}</div>
        <div className="sy-small" style={{ color: "var(--ink-2)", marginTop: 4 }}>
          Prévu le {nextPayout.dateLabel} · {nextPayout.count} versement
          {nextPayout.count > 1 ? "s" : ""} à venir
        </div>
      </div>
      <div className="rev-next-note">
        <Icon name="info" size={15} color="var(--accent-deep)" />
        <span>
          Versement automatique le lendemain de l'expérience (J+1), après une fenêtre de
          contestation de 48 h. Commission Sociuly de 6 % déjà déduite.
        </span>
      </div>

      <style>{`
        .rev-next {
          display: flex; align-items: center; gap: 24px;
        }
        .rev-next-main { flex: 0 0 auto; }
        .rev-next-amount {
          font-family: var(--display); font-weight: 700; font-size: 32px; line-height: 1;
          margin-top: 6px; font-variation-settings: var(--display-var); color: var(--ink);
        }
        .rev-next-note {
          display: flex; align-items: flex-start; gap: 10px;
          padding-left: 24px; border-left: 1px solid var(--line-2);
          font-size: 13px; line-height: 1.45; color: var(--ink-2);
        }
        @media (max-width: 768px) {
          .rev-next { flex-direction: column; align-items: flex-start; gap: 16px; }
          .rev-next-note { padding-left: 0; border-left: none; }
        }
      `}</style>
    </section>
  );
}

function StatusChip({ status }: { status: UpcomingPayoutStatus }) {
  const v = UPCOMING_VISUAL[status];
  return (
    <span
      className="sy-chip sy-chip-sm"
      style={{ background: v.bg, color: v.fg, fontWeight: 600 }}
    >
      {UPCOMING_STATUS_LABEL[status]}
    </span>
  );
}

function PaidChip() {
  return (
    <span
      className="sy-chip sy-chip-sm"
      style={{
        background: "var(--primary-soft)",
        color: "var(--primary-deep)",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Icon name="check" size={12} color="var(--primary-deep)" /> Versé
    </span>
  );
}

function Cell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className ? `rev-cell ${className}` : "rev-cell"} data-label={label}>
      {children}
    </div>
  );
}

function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <div className="rev-empty">
      <div className="sy-mono">{children}</div>
    </div>
  );
}

function UpcomingTable({ rows }: { rows: UpcomingPayout[] }) {
  if (rows.length === 0) return <EmptyRow>Aucun versement à venir</EmptyRow>;
  return (
    <div className="rev-table">
      <div className="rev-thead rev-up-head sy-mono">
        <div>Expérience</div>
        <div>Date expérience</div>
        <div>Statut</div>
        <div className="rev-cell-num">Versement prévu</div>
        <div className="rev-cell-num">Net à verser</div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="rev-row rev-up-row">
          <Cell label="Expérience">
            <div className="rev-prim">{r.experienceTitle}</div>
            <div className="rev-sub">
              {r.orgName} · <span className="sy-num">{r.bookingNumber}</span>
            </div>
          </Cell>
          <Cell label="Date expérience">
            <span className="sy-num" style={{ fontSize: 13.5 }}>{r.experienceDateLabel}</span>
          </Cell>
          <Cell label="Statut">
            <StatusChip status={r.status} />
          </Cell>
          <Cell label="Versement prévu" className="rev-cell-num">
            <span className="sy-num" style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
              {r.payoutDateLabel}
            </span>
          </Cell>
          <Cell label="Net à verser" className="rev-cell-amount sy-num">
            {fmtEur(r.netAmountCents)}
          </Cell>
        </div>
      ))}
    </div>
  );
}

function HistoryTable({ rows }: { rows: PayoutHistoryRow[] }) {
  if (rows.length === 0) return <EmptyRow>Aucun versement effectué</EmptyRow>;
  return (
    <div className="rev-table">
      <div className="rev-thead rev-hist-head sy-mono">
        <div>Versé le</div>
        <div>Expérience</div>
        <div className="rev-cell-num">Brut</div>
        <div className="rev-cell-num">Commission</div>
        <div className="rev-cell-num">Net versé</div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="rev-row rev-hist-row">
          <Cell label="Versé le">
            <span className="sy-num" style={{ fontSize: 13.5 }}>{r.paidAtLabel}</span>
            <div style={{ marginTop: 5 }}>
              <PaidChip />
            </div>
          </Cell>
          <Cell label="Expérience">
            <div className="rev-prim">{r.experienceTitle}</div>
            <div className="rev-sub">
              {r.orgName} · <span className="sy-num">{r.bookingNumber}</span>
            </div>
          </Cell>
          <Cell label="Brut" className="rev-cell-num sy-num">
            <span style={{ fontSize: 13.5 }}>{fmtEur(r.grossAmountTTCCents)}</span>
          </Cell>
          <Cell label="Commission" className="rev-cell-num sy-num">
            <span style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
              −{fmtEur(r.feeAmountCents)}
            </span>
          </Cell>
          <Cell label="Net versé" className="rev-cell-amount sy-num">
            {fmtEur(r.netAmountCents)}
          </Cell>
        </div>
      ))}
    </div>
  );
}

function EncaissementsTable({ rows }: { rows: Encaissement[] }) {
  if (rows.length === 0) return <EmptyRow>Aucun encaissement</EmptyRow>;
  return (
    <div className="rev-table">
      <div className="rev-thead rev-enc-head sy-mono">
        <div>Encaissé le</div>
        <div>Organisation</div>
        <div>Type</div>
        <div className="rev-cell-num">Montant TTC</div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="rev-row rev-enc-row">
          <Cell label="Encaissé le">
            <span className="sy-num" style={{ fontSize: 13.5 }}>{r.paidAtLabel}</span>
          </Cell>
          <Cell label="Organisation">
            <div className="rev-prim">{r.orgName}</div>
            <div className="rev-sub sy-num">{r.bookingNumber}</div>
          </Cell>
          <Cell label="Type">
            <span
              className="sy-chip sy-chip-sm sy-chip-outline"
              style={{ fontWeight: 500 }}
            >
              {ENCAISSEMENT_LABEL[r.kind]}
            </span>
          </Cell>
          <Cell label="Montant TTC" className="rev-cell-amount sy-num">
            {fmtEur(r.amountCents)}
          </Cell>
        </div>
      ))}
    </div>
  );
}
