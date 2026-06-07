import type { Metadata } from "next";
import Link from "next/link";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

export const metadata: Metadata = {
  title: "Inscrire mon entreprise · Sociuly",
  description:
    "Créez votre compte entreprise Sociuly pour demander des devis aux clubs partenaires et organiser des expériences sportives sur-mesure pour vos collaborateurs.",
};

// Stub minimal — l'onboarding entreprise complet (SIRET + TVA intracom +
// secteur + taille + contact principal) sera implémenté dans le prochain
// chantier (cf. CLAUDE.md §5 — `/inscription-entreprise` à concevoir).
// Cette page existe pour que le CTA de /connexion pointe vers une URL valide.

export default function InscriptionEntreprisePage() {
  return (
    <div className="sy-auth-card" style={{ maxWidth: 540 }}>
      <header style={{ marginBottom: 22 }}>
        <div
          className="sy-mono"
          style={{ color: "var(--ink-3)", letterSpacing: "0.12em", marginBottom: 10 }}
        >
          Espace entreprise · création de compte
        </div>
        <h1 className="sy-h1" style={{ fontSize: 30, lineHeight: 1.1 }}>
          Inscrivez votre entreprise.
        </h1>
        <p className="sy-body" style={{ marginTop: 8 }}>
          Demandez des devis aux clubs partenaires, organisez des journées
          cohésion, séminaires sportifs et soirées immersives pour vos équipes.
        </p>
      </header>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 22px",
          display: "grid",
          gap: 10,
        }}
      >
        {[
          "Catalogue d'expériences sur-mesure dans 3 villes pilotes",
          "Devis personnalisés en moins de 48 h",
          "Facturation TTC conforme avec TVA, acompte 30 % puis solde",
          "Espace dédié pour suivre devis, événements et factures",
        ].map((line) => (
          <li
            key={line}
            className="sy-small"
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
          >
            <span style={{ marginTop: 2, color: "var(--accent)" }}>
              <Icon name="check" size={14} color="currentColor" />
            </span>
            {line}
          </li>
        ))}
      </ul>

      <div
        className="sy-small"
        style={{
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          color: "var(--ink-2)",
          marginBottom: 22,
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Bientôt disponible</strong> — le
        parcours de création de compte entreprise est en cours d'implémentation.
        En attendant, contactez-nous à{" "}
        <a className="sy-link" href="mailto:contact@sociuly.fr">
          contact@sociuly.fr
        </a>
        {" "}pour démarrer manuellement.
      </div>

      <Link href="/experiences" style={{ textDecoration: "none" }}>
        <Btn variant="primary" size="lg" block iconRight={<Icon name="arrow" size={16} color="#fff" />}>
          Découvrir les expériences
        </Btn>
      </Link>

      <p className="sy-small" style={{ marginTop: 18, textAlign: "center" }}>
        Vous avez déjà un compte ?{" "}
        <Link href="/connexion" className="sy-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}
