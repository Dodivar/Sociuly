import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalNote, LegalTable, type TocItem } from "../_components";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Sociuly",
  description:
    "Comment Sociuly collecte, utilise et protège vos données personnelles, conformément au RGPD.",
};

const TOC: TocItem[] = [
  { id: "responsable", label: "1. Responsable du traitement" },
  { id: "donnees", label: "2. Données collectées" },
  { id: "finalites", label: "3. Finalités et bases légales" },
  { id: "destinataires", label: "4. Destinataires et sous-traitants" },
  { id: "transferts", label: "5. Transferts hors UE" },
  { id: "conservation", label: "6. Durée de conservation" },
  { id: "droits", label: "7. Vos droits" },
  { id: "securite", label: "8. Sécurité" },
  { id: "cookies", label: "9. Cookies et audience" },
  { id: "contact", label: "10. Contact et réclamation" },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Sociuly accorde une grande importance à la protection de vos données personnelles. Cette politique décrit les traitements réalisés via sociuly.fr, conformément au Règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés."
      updatedAt="4 juin 2026"
      toc={TOC}
    >
      <LegalSection id="responsable" n="1" title="Responsable du traitement">
        <p>
          Le responsable du traitement est <strong>Sociuly SAS</strong> (RCS Strasbourg B 924 318 027),
          dont le siège social est situé [À COMPLÉTER], Strasbourg, France.
        </p>
        <p>
          Pour toute question relative à vos données, vous pouvez contacter notre référent
          « protection des données » à l'adresse{" "}
          <a href="mailto:confidentialite@sociuly.fr">confidentialite@sociuly.fr</a>.
        </p>
        <LegalNote>
          La désignation éventuelle d'un délégué à la protection des données (DPO) et son inscription
          auprès de la CNIL restent à confirmer avant la mise en production.
        </LegalNote>
      </LegalSection>

      <LegalSection id="donnees" n="2" title="Données collectées">
        <p>Selon votre usage de la plateforme, nous collectons les catégories de données suivantes :</p>
        <ul>
          <li>
            <strong>Données de compte et d'identification</strong> : adresse e-mail (utilisée pour
            l'authentification par lien magique), nom, prénom, fonction, rôle (acheteur d'une
            entreprise ou membre d'un club).
          </li>
          <li>
            <strong>Données entreprise</strong> : raison sociale, SIRET, numéro de TVA
            intracommunautaire, secteur, taille, coordonnées et adresse de facturation.
          </li>
          <li>
            <strong>Données club</strong> : identité du club, SIRET, type, coordonnées des membres,
            justificatifs (affiliation, assurance, diplômes des intervenants), coordonnées bancaires
            (RIB) traitées via notre prestataire de paiement.
          </li>
          <li>
            <strong>Données transactionnelles</strong> : devis, réservations, factures et historique
            des échanges. Les données de carte bancaire ne transitent ni ne sont stockées par
            Sociuly : elles sont traitées directement par Stripe.
          </li>
          <li>
            <strong>Données techniques</strong> : journaux de connexion, adresse IP, données de
            navigation et de mesure d'audience.
          </li>
        </ul>
        <LegalNote>
          Sociuly ne collecte aucune donnée auprès de consommateurs individuels : la plateforme est
          exclusivement destinée aux entreprises et aux clubs sportifs (B2B).
        </LegalNote>
      </LegalSection>

      <LegalSection id="finalites" n="3" title="Finalités et bases légales">
        <ul>
          <li>
            <strong>Gestion des comptes et authentification</strong> (lien magique par e-mail) —
            exécution du contrat.
          </li>
          <li>
            <strong>Mise en relation, élaboration des devis et des réservations</strong> — exécution
            du contrat.
          </li>
          <li>
            <strong>Paiements et facturation</strong> (acompte, solde, commission, versement aux
            clubs) — exécution du contrat et obligation légale (conservation comptable).
          </li>
          <li>
            <strong>Vérification d'éligibilité des clubs (KYC)</strong> : SIRET, statut, assurance,
            diplômes — obligation légale et intérêt légitime à garantir la qualité des prestations.
          </li>
          <li>
            <strong>Communications de service</strong> (confirmations, rappels, suivi de devis) —
            exécution du contrat.
          </li>
          <li>
            <strong>Newsletter et communications marketing</strong> — consentement (révocable à tout
            moment).
          </li>
          <li>
            <strong>Mesure d'audience, amélioration et sécurité du service</strong> — intérêt
            légitime.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="destinataires" n="4" title="Destinataires et sous-traitants">
        <p>
          Vos données sont accessibles aux équipes habilitées de Sociuly et, le cas échéant, au club
          ou à l'entreprise partie au devis ou à la réservation concernée. Nous faisons appel à des
          sous-traitants techniques agissant sur instruction et liés par un accord de traitement :
        </p>
        <ul>
          <li><strong>Supabase</strong> — base de données et stockage de fichiers (Union européenne, Francfort).</li>
          <li><strong>Vercel</strong> — hébergement applicatif (exécution en Union européenne, Francfort).</li>
          <li><strong>Stripe</strong> — traitement des paiements et versements aux clubs (Stripe Payments Europe, Ltd, Irlande).</li>
          <li><strong>Resend</strong> — envoi des e-mails transactionnels et liens d'authentification.</li>
          <li><strong>Sentry</strong> — supervision technique et détection des erreurs.</li>
          <li><strong>PostHog</strong> — mesure d'audience et analyse d'usage.</li>
          <li><strong>Upstash</strong> — limitation de débit (protection des API).</li>
          <li><strong>MapTiler</strong> — affichage cartographique.</li>
        </ul>
        <p>
          Vos données ne sont jamais vendues à des tiers. Elles peuvent être communiquées aux
          autorités administratives ou judiciaires lorsque la loi l'exige.
        </p>
      </LegalSection>

      <LegalSection id="transferts" n="5" title="Transferts hors Union européenne">
        <p>
          L'hébergement et la base de données sont localisés dans l'Union européenne. Certains
          sous-traitants peuvent toutefois être établis hors de l'UE : dans ce cas, les transferts
          sont encadrés par les garanties appropriées prévues par le RGPD (clauses contractuelles
          types de la Commission européenne).
        </p>
      </LegalSection>

      <LegalSection id="conservation" n="6" title="Durée de conservation">
        <ul>
          <li>
            <strong>Données de compte et d'activité</strong> : conservées pendant toute la durée de la
            relation, puis <strong>3 ans après la dernière activité</strong>.
          </li>
          <li>
            <strong>Documents comptables (factures, devis acceptés)</strong> : 10 ans, conformément
            aux obligations légales.
          </li>
          <li>
            <strong>Données de prospection / newsletter</strong> : 3 ans à compter du dernier contact
            ou jusqu'au retrait du consentement.
          </li>
          <li>
            <strong>Journaux techniques</strong> : 12 mois maximum.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="droits" n="7" title="Vos droits">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>droit d'accès, de rectification et d'effacement de vos données ;</li>
          <li>droit à la limitation et droit d'opposition au traitement ;</li>
          <li>droit à la portabilité de vos données ;</li>
          <li>droit de retirer votre consentement à tout moment (newsletter, marketing) ;</li>
          <li>droit de définir des directives relatives au sort de vos données après votre décès.</li>
        </ul>
        <p>
          Un <strong>export</strong> et une <strong>suppression en libre-service</strong> de vos
          données sont accessibles depuis votre espace (entreprise comme club). Vous pouvez également
          exercer vos droits en écrivant à{" "}
          <a href="mailto:confidentialite@sociuly.fr">confidentialite@sociuly.fr</a>. Une réponse vous
          sera apportée dans un délai d'un mois.
        </p>
      </LegalSection>

      <LegalSection id="securite" n="8" title="Sécurité">
        <p>
          Sociuly met en œuvre des mesures techniques et organisationnelles appropriées : chiffrement
          des échanges (HTTPS), authentification sans mot de passe par lien magique, hébergement au
          sein de l'Union européenne, limitation des accès aux personnes habilitées et limitation de
          débit sur les API. Les données bancaires sensibles ainsi que les jetons d'authentification
          ne sont jamais journalisés.
        </p>
      </LegalSection>

      <LegalSection id="cookies" n="9" title="Cookies et mesure d'audience">
        <p>Le site dépose deux catégories de traceurs :</p>
        <ul>
          <li>
            <strong>Cookies strictement nécessaires</strong> : indispensables au fonctionnement et à
            la sécurité (session, authentification). Ils ne requièrent pas de consentement.
          </li>
          <li>
            <strong>Cookies de mesure d'audience</strong> (PostHog) : permettent d'analyser
            l'utilisation du service pour l'améliorer. Ils sont soumis à votre consentement.
          </li>
        </ul>
        <p>
          Vous pouvez à tout moment paramétrer ou retirer votre consentement et configurer votre
          navigateur pour refuser les cookies.
        </p>
      </LegalSection>

      <LegalSection id="contact" n="10" title="Contact et réclamation">
        <p>
          Pour toute demande relative à vos données personnelles, contactez{" "}
          <a href="mailto:confidentialite@sociuly.fr">confidentialite@sociuly.fr</a>.
        </p>
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous
          pouvez introduire une réclamation auprès de la Commission nationale de l'informatique et des
          libertés (CNIL),{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
