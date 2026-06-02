import Link from "next/link";
import { Btn, Card, Field, Input, Stars, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo } from "@/components/ds/patterns";
import { ImpactMini } from "@/components/ds/impact";
import { BookingStepper } from "@/components/booking/stepper";

type Props = { params: Promise<{ ref: string }> };

type SectionState = "done" | "active" | "upcoming";

function BookSection({
  n, title, state, open, children, summary,
}: {
  n: number;
  title: string;
  state: SectionState;
  open?: boolean;
  children?: React.ReactNode;
  summary?: string;
}) {
  const isActive = state === "active";
  return (
    <Card
      style={{
        padding: 0, overflow: "hidden",
        border: isActive ? "1.5px solid var(--ink)" : "1px solid var(--line)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          padding: "18px 22px", display: "flex", alignItems: "center", gap: 14,
          borderBottom: open ? "1px solid var(--line)" : "none",
        }}
      >
        <div
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background:
              state === "done" ? "var(--primary)" :
              isActive       ? "var(--ink)" :
                               "var(--surface-2)",
            color:
              state === "done" ? "#fff" :
              isActive       ? "var(--surface)" :
                               "var(--ink-3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13,
          }}
        >
          {state === "done" ? <Icon name="check" size={14} color="#fff" /> : n}
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="sy-h3">{title}</h3>
          {!open && summary && <div className="sy-small sy-muted" style={{ marginTop: 2 }}>{summary}</div>}
        </div>
        {state === "done" && !open && <Btn variant="ghost" size="sm">Modifier</Btn>}
      </div>
      {open && <div style={{ padding: "20px 22px" }}>{children}</div>}
    </Card>
  );
}

// Montants de démonstration (cents). En Phase B ils viennent du Quote accepté.
// SPEC §4 — acompte par défaut 30%, solde réglé avant l'événement.
const TOTAL_TTC_CENTS = 480_000;
const DEPOSIT_RATE = 0.3;
const DEPOSIT_CENTS = Math.round(TOTAL_TTC_CENTS * DEPOSIT_RATE);
const BALANCE_CENTS = TOTAL_TTC_CENTS - DEPOSIT_CENTS;

