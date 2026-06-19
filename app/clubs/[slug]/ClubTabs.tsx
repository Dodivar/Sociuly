"use client";

import { useState } from "react";
import { Tabs } from "@/components/ds/components";
import { ExperienceCard, ReviewCard } from "@/components/ds/patterns";
import { Icon } from "@/components/ds/icon";
import type {
  ClubExperienceCard,
  ClubProjectCard,
  ClubReviewCard,
  ClubTeamMember,
} from "@/lib/clubs/club-detail";

type TabId = "experiences" | "projets" | "avis" | "team";

type Props = {
  clubName: string;
  experiences: ClubExperienceCard[];
  projects: ClubProjectCard[];
  reviews: ClubReviewCard[];
  team: ClubTeamMember[];
  counts: { experiences: number; projects: number; reviews: number };
};

const AVATAR_TONES = ["green", "orange", "yellow", "ink"] as const;

export function ClubTabs({ clubName, experiences, projects, reviews, team, counts }: Props) {
  const [active, setActive] = useState<TabId>("experiences");

  return (
    <>
      {/* Navigation de section : filet de séparation pleine largeur, barre transparente.
          Le scroll horizontal préserve l'accès aux onglets sur mobile sans créer de cadre. */}
      <div
        style={{
          marginTop: 32,
          borderBottom: "1px solid var(--line)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ display: "inline-block", minWidth: "100%" }}>
          <Tabs
            variant="underline"
            active={active}
            onChange={(id) => setActive(id as TabId)}
            items={[
              { id: "experiences", label: `Expériences · ${counts.experiences}` },
              { id: "projets", label: `Projets · ${counts.projects}` },
              { id: "avis", label: `Avis · ${counts.reviews}` },
              { id: "team", label: "Équipe" },
            ]}
          />
        </div>
      </div>

      <div style={{ marginTop: 20, paddingBottom: 48 }}>
        {active === "experiences" && (
          experiences.length === 0 ? (
            <p className="sy-small sy-muted">Aucune expérience publiée pour le moment.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              {experiences.map((p) => (
                <ExperienceCard
                  key={p.slug}
                  href={`/experiences/${p.slug}`}
                  title={p.title}
                  price={p.price}
                  loc={clubName}
                  hue={p.hue}
                  goal={p.goal}
                  funds={p.funds}
                  rating={p.rating}
                  reviews={p.reviews}
                  category={p.categoryLabel}
                />
              ))}
            </div>
          )
        )}

        {active === "projets" && (
          projects.length === 0 ? (
            <p className="sy-small sy-muted">Aucun projet pour le moment.</p>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
            {projects.map((p) => (
              <div
                key={p.title}
                className="sy-card"
                style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <span className="sy-mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {p.eyebrow}
                    </span>
                    <h3 className="sy-h3" style={{ marginTop: 4 }}>{p.title}</h3>
                  </div>
                  {!p.funded ? (
                    <span
                      className="sy-chip sy-chip-primary sy-chip-sm"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    >
                      en cours
                    </span>
                  ) : (
                    <span
                      className="sy-chip sy-chip-sm"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    >
                      financé ✓
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 14 }}>
                  <div
                    className="sy-progress"
                    style={{ height: 6, borderRadius: 99, background: "var(--line-2)", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(p.goal * 100, 100)}%`,
                        background: !p.funded ? "var(--primary)" : "var(--accent)",
                        borderRadius: 99,
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span className="sy-small sy-num">
                      €{Math.round(p.raisedCents / 100).toLocaleString("fr-FR")} / €{Math.round(p.targetCents / 100).toLocaleString("fr-FR")}
                    </span>
                    {p.funded && (
                      <span className="sy-small" style={{ color: "var(--accent-deep)" }}>
                        <Icon name="check" size={11} /> Objectif atteint
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        )}

        {active === "avis" && (
          reviews.length === 0 ? (
            <p className="sy-small sy-muted">Aucun avis pour le moment.</p>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
            {reviews.map((a) => (
              <ReviewCard
                key={a.id}
                name={a.name}
                date={a.date}
                rating={a.rating}
                body={a.body}
                tone={a.tone}
              />
            ))}
          </div>
          )
        )}

        {active === "team" && (
          team.length === 0 ? (
            <p className="sy-small sy-muted">Équipe à compléter.</p>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {team.map((member, i) => {
              const tone = AVATAR_TONES[i % AVATAR_TONES.length];
              return (
                <div
                  key={member.name}
                  className="sy-card"
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    border: "1px solid var(--line)", background: "var(--surface)",
                  }}
                >
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: tone === "green" ? "var(--primary-soft)"
                        : tone === "orange" ? "var(--accent-soft)"
                        : tone === "yellow" ? "var(--highlight-soft)"
                        : "var(--surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--display)", fontWeight: 700, fontSize: 15,
                      color: tone === "green" ? "var(--primary-deep)"
                        : tone === "orange" ? "var(--accent-deep)"
                        : tone === "yellow" ? "var(--ink)"
                        : "var(--ink-3)",
                      fontVariationSettings: "var(--display-var)",
                      flexShrink: 0,
                    }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <div className="sy-h4">{member.name}</div>
                    <div className="sy-mono" style={{ marginTop: 2 }}>{member.role}</div>
                    <div className="sy-small sy-muted" style={{ marginTop: 2 }}>depuis {member.since}</div>
                  </div>
                </div>
              );
            })}
          </div>
          )
        )}
      </div>
    </>
  );
}
