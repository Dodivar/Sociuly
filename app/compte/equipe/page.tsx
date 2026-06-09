import { Avatar } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { PanelCard, StatusChip } from "@/components/account/account-bits";
import { getOrgTeam, ORG_ROLE_LABEL } from "@/lib/account/org";

// Équipe de l'entreprise — /compte/equipe (SPEC §6).
// TODO(api): invitation par email (Resend) + gestion des rôles org_buyer.
export default async function CompteEquipePage() {
  const team = await getOrgTeam();

  return (
    <PanelCard
      title="Membres de l'équipe"
      action={
        <button type="button" className="sy-btn sy-btn-soft sy-btn-sm">
          <Icon name="plus" size={13} /> Inviter
        </button>
      }
    >
      <ul className="eq-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {team.map((m) => (
          <li key={m.id} className="eq-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
            <Avatar initials={m.initials} tone={m.role === "admin" ? "green" : "orange"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sy-h4">{m.name}</div>
              <div className="sy-mono" style={{ marginTop: 2 }}>{m.email}</div>
            </div>
            <div className="sy-small sy-muted eq-seen" style={{ whiteSpace: "nowrap" }}>{m.lastActiveLabel}</div>
            {m.role === "admin" ? (
              <StatusChip label={ORG_ROLE_LABEL.admin} bg="var(--primary-soft)" fg="var(--primary-deep)" />
            ) : (
              <StatusChip label={ORG_ROLE_LABEL.member} bg="var(--surface-2)" fg="var(--ink-2)" />
            )}
          </li>
        ))}
      </ul>
      <style>{`
        .eq-row { border-top: 1px solid var(--line); }
        .eq-row:first-child { border-top: none; }
        @media (max-width: 560px) { .eq-seen { display: none; } }
      `}</style>
    </PanelCard>
  );
}
