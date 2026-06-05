import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalNote, LegalTable, type TocItem } from "../_components";

export const metadata: Metadata = {
  title: "Mentions légales — Sociuly",
  description:
    "Mentions légales du site Sociuly : éditeur, hébergeur, propriété intellectuelle et contact.",
};

const TOC: TocItem[] = [
  { id: "editeur", label: "1. Éditeur du site" },
  { id: "publication", label: "2. Directeur de la publication" },
  { id: "hebergement", label: "3. Hébergement" },
  { id: "propriete", label: "4. Propriété intellectuelle" },
  { id: "donnees", label: "5. Données personnelles" },
  { id: "cookies", label: "6. Cookies" },
  { id: "litiges", label: "7. Médiation et litiges" },
  { id: "contact", label: "8. Contact" },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      intro="Informations légales relatives au site sociuly.fr et à la société qui l'édite, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN)."
      updatedAt="4 juin 2026"
      toc={TOC}
    >
      <LegalSection id="editeur" n="1" title="Éditeur du site">
        <p>Le site <strong>sociuly.fr</strong> est édité par :</p>
        <LegalTable
          rows={[
            ["Raison sociale", "Sociuly SAS"],
            ["Forme juridique", "Société par actions simplifiée (SAS)"],
            ["Capital social", "[À COMPLÉTER] €"],
            ["RCS", "Strasbourg B 924 318 027"],
            ["SIREN", "924 318 027"],
            ["N° TVA intracommunautaire", "[À COMPLÉTER]"],
            ["Siège social", "[À COMPLÉTER], Strasbourg, France"],
            ["Adresse e-mail", <a key="m" href="mailto:contact@sociuly.fr">contact@sociuly.fr</a>],
          ]}
        />
        <LegalNote>
          Les champs <strong>[À COMPLÉTER]</strong> (capital social, numéro de TVA intracommunautaire,
          adresse exacte du siège) doivent être renseignés à partir de l'extrait Kbis avant toute
          mise en production.
        </LegalNote>
      </LegalSection>

      <LegalSection id="publication" n="2" title="Directeur de la publication">
        <p>
          Le directeur de la publication est <strong>[À COMPLÉTER]</strong>, en sa qualité de
          représentant légal de Sociuly SAS. Toute question relative au contenu éditorial du site peut
          lui être adressée à <a href="mailto:contact@sociuly.fr">contact@sociuly.fr</a>.
        </p>
      </LegalSection>

      <LegalSection id="hebergement" n="3" title="Hébergement">
        <p>L'application et le site sont hébergés par :</p>
        <LegalTable
          rows={[
            ["Hébergeur applicatif", "Vercel Inc."],
            ["Adresse", "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis"],
            ["Site", <a key="v" href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>],
            ["Région d'exécution", "Union européenne (Francfort — fra1)"],
            ["Base de données & stockage", "Supabase — région Union européenne (Francfort)"],
          ]}
        />
        <p>
          Les traitements applicatifs et la base de données sont exécutés au sein de l'Union
          européenne. Le détail des sous-traitants figure dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection id="propriete" n="4" title="Propriété intellectuelle">
        <p>
          L'ensemble des éléments composant le site (marque « Sociuly », logo, charte graphique,
          textes, illustrations, code source, structure et bases de données) est protégé par le droit
          de la propriété intellectuelle et demeure la propriété exclusive de Sociuly SAS ou de ses
          partenaires.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation, totale ou
          partielle, de ces éléments, par quelque procédé que ce soit, est interdite sans
          l'autorisation écrite préalable de Sociuly SAS, sous réserve des exceptions prévues par la
          loi.
        </p>
        <p>
          Les photographies, descriptifs et logos des clubs partenaires restent la propriété de leurs
          titulaires respectifs et sont diffusés sur le site avec leur accord.
        </p>
      </LegalSection>

      <LegalSection id="donnees" n="5" title="Données personnelles">
        <p>
          Le traitement des données à caractère personnel collectées sur le site est décrit en détail
          dans notre <Link href="/confidentialite">politique de confidentialité</Link>. Vous y
          trouverez notamment les finalités, bases légales, durées de conservation et les modalités
          d'exercice de vos droits (accès, rectification, effacement, portabilité).
        </p>
      </LegalSection>

      <LegalSection id="cookies" n="6" title="Cookies">
        <p>
          Le site utilise des cookies et traceurs strictement nécessaires à son fonctionnement
          (notamment l'authentification par lien magique) ainsi que des outils de mesure d'audience.
          Les modalités sont détaillées dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection id="litiges" n="7" title="Médiation et litiges">
        <p>
          Sociuly s'adresse exclusivement à des clients professionnels (entreprises) et à des clubs
          sportifs. Les conditions contractuelles applicables sont définies dans les{" "}
          <Link href="/cgu">conditions générales</Link>. Tout litige relatif à l'utilisation du site
          est soumis au droit français.
        </p>
      </LegalSection>

      <LegalSection id="contact" n="8" title="Contact">
        <p>
          Pour toute question relative au site ou à son éditeur, vous pouvez écrire à{" "}
          <a href="mailto:contact@sociuly.fr">contact@sociuly.fr</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
