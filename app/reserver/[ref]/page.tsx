import Link from "next/link";
import { Btn, Card, Field, Input, Stars, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo } from "@/components/ds/patterns";
import { ImpactMini } from "@/components/ds/impact";
import { BookingStepper } from "@/components/booking/stepper";
import { TipSelector } from "@/components/booking/tip-selector";

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

/**
 * Booking summary right rail.
 *
 * Per SPEC §5: "Affichage prix : prix TTC visible pour le client = montant payé.
 * La commission n'est pas surfacée publiquement." We therefore show the prestation
 * price as the total (no separate Sociuly fee line) — this differs from the
 * Hi-Fi maquette which surfaced a 3% fee line. Source-of-truth conflict; SPEC wins.
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
          <div className="sy-mono">USB Volley</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>Barbecue convivial</div>
          <div className="sy-small sy-muted" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Stars value={4.9} size={11} /> 4.9 (47)
          </div>
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <Row label="Date" value="sam. 14 juin · 16h00" />
        <Row label="Participants" value="24 personnes" />
        <Row label="Lieu" value="12 rue de Vannes" />
        <hr className="sy-divider" style={{ margin: "14px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="sy-h3">Total</div>
          <div
            className="sy-num"
            style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 28,
              fontVariationSettings: "var(--display-var)",
            }}
          >
            €280,00
          </div>
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
          padding: "16px 32px", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, background: "var(--surface)", flexWrap: "wrap",
        }}
      >
        <Link href={`/prestations/${prestationSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
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
          <h1 className="sy-h1" style={{ marginBottom: 6 }}>Finalisez votre réservation</h1>
          <p className="sy-small sy-muted" style={{ marginBottom: 22 }}>
            Plus que quelques étapes — votre soutien ira directement au tournoi U17 d&apos;USB Volley.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BookSection
              n={1}
              state="done"
              title="Détails de la prestation"
              summary="sam. 14 juin · 16h00 · 24 personnes · 12 rue de Vannes"
            />

            <BookSection n={2} state="active" open title="Message à l'association">
              <Field label="Votre nom">
                <Input defaultValue="Camille Léger" />
              </Field>
              <div style={{ height: 14 }} />
              <Field label="Téléphone (optionnel)" hint="Pour faciliter la coordination le jour J">
                <Input defaultValue="06 12 34 56 78" />
              </Field>
              <div style={{ height: 14 }} />
              <Field
                label="Message au club"
                hint="Précisez vos attentes, allergies, contraintes d'accès…"
              >
                <Textarea defaultValue="Bonjour, c'est pour l'anniversaire de mon père (65 ans). On sera plutôt 22 adultes + 2 enfants. Pas d'allergies particulières, mais on aimerait des merguez et des saucisses végé." />
              </Field>
              <div style={{ height: 14 }} />

              <Card variant="accent" style={{ padding: 16, borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon name="sparkle" size={16} color="var(--accent-deep)" />
                  <div className="sy-h4">Ajouter un coup de pouce au projet ?</div>
                </div>
                <div className="sy-small" style={{ color: "var(--ink-2)" }}>
                  100% reversé au tournoi U17. Optionnel et déductible d&apos;impôts.
                </div>
                <TipSelector projectName="le tournoi U17" />
              </Card>

              <div
                style={{
                  display: "flex", justifyContent: "space-between", marginTop: 20,
                  flexWrap: "wrap", gap: 8,
                }}
              >
                <Link href={`/prestations/${prestationSlug}`} style={{ textDecoration: "none" }}>
                  <Btn variant="ghost">← Étape précédente</Btn>
                </Link>
                <Link
                  href={`/reserver/${fakeBookingNumber}/confirmation`}
                  style={{ textDecoration: "none" }}
                >
                  <Btn variant="dark" iconRight={<Icon name="arrow" size={14} color="#fff" />}>
                    Continuer vers le paiement
                  </Btn>
                </Link>
              </div>
            </BookSection>

            <BookSection n={3} state="upcoming" title="Paiement" />
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
          padding: 28px 48px;
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .booking-grid { grid-template-columns: 1fr; padding: 24px 24px; }
        }
      `}</style>
    </main>
  );
}
