import Link from "next/link";
import { Btn, Chip } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

type SearchParams = Promise<{
  stripe?: string;
  nom?: string;
}>;

export default async function ConfirmationPage({ searchParams }: { searchParams: SearchParams }) {
  const { stripe, nom } = await searchParams;
  const nomAssociation = nom ? decodeURIComponent(nom) : null;
  const stripeIsPending = stripe === "pending" || !stripe;

  return (
    <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>

      {/* Success icon */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "var(--primary-soft)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="check" size={36} color="var(--primary-deep)" />
      </div>

      {/* Main message */}
      <div style={{ textAlign: "center" }}>
        <h1 className="sy-h1">Dossier soumis avec succès</h1>
        {nomAssociation && (
          <p className="sy-body-l" style={{ marginTop: 8 }}>
            Bienvenue, <strong>{nomAssociation}</strong> !
          </p>
        )}
        <p className="sy-body" style={{ marginTop: 12 }}>
          Votre dossier est en cours d'examen par notre équipe.
          Vous recevrez un email de confirmation dans les prochaines minutes,
          et une réponse sous <strong>48 heures ouvrées</strong>.
        </p>
      </div>

      {/* Status cards */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
          background: "var(--primary-soft)", borderRadius: "var(--radius-md)" }}>
          <Icon name="check" size={18} color="var(--primary-deep)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div className="sy-h4" style={{ color: "var(--primary-deep)" }}>Documents reçus</div>
            <div className="sy-small" style={{ color: "var(--primary-deep)", opacity: 0.8, marginTop: 2 }}>
              Statuts, RIB et attestation d'assurance transmis et en attente de vérification
            </div>
          </div>
        </div>

        {stripeIsPending ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
            background: "var(--highlight-soft)", borderRadius: "var(--radius-md)" }}>
            <Icon name="info" size={18} color="#6e5111" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div className="sy-h4" style={{ color: "#6e5111" }}>Compte bancaire à finaliser</div>
              <div className="sy-small" style={{ color: "#6e5111", opacity: 0.9, marginTop: 2 }}>
                Vous recevrez un email pour configurer votre compte Stripe Connect
                dès validation de votre dossier KYC
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
            background: "var(--primary-soft)", borderRadius: "var(--radius-md)" }}>
            <Icon name="euro" size={18} color="var(--primary-deep)" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div className="sy-h4" style={{ color: "var(--primary-deep)" }}>Compte bancaire configuré</div>
              <div className="sy-small" style={{ color: "var(--primary-deep)", opacity: 0.8, marginTop: 2 }}>
                Votre compte Stripe Connect est prêt à recevoir des paiements
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
          background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
          <Icon name="bell" size={18} color="var(--ink-2)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div className="sy-h4">Email de confirmation en route</div>
            <div className="sy-small sy-muted" style={{ marginTop: 2 }}>
              Vérifiez vos spams si vous ne le recevez pas dans les 5 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Prochaines étapes */}
      <div style={{ width: "100%", padding: "20px", background: "var(--surface)",
        border: "1px solid var(--line)", borderRadius: "var(--radius-lg)" }}>
        <div className="sy-mono" style={{ marginBottom: 14 }}>Prochaines étapes</div>
        {[
          "Notre équipe vérifie vos documents (48h ouvrées)",
          "Vous recevrez votre lien d'accès à la console club par email",
          stripeIsPending
            ? "Configurez votre compte bancaire Stripe Connect pour recevoir des paiements"
            : "Publiez votre première prestation depuis la console club",
          "Commencez à financer vos projets de saison !",
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12,
            paddingBottom: i < 3 ? 12 : 0, marginBottom: i < 3 ? 12 : 0,
            borderBottom: i < 3 ? "1px solid var(--line)" : "none" }}>
            <Chip variant="primary" size="sm"
              style={{ width: 22, height: 22, padding: 0, justifyContent: "center",
                fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </Chip>
            <span className="sy-small" style={{ color: "var(--ink-2)" }}>{step}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", width: "100%" }}>
          <Btn variant="primary" size="lg" block
            iconRight={<Icon name="arrow" size={18} color="#fff" />}>
            Retour à l'accueil
          </Btn>
        </Link>
        <Link href="/connexion" className="sy-small sy-link" style={{ color: "var(--ink-3)" }}>
          Vous avez déjà un accès ? Connectez-vous
        </Link>
      </div>

    </div>
  );
}
