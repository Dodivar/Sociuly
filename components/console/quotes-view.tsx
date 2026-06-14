"use client";

// Console club — gestion des demandes de devis (SPEC §4/§6).
// Master/detail aligné sur ReservationsView : liste filtrable à gauche, détail +
// éditeur à droite. Le club chiffre une demande (draft) puis l'envoie (sent) ;
// l'entreprise répond ensuite côté /devis/[ref].
//
// Les mutations passent par les Server Actions (lib/actions/quotes.ts) : envoi
// (draft → sent, calcul des montants + numéro DEV serveur) et réouverture
// (sent → draft). L'état local est mis à jour optimiste puis resynchronisé via
// router.refresh(). (PDF + email Resend : étape ultérieure.)

import { type ReactNode, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reopenQuoteAction, sendQuoteAction } from "@/lib/actions/quotes";
import { Btn, Input, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import {
  DEPOSIT_RATE,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_VISUAL,
  LOCATION_LABEL,
  defaultValidUntilISO,
  eurDecimal,
  eurWhole,
  frDateLong,
  frDateShort,
  lineSubtotalCents,
  quoteAmounts,
  type Quote,
  type QuoteLine,
  type QuoteStatus,
} from "@/lib/devis/quotes";

type Props = { quotes: Quote[] };

type TabId = "all" | "todo" | "sent" | "accepted" | "closed";

const TAB_DEFS: { id: TabId; label: string; match: (s: QuoteStatus) => boolean }[] = [
  { id: "all",      label: "Tous",      match: () => true },
  { id: "todo",     label: "À envoyer", match: (s) => s === "draft" },
  { id: "sent",     label: "Envoyés",   match: (s) => s === "sent" },
  { id: "accepted", label: "Acceptés",  match: (s) => s === "accepted" },
  { id: "closed",   label: "Clos",      match: (s) => s === "refused" || s === "expired" },
];

function StatusChip({ status }: { status: QuoteStatus }) {
  const v = QUOTE_STATUS_VISUAL[status];
  return (
    <span
      className="sy-chip sy-chip-sm"
      style={{ background: v.bg, color: v.fg, fontWeight: 600, border: v.border ? `1px solid ${v.border}` : undefined }}
    >
      {QUOTE_STATUS_LABEL[status]}
    </span>
  );
}

export function QuotesView({ quotes }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [rows, setRows] = useState<Quote[]>(quotes);
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(quotes[0]?.id ?? null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<TabId, number> = { all: 0, todo: 0, sent: 0, accepted: 0, closed: 0 };
    for (const q of rows) for (const t of TAB_DEFS) if (t.match(q.status)) c[t.id]++;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const def = TAB_DEFS.find((t) => t.id === tab)!;
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => def.match(r.status))
      .filter((r) =>
        q
          ? r.organizationName.toLowerCase().includes(q) ||
            r.experienceTitle.toLowerCase().includes(q) ||
            r.quoteNumber.toLowerCase().includes(q)
          : true,
      );
  }, [rows, tab, query]);

  const selected = rows.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  // ── Mutations locales (TODO api : server actions) ───────────────────────────
  function updateQuote(id: string, patch: Partial<Quote>) {
    setRows((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function setLines(id: string, lines: QuoteLine[]) {
    updateQuote(id, { lines });
  }

  // Envoi du devis : draft → sent. Calcul des montants + numéro DEV côté serveur ;
  // ici on met à jour l'état optimiste puis on resynchronise via router.refresh().
  function sendQuote(id: string, message: string) {
    const q = rows.find((r) => r.id === id);
    if (!q) return;
    setActionError(null);
    startTransition(async () => {
      const res = await sendQuoteAction({
        quoteId: id,
        lines: q.lines.map((l) => ({
          label: l.label,
          detail: l.detail,
          quantity: l.quantity,
          unitPriceCents: l.unitPriceCents,
        })),
        message: message.trim() || undefined,
      });
      if (!res.ok) { setActionError(res.error); return; }
      updateQuote(id, {
        status: "sent",
        sentAtLabel: "à l'instant",
        validUntilISO: defaultValidUntilISO(),
        thread: [
          ...q.thread,
          {
            id: `t-${Date.now()}`,
            from: "club",
            author: "Vous (club)",
            atLabel: "à l'instant",
            kind: "sent",
            body: message.trim() || "Voici votre devis. N'hésitez pas si vous avez des questions.",
          },
        ],
      });
      router.refresh();
    });
  }

  // Repasse un devis envoyé en édition (le club veut le modifier avant réponse).
  function reopenForEdit(id: string) {
    setActionError(null);
    startTransition(async () => {
      const res = await reopenQuoteAction({ quoteId: id });
      if (!res.ok) { setActionError(res.error); return; }
      updateQuote(id, { status: "draft" });
      router.refresh();
    });
  }

  return (
    <div className="qv-root" data-mobile-detail={mobileDetailOpen ? "1" : "0"}>
      <aside className="qv-list" aria-label="Liste des devis">
        <header className="qv-list-header">
          <div className="qv-list-titlebar">
            <h2 className="sy-h2">Devis</h2>
            {counts.todo > 0 && (
              <span className="sy-badge" aria-label={`${counts.todo} à envoyer`}>{counts.todo}</span>
            )}
          </div>
          <Input
            placeholder="Entreprise, expérience, n° DEV…"
            icon={<Icon name="search" size={14} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher un devis"
            style={{ marginTop: 12, height: 38 }}
          />
          <div className="qv-tabs-scroll" style={{ marginTop: 12 }}>
            <Tabs
              variant="pill"
              items={TAB_DEFS.map((t) => ({ id: t.id, label: `${t.label} · ${counts[t.id]}` }))}
              active={tab}
              onChange={(id) => setTab(id as TabId)}
            />
          </div>
        </header>

        <div className="qv-list-body">
          {filtered.length === 0 ? (
            <div className="qv-list-empty">
              <div className="sy-mono">Aucun devis</div>
              <p className="sy-small sy-muted" style={{ marginTop: 6 }}>Ajustez la recherche ou le filtre.</p>
            </div>
          ) : (
            filtered.map((q) => (
              <QuoteListRow
                key={q.id}
                quote={q}
                active={q.id === selected?.id}
                onClick={() => { setSelectedId(q.id); setMobileDetailOpen(true); }}
              />
            ))
          )}
        </div>
      </aside>

      <section className="qv-detail" aria-label="Détail du devis">
        {selected ? (
          <QuoteDetailPane
            quote={selected}
            pending={pending}
            actionError={actionError}
            onBack={() => setMobileDetailOpen(false)}
            onLinesChange={(lines) => setLines(selected.id, lines)}
            onSend={(msg) => sendQuote(selected.id, msg)}
            onReopen={() => reopenForEdit(selected.id)}
          />
        ) : (
          <EmptyDetail />
        )}
      </section>

      <style>{`
        .qv-root { display: flex; flex: 1; min-height: calc(100vh - 60px); align-items: stretch; }
        .qv-list {
          width: 360px; flex: 0 0 auto; border-right: 1px solid var(--line);
          background: var(--surface); display: flex; flex-direction: column;
          position: sticky; top: 0; height: calc(100vh - 60px);
        }
        .qv-list-header { padding: 20px 18px; border-bottom: 1px solid var(--line); }
        .qv-list-titlebar { display: flex; align-items: center; gap: 10px; }
        .qv-tabs-scroll { overflow-x: auto; }
        .qv-tabs-scroll::-webkit-scrollbar { height: 0; }
        .qv-list-body { padding: 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; flex: 1; }
        .qv-list-empty { padding: 28px 12px; text-align: center; }
        .qv-detail { flex: 1; min-width: 0; padding: 28px 36px; }

        @media (max-width: 1180px) { .qv-list { width: 320px; } .qv-detail { padding: 24px 24px; } }
        @media (max-width: 900px)  { .qv-list { width: 286px; } }
        @media (max-width: 768px) {
          .qv-root { flex-direction: column; min-height: auto; }
          .qv-list { width: 100%; position: static; height: auto; border-right: none; border-bottom: 1px solid var(--line); }
          .qv-detail { padding: 18px 16px; }
          .qv-root[data-mobile-detail="1"] .qv-list { display: none; }
          .qv-root[data-mobile-detail="0"] .qv-detail { display: none; }
        }
      `}</style>
    </div>
  );
}

// ─────────────── List row ───────────────
function QuoteListRow({ quote, active, onClick }: { quote: Quote; active: boolean; onClick: () => void }) {
  const { amountTTCCents } = quoteAmounts(quote.lines, quote.clubVatLiable);
  const isRevision = quote.status === "draft" && quote.revisionCount > 0;
  return (
    <button
      type="button"
      className="qv-row"
      data-active={active ? "1" : "0"}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${quote.organizationName} — ${QUOTE_STATUS_LABEL[quote.status]}`}
    >
      <div className="qv-row-top">
        <StatusChip status={quote.status} />
        <span className="sy-mono sy-num qv-row-num">{quote.quoteNumber}</span>
      </div>
      <div className="sy-h4 qv-row-org">{quote.organizationName}</div>
      <div className="sy-small sy-muted qv-row-exp">
        {quote.experienceTitle} · {quote.participants} pers.
      </div>
      <div className="qv-row-foot">
        <span className="sy-mono">
          {isRevision ? "↻ révision demandée" : frDateShort(quote.requestedDateISO)}
        </span>
        <span className="sy-num qv-row-amount">
          {amountTTCCents > 0 ? eurWhole(amountTTCCents) : "—"}
        </span>
      </div>

      <style>{`
        .qv-row {
          width: 100%; text-align: left; background: transparent;
          border: 1.5px solid transparent; border-radius: 12px; padding: 12px 14px;
          cursor: pointer; color: inherit; font: inherit;
          display: flex; flex-direction: column; gap: 4px;
          transition: background .15s ease, border-color .15s ease;
        }
        .qv-row:hover { background: var(--surface-2); }
        .qv-row:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
        .qv-row[data-active="1"] { background: var(--surface-2); border-color: var(--ink); }
        .qv-row-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .qv-row-num { color: var(--ink-3); }
        .qv-row-org { margin-top: 2px; }
        .qv-row-exp { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qv-row-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; }
        .qv-row-amount { font-family: var(--display); font-weight: 700; font-size: 15px; font-variation-settings: var(--display-var); }
      `}</style>
    </button>
  );
}

// ─────────────── Detail pane ───────────────
function QuoteDetailPane({
  quote, pending, actionError, onBack, onLinesChange, onSend, onReopen,
}: {
  quote: Quote;
  pending: boolean;
  actionError: string | null;
  onBack: () => void;
  onLinesChange: (lines: QuoteLine[]) => void;
  onSend: (message: string) => void;
  onReopen: () => void;
}) {
  const q = quote;
  const editable = q.status === "draft";
  const isRevision = editable && q.revisionCount > 0;

  return (
    <>
      <button type="button" className="qv-back" onClick={onBack} aria-label="Retour à la liste">
        <Icon name="arrowLeft" size={14} /><span>Retour</span>
      </button>

      <div className="qv-titlebar">
        <div style={{ minWidth: 0 }}>
          <div className="qv-title-meta">
            <StatusChip status={q.status} />
            <span className="sy-mono sy-num">{q.quoteNumber}</span>
          </div>
          <h1 className="sy-h1 qv-title">{q.experienceTitle}</h1>
          <p className="sy-body qv-sub">
            Demandé par <strong style={{ color: "var(--ink)" }}>{q.organizationName}</strong>
            {q.projectTitle ? <> · finance <span style={{ color: "var(--accent-deep)" }}>{q.projectTitle}</span></> : null}
          </p>
        </div>
        <div className="qv-actions">
          <a className="sy-btn sy-btn-soft" href={`mailto:${q.contactEmail}`}>
            <Icon name="chat" size={14} /> Contacter
          </a>
          {q.status === "sent" && (
            <Btn variant="outline" disabled={pending} onClick={onReopen}>Modifier</Btn>
          )}
          {q.status === "accepted" && q.bookingRef && (
            <span className="sy-chip sy-chip-sm" style={{ background: "var(--primary-soft)", color: "var(--primary-deep)", fontWeight: 600 }}>
              → {q.bookingRef}
            </span>
          )}
        </div>
      </div>

      {isRevision && (
        <div className="qv-hint">
          <Icon name="info" size={15} color="var(--accent-deep)" />
          <span>
            L'entreprise a demandé une <strong>modification</strong> ({q.revisionCount}
            {q.revisionCount > 1 ? "ᵉ" : "ʳᵉ"} révision). Ajustez le devis puis renvoyez-le.
          </span>
        </div>
      )}
      {q.status === "sent" && (
        <div className="qv-hint">
          <Icon name="info" size={15} color="var(--accent-deep)" />
          <span>
            Devis envoyé{q.sentAtLabel ? ` le ${q.sentAtLabel}` : ""}
            {q.validUntilISO ? ` · valable jusqu'au ${frDateLong(q.validUntilISO)}` : ""}.
            En attente de la réponse de l'entreprise.
          </span>
        </div>
      )}

      <div className="qv-cols">
        <div className="qv-col">
          {/* Demande de l'entreprise */}
          <section className="sy-card">
            <div className="sy-mono">Demande de l'entreprise</div>
            <dl className="qv-facts">
              <Fact label="Date souhaitée">
                {frDateLong(q.requestedDateISO)}{q.requestedTime ? ` · ${q.requestedTime.replace(":", "h")}` : ""}
              </Fact>
              <Fact label="Participants">{q.participants} personnes</Fact>
              <Fact label="Lieu">
                {LOCATION_LABEL[q.location]}
                {q.addressForService ? (
                  <span className="qv-fact-addr"><Icon name="pin" size={13} color="var(--ink-3)" /> {q.addressForService}</span>
                ) : null}
              </Fact>
              <Fact label="Reçue le">{q.createdAtLabel}</Fact>
            </dl>
          </section>

          {/* Chiffrage : éditeur (draft) ou lecture seule */}
          <QuoteLinesSection
            quote={q}
            editable={editable}
            pending={pending}
            actionError={actionError}
            onLinesChange={onLinesChange}
            onSend={onSend}
          />

          {/* Fil de discussion */}
          <ThreadSection quote={q} />
        </div>

        <div className="qv-col">
          <PayoutCard quote={q} />

          <section className="sy-card">
            <div className="sy-mono">Entreprise</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <ContactLine label="Société" value={q.organizationName} />
              {q.organizationSiret && <ContactLine label="SIRET" value={q.organizationSiret} />}
              <ContactLine label="Contact" value={q.contactName} />
              <ContactLine label="Email" value={q.contactEmail} href={`mailto:${q.contactEmail}`} />
              {q.contactPhone && <ContactLine label="Téléphone" value={q.contactPhone} />}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .qv-back {
          display: none; align-items: center; gap: 6px; padding: 6px 10px; margin-bottom: 12px;
          background: var(--surface-2); border: none; border-radius: 999px;
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink-2); cursor: pointer;
        }
        .qv-back:hover { background: var(--surface-3); color: var(--ink); }
        .qv-back:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
        .qv-titlebar { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
        .qv-title-meta { display: flex; align-items: center; gap: 10px; }
        .qv-title { margin-top: 12px; font-size: 32px; }
        .qv-sub { margin-top: 8px; }
        .qv-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
        .qv-hint {
          margin-top: 18px; display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px; background: var(--accent-soft);
          color: var(--ink-2); font-size: 13px; line-height: 1.4;
        }
        .qv-cols { margin-top: 22px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: start; }
        .qv-col { display: flex; flex-direction: column; gap: 16px; }
        .qv-facts { margin: 12px 0 0; display: flex; flex-direction: column; }
        .qv-fact { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 10px 0; border-top: 1px solid var(--line); }
        .qv-fact:first-of-type { border-top: none; }
        .qv-fact dt { flex: 0 0 auto; }
        .qv-fact dd { margin: 0; text-align: right; color: var(--ink); font-weight: 500; font-size: 14px; }
        .qv-fact-addr { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; color: var(--ink-2); font-weight: 400; font-size: 13px; }

        @media (max-width: 1180px) { .qv-title { font-size: 28px; } }
        @media (max-width: 900px) { .qv-cols { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .qv-back { display: inline-flex; }
          .qv-titlebar { flex-direction: column; align-items: stretch; }
          .qv-actions { width: 100%; }
          .qv-actions > * { flex: 1; justify-content: center; }
          .qv-title { font-size: 24px; }
        }
      `}</style>
    </>
  );
}

// ─────────────── Lines section (editor / read-only) ───────────────
function QuoteLinesSection({
  quote, editable, pending, actionError, onLinesChange, onSend,
}: {
  quote: Quote;
  editable: boolean;
  pending: boolean;
  actionError: string | null;
  onLinesChange: (lines: QuoteLine[]) => void;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const { amountTTCCents, depositCents, balanceCents } = quoteAmounts(quote.lines, quote.clubVatLiable);

  function patchLine(id: string, patch: Partial<QuoteLine>) {
    onLinesChange(quote.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function addLine() {
    onLinesChange([
      ...quote.lines,
      { id: `l-${Date.now()}`, label: "", quantity: 1, unitPriceCents: 0 },
    ]);
  }
  function removeLine(id: string) {
    onLinesChange(quote.lines.filter((l) => l.id !== id));
  }

  const canSend = quote.lines.length > 0 && quote.lines.every((l) => l.label.trim() && l.unitPriceCents > 0) && amountTTCCents > 0;
  const validUntilPreview = frDateLong(defaultValidUntilISO());

  return (
    <section className="sy-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div className="sy-mono">Devis chiffré</div>
        {editable && (
          <button type="button" className="sy-btn sy-btn-soft sy-btn-sm" onClick={addLine}>
            <Icon name="plus" size={13} /> Ligne
          </button>
        )}
      </div>

      {quote.lines.length === 0 ? (
        <p className="sy-small sy-muted" style={{ marginTop: 12 }}>
          Aucune ligne. Ajoutez les prestations à facturer.
        </p>
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: editable ? 12 : 0 }}>
          {quote.lines.map((l) =>
            editable ? (
              <div key={l.id} className="qv-line-edit">
                <input
                  className="sy-input"
                  value={l.label}
                  placeholder="Intitulé (ex : Atelier cohésion 3h)"
                  onChange={(e) => patchLine(l.id, { label: e.target.value })}
                  aria-label="Intitulé de la ligne"
                />
                <input
                  className="sy-input qv-line-qty"
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => patchLine(l.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  aria-label="Quantité"
                />
                <div className="sy-input qv-line-price">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={l.unitPriceCents / 100}
                    onChange={(e) => patchLine(l.id, { unitPriceCents: Math.max(0, Math.round((Number(e.target.value) || 0) * 100)) })}
                    aria-label="Prix unitaire en euros"
                    style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", textAlign: "right" }}
                  />
                  <span className="sy-muted" style={{ marginLeft: 4 }}>€</span>
                </div>
                <div className="qv-line-sub sy-num">{eurWhole(lineSubtotalCents(l))}</div>
                <button
                  type="button"
                  className="qv-line-del"
                  onClick={() => removeLine(l.id)}
                  aria-label="Supprimer la ligne"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ) : (
              <div key={l.id} className="qv-line-ro">
                <div style={{ minWidth: 0 }}>
                  <div className="sy-small" style={{ color: "var(--ink)", fontWeight: 500 }}>{l.label}</div>
                  {l.detail && <div className="sy-mono" style={{ marginTop: 2 }}>{l.detail}</div>}
                </div>
                <div className="sy-small sy-muted" style={{ whiteSpace: "nowrap" }}>
                  {l.quantity} × {eurDecimal(l.unitPriceCents)}
                </div>
                <div className="qv-line-sub sy-num">{eurWhole(lineSubtotalCents(l))}</div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Totaux */}
      <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
        <TotalRow label="Total TTC" value={eurDecimal(amountTTCCents)} strong />
        <TotalRow label={`Acompte (${Math.round(DEPOSIT_RATE * 100)} %)`} value={eurDecimal(depositCents)} />
        <TotalRow label="Solde avant l'événement" value={eurDecimal(balanceCents)} />
        {/* TVA selon Club.vatLiable (décision §11) — lignes saisies HT. */}
        <div className="sy-mono" style={{ marginTop: 8, color: "var(--ink-3)" }}>
          Lignes HT · {quote.clubVatLiable ? "TVA 20 % appliquée" : "club non assujetti (TVA 0 %)"}
        </div>
      </div>

      {/* Envoi (draft uniquement) */}
      {editable && (
        <div style={{ marginTop: 16 }}>
          <label className="sy-label" htmlFor="qv-send-msg">Message à l'entreprise (optionnel)</label>
          <textarea
            id="qv-send-msg"
            className="sy-input sy-textarea"
            style={{ marginTop: 6 }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bonjour, voici votre devis pour…"
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <div className="sy-small sy-muted">
              <Icon name="calendar" size={12} /> Validité : jusqu'au {validUntilPreview}
            </div>
            <Btn
              variant="primary"
              disabled={!canSend || pending}
              onClick={() => onSend(message)}
              iconRight={<Icon name="arrow" size={15} color="#fff" />}
            >
              {pending ? "Envoi…" : quote.revisionCount > 0 ? "Renvoyer le devis" : "Envoyer le devis"}
            </Btn>
          </div>
          {actionError && (
            <p className="sy-small" role="alert" style={{ marginTop: 8, color: "var(--danger)" }}>{actionError}</p>
          )}
          {!canSend && (
            <div className="sy-small sy-muted" style={{ marginTop: 8 }}>
              Renseignez au moins une ligne avec un intitulé et un prix avant l'envoi.
            </div>
          )}
        </div>
      )}

      <style>{`
        /* Intitulé sur sa propre ligne, contrôles en dessous : robuste même quand
           le panneau détail est étroit (liste + sidebar mangent la largeur). */
        .qv-line-edit {
          display: grid; gap: 8px; align-items: center;
          grid-template-columns: 64px 1fr auto 36px;
          grid-template-areas: "label label label label" "qty price sub del";
          padding-bottom: 12px; border-bottom: 1px dashed var(--line-2);
        }
        .qv-line-edit > :nth-child(1) { grid-area: label; }
        .qv-line-edit > :nth-child(2) { grid-area: qty; }
        .qv-line-edit > :nth-child(3) { grid-area: price; }
        .qv-line-edit > :nth-child(4) { grid-area: sub; }
        .qv-line-edit > :nth-child(5) { grid-area: del; }
        .qv-line-qty { text-align: center; padding: 0 8px; }
        .qv-line-price { display: flex; align-items: center; padding: 0 10px; }
        .qv-line-sub {
          text-align: right; font-family: var(--display); font-weight: 700; font-size: 14px;
          font-variation-settings: var(--display-var);
        }
        .qv-line-del {
          width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
          background: var(--surface-2); color: var(--ink-3);
          display: inline-flex; align-items: center; justify-content: center;
        }
        .qv-line-del:hover { background: var(--surface-3); color: var(--danger); }
        .qv-line-del:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
        .qv-line-ro {
          display: grid; grid-template-columns: 1fr auto 92px; gap: 12px; align-items: center;
          padding: 10px 0; border-top: 1px solid var(--line);
        }
        .qv-line-ro:first-child { border-top: none; }
      `}</style>
    </section>
  );
}

// ─────────────── Thread ───────────────
function ThreadSection({ quote }: { quote: Quote }) {
  if (quote.thread.length === 0) return null;
  return (
    <section className="sy-card">
      <div className="sy-mono">Échanges</div>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {quote.thread.map((m) => (
          <li
            key={m.id}
            style={{
              padding: "10px 12px", borderRadius: 12,
              background: m.from === "club" ? "var(--primary-soft)" : "var(--surface-2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span className="sy-small" style={{ fontWeight: 600, color: "var(--ink)" }}>{m.author}</span>
              <span className="sy-mono">{m.atLabel}</span>
            </div>
            <p className="sy-small" style={{ marginTop: 4, color: "var(--ink-2)" }}>{m.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────── Payout card (vue club, SPEC §5) ───────────────
function PayoutCard({ quote }: { quote: Quote }) {
  // SPEC §5 — la commission Sociuly (6 % du TTC) est visible côté club (payout net),
  // jamais surfacée à l'acheteur. Affichage indicatif ; l'autorité de calcul est
  // computeBookingAmounts (serveur). TVA selon Club.vatLiable (décision §11).
  const { amountTTCCents, depositCents, balanceCents } = quoteAmounts(quote.lines, quote.clubVatLiable);
  const feeCents = Math.round(amountTTCCents * 0.06);
  const netCents = amountTTCCents - feeCents;

  return (
    <section className="sy-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 18 }}>
        <div className="sy-mono">Montant</div>
        <Line label="Total TTC (entreprise)" value={eurDecimal(amountTTCCents)} />
        <Line label={`Acompte (${Math.round(DEPOSIT_RATE * 100)} %)`} value={eurDecimal(depositCents)} muted />
        <Line label="Solde avant l'événement" value={eurDecimal(balanceCents)} muted />
        <Line label="Commission Sociuly (6 %)" value={`−${eurDecimal(feeCents)}`} muted />
      </div>
      <div style={{ padding: 18, background: "var(--accent-soft)" }}>
        <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>Versé au club</div>
        <div
          className="sy-num"
          style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, lineHeight: 1, marginTop: 6, fontVariationSettings: "var(--display-var)" }}
        >
          {eurDecimal(netCents)}
        </div>
        <div className="sy-small" style={{ marginTop: 8, color: "var(--ink-2)" }}>
          {quote.status === "accepted"
            ? "Devis accepté — versement automatique J+1 après l'événement."
            : "Estimation — confirmée à l'acceptation du devis par l'entreprise."}
        </div>
      </div>
    </section>
  );
}

// ─────────────── Bits ───────────────
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="qv-fact">
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
        <a className="sy-link" href={href} style={{ fontSize: 14, fontWeight: 500, textAlign: "right" }}>{value}</a>
      ) : (
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", textAlign: "right" }}>{value}</span>
      )}
    </div>
  );
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="sy-small" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
      <span className="sy-muted">{label}</span>
      <span className="sy-num" style={{ fontWeight: strong ? 700 : 500, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="sy-small" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
      <span className="sy-muted">{label}</span>
      <span className="sy-num" style={{ color: muted ? "var(--ink-2)" : "var(--ink)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: 40, gap: 12 }}>
      <div aria-hidden style={{ width: 56, height: 56, borderRadius: 16, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="chat" size={24} color="var(--ink-3)" />
      </div>
      <h2 className="sy-h2">Aucun devis sélectionné</h2>
      <p className="sy-body" style={{ maxWidth: 360 }}>
        Sélectionnez une demande dans la liste pour la chiffrer et l'envoyer à l'entreprise.
      </p>
    </div>
  );
}
