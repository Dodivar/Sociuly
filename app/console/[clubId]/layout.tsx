import { ClubSidebar } from "@/components/console/club-sidebar";
import { requireClubAccess } from "@/lib/auth/rbac";
import { getClubSummary, getDashboardData } from "@/lib/console/dashboard";

type Props = {
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
};

export default async function ConsoleLayout({ children, params }: Props) {
  const { clubId } = await params;
  // Garde RBAC (défense en profondeur ; le middleware barre déjà en amont) :
  // rôle club_admin + appartenance au club via ClubMember (SPEC §6).
  await requireClubAccess(clubId);
  // TODO(api): paralléliser via Promise.all et remplacer par des fetchers réels.
  const [club, data] = await Promise.all([
    getClubSummary(clubId),
    getDashboardData(clubId),
  ]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <ClubSidebar club={club} clubId={clubId} badges={data.navBadges} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          paddingBottom: 60,
        }}
      >
        {children}
      </main>
    </div>
  );
}
