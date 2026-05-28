import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ds/patterns";
import { Avatar, Btn, Chip } from "@/components/ds/components";
import { signOut } from "@/app/auth/actions";

export default async function ClubDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const clubName =
    (user.user_metadata?.club_name as string | undefined) ?? "Mon club";
  const initials = clubName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top bar */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          padding: "0 var(--screen-pad)",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo size={22} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={initials} tone="green" />
          <span
            className="sy-h4"
            style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {clubName}
          </span>
          <form action={signOut}>
            <Btn type="submit" variant="soft" size="sm">
              Déconnexion
            </Btn>
          </form>
        </div>
      </header>

      {/* Dashboard body */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px var(--screen-pad)" }}>
        <div style={{ marginBottom: 32 }}>
          <Chip variant="primary" size="sm">Dashboard club</Chip>
          <h1 className="sy-h1" style={{ marginTop: 10 }}>
            Bienvenue, {clubName} 👋
          </h1>
          <p className="sy-body" style={{ marginTop: 8 }}>
            Votre espace de gestion des prestations et réservations.
          </p>
        </div>

        {/* Placeholder cards */}
        <div className="sy-grid-3" style={{ marginTop: 24 }}>
          {SECTIONS.map((s) => (
            <div key={s.title} className="sy-card sy-card-elevated" style={{ padding: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--primary-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 16,
                }}
              >
                {s.icon}
              </div>
              <h3 className="sy-h3">{s.title}</h3>
              <p className="sy-small" style={{ marginTop: 6 }}>{s.description}</p>
              <div style={{ marginTop: 16 }}>
                <Chip variant="outline" size="sm">Bientôt disponible</Chip>
              </div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="sy-card" style={{ marginTop: 32, padding: 24 }}>
          <h3 className="sy-h3">Informations du compte</h3>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="ID utilisateur" value={user.id} mono />
            <Row
              label="Compte créé le"
              value={new Date(user.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "baseline",
        paddingBottom: 10,
        borderBottom: "1px solid var(--line)",
      }}
    >
      <span className="sy-small sy-muted" style={{ minWidth: 140 }}>
        {label}
      </span>
      <span
        className={mono ? "sy-mono" : "sy-small"}
        style={{ color: "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}

const SECTIONS = [
  {
    icon: "📋",
    title: "Mes prestations",
    description: "Gérez vos offres de barbecue, animations et événements.",
  },
  {
    icon: "📅",
    title: "Réservations",
    description: "Consultez et confirmez les demandes de vos clients.",
  },
  {
    icon: "💰",
    title: "Revenus",
    description: "Suivez vos paiements et le financement de vos projets.",
  },
];
