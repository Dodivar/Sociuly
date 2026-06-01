"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ds/icon";
import { AdminSidebar, type AdminSection } from "@/components/admin/admin-sidebar";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminValidation } from "@/components/admin/admin-validation";
import type { AdminData } from "@/lib/admin/mock-admin";

type Props = { data: AdminData };

export function AdminShell({ data }: Props) {
  const [section, setSection] = useState<AdminSection>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(
    data.pending[0]?.id ?? null,
  );

  function review(id: string) {
    setSelectedId(id);
    setSection("validation");
  }

  return (
    <div className="ash-root">
      <AdminSidebar
        active={section}
        onSelect={setSection}
        pendingCount={data.pendingCount}
      />

      <main className="ash-main">
        {section === "overview" && (
          <AdminOverview
            data={data}
            onOpenValidation={() => setSection("validation")}
            onReview={review}
          />
        )}
        {section === "validation" && (
          <AdminValidation
            data={data}
            selectedId={selectedId}
            onSelectId={setSelectedId}
          />
        )}
        {section !== "overview" && section !== "validation" && (
          <Placeholder section={section} />
        )}
      </main>

      <style>{`
        .ash-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }
        .ash-main { flex: 1; min-width: 0; }
        @media (max-width: 640px) {
          .ash-main { padding-bottom: 60px; }
        }
      `}</style>
    </div>
  );
}

// Sections présentes dans la navigation mais non maquettées dans wire-admin.jsx.
// On affiche un état honnête plutôt que d'inventer une UI (CLAUDE.md §6 :
// source de vérité = maquettes, ne pas inventer de copy).
const PLACEHOLDERS: Record<
  Exclude<AdminSection, "overview" | "validation">,
  { icon: IconName; title: string; desc: string }
> = {
  moderation: {
    icon: "eye",
    title: "Modération",
    desc: "Modération a posteriori des avis et contenus signalés (SPEC §5 — Reviews).",
  },
  finances: {
    icon: "euro",
    title: "Finances",
    desc: "Suivi du CA, des commissions (6 % du TTC) et des reversements aux clubs (SPEC §5).",
  },
  reports: {
    icon: "flag",
    title: "Signalements",
    desc: "File des litiges et contenus signalés à traiter manuellement en v1 (SPEC §5).",
  },
  logs: {
    icon: "menu",
    title: "Logs",
    desc: "Journal d'audit des actions de l'équipe Sociuly.",
  },
  settings: {
    icon: "settings",
    title: "Réglages",
    desc: "Paramètres de la plateforme et gestion de l'équipe Sociuly.",
  },
};

function Placeholder({
  section,
}: {
  section: Exclude<AdminSection, "overview" | "validation">;
}) {
  const p = PLACEHOLDERS[section];
  return (
    <div style={{ padding: "24px 28px 80px" }}>
      <div className="sy-mono">Sociuly · Admin</div>
      <h1 className="sy-h1" style={{ fontSize: 24, marginTop: 4 }}>{p.title}</h1>

      <div
        className="sy-card"
        style={{
          marginTop: 20,
          padding: "48px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={p.icon} size={24} color="var(--ink-3)" />
        </div>
        <h2 className="sy-h2">Section en préparation</h2>
        <p className="sy-body" style={{ maxWidth: 420 }}>{p.desc}</p>
        <span className="sy-chip sy-chip-outline">Bientôt disponible</span>
      </div>
    </div>
  );
}
