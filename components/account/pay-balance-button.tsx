"use client";

// Bouton de règlement du solde (statut deposit_paid) — déclenche le Stripe Checkout
// du solde via startBalanceCheckout, puis redirige. Isolé en Client Component pour
// rester intégrable dans les listes server-rendered (org-lists).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startBalanceCheckout } from "@/lib/actions/payments";
import { Icon } from "@/components/ds/icon";

export function PayBalanceButton({ bookingNumber }: { bookingNumber: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pay() {
    setError(null);
    start(async () => {
      const res = await startBalanceCheckout(bookingNumber);
      if (!res.ok) { setError(res.error); return; }
      if (/^https?:\/\//.test(res.url)) window.location.href = res.url;
      else router.push(res.url);
    });
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button type="button" className="sy-btn sy-btn-primary sy-btn-sm" onClick={pay} disabled={pending}>
        <Icon name="lock" size={13} color="#fff" /> {pending ? "Redirection…" : "Régler le solde"}
      </button>
      {error && <span className="sy-small" role="alert" style={{ color: "var(--danger)" }}>{error}</span>}
    </span>
  );
}
