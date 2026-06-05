import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ds/icon";

// Composants de présentation partagés par les pages légales statiques
// (/cgu, /confidentialite, /mentions-legales). Server Components — aucune
// interactivité, uniquement de la mise en page DS.

export type TocItem = { id: string; label: string };

export function LegalPage({
  title,
  intro,
  updatedAt,
  toc,
  children,
}: {
  title: string;
  intro?: ReactNode;
  /** Date de dernière mise à jour, déjà formatée en français. */
  updatedAt: string;
  toc: TocItem[];
  children: ReactNode;
}) {
  return (
    <>
      <header className="sy-legal__head">
        <div className="sy-legal__head-inner">
          <Link href="/" className="sy-legal__crumb sy-mono">
            <Icon name="arrowLeft" size={12} color="currentColor" />
            Accueil
          </Link>
          <h1 className="sy-display-sm" style={{ marginTop: 16 }}>{title}</h1>
          {intro && (
            <p className="sy-body-l" style={{ marginTop: 12, maxWidth: 680 }}>{intro}</p>
          )}
          <p className="sy-mono" style={{ marginTop: 18 }}>
            Dernière mise à jour : {updatedAt}
          </p>
        </div>
      </header>

      <div className="sy-legal__body">
        <nav className="sy-legal__toc" aria-label="Sommaire">
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`}>{item.label}</a>
          ))}
        </nav>
        <article className="sy-legal__prose">{children}</article>
      </div>
    </>
  );
}

export function LegalSection({
  id,
  n,
  title,
  children,
}: {
  id: string;
  /** Numéro d'article affiché en mono devant le titre (ex. « 1 »). */
  n?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <h2>
        {n && <span className="sy-legal__n">{n}.</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

// Encart d'avertissement : marque les éléments à compléter avant la mise en
// production (identité société, validation juridique des CGV — cf. SPEC §11).
export function LegalNote({ children }: { children: ReactNode }) {
  return <p className="sy-legal__note">{children}</p>;
}

// Tableau clé/valeur (identité de l'éditeur, barème d'annulation…).
export function LegalTable({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="sy-legal__table">
      {rows.map(([key, value], i) => (
        <div key={i} className="sy-legal__row">
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
