import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { AccountNav } from "@/components/account/account-nav";
import { requireRole } from "@/lib/auth/rbac";
import { getOrganizationSummary, getOrgBookings } from "@/lib/account/org";
import { getQuotesForOrg } from "@/lib/devis/quotes.server";

// Espace entreprise /compte (SPEC §6) — réservé org_buyer.
// TODO(api): résoudre l'Organization depuis la session (session.organizationId)
// au lieu de l'organisation de démo.

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  // Garde RBAC : réservé au rôle org_buyer (SPEC §6).
  await requireRole(["org_buyer"], "/compte");

  const [org, quotes, bookings] = await Promise.all([
    getOrganizationSummary(),
    getQuotesForOrg(),
    getOrgBookings(),
  ]);

  const devisBadge = quotes.filter((q) => q.status === "sent").length;
  const resaBadge = bookings.filter((b) => b.status === "quote_accepted").length;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav account={{ name: org.name, initials: org.initials }} />

      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px var(--page-pad) 18px" }}>
          <div className="sy-mono" style={{ color: "var(--ink-3)" }}>Espace entreprise</div>
          <h1 className="sy-h1" style={{ fontSize: 30, marginTop: 4 }}>{org.name}</h1>
          <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
            {org.sector} · {org.sizeBucket} · SIRET {org.siret}
          </div>
        </div>
      </header>

      <AccountNav badges={{ "/compte/devis": devisBadge, "/compte/reservations": resaBadge }} />

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px var(--page-pad) 48px" }}>
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
