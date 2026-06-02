"use client";

import { useState } from "react";
import { Tabs } from "@/components/ds/components";
import { PrestationCard, ReviewCard } from "@/components/ds/patterns";
import { Icon } from "@/components/ds/icon";
import type { PrestationHue } from "@/components/ds/patterns";

type TabId = "prestations" | "projets" | "avis" | "team";

const PRESTATIONS = [
  { title: "Barbecue convivial du club", price: 280, hue: "green" as PrestationHue, goal: 0.62, funds: "Tournoi U17", rating: 4.8, reviews: 47 },
  { title: "Olympiades en entreprise", price: 720, hue: "orange" as PrestationHue, goal: 0.78, funds: "Mini-bus du club", rating: 4.9, reviews: 62 },
  { title: "Anniversaire sportif", price: 180, hue: "yellow" as PrestationHue, goal: 0.25, funds: "Maillots saison", rating: 4.6, reviews: 28 },
  { title: "Initiation volley", price: 150, hue: "teal" as PrestationHue, goal: 0.5, funds: "Tournoi Espagne", rating: 4.9, reviews: 34 },
  { title: "Team building sportif", price: 480, hue: "rust" as PrestationHue, goal: 0.45, funds: "Équipement U13", rating: 4.7, reviews: 19 },
  { title: "Stage d'initiation", price: 95, hue: "sand" as PrestationHue, goal: 0.3, funds: "Formation bénévoles", rating: 4.8, reviews: 12 },
];

const PROJETS = [
  { title: "Tournoi national U17 · Espagne", goal: 0.62, raised: 2480, target: 4000, days: 12, category: "Déplacement", active: true },
  { title: "Mini-bus du club", goal: 1, raised: 6200, target: 6200, days: 0, category: "Équipement", active: false },
  { title: "Maillots saison 2025–26", goal: 0.25, raised: 750, target: 3000, days: 34, category: "Équipement", active: true },
  { title: "Formation arbitres régionaux", goal: 0.88, raised: 2200, target: 2500, days: 8, category: "Formation", active: true },
];

const AVIS = [
  { name: "Camille L.", date: "avril 2026", rating: 5, body: "Super journée pour le BBQ de mon entreprise, équipe ultra réactive et on a fait avancer un projet local !", tone: "orange" as const },
  { name: "Thomas B.", date: "mars 2026", rating: 5, body: "Les olympiades étaient parfaites pour notre séminaire. L'équipe USB Volley est pro et enthousiaste.", tone: "green" as const },
  { name: "Sophie M.", date: "mars 2026", rating: 4, body: "Très bonne expérience, les animateurs sont passionnés. Parfait pour l'anniversaire de notre fils.", tone: "yellow" as const },
  { name: "Adrien K.", date: "février 2026", rating: 5, body: "On a adoré l'initiation volley, même pour des débutants complets. Bravo au club !", tone: "ink" as const },
];

const TEAM = [
  { name: "Marc Dubois", role: "Président", since: "2019", initials: "MD" },
  { name: "Laure Martin", role: "Responsable prestations", since: "2021", initials: "LM" },
  { name: "Julien Rosa", role: "Entraîneur seniors", since: "2017", initials: "JR" },
  { name: "Amina Bel", role: "Responsable U17", since: "2022", initials: "AB" },
  { name: "Pierre Vidal", role: "Trésorier", since: "2020", initials: "PV" },
  { name: "Céline Faure", role: "Responsable U13", since: "2023", initials: "CF" },
];

const AVATAR_TONES = ["green", "orange", "yellow", "ink"] as const;

export function AssociationTabs() {
  const [active, setActive] = useState<TabId>("prestations");

  return (
    <>
      <div style={{ marginTop: 32, borderBottom: "1px solid var(--line)" }}>
        <Tabs
          variant="underline"
          active={active}
          onChange={(id) => setActive(id as TabId)}
          items={[
            { id: "prestations", label: "Prestations · 12" },
            { id: "projets", label: "Projets · 4" },
            { id: "avis", label: "Avis · 47" },
            { id: "team", label: "Équipe" },
          ]}
        />
      </div>

      <div style={{ marginTop: 20, paddingBottom: 48 }}>
        {active === "prestations" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {PRESTATIONS.map((p) => (
              <PrestationCard
                key={p.title}
                title={p.title}
                price={p.price}
                hue={p.hue}
                goal={p.goal}
                funds={p.funds}
                rating={p.rating}
                reviews={p.reviews}
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
