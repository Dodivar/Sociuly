import { DashboardHeader } from "@/components/console/dashboard-header";
import { StatCard } from "@/components/console/stat-card";
import { BookingsPanel } from "@/components/console/bookings-panel";
import { FundingCard } from "@/components/console/funding-card";
import { TasksCard } from "@/components/console/tasks-card";
import { getDashboardData } from "@/lib/console/dashboard";

type Props = { params: Promise<{ clubId: string }> };

export default async function DashboardPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch SWR-cached côté serveur (revalidate, tags).
  const data = await getDashboardData(clubId);

  return (
    <>
      <DashboardHeader greeting={data.greeting} summary={data.summary} />

      <div style={{ padding: "24px 32px" }}>
        <div className="sy-grid-4">
          {data.stats.map((s) => (
            <StatCard
              key={s.id}
              icon={s.icon}
              label={s.label}
              value={s.value}
              delta={s.delta}
              deltaPositive={s.deltaPositive}
            />
          ))}
        </div>

        <div className="dash-split">
          <BookingsPanel bookings={data.bookings} totalCount={data.bookingsTotal} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FundingCard project={data.project} />
            <TasksCard tasks={data.tasks} />
          </div>
        </div>
      </div>

      <style>{`
        .dash-split {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .dash-split { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
