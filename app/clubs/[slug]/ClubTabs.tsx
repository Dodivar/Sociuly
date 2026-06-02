"use client";

import { useState } from "react";
import { Tabs } from "@/components/ds/components";
import { ExperienceCard, ReviewCard } from "@/components/ds/patterns";
import { Icon } from "@/components/ds/icon";
import type { ExperienceHue } from "@/components/ds/patterns";

type TabId = "experiences" | "projets" | "avis" | "team";

const EXPERIENCES = [
  { title: "Journée immersion · SIG", price: 4800, hue: "green" as ExperienceHue, goal: 0.62, funds: "École de jeunes U17", rating: 4.9, reviews: 47, category: "Cohésion · 20–60 pers." },
  { title: "Match VIP & hospitalités", price: 2400, hue: "orange" as ExperienceHue, goal: 0.78, funds: "Mini-bus du club", rating: 4.9, reviews: 62, category: "Match VIP · 20–60 pers." },
  { title: "Initiation basket encadrée", price: 900, hue: "yellow" as ExperienceHue, goal: 0.25, funds: "Maillots saison", rating: 4.6, reviews: 28, category: "Initiation · 15–30 pers." },
  { title: "Atelier cohésion d'équipe", price: 1200, hue: "teal" as ExperienceHue, goal: 0.5, funds: "Tournoi U17", rating: 4.9, reviews: 34, category: "Cohésion · 10–40 pers." },
  { title: "Masterclass joueur pro", price: 1800, hue: "rust" as ExperienceHue, goal: 0.45, funds: "Équipement U13", rating: 4.7, reviews: 19, category: "Masterclass · 10–40 pers." },
  { title: "Cocktail & visite des coulisses", price: 1100, hue: "sand" as ExperienceHue, goal: 0.3, funds: "École de jeunes", rating: 4.8, reviews: 12, category: "Coulisses · 15–50 pers." },
];

const PROJETS = [
  { title: "École de jeunes U17 · saison 2026", goal: 0.62, raised: 24800, target: 40000, days: 12, category: "Formation", active: true },
  { title: "Mini-bus du club", goal: 1, raised: 62000, target: 62000, days: 0, category: "Équipement", active: false },
  { title: "Maillots saison 2025–26", goal: 0.25, raised: 7500, target: 30000, days: 34, category: "Équipement", active: true },
  { title: "Stage été U13", goal: 0.88, raised: 22000, target: 25000, days: 8, category: "Formation", active: true },
];

const AVIS = [
  { name: "Élodie M. · DRH", date: "avril 2026", rating: 5, body: "Séminaire de cohésion impeccable pour nos 32 collaborateurs. Le club a tout organisé, et notre budget a directement soutenu leur école de jeunes.", tone: "orange" as const },
  { name: "Thomas B. · Office Manager", date: "mars 2026", rating: 5, body: "Un match VIP parfait pour notre séminaire annuel. L'équipe SIG est pro et accueillante du début à la fin.", tone: "green" as const },
  { name: "Sophie M. · CEO", date: "mars 2026", rating: 4, body: "Très bonne expérience d'équipe, encadrants passionnés. Initiation accessible même pour les non-sportifs.", tone: "yellow" as const },
  { name: "Adrien K. · Head of People", date: "février 2026", rating: 5, body: "La masterclass avec un joueur pro a marqué les esprits. Organisation millimétrée, on reviendra l'an prochain.", tone: "ink" as const },
];

const TEAM = [
  { name: "Marc Dubois", role: "Président", since: "2019", initials: "MD" },
  { name: "Laure Martin", role: "Responsable expériences entreprises", since: "2021", initials: "LM" },
  { name: "Julien Rosa", role: "Coach principal", since: "2017", initials: "JR" },
  { name: "Amina Bel", role: "Responsable école de jeunes", since: "2022", initials: "AB" },
  { name: "Pierre Vidal", role: "Trésorier", since: "2020", initials: "PV" },
  { name: "Céline Faure", role: "Responsable hospitalités", since: "2023", initials: "CF" },
];

const AVATAR_TONES = ["green", "orange", "yellow", "ink"] as const;

export function ClubTabs() {
  const [active, setActive] = useState<TabId>("experiences");

  return (
    <>
      <div style={{ marginTop: 32, borderBottom: "1px solid var(--line)" }}>
        <Tabs
          variant="underline"
          active={active}
          onChange={(id) => setActive(id as TabId)}
          items={[
            { id: "experiences", label: "Expériences · 12" },
            { id: "projets", label: "Projets · 4" },
            { id: "avis", label: "Avis · 47" },
            { id: "team", label: "Équipe" },
          ]}
        />
      </div>

      <div style={{ marginTop: 20, paddingBottom: 48 }}>
        {active === "experiences" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {EXPERIENCES.map((p) => (
              <ExperienceCard
                key={p.title}
                title={p.title}
                price={p.price}
                hue={p.hue}
                goal={p.goal}
                funds={p.funds}
                rating={p.rating}
                reviews={p.reviews}
                category={p.category}
              />
            ))}
          </div>
        )}

        {active === "projets" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
            {PROJETS.map((p) => (
              <div
                key={p.title}
                className="sy-card"
                style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <span className="sy-mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {p.category}
                    </span>
                    <h3 className="sy-h3" style={{ marginTop: 4 }}>{p.title}</h3>
                  </div>
                  {p.active ? (
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
                        background: p.active ? "var(--primary)" : "var(--accent)",
                        borderRadius: 99,
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span className="sy-small sy-num">
                      €{p.raised.toLocaleString("fr-FR")} / €{p.target.toLocaleString("fr-FR")}
                    </span>
                    {p.active && p.days > 0 && (
                      <span className="sy-small sy-muted">reste {p.days}j</span>
                    )}
                    {!p.active && (
                      <span className="sy-small" style={{ color: "var(--accent-deep)" }}>
                        <Icon name="check" size={11} /> Objectif atteint
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "avis" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
            {AVIS.map((a) => (
              <ReviewCard
                key={a.name}
                name={a.name}
                date={a.date}
                rating={a.rating}
                body={a.body}
                tone={a.tone}
              />
            ))}
          </div>
        )}

        {active === "team" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {TEAM.map((member, i) => {
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
        )}
      </div>
    </>
  );
}
