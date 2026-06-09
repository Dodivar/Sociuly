import { Icon } from "@/components/ds/icon";
import type { Task, TaskTone } from "@/lib/console/dashboard";

const TONE_COLOR: Record<TaskTone, string> = {
  urgent: "var(--accent)",
  warn:   "var(--highlight)",
  info:   "var(--primary)",
};

type Props = { tasks: Task[] };

export function TasksCard({ tasks }: Props) {
  return (
    <section className="sy-card" aria-label="À faire">
      <div className="sy-mono">À faire</div>
      <ul
        style={{
          marginTop: 10, display: "flex", flexDirection: "column", gap: 10,
          listStyle: "none", padding: 0,
        }}
      >
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className="task-row"
              aria-label={`${t.label}${t.hint ? ` (${t.hint})` : ""}`}
            >
              <span
                aria-hidden
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: TONE_COLOR[t.tone], flex: "0 0 auto",
                }}
              />
              <span style={{ flex: 1, textAlign: "left" }}>
                <span
                  className="sy-small"
                  style={{ color: "var(--ink)", fontWeight: 500, display: "block" }}
                >
                  {t.label}
                </span>
                {t.hint && (
                  <span
                    className="sy-mono"
                    style={{ color: "var(--accent-deep)", fontSize: 9, display: "block" }}
                  >
                    {t.hint}
                  </span>
                )}
              </span>
              <Icon name="arrow" size={13} color="var(--ink-3)" />
            </button>
          </li>
        ))}
      </ul>

      <style>{`
        .task-row {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: var(--surface-2);
          border: none;
          color: inherit;
          font: inherit;
          cursor: pointer;
          transition: background .15s ease;
        }
        .task-row:hover { background: var(--surface-3); }
        .task-row:focus-visible {
          outline: 3px solid var(--ring); outline-offset: 2px;
        }
      `}</style>
    </section>
  );
}
