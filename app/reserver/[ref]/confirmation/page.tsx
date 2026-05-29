import Link from "next/link";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo, SiteFooter } from "@/components/ds/patterns";
import { ImpactHero } from "@/components/ds/impact";
import { BookingStepper } from "@/components/booking/stepper";

type Props = { params: Promise<{ ref: string }> };

export default async function BookingConfirmationPage({ params }: Props) {
  const { ref } = await params;

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Slim top bar */}
      <div
        style={{
          padding: "16px 32px", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 24, flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <BookingStepper active={4} />
        <div className="sy-mono">✓ confirmation</div>
      </div>

      <div style={{ padding: "60px 48px", maxWidth: 920, margin: "0 auto" }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%", background: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 22px",
          }}
        >
          <Icon name="check" size={36} color="#fff" />
        </div>

        <h1
          className="sy-display-sm"
          style={{ textAlign: "center", maxWidth: 620, margin: "0 auto", fontSize: 48, lineHeight: 1.05 }}
        >
          C&apos;est réservé. Et grâce à vous,{" "}
          <span style={{ color: "var(--accent)" }}>le projet U17 avance.</span>
        </h1>

        <p
          className="sy-body-l"
          style={{ textAlign: "center", marginTop: 14, color: "var(--ink-2)" }}
        >
          Confirmation envoyée à{" "}
          <b style={{ color: "var(--ink)" }}>camille.l@example.com</b>.
          USB Volley vous contactera sous 24h pour caler les détails.
        </p>

        <div
          className="sy-mono"
          style={{ textAlign: "center", marginTop: 10, color: "var(--ink-3)" }}
        >
          Référence · {ref}
        </div>

        <div style={{ marginTop: 36 }}>
          <ImpactHero />
        </div>

        <div
          style={{
            marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
          }}
        >
          <Btn variant="primary" size="lg" icon={<Icon name="download" size={15} color="#fff" />}>
            Télécharger le reçu
          </Btn>
          <Btn variant="outline" size="lg" icon={<Icon name="share" size={15} />}>
            Partager le projet
          </Btn>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
