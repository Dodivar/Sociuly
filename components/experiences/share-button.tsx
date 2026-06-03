"use client";

// Bouton « Partager » de la fiche expérience : menu léger avec copie du lien
// (feedback « Lien copié ») et partage par e-mail (mailto). Utilise l'API
// navigator.share quand elle est disponible (mobile), sinon le menu.

import { useEffect, useRef, useState } from "react";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

export function ShareButton({ title }: { title: string }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // URL courante (rendu client uniquement).
  const url = typeof window !== "undefined" ? window.location.href : "";
  const subject = `Découvrez « ${title} » sur Sociuly`;
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${subject}\n${url}`)}`;

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

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
        await navigator.share({ title, url });
        return;
      } catch {
        // L'utilisateur a annulé : on retombe sur le menu.
      }
    }
    setOpenMenu((v) => !v);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Btn
        variant="ghost"
        size="sm"
        icon={<Icon name="share" size={14} />}
        onClick={onShare}
        aria-haspopup="menu"
        aria-expanded={openMenu}
      >
        Partager
      </Btn>

      {openMenu && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 30,
            minWidth: 220, padding: 6,
            background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)",
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="sy-share-item"
          >
            <Icon name={copied ? "check" : "share"} size={15} color={copied ? "var(--success)" : "var(--ink)"} />
            <span>{copied ? "Lien copié !" : "Copier le lien"}</span>
          </button>
          <a href={mailto} role="menuitem" className="sy-share-item" onClick={() => setOpenMenu(false)}>
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
  );
}
