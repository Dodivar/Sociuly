"use client";

// Vue entreprise d'un devis — /devis/[ref] (SPEC §4/§6).
// L'org_buyer consulte le devis envoyé par le club et décide :
//   • Accepter   → Quote.accepted + Booking(quote_accepted) → règlement de l'acompte ;
//   • Demander une modification → retour au club (Quote.draft, révision) ;
//   • Refuser    → Quote.refused.
//
// Les décisions appellent les Server Actions (lib/actions/quotes.ts) : acceptation
// → Quote(accepted) + Booking, révision → retour au club, refus → Quote(refused).
// L'état local est mis à jour optimiste puis resynchronisé via router.refresh().
// La commission Sociuly (6 %) n'est jamais affichée ici (SPEC §5).

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  acceptQuoteAction,
  refuseQuoteAction,
  requestRevisionAction,
} from "@/lib/actions/quotes";
import { Btn, Card } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { ImpactMini } from "@/components/ds/impact";
import {
  DEPOSIT_RATE,
  LOCATION_LABEL,
  daysUntil,
  eurDecimal,
  frDateLong,
  lineSubtotalCents,
  quoteAmounts,
  type Quote,
  type QuoteStatus,
  type QuoteThreadEntry,
} from "@/lib/devis/quotes";

type Props = { quote: Quote };

