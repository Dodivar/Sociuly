import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalNote, LegalTable, type TocItem } from "../_components";

export const metadata: Metadata = {
  title: "Conditions générales — Sociuly",
  description:
    "Conditions générales de vente et d'utilisation professionnelles de la plateforme Sociuly (B2B).",
};

const TOC: TocItem[] = [
  { id: "objet", label: "1. Objet et champ d'application" },
  { id: "definitions", label: "2. Définitions" },
  { id: "role", label: "3. Rôle de Sociuly" },
  { id: "compte", label: "4. Compte et accès" },
  { id: "devis", label: "5. Devis et formation du contrat" },
  { id: "prix", label: "6. Prix, commission et TVA" },
  { id: "paiement", label: "7. Modalités de paiement" },
  { id: "realisation", label: "8. Réalisation de l'expérience" },
  { id: "annulation", label: "9. Annulation et report" },
  { id: "facturation", label: "10. Facturation" },
  { id: "avis", label: "11. Avis et évaluations" },
  { id: "responsabilite", label: "12. Responsabilité" },
  { id: "donnees", label: "13. Données personnelles" },
  { id: "propriete", label: "14. Propriété intellectuelle" },
  { id: "duree", label: "15. Durée et résiliation" },
  { id: "droit", label: "16. Droit applicable et litiges" },
  { id: "modifications", label: "17. Modifications" },
];

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales"
      intro="Conditions générales de vente et d'utilisation professionnelles régissant l'accès et l'usage de la plateforme Sociuly. Sociuly est un service strictement professionnel (B2B) : il s'adresse aux entreprises et aux clubs sportifs, à l'exclusion de tout consommateur particulier."
      updatedAt="4 juin 2026"
      toc={TOC}
    >
      <LegalNote>
        Le barème d'annulation, le taux d'acompte et le traitement de la TVA figurant ci-dessous
        reprennent les valeurs de référence du projet et doivent faire l'objet d'une validation
        juridique et comptable avant la mise en production (cf. décisions ouvertes du cahier des
        charges). Ils sont susceptibles d'évoluer.
      </LegalNote>

      <LegalSection id="objet" n="1" title="Objet et champ d'application">
        <p>
          Les présentes conditions générales (les « CGV ») ont pour objet de définir les modalités
          d'accès et d'utilisation de la plateforme Sociuly ainsi que les conditions de commande des
          expériences sportives proposées par les clubs partenaires.
        </p>
        <p>
          Elles s'appliquent à toute Entreprise utilisant la plateforme pour commander une Expérience,
          ainsi qu'à tout Club proposant ses Expériences. L'acceptation d'un Devis emporte adhésion
          pleine et entière aux présentes CGV, qui prévalent sur tout document contraire de
          l'Entreprise ou du Club.
        </p>
      </LegalSection>

      <LegalSection id="definitions" n="2" title="Définitions">
        <ul>
          <li><strong>Sociuly</strong> : la société Sociuly SAS, éditrice de la plateforme.</li>
          <li><strong>Entreprise</strong> : la personne morale qui commande une Expérience pour ses équipes.</li>
          <li><strong>Club</strong> : le club sportif (association loi 1901 ou structure professionnelle) qui conçoit et opère l'Expérience.</li>
          <li><strong>Expérience</strong> : la prestation sportive sur mesure proposée par un Club et commandée par une Entreprise.</li>
          <li><strong>Devis</strong> : la proposition chiffrée et nominative établie pour une Entreprise (référence au format DEV-AAAA-NNNNN).</li>
          <li><strong>Réservation</strong> : la commande confirmée née de l'acceptation d'un Devis (référence au format SOC-AAAA-NNNNN).</li>
        </ul>
      </LegalSection>

      <LegalSection id="role" n="3" title="Rôle de Sociuly">
        <p>
          Sociuly agit en qualité d'<strong>intermédiaire technique</strong> de mise en relation entre
          les Entreprises et les Clubs, et opère la conception et l'organisation des Expériences. La
          prestation sportive elle-même est réalisée sous la responsabilité du Club, qui dispose des
          qualifications et encadrants requis.
        </p>
        <p>
          Sociuly ne propose aucune vente en libre-service ni réservation instantanée : chaque
          Expérience est commandée via un Devis. Le service est limité, en version initiale, aux villes
          pilotes de <strong>Strasbourg, Nancy et Metz</strong>.
        </p>
      </LegalSection>

      <LegalSection id="compte" n="4" title="Compte et accès">
        <p>
          L'accès aux fonctionnalités réservées nécessite la création d'un compte. L'authentification
          s'effectue exclusivement par <strong>lien magique</strong> envoyé par e-mail (sans mot de
          passe). L'utilisateur est responsable de la confidentialité de sa boîte de réception et de
          l'exactitude des informations communiquées.
        </p>
        <p>
          Les Clubs ne peuvent publier d'Expérience qu'après validation de leur dossier de
          vérification (SIRET, statut, onboarding de paiement, présence d'un président) et obtention du
          statut « prêt pour le B2B » (assurance responsabilité civile professionnelle, encadrant
          diplômé, capacité à émettre une facture conforme).
        </p>
      </LegalSection>

      <LegalSection id="devis" n="5" title="Devis et formation du contrat">
        <p>Le parcours de commande se déroule comme suit :</p>
        <ul>
          <li>l'Entreprise demande un Devis à partir d'une Expérience ou d'un besoin sur mesure ;</li>
          <li>le Club ajuste et envoie le Devis, assorti d'une date de validité ;</li>
          <li>l'Entreprise accepte le Devis, ce qui crée la Réservation ;</li>
          <li>le versement de l'acompte, puis du solde, confirme définitivement la Réservation.</li>
        </ul>
        <p>
          Le contrat est formé à l'acceptation du Devis par l'Entreprise. Passée la date de validité,
          le Devis devient caduc.
        </p>
      </LegalSection>

      <LegalSection id="prix" n="6" title="Prix, commission et TVA">
        <p>
          Les prix sont exprimés en euros. Le montant <strong>toutes taxes comprises (TTC)</strong>
          {" "}indiqué sur le Devis correspond au prix payé par l'Entreprise.
        </p>
        <p>
          Sociuly perçoit une <strong>commission de 6 % du montant TTC</strong> de chaque Réservation
          confirmée, prélevée automatiquement sur le paiement. Le Club perçoit le montant net
          correspondant. La commission n'est pas facturée séparément à l'Entreprise.
        </p>
        <p>
          L'application de la TVA sur la prestation dépend du régime fiscal du Club (assujetti ou non).
          Le détail HT / TVA / TTC figure sur le Devis et la facture.
        </p>
        <LegalNote>
          Le traitement exact de la TVA (base selon l'assujettissement du Club et TVA applicable à la
          commission Sociuly) est en cours de validation avec l'expert-comptable et sera précisé.
        </LegalNote>
      </LegalSection>

      <LegalSection id="paiement" n="7" title="Modalités de paiement">
        <p>
          Les paiements sont opérés de manière sécurisée via notre prestataire Stripe. Aucune donnée
          de carte bancaire n'est conservée par Sociuly.
        </p>
        <ul>
          <li>
            <strong>Acompte</strong> : un acompte de <strong>30 %</strong> du montant TTC est exigible
            à l'acceptation du Devis pour confirmer la Réservation.
          </li>
          <li>
            <strong>Solde</strong> : le solde est exigible avant la date de réalisation de
            l'Expérience.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="realisation" n="8" title="Réalisation de l'expérience">
        <p>
          L'Expérience est réalisée à la date convenue, sous la responsabilité du Club et de ses
          encadrants. Le Club s'engage à mettre en œuvre les moyens humains et matériels décrits dans
          le Devis. À l'issue de la prestation, la Réservation est marquée comme réalisée, ce qui
          ouvre, sauf litige, le versement des sommes dues au Club.
        </p>
        <p>
          Une fenêtre de réclamation de <strong>48 heures</strong> est ouverte à l'Entreprise après la
          réalisation ; toute contestation suspend le versement et fait l'objet d'un traitement par
          Sociuly.
        </p>
      </LegalSection>

      <LegalSection id="annulation" n="9" title="Annulation et report">
        <p>
          <strong>L'acompte n'est pas remboursable</strong> une fois le Devis accepté. En cas
          d'annulation par l'Entreprise, le barème dégressif suivant s'applique sur le montant TTC :
        </p>
        <LegalTable
          rows={[
            ["Plus de 30 jours avant", "Acompte conservé"],
            ["Entre 30 et 7 jours avant", "50 % du montant TTC dû"],
            ["Moins de 7 jours avant", "100 % du montant TTC dû"],
          ]}
        />
        <p>
          En cas d'annulation par le Club, l'Entreprise est <strong>intégralement remboursée</strong>
          {" "}et reçoit un e-mail d'excuses. Trois annulations par un même Club sur une période de six
          mois entraînent sa suspension automatique.
        </p>
        <LegalNote>
          Ce barème d'annulation est une valeur de référence soumise à validation juridique avant la
          mise en production.
        </LegalNote>
      </LegalSection>

      <LegalSection id="facturation" n="10" title="Facturation">
        <p>
          Une facture conforme est émise pour chaque Réservation, faisant apparaître les montants HT,
          TVA et TTC. Les factures sont mises à disposition au format PDF dans l'espace de
          l'Entreprise et conservées conformément aux obligations légales.
        </p>
      </LegalSection>

      <LegalSection id="avis" n="11" title="Avis et évaluations">
        <p>
          À l'issue d'une Réservation réalisée, et pendant une période de 30 jours, l'Entreprise peut
          publier un avis (note de 1 à 5, commentaire facultatif de 600 caractères maximum). Les avis
          font l'objet d'une modération a posteriori. Sociuly se réserve le droit de retirer tout
          contenu manifestement illicite, diffamatoire ou hors sujet.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" n="12" title="Responsabilité">
        <p>
          Le Club est seul responsable de la bonne exécution de l'Expérience, de la sécurité des
          participants et du respect des règles applicables à son activité sportive. Sociuly ne saurait
          être tenue responsable d'un dommage résultant de la prestation réalisée par le Club.
        </p>
        <p>
          Sociuly met en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité de
          la plateforme, sans garantie d'absence totale d'interruption. La responsabilité de Sociuly,
          lorsqu'elle est engagée, est limitée au montant de la commission perçue sur la Réservation
          concernée.
        </p>
      </LegalSection>

      <LegalSection id="donnees" n="13" title="Données personnelles">
        <p>
          Le traitement des données personnelles dans le cadre de l'utilisation de la plateforme est
          décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection id="propriete" n="14" title="Propriété intellectuelle">
        <p>
          L'ensemble des éléments de la plateforme est protégé. Les conditions de propriété
          intellectuelle sont précisées dans les{" "}
          <Link href="/mentions-legales">mentions légales</Link>. Le Club concède à Sociuly une
          licence d'utilisation des contenus (photos, descriptifs) qu'il publie aux fins de promotion
          de ses Expériences.
        </p>
      </LegalSection>

      <LegalSection id="duree" n="15" title="Durée et résiliation">
        <p>
          Les présentes CGV s'appliquent pendant toute la durée d'utilisation de la plateforme. Chaque
          partie peut clôturer son compte à tout moment, sous réserve de la bonne fin des Réservations
          en cours et du respect des obligations comptables et légales. Sociuly peut suspendre ou
          résilier un accès en cas de manquement aux présentes CGV.
        </p>
      </LegalSection>

      <LegalSection id="droit" n="16" title="Droit applicable et litiges">
        <p>
          Les présentes CGV sont régies par le droit français. En cas de litige, et à défaut de
          résolution amiable, compétence est attribuée aux tribunaux compétents du ressort du siège
          social de Sociuly, conformément aux règles applicables entre professionnels.
        </p>
      </LegalSection>

      <LegalSection id="modifications" n="17" title="Modifications">
        <p>
          Sociuly se réserve le droit de modifier les présentes CGV. La version applicable est celle en
          vigueur à la date d'acceptation du Devis. Les utilisateurs sont informés de toute évolution
          substantielle.
        </p>
        <LegalTable
          rows={[
            ["Éditeur", "Sociuly SAS — RCS Strasbourg B 924 318 027"],
            ["Contact", <a key="c" href="mailto:contact@sociuly.fr">contact@sociuly.fr</a>],
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
