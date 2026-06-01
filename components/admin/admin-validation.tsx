"use client";

import { useMemo, useState } from "react";
import { Avatar, Btn, Chip, IconBtn, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { PENDING_STATUS_CHIP } from "@/components/admin/admin-overview";
import {
  FEDERATION_LABEL,
  PENDING_STATUS_LABEL,
  type AdminData,
  type AdminKpi,
  type KycCheckItem,
  type PendingAssociation,
} from "@/lib/admin/mock-admin";

type Filter = "all" | "to_verify" | "docs_incomplete";

type Props = {
  data: AdminData;
  selectedId: string | null;
  onSelectId: (id: string) => void;
};

export function AdminValidation({ data, selectedId, onSelectId }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    let toVerify = 0;
    let docs = 0;
    for (const a of data.pending) {
      if (a.status === "to_verify") toVerify++;
      else docs++;
    }
    return { all: data.pending.length, to_verify: toVerify, docs_incomplete: docs };
  }, [data.pending]);

  const filtered = useMemo(
    () =>
      data.pending.filter((a) => (filter === "all" ? true : a.status === filter)),
    [data.pending, filter],
  );

  const selected =
    data.pending.find((a) => a.id === selectedId) ?? filtered[0] ?? data.pending[0] ?? null;

  return (
    <div className="va-root">
      <header className="va-head">
        <div>
          <div className="sy-mono">Sociuly · Admin · Validation</div>
          <h1 className="sy-h1" style={{ fontSize: 24, marginTop: 4 }}>
            {data.pendingCount} associations en attente
          </h1>
        </div>
        <div className="va-filters">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            tous · {counts.all}
          </FilterChip>
          <FilterChip active={filter === "to_verify"} onClick={() => setFilter("to_verify")}>
            à vérifier · {counts.to_verify}
          </FilterChip>
          <FilterChip
            active={filter === "docs_incomplete"}
            onClick={() => setFilter("docs_incomplete")}
          >
            docs manquants · {counts.docs_incomplete}
          </FilterChip>
        </div>
      </header>

      <div className="va-split">
        <section
          className="sy-card va-list"
          style={{ padding: 0, overflow: "hidden" }}
          aria-label="Demandes en attente"
        >
          <div className="va-list-head">
            <div className="sy-mono">Demandes · tri : ancienneté</div>
            <Btn variant="ghost" size="sm" icon={<Icon name="filter" size={13} />}>
              Filtres
            </Btn>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: "28px 18px", textAlign: "center" }}>
              <div className="sy-mono">Aucune demande dans ce filtre</div>
            </div>
          ) : (
            <ul className="va-rows">
              {filtered.map((a) => (
                <ListRow
                  key={a.id}
                  asso={a}
                  active={a.id === selected?.id}
                  onClick={() => onSelectId(a.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {selected ? (
          <ReviewPane key={selected.id} asso={selected} />
        ) : (
          <section className="sy-card" aria-label="Volet de revue">
            <div className="sy-mono">Aucune association sélectionnée</div>
          </section>
        )}
      </div>

      <div className="va-kpis">
        {data.validationKpis.map((k) => (
          <MiniKpi key={k.id} kpi={k} />
        ))}
      </div>

      <style>{`
        .va-root { padding: 24px 28px 80px; }
        .va-head {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .va-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .va-split {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 16px;
          align-items: start;
        }
        .va-list-head {
          padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid var(--line);
        }
        .va-rows { list-style: none; margin: 0; padding: 0; }
        .va-kpis {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 980px) {
          .va-split { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .va-root { padding: 18px 16px 80px; }
          .va-kpis { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

// ─────── Filter chip ───────

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Chip variant={active ? "solid" : "outline"} onClick={onClick}>
      {children}
    </Chip>
  );
}

// ─────── List row ───────

function ListRow({
  asso,
  active,
  onClick,
}: {
  asso: PendingAssociation;
  active: boolean;
  onClick: () => void;
}) {
  const chip = PENDING_STATUS_CHIP[asso.status];
  return (
    <li>
      <button
        type="button"
        className="va-row"
        data-active={active ? "1" : "0"}
        onClick={onClick}
        aria-pressed={active}
      >
        <Avatar initials={asso.initials} tone="ink" />
        <span className="va-row-main">
          <span className="sy-h4">{asso.name}</span>
          <span className="sy-mono" style={{ marginTop: 2, display: "block" }}>
            {asso.sport} · {asso.city} ({asso.postalCode.slice(0, 2)}) · {asso.submittedLabel}
          </span>
        </span>
        <span className="sy-chip" style={{ background: chip.bg, color: chip.fg, fontWeight: 600 }}>
          {PENDING_STATUS_LABEL[asso.status]}
        </span>
      </button>

      <style>{`
        .va-row {
          width: 100%;
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          background: transparent; border: none;
          border-top: 1px solid var(--line);
          text-align: left; cursor: pointer; color: inherit; font: inherit;
          transition: background .15s ease;
        }
        li:first-child .va-row { border-top: none; }
        .va-row:hover { background: var(--surface-2); }
        .va-row:focus-visible { outline: 3px solid var(--ring); outline-offset: -3px; }
        .va-row[data-active="1"] { background: var(--surface-2); box-shadow: inset 3px 0 0 var(--accent); }
        .va-row-main { flex: 1; min-width: 0; }
      `}</style>
    </li>
  );
}

// ─────── Review pane ───────

function ReviewPane({ asso }: { asso: PendingAssociation }) {
  const [checks, setChecks] = useState<KycCheckItem[]>(asso.checklist);
  const chip = PENDING_STATUS_CHIP[asso.status];

  const conditions = [
    { label: "SIRET vérifié (INSEE Sirene)", ok: asso.conditions.siretVerified, hint: asso.siret },
    {
      label: "Affiliation fédérale",
      ok: asso.conditions.federationNumber !== null,
      hint: asso.conditions.federationNumber ?? "non renseignée",
    },
    { label: "Onboarding Stripe Connect", ok: asso.conditions.stripeOnboarded, hint: "RIB validé Stripe" },
    { label: "Président identifié", ok: asso.conditions.hasPresident, hint: asso.president.name },
  ];
  const canActivate = conditions.every((c) => c.ok);

  function toggle(id: string) {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  }

  return (
    <section
      className="sy-card va-pane"
      style={{ background: "var(--accent-soft)", borderColor: "var(--accent)" }}
      aria-label={`Revue de ${asso.name}`}
    >
      <div className="va-pane-head">
        <Avatar initials={asso.initials} size="lg" tone="ink" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sy-h2">{asso.name}</h2>
          <div className="sy-mono" style={{ marginTop: 2 }}>
            {FEDERATION_LABEL[asso.federation]} · {asso.city} ({asso.postalCode.slice(0, 2)}) · soumis {asso.submittedLabel}
          </div>
        </div>
        <span className="sy-chip" style={{ background: chip.bg, color: chip.fg, fontWeight: 600 }}>
          {PENDING_STATUS_LABEL[asso.status]}
        </span>
      </div>

      <div className="va-dashed" />

      {/* Conditions d'activation (SPEC §5 — les 4 doivent être vraies) */}
      <div className="sy-mono">Conditions d'activation</div>
      <ul className="va-cond">
        {conditions.map((c) => (
          <li key={c.label} className="va-cond-row">
            <span className={`va-cond-mark ${c.ok ? "ok" : "ko"}`} aria-hidden>
              <Icon name={c.ok ? "check" : "close"} size={11} color="#fff" />
            </span>
            <span style={{ flex: 1 }}>
              <span className="sy-small" style={{ color: "var(--ink)", fontWeight: 500, display: "block" }}>
                {c.label}
              </span>
              <span className="sy-mono" style={{ display: "block", marginTop: 1 }}>{c.hint}</span>
            </span>
            <span className="sy-mono" style={{ color: c.ok ? "var(--success)" : "var(--danger)" }}>
              {c.ok ? "ok" : "à faire"}
            </span>
          </li>
        ))}
      </ul>

      <div className="va-dashed" />

      <div className="sy-mono">Pièces jointes</div>
      <div className="va-docs">
        {asso.docs.map((d) => {
          const missing = d.status === "missing";
          return (
            <div key={d.id} className="va-doc" data-missing={missing ? "1" : "0"}>
              <span className="va-doc-ico" aria-hidden>
                <Icon name="info" size={14} color={missing ? "var(--ink-3)" : "var(--accent)"} />
              </span>
              <span className="va-doc-label" style={{ flex: 1, minWidth: 0 }}>{d.label}</span>
              {missing ? (
                <span className="sy-mono" style={{ color: "var(--danger)" }}>manquant</span>
              ) : (
                <IconBtn size="sm" aria-label={`Ouvrir ${d.label}`}>
                  <Icon name="arrow" size={13} />
                </IconBtn>
              )}
            </div>
          );
        })}
      </div>

      <div className="va-dashed" />

      <div className="sy-mono">Checklist</div>
      <div className="va-checks">
        {checks.map((c) => (
          <label key={c.id} className="va-check">
            <input
              type="checkbox"
              checked={c.done}
              onChange={() => toggle(c.id)}
              className="va-check-box"
            />
            <span className="sy-small" style={{ color: "var(--ink)" }}>{c.label}</span>
          </label>
        ))}
      </div>

      <div className="va-dashed" />

      <div className="sy-mono">Note interne</div>
      <Textarea
        placeholder="Note visible uniquement par l'équipe Sociuly…"
        defaultValue={asso.note}
        aria-label="Note interne"
        style={{ marginTop: 6, background: "var(--surface)" }}
      />

      <div className="va-actions">
        <Btn variant="ghost" size="sm">Demander un doc</Btn>
        <Btn variant="ghost" size="sm" style={{ color: "var(--danger)" }}>
          Refuser
        </Btn>
        <Btn
          variant="primary"
          block
          style={{ flex: 1 }}
          disabled={!canActivate}
          icon={<Icon name="check" size={15} color="#fff" />}
          title={
            canActivate
              ? undefined
              : "Les 4 conditions d'activation doivent être remplies (SPEC §5)"
          }
        >
          Valider l'association
        </Btn>
      </div>
      {!canActivate && (
        <div className="sy-small" style={{ marginTop: 8, color: "var(--danger)" }}>
          Activation bloquée : une ou plusieurs conditions ne sont pas remplies.
        </div>
      )}

      <style>{`
        .va-pane-head { display: flex; align-items: center; gap: 12px; }
        .va-dashed {
          height: 0; margin: 16px 0;
          border-top: 1.5px dashed var(--line-2);
        }
        .va-cond, .va-checks, .va-docs { margin-top: 8px; }
        .va-cond { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .va-cond-row { display: flex; align-items: center; gap: 10px; }
        .va-cond-mark {
          width: 18px; height: 18px; border-radius: 50%; flex: 0 0 auto;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .va-cond-mark.ok { background: var(--success); }
        .va-cond-mark.ko { background: var(--danger); }

        .va-docs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .va-doc {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--line);
        }
        .va-doc[data-missing="1"] { border-style: dashed; }
        .va-doc-ico { display: inline-flex; flex: 0 0 auto; }
        .va-doc-label {
          font-size: 12px; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .va-checks { display: flex; flex-direction: column; gap: 8px; }
        .va-check { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .va-check-box { width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer; }

        .va-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }

        @media (max-width: 480px) {
          .va-docs { grid-template-columns: 1fr; }
          .va-actions > * { flex: 1 1 auto; }
        }
      `}</style>
    </section>
  );
}

// ─────── Mini KPI ───────

function MiniKpi({ kpi }: { kpi: AdminKpi }) {
  const accent = kpi.accent;
  return (
    <div
      className="sy-card"
      style={{
        padding: 14,
        background: accent ? "var(--accent-soft)" : undefined,
        borderColor: accent ? "transparent" : undefined,
      }}
    >
      <div className="sy-mono" style={{ color: accent ? "var(--accent-deep)" : undefined }}>
        {kpi.label}
      </div>
      <div
        className="sy-num"
        style={{
          fontFamily: "var(--display)",
          fontWeight: 700,
          fontSize: 24,
          marginTop: 6,
          fontVariationSettings: "var(--display-var)",
        }}
      >
        {kpi.value}
      </div>
      {kpi.delta && (
        <div
          className="sy-small"
          style={{ marginTop: 2, color: accent ? "var(--accent-deep)" : "var(--ink-3)" }}
        >
          {kpi.delta}
        </div>
      )}
    </div>
  );
}