export function QuoteView({ quote }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [thread, setThread] = useState<QuoteThreadEntry[]>(quote.thread);
  const [bookingRef, setBookingRef] = useState<string | undefined>(quote.bookingRef);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState("");
  const [refuseOpen, setRefuseOpen] = useState(false);

  const { amountTTCCents, depositCents, balanceCents } = quoteAmounts(quote.lines, quote.clubVatLiable);
  const remaining = quote.validUntilISO ? daysUntil(quote.validUntilISO) : null;
  const expired = status === "expired" || (status === "sent" && remaining !== null && remaining < 0);

  const authorName = quote.contactName.split(" · ")[0];
  function optimisticEntry(kind: QuoteThreadEntry["kind"], body: string): QuoteThreadEntry {
    return { id: `t-${Date.now()}`, from: "org", author: authorName, atLabel: "à l'instant", kind, body };
  }

  // ── Décisions (Server Actions, lib/actions/quotes.ts) ───────────────────────
  function accept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptQuoteAction({ ref: quote.ref });
      if (!res.ok) { setError(res.error); return; }
      setBookingRef(res.bookingRef);
      setStatus("accepted");
      setThread((t) => [...t, optimisticEntry("decision", "Devis accepté. Je procède au règlement de l'acompte.")]);
      router.refresh();
    });
  }
  function requestRevision() {
    const msg = revisionMsg.trim();
    if (!msg) return;
    setError(null);
    startTransition(async () => {
      const res = await requestRevisionAction({ ref: quote.ref, message: msg });
      if (!res.ok) { setError(res.error); return; }
      setStatus("draft");
      setThread((t) => [...t, optimisticEntry("revision", msg)]);
      setRevisionOpen(false);
      setRevisionMsg("");
      router.refresh();
    });
  }
  function refuse() {
    setError(null);
    startTransition(async () => {
      const res = await refuseQuoteAction({ ref: quote.ref });
      if (!res.ok) { setError(res.error); return; }
      setStatus("refused");
      setThread((t) => [...t, optimisticEntry("decision", "Devis refusé.")]);
      setRefuseOpen(false);
      router.refresh();
    });
  }

  // Réf. de réservation pour régler l'acompte (présente sur un devis déjà accepté côté serveur).
  const checkoutHref = bookingRef
    ? `/reserver/${bookingRef}?slug=${quote.experienceSlug}`
    : null;

  return (
    <div className="qd-grid">
      {/* Colonne principale */}
      <div>
        <div className="sy-mono" style={{ marginBottom: 6 }}>
          Devis {quote.quoteNumber} · {quote.clubName}
        </div>
        <h1 className="sy-h1" style={{ fontSize: 32 }}>{quote.experienceTitle}</h1>
        <p className="sy-body sy-muted" style={{ marginTop: 6 }}>
          Proposé par <strong style={{ color: "var(--ink)" }}>{quote.clubName}</strong>
          {quote.projectTitle ? <> · finance <span style={{ color: "var(--accent-deep)" }}>{quote.projectTitle}</span></> : null}
        </p>

        <StatusBanner status={status} expired={expired} remaining={remaining} />

        {/* Récap de la demande */}
        <Card style={{ marginTop: 18, padding: 20 }}>
          <div className="sy-mono">Votre demande</div>
          <div className="qd-facts">
            <Fact label="Date souhaitée">
              {frDateLong(quote.requestedDateISO)}{quote.requestedTime ? ` · ${quote.requestedTime.replace(":", "h")}` : ""}
            </Fact>
            <Fact label="Participants">{quote.participants} personnes</Fact>
            <Fact label="Lieu">
              {LOCATION_LABEL[quote.location]}
              {quote.addressForService ? <span style={{ display: "block", color: "var(--ink-2)", fontWeight: 400, fontSize: 13, marginTop: 2 }}>{quote.addressForService}</span> : null}
            </Fact>
          </div>
        </Card>

        {/* Détail chiffré */}
        <Card style={{ marginTop: 16, padding: 20 }}>
          <div className="sy-mono">Détail du devis</div>
          <div style={{ marginTop: 12 }}>
            {quote.lines.map((l) => (
              <div key={l.id} className="qd-line">
                <div style={{ minWidth: 0 }}>
                  <div className="sy-small" style={{ color: "var(--ink)", fontWeight: 500 }}>{l.label}</div>
                  {l.detail && <div className="sy-mono" style={{ marginTop: 2 }}>{l.detail}</div>}
                  <div className="sy-mono" style={{ marginTop: 2 }}>{l.quantity} × {eurDecimal(l.unitPriceCents)}</div>
                </div>
                <div className="sy-num qd-line-sub">{eurDecimal(lineSubtotalCents(l))}</div>
              </div>
            ))}
          </div>
          <hr className="sy-divider" style={{ margin: "14px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="sy-h3">Total TTC</div>
            <div className="sy-num" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, fontVariationSettings: "var(--display-var)" }}>
              {eurDecimal(amountTTCCents)}
            </div>
          </div>
          {/* TODO(§11) — ventilation HT/TVA : décision comptable OUVERTE. */}
          <div className="sy-mono" style={{ marginTop: 4, color: "var(--ink-3)" }}>
            Montant payé par votre entreprise · TVA selon statut du club
          </div>
        </Card>

        {/* Conditions */}
        <Card style={{ marginTop: 16, padding: 20 }}>
          <div className="sy-mono">Conditions</div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--ink-2)" }} className="sy-small">
            <li>Acompte de {Math.round(DEPOSIT_RATE * 100)} % à l'acceptation, solde dû avant l'événement.</li>
            <li>L'acompte n'est pas remboursable une fois le devis accepté (CGV §4).</li>
            <li>Annulation par le club : remboursement intégral.</li>
            {quote.validUntilISO && <li>Devis valable jusqu'au {frDateLong(quote.validUntilISO)}.</li>}
          </ul>
        </Card>

        {/* Échanges */}
        {thread.length > 0 && (
          <Card style={{ marginTop: 16, padding: 20 }}>
            <div className="sy-mono">Échanges avec le club</div>
            <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {thread.map((m) => (
                <li key={m.id} style={{ padding: "10px 12px", borderRadius: 12, background: m.from === "org" ? "var(--accent-soft)" : "var(--surface-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span className="sy-small" style={{ fontWeight: 600, color: "var(--ink)" }}>{m.author}</span>
                    <span className="sy-mono">{m.atLabel}</span>
                  </div>
                  <p className="sy-small" style={{ marginTop: 4, color: "var(--ink-2)" }}>{m.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Rail de décision */}
      <aside>
        <div style={{ position: "sticky", top: 16 }}>
          <Card variant="elevated" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div className="sy-h3">Montant TTC</div>
              <div className="sy-num" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, fontVariationSettings: "var(--display-var)" }}>
                {eurDecimal(amountTTCCents)}
              </div>
            </div>
            <div style={{ marginTop: 12, padding: 12, borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
              <Row label={`Acompte (${Math.round(DEPOSIT_RATE * 100)} %)`} value={eurDecimal(depositCents)} strong />
              <Row label="Solde avant l'événement" value={eurDecimal(balanceCents)} />
            </div>

            {/* Actions selon le statut */}
            <div style={{ marginTop: 16 }}>
              {status === "sent" && !expired && (
                <>
                  <Btn variant="primary" size="lg" block onClick={accept} disabled={pending} icon={<Icon name="check" size={16} color="#fff" />}>
                    {pending ? "Traitement…" : "Accepter le devis"}
                  </Btn>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Btn variant="outline" block disabled={pending} onClick={() => { setRevisionOpen((v) => !v); setRefuseOpen(false); }}>
                      Demander une modif.
                    </Btn>
                    <Btn variant="ghost" block disabled={pending} onClick={() => { setRefuseOpen((v) => !v); setRevisionOpen(false); }}>
                      Refuser
                    </Btn>
                  </div>
                  {error && (
                    <p className="sy-small" role="alert" style={{ marginTop: 10, color: "var(--danger)" }}>{error}</p>
                  )}

                  {revisionOpen && (
                    <div style={{ marginTop: 12 }}>
                      <label className="sy-label" htmlFor="qd-rev">Que faut-il ajuster ?</label>
                      <textarea
                        id="qd-rev"
                        className="sy-input sy-textarea"
                        style={{ marginTop: 6 }}
                        value={revisionMsg}
                        onChange={(e) => setRevisionMsg(e.target.value)}
                        placeholder="Ex : pouvez-vous ajouter une collation et revoir l'effectif à 30 ?"
                      />
                      <Btn variant="dark" block style={{ marginTop: 8 }} disabled={pending || !revisionMsg.trim()} onClick={requestRevision}>
                        {pending ? "Envoi…" : "Envoyer au club"}
                      </Btn>
                    </div>
                  )}
                  {refuseOpen && (
                    <div style={{ marginTop: 12, padding: 12, borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                      <p className="sy-small" style={{ color: "var(--ink-2)" }}>
                        Confirmer le refus de ce devis ? Le club en sera informé.
                      </p>
                      <Btn variant="dark" block style={{ marginTop: 8 }} disabled={pending} onClick={refuse}>
                        {pending ? "Traitement…" : "Confirmer le refus"}
                      </Btn>
                    </div>
                  )}
                </>
              )}

              {status === "accepted" && (
                <>
                  <div className="qd-ok">
                    <Icon name="check" size={16} color="var(--primary-deep)" />
                    <span>Devis accepté. Réglez l'acompte pour confirmer la date.</span>
                  </div>
                  {checkoutHref ? (
                    <Link href={checkoutHref} style={{ textDecoration: "none", display: "block", marginTop: 12 }}>
                      <Btn variant="primary" size="lg" block icon={<Icon name="lock" size={15} color="#fff" />}>
                        Régler l'acompte · {eurDecimal(depositCents)}
                      </Btn>
                    </Link>
                  ) : (
                    <div className="sy-small sy-muted" style={{ marginTop: 12 }}>
                      Un email vous est envoyé avec le lien de paiement sécurisé de l'acompte.
                      {/* Lien dev : le parcours réel passe par le magic-link de l'email. */}
                      <Link href={`/reserver/SOC-2026-00042?slug=journee-immersion-sig`} className="sy-link" style={{ display: "block", marginTop: 6 }}>
                        Voir un exemple de paiement d'acompte →
                      </Link>
                    </div>
                  )}
                </>
              )}

              {status === "draft" && (
                <div className="qd-pending">
                  <Icon name="info" size={16} color="var(--accent-deep)" />
                  <span>Votre demande de modification a été transmise. Le club vous renverra un devis ajusté.</span>
                </div>
              )}

              {status === "refused" && (
                <div className="qd-pending"><Icon name="info" size={16} color="var(--ink-3)" /><span>Vous avez refusé ce devis.</span></div>
              )}

              {expired && (
                <div className="qd-pending">
                  <Icon name="info" size={16} color="var(--ink-3)" />
                  <span>Ce devis a expiré. Contactez le club pour en obtenir un nouveau.</span>
                </div>
              )}
            </div>

            <div className="sy-small sy-muted" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
              <Icon name="lock" size={12} color="var(--ink-3)" /> Paiement sécurisé Stripe
            </div>
          </Card>

          <div style={{ marginTop: 16 }}>
            <ImpactMini />
          </div>
        </div>
      </aside>

      <style>{`
        .qd-grid {
          padding: 28px var(--page-pad); max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 360px; gap: 32px;
        }
        .qd-facts { margin-top: 12px; display: flex; flex-direction: column; }
        .qd-fact { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 10px 0; border-top: 1px solid var(--line); }
        .qd-fact:first-of-type { border-top: none; }
        .qd-fact dt { flex: 0 0 auto; }
        .qd-fact dd { margin: 0; text-align: right; color: var(--ink); font-weight: 500; font-size: 14px; }
        .qd-line { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line); }
        .qd-line:first-child { border-top: none; }
        .qd-line-sub { font-family: var(--display); font-weight: 700; font-size: 15px; font-variation-settings: var(--display-var); white-space: nowrap; }
        .qd-ok, .qd-pending { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.4; }
        .qd-ok { background: var(--primary-soft); color: var(--primary-deep); }
        .qd-pending { background: var(--surface-2); color: var(--ink-2); }
        @media (max-width: 1024px) { .qd-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function StatusBanner({ status, expired, remaining }: { status: QuoteStatus; expired: boolean; remaining: number | null }) {
  if (status === "sent" && !expired) {
    return (
      <div className="qd-bann" style={{ background: "var(--accent-soft)", color: "var(--ink-2)" }}>
        <Icon name="info" size={15} color="var(--accent-deep)" />
        <span>
          Le club vous a envoyé ce devis.
          {remaining !== null && remaining >= 0 ? ` Il reste ${remaining} jour${remaining > 1 ? "s" : ""} pour l'accepter.` : ""}
        </span>
        <style>{BANN_CSS}</style>
      </div>
    );
  }
  return null;
}

const BANN_CSS = `.qd-bann { margin-top: 16px; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.4; }`;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="qd-fact">
      <dt className="sy-mono">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="sy-small" style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
      <span className="sy-muted">{label}</span>
      <span className="sy-num" style={{ fontWeight: strong ? 700 : 500, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}
