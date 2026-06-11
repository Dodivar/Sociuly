"use client";

// Actions de la fiche club — Client Component (interactivité requise).
//   • Contacter : ouvre un e-mail pré-rempli vers le contact du club (mailto).
//     Repli vers la demande de devis si le club n'a pas d'email de contact.
//   • Demander un devis : devis SUR MESURE rattaché au club (experienceId = null,
//     SPEC §3) — branché sur le même parcours que le devis depuis une expérience.
//   • Partager : copie du lien + partage e-mail, ou partage natif (mobile).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Btn, IconBtn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

type Props = {
  slug: string;
  clubName: string;
  contactEmail: string | null;
};

export function ClubActions({ slug, clubName, contactEmail }: Props) {
  const [openShare, setOpenShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const devisHref = `/clubs/${slug}/devis`;

  // URL courante (rendu client uniquement).
  const url = typeof window !== "undefined" ? window.location.href : "";

  // mailto « Contacter » — sujet/corps pré-remplis côté entreprise.
  const contactSubject = `Demande d'information · ${clubName} sur Sociuly`;
  const contactBody = `Bonjour ${clubName},\n\nNous souhaitons en savoir plus sur vos expériences pour entreprises.\n\nMerci !`;
  const contactMailto = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactBody)}`
    : null;

  // mailto « Partager »
  const shareSubject = `Découvrez ${clubName} sur Sociuly`;
  const shareMailto = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(`${shareSubject}\n${url}`)}`;

  // Fermeture du menu partage au clic extérieur.
  useEffect(() => {
    if (!openShare) return;
    const onClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setOpenShare(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openShare]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : on laisse le menu ouvert avec le mailto.
    }
  };

  const onShare = async () => {
    // Partage natif si supporté (mobile), sinon menu desktop.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: clubName, url });
        return;
      } catch {
        // Annulé : on retombe sur le menu.
      }
    }
    setOpenShare((v) => !v);
  };

  return (
    <div className="asso-actions">
      {/* Contacter — e-mail direct au club (repli devis si pas de contact). */}
      {contactMailto ? (
        <a className="asso-act-contact" href={contactMailto} style={{ textDecoration: "none" }}>
          <Btn variant="outline" block>Contacter</Btn>
        </a>
      ) : (
        <Link className="asso-act-contact" href={devisHref} style={{ textDecoration: "none" }}>
          <Btn variant="outline" block>Contacter</Btn>
        </Link>
      )}

      <Link className="asso-act-devis" href={devisHref} style={{ textDecoration: "none" }}>
        <Btn variant="dark">Demander un devis</Btn>
      </Link>

      <div ref={shareRef} style={{ position: "relative" }} className="asso-act-share">
        <IconBtn
          aria-label="Partager"
          aria-haspopup="menu"
          aria-expanded={openShare}
          onClick={onShare}
        >
          <Icon name="share" size={16} />
        </IconBtn>

        {openShare && (
          <div
            role="menu"
            style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 30,
              minWidth: 220, padding: 6,
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)",
            }}
          >
            <button type="button" role="menuitem" onClick={copyLink} className="sy-share-item">
              <Icon name={copied ? "check" : "share"} size={15} color={copied ? "var(--success)" : "var(--ink)"} />
              <span>{copied ? "Lien copié !" : "Copier le lien"}</span>
            </button>
            <a href={shareMailto} role="menuitem" className="sy-share-item" onClick={() => setOpenShare(false)}>
              <Icon name="chat" size={15} />
              <span>Partager par e-mail</span>
            </a>

            <style>{`
              .sy-share-item {
                display: flex; align-items: center; gap: 10px; width: 100%;
                padding: 9px 10px; border: none; background: transparent;
                border-radius: var(--radius-sm); cursor: pointer; text-align: left;
                font-family: var(--sans); font-size: 14px; color: var(--ink);
                text-decoration: none;
              }
              .sy-share-item:hover { background: var(--surface-2); }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
