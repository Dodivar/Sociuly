"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Btn, Stars, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { StatCard } from "@/components/console/stat-card";
import {
  REPORT_REASON_LABEL,
  type RatingDistribution,
  type ReportReason,
  type Review,
  type ReviewsData,
} from "@/lib/console/reviews";

type Props = { data: ReviewsData };

type TabId = "all" | "new" | "reported";

const REASON_ORDER: ReportReason[] = [
  "offensive",
  "false",
  "off_topic",
  "personal_data",
  "spam",
  "other",
];

export function ReviewsView({ data }: Props) {
  const [tab, setTab] = useState<TabId>("all");
  // État local : un signalement met l'avis en `reported` (modération admin Sociuly, SPEC §5).
  // TODO(api): brancher sur une Server Action `reportReview(reviewId, reason, note)`.
  const [reviews, setReviews] = useState<Review[]>(data.reviews);
  const [reportTarget, setReportTarget] = useState<Review | null>(null);

  const newCount = reviews.filter((r) => r.isNew).length;
  const reportedCount = reviews.filter((r) => r.status === "reported").length;

  const visible = useMemo(() => {
    if (tab === "new") return reviews.filter((r) => r.isNew);
    if (tab === "reported") return reviews.filter((r) => r.status === "reported");
    return reviews;
  }, [reviews, tab]);

  function handleReport(reason: ReportReason) {
    if (!reportTarget) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reportTarget.id
          ? { ...r, status: "reported", reportReason: reason }
          : r,
      ),
    );
    setReportTarget(null);
  }

  return (
    <>
      <header className="av-head">
        <div>
          <h1 className="sy-h1">Avis reçus</h1>
          <p className="sy-small sy-muted" style={{ marginTop: 4 }}>
            Avis laissés par les organisations après leurs expériences. Un avis problématique peut
            être signalé à l'équipe Sociuly pour modération.
          </p>
        </div>
      </header>

      <div className="av-body">
        <div className="sy-grid-4">
          <StatCard
            icon="star"
            label="Note moyenne"
            value={data.kpis.averageRating.toFixed(1)}
            delta="+0,1 pt"
            deltaPositive
          />
          <StatCard icon="chat" label="Total avis" value={String(data.kpis.totalCount)} />
          <StatCard icon="sparkle" label="Nouveaux avis" value={String(newCount)} />
          <StatCard icon="flag" label="En modération" value={String(reportedCount)} />
        </div>

        <DistributionCard
          distribution={data.kpis.distribution}
          total={data.kpis.totalCount}
          average={data.kpis.averageRating}
        />

        <section className="sy-card av-list" style={{ padding: 0, overflow: "hidden" }}>
          <div className="av-list-head">
            <div>
              <div className="sy-mono">Modération</div>
              <h2 className="sy-h2" style={{ marginTop: 2 }}>
                {tab === "new"
                  ? "Nouveaux avis"
                  : tab === "reported"
                    ? "Avis signalés"
                    : "Tous les avis"}
              </h2>
            </div>
            <div className="av-tabs-scroll">
              <Tabs
                variant="pill"
                items={[
                  { id: "all", label: `Tous · ${reviews.length}` },
                  { id: "new", label: `Nouveaux · ${newCount}` },
                  { id: "reported", label: `Signalés · ${reportedCount}` },
                ]}
                active={tab}
                onChange={(id) => setTab(id as TabId)}
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <ul className="av-items">
              {visible.map((r) => (
                <li key={r.id}>
                  <ReviewRow review={r} onReport={() => setReportTarget(r)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="av-foot sy-small sy-muted">
          <Icon name="info" size={14} color="var(--ink-3)" />
          La réponse publique aux avis n'est pas disponible en v1. Les signalements sont traités a
          posteriori par l'équipe Sociuly.
        </p>
      </div>

      {reportTarget && (
        <ReportDialog
          review={reportTarget}
          onConfirm={handleReport}
          onClose={() => setReportTarget(null)}
        />
      )}

      <style>{`
        .av-head {
          padding: 20px 32px;
          border-bottom: 1px solid var(--line);
          background: var(--surface);
        }
        .av-body { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }

        .av-list-head {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 18px 22px; border-bottom: 1px solid var(--line);
        }
        .av-tabs-scroll { overflow-x: auto; }
        .av-tabs-scroll::-webkit-scrollbar { height: 0; }

        .av-items { display: flex; flex-direction: column; }
        .av-items > li { border-top: 1px solid var(--line); }
        .av-items > li:first-child { border-top: none; }

        .av-foot {
          display: flex; align-items: center; gap: 8px;
        }

        @media (max-width: 1024px) {
          .av-body { padding: 22px 24px; }
        }
        @media (max-width: 768px) {
          .av-head { padding: 16px 18px; }
          .av-body { padding: 16px 16px; }
          .av-list-head { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </>
  );
}

// ─────────────── Répartition des notes ───────────────

function DistributionCard({
  distribution,
  total,
  average,
}: {
  distribution: RatingDistribution;
  total: number;
  average: number;
}) {
  const rows = [5, 4, 3, 2, 1] as const;
  return (
    <section className="sy-card av-dist">
      <div className="av-dist-summary">
        <div className="sy-num av-dist-avg">{average.toFixed(1)}</div>
        <Stars value={average} size={16} />
        <div className="sy-small sy-muted" style={{ marginTop: 6 }}>
          {total} avis vérifié{total > 1 ? "s" : ""}
        </div>
      </div>
      <div className="av-dist-bars" role="list" aria-label="Répartition des notes">
        {rows.map((star) => {
          const count = distribution[star];
          const pct = total === 0 ? 0 : count / total;
          return (
            <div key={star} className="av-dist-row" role="listitem">
              <span className="sy-small av-dist-label">
                {star}
                <span aria-hidden style={{ color: "var(--accent)" }}>
                  ★
                </span>
              </span>
              <div className="av-dist-track" aria-hidden>
                <i style={{ width: `${Math.max(pct * 100, count > 0 ? 3 : 0)}%` }} />
              </div>
              <span className="sy-num sy-small av-dist-count">{count}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        .av-dist {
          display: flex; align-items: center; gap: 32px;
        }
        .av-dist-summary {
          flex: 0 0 auto; text-align: center;
          padding-right: 32px; border-right: 1px solid var(--line);
        }
        .av-dist-avg {
          font-family: var(--display); font-weight: 700; font-size: 44px; line-height: 1;
          font-variation-settings: var(--display-var); color: var(--ink);
          margin-bottom: 8px;
        }
        .av-dist-bars { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
        .av-dist-row { display: flex; align-items: center; gap: 12px; }
        .av-dist-label {
          flex: 0 0 36px; display: inline-flex; align-items: center; gap: 3px;
          color: var(--ink-2); font-weight: 500;
        }
        .av-dist-track {
          flex: 1; height: 8px; border-radius: 999px; background: var(--surface-2);
          overflow: hidden;
        }
        .av-dist-track > i {
          display: block; height: 100%; border-radius: 999px;
          background: var(--accent);
        }
        .av-dist-count { flex: 0 0 32px; text-align: right; color: var(--ink-2); }

        @media (max-width: 768px) {
          .av-dist { flex-direction: column; align-items: stretch; gap: 18px; }
          .av-dist-summary {
            padding-right: 0; padding-bottom: 18px;
            border-right: none; border-bottom: 1px solid var(--line);
          }
        }
      `}</style>
    </section>
  );
}

// ─────────────── Ligne d'avis ───────────────

function ReviewRow({ review, onReport }: { review: Review; onReport: () => void }) {
  const isReported = review.status === "reported";
  return (
    <article className="av-row">
      <Avatar initials={review.organizationInitials} tone="green" />

      <div className="av-row-main">
        <div className="av-row-top">
          <div style={{ minWidth: 0 }}>
            <div className="av-row-org">
              {review.organizationName}
              {review.isNew && (
                <span className="sy-chip sy-chip-sm av-new" aria-label="Nouvel avis">
                  Nouveau
                </span>
              )}
            </div>
            <div className="sy-small sy-muted av-row-meta">
              {review.experienceTitle} · <span className="sy-num">{review.bookingNumber}</span>
            </div>
          </div>
          <div className="av-row-aside">
            <Stars value={review.rating} size={14} />
            <span className="sy-mono av-row-date">{review.publishedAtLabel}</span>
          </div>
        </div>

        {review.comment ? (
          <p className="sy-body av-row-comment">« {review.comment} »</p>
        ) : (
          <p className="sy-small sy-muted av-row-comment" style={{ fontStyle: "italic" }}>
            Note attribuée sans commentaire.
          </p>
        )}

        <div className="av-row-actions">
          {isReported ? (
            <span className="av-reported">
              <Icon name="flag" size={14} color="var(--accent-deep)" />
              Signalé{review.reportReason ? ` · ${REPORT_REASON_LABEL[review.reportReason]}` : ""} ·
              en cours de modération
            </span>
          ) : (
            <Btn
              variant="ghost"
              size="sm"
              icon={<Icon name="flag" size={14} />}
              onClick={onReport}
              aria-label={`Signaler l'avis de ${review.organizationName}`}
            >
              Signaler
            </Btn>
          )}
        </div>
      </div>

      <style>{`
        .av-row { display: flex; gap: 14px; padding: 18px 22px; }
        .av-row-main { flex: 1; min-width: 0; }
        .av-row-top {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
        }
        .av-row-org {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          font-weight: 600; font-size: 15px; color: var(--ink);
        }
        .av-row-meta {
          margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .av-new {
          background: var(--highlight-soft); color: #6e5111; font-weight: 600;
        }
        .av-row-aside {
          flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
        }
        .av-row-date { color: var(--ink-3); font-size: 11.5px; }
        .av-row-comment { margin-top: 10px; }
        .av-row-actions { margin-top: 12px; }
        .av-reported {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 500; color: var(--accent-deep);
        }
        @media (max-width: 640px) {
          .av-row-top { flex-direction: column; }
          .av-row-aside { flex-direction: row; align-items: center; gap: 10px; }
          .av-row-meta { white-space: normal; }
        }
      `}</style>
    </article>
  );
}

// ─────────────── État vide ───────────────

function EmptyState({ tab }: { tab: TabId }) {
  const msg =
    tab === "new"
      ? "Aucun nouvel avis à consulter."
      : tab === "reported"
        ? "Aucun avis signalé."
        : "Aucun avis pour le moment.";
  return (
    <div style={{ padding: "40px 22px", textAlign: "center" }}>
      <div
        aria-hidden
        style={{
          width: 48, height: 48, borderRadius: 14, background: "var(--surface-2)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
        }}
      >
        <Icon name="star" size={22} color="var(--ink-3)" />
      </div>
      <div className="sy-mono">{msg}</div>
    </div>
  );
}

// ─────────────── Dialogue de signalement ───────────────

function ReportDialog({
  review,
  onConfirm,
  onClose,
}: {
  review: Review;
  onConfirm: (reason: ReportReason) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector("input")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="av-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="av-dialog-title"
      onClick={onClose}
    >
      <div ref={dialogRef} className="sy-card av-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 id="av-dialog-title" className="sy-h2">
          Signaler cet avis
        </h2>
        <p className="sy-body" style={{ marginTop: 8 }}>
          L'avis de <strong>{review.organizationName}</strong> sera transmis à l'équipe Sociuly pour
          modération. Il reste visible tant qu'il n'a pas été examiné.
        </p>

        <fieldset className="av-reasons">
          <legend className="sy-label">Motif du signalement</legend>
          {REASON_ORDER.map((key) => (
            <label key={key} className={`av-reason ${reason === key ? "is-on" : ""}`}>
              <input
                type="radio"
                name="report-reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
              />
              <span>{REPORT_REASON_LABEL[key]}</span>
            </label>
          ))}
        </fieldset>

        <div className="av-dialog-actions">
          <Btn variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn
            variant="dark"
            icon={<Icon name="flag" size={15} />}
            disabled={!reason}
            onClick={() => reason && onConfirm(reason)}
          >
            Transmettre le signalement
          </Btn>
        </div>
      </div>

      <style>{`
        .av-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(11, 21, 48, 0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .av-dialog {
          width: 100%; max-width: 480px;
          box-shadow: var(--shadow-lg);
          border-color: var(--line);
        }
        .av-reasons {
          margin-top: 16px; padding: 0; border: none;
          display: flex; flex-direction: column; gap: 8px;
        }
        .av-reasons legend { margin-bottom: 8px; }
        .av-reason {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 12px;
          border: 1px solid var(--line-2); cursor: pointer;
          font-size: 14px; color: var(--ink-2);
          transition: border-color .15s ease, background .15s ease, color .15s ease;
        }
        .av-reason:hover { background: var(--surface-2); }
        .av-reason.is-on {
          border-color: var(--ink); color: var(--ink); font-weight: 500;
          background: var(--surface-2);
        }
        .av-reason input { accent-color: var(--primary); width: 16px; height: 16px; }
        .av-reason:focus-within { outline: 3px solid var(--ring); outline-offset: 2px; }
        .av-dialog-actions {
          margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;
        }
        @media (max-width: 480px) {
          .av-dialog-actions { flex-direction: column-reverse; }
          .av-dialog-actions > * { width: 100%; }
        }
      `}</style>
    </div>
  );
}