const eur = (cents: number) =>
  `€${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Récapitulatif de réservation (rail droit).
 *
 * SPEC §5 : « prix TTC visible pour l'acheteur = montant payé. La commission
 * Sociuly (6% du TTC) n'est pas surfacée publiquement. » On affiche donc le
 * montant TTC du devis comme total, sans ligne de commission séparée.
 *
 * TODO(§11) — décomposition HT / TVA / TTC pour la facture : la base TVA dépend
 * de Club.vatLiable (club pro assujetti vs loi 1901 exonéré) ET du traitement
 * de la TVA sur la commission Sociuly. Décision comptable OUVERTE (SPEC §11) :
 * ne pas figer de taux ici. L'acheteur ne voit que le TTC + l'échéancier.
 */
function BookingSummary() {
  return (
    <Card
      variant="elevated"
      style={{ padding: 0, overflow: "hidden", borderRadius: "var(--radius-lg)" }}
    >
      <div style={{ display: "flex", gap: 12, padding: 18, borderBottom: "1px solid var(--line)" }}>
        <div
          className="sy-img"
          style={{
            width: 80, height: 80, flex: "0 0 auto", borderRadius: 12,
            background: "linear-gradient(135deg, #1f4b3f 0%, #14332b 100%)",
          }}
        />
        <div style={{ flex: 1 }}>
          <div className="sy-mono">SIG Strasbourg</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>Journée immersion · SIG</div>
          <div className="sy-small sy-muted" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Stars value={4.9} size={11} /> 4.9 (47)
          </div>
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <Row label="Date" value="lun. 16 juin · 09h00" />
        <Row label="Participants" value="40 personnes" />
        <Row label="Lieu" value="Rhénus Sport, Strasbourg" />
        <hr className="sy-divider" style={{ margin: "14px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="sy-h3">Total TTC</div>
          <div
            className="sy-num"
            style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 28,
              fontVariationSettings: "var(--display-var)",
            }}
          >
            {eur(TOTAL_TTC_CENTS)}
          </div>
        </div>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "var(--surface-2)" }}>
          <Row label="Acompte à régler aujourd'hui (30%)" value={eur(DEPOSIT_CENTS)} />
          <Row label="Solde avant l'événement" value={eur(BALANCE_CENTS)} />
        </div>
      </div>
      <div style={{ padding: 18, background: "var(--accent-soft)" }}>
        <ImpactMini />
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="sy-small"
      style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}
    >
      <span className="sy-muted">{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default async function BookingPage({ params }: Props) {
  const { ref } = await params;
  // Pretend booking number generated server-side. In Phase B this lives in DB.
  const fakeBookingNumber = "SOC-2026-00042";
  const prestationSlug = ref;

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Slim top bar */}
      <div
        style={{
          padding: "16px var(--page-pad)", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, background: "var(--surface)", flexWrap: "wrap",
        }}
      >
        <Link href={`/experiences/${prestationSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <BookingStepper active={1} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="lock" size={14} color="var(--ink-3)" />
          <span className="sy-mono">paiement sécurisé Stripe</span>
        </div>
      </div>

      <div className="booking-grid">
        <div>
          <h1 className="sy-h1" style={{ marginBottom: 6 }}>Finalisez votre commande</h1>
          <p className="sy-small sy-muted" style={{ marginBottom: 22 }}>
            Plus que quelques étapes — votre commande finance directement l&apos;école de jeunes U17 de la SIG Strasbourg.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BookSection
              n={1}
              state="done"
              title="Détails de l'expérience"
              summary="lun. 16 juin · 09h00 · 40 personnes · Rhénus Sport, Strasbourg"
            />

            <BookSection n={2} state="active" open title="Coordonnées de l'entreprise">
              <Field label="Entreprise">
                <Input defaultValue="Klaxoon SAS" />
              </Field>
              <div style={{ height: 14 }} />
              <Field label="Contact référent">
                <Input defaultValue="Camille Léger · Office Manager" />
              </Field>
              <div style={{ height: 14 }} />
              <Field label="Téléphone (optionnel)" hint="Pour faciliter la coordination le jour J">
                <Input defaultValue="06 12 34 56 78" />
              </Field>
              <div style={{ height: 14 }} />
              <Field
                label="Message au club"
                hint="Précisez vos attentes : effectif définitif, contraintes d'accès, besoins logistiques…"
              >
                <Textarea defaultValue="Bonjour, c'est pour notre séminaire annuel d'équipe. Nous serons 40 collaborateurs (dont 6 à mobilité réduite). Prévoir une salle au calme pour le débrief de l'après-midi si possible. Merci !" />
              </Field>

              <div
                style={{
                  display: "flex", justifyContent: "space-between", marginTop: 20,
                  flexWrap: "wrap", gap: 8,
                }}
              >
                <Link href={`/experiences/${prestationSlug}`} style={{ textDecoration: "none" }}>
                  <Btn variant="ghost">← Étape précédente</Btn>
                </Link>
                <Link
                  href={`/reserver/${fakeBookingNumber}/confirmation`}
                  style={{ textDecoration: "none" }}
                >
                  <Btn variant="dark" iconRight={<Icon name="arrow" size={14} color="#fff" />}>
                    Continuer vers l&apos;acompte
                  </Btn>
                </Link>
              </div>
            </BookSection>

            <BookSection n={3} state="upcoming" title="Acompte (30%)" />
          </div>
        </div>

        <aside>
          <div style={{ position: "sticky", top: 16 }}>
            <BookingSummary />
          </div>
        </aside>
      </div>

      <style>{`
        .booking-grid {
          padding: 28px var(--page-pad);
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .booking-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .booking-grid { padding-top: 20px; padding-bottom: 20px; }
        }
      `}</style>
    </main>
  );
}
