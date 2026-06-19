"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { Avatar, Btn, IconBtn } from "./components";
import { Icon } from "./icon";
import type { TopNavItem } from "./topnav-tabs";

/**
 * Navigation mobile (≤768px) : déclencheur « burger » + panneau latéral (drawer).
 * Remplace la barre d'onglets masquée sous 768px (cf. SPEC §6 — pattern MobileTopNav).
 * Server-friendly : le TopNav reste un Server Component, seul ce panneau est client.
 */
export function MobileNav({
  items,
  account,
}: {
  items: ReadonlyArray<TopNavItem>;
  /** Quand fourni, affiche l'accès à l'espace entreprise (org_buyer). */
  account?: { name: string; initials?: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Ferme le panneau à chaque changement de route.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Verrouille le scroll, gère Échap et le focus pendant l'ouverture.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    // Focus le premier élément interactif du panneau.
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      // Rend le focus au déclencheur à la fermeture.
      triggerRef.current?.focus();
    };
  }, [open]);

  const current = pathname;
  const isActive = (href: string) => {
    const base = href.split("?")[0];
    return base !== "/" && (current === base || current.startsWith(`${base}/`));
  };

  return (
    <>
      <IconBtn
        ref={triggerRef}
        className="sy-mobilenav-trigger"
        aria-label="Ouvrir le menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" size={20} />
      </IconBtn>

      {open && (
        <div className="sy-mobilenav-overlay" onClick={() => setOpen(false)}>
          <div
            ref={panelRef}
            id={panelId}
            className="sy-mobilenav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sy-mobilenav-head">
              <Link
                href="/"
                className="sy-mono"
                style={{ textDecoration: "none", color: "var(--ink-3)" }}
              >
                Menu
              </Link>
              <IconBtn
                aria-label="Fermer le menu"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <Icon name="close" size={18} />
              </IconBtn>
            </div>

            <nav className="sy-mobilenav-links" aria-label="Navigation principale">
              {items.map((it) => (
                <Link
                  key={it.id}
                  href={it.href}
                  aria-current={isActive(it.href) ? "page" : undefined}
                  className={cx("sy-mobilenav-link", isActive(it.href) && "on")}
                >
                  {it.label}
                  <Icon name="chevron" size={16} color="var(--ink-3)" />
                </Link>
              ))}
            </nav>

            <div className="sy-mobilenav-actions">
              {account ? (
                <Link href="/compte" style={{ textDecoration: "none" }}>
                  <Btn
                    variant="dark"
                    size="lg"
                    block
                    icon={
                      <Avatar
                        initials={account.initials ?? account.name.slice(0, 2).toUpperCase()}
                        tone="orange"
                      />
                    }
                  >
                    Mon espace
                  </Btn>
                </Link>
              ) : (
                <>
                  <Link href="/inscription-club" style={{ textDecoration: "none" }}>
                    <Btn variant="outline" size="lg" block>Inscrire mon club</Btn>
                  </Link>
                  <Link href="/connexion" style={{ textDecoration: "none" }}>
                    <Btn variant="dark" size="lg" block>Se connecter</Btn>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
