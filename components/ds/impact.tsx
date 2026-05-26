import type { CSSProperties } from "react";
import { Progress } from "./components";
import { Icon } from "./icon";

// ─────── ImpactHero (signature) ───────
export function ImpactHero({
  title = "Tournoi national Espagne U17",
  asso = "USB Volley",
  value = 0.62,
  delta = 0.06,
  collected = 2480,
  target = 4000,
  bookingPrice = 280,
  bookings = 14,
  days = 12,
  style,
}: {
  title?: string; asso?: string; value?: number; delta?: number;
  collected?: number; target?: number; bookingPrice?: number;
  bookings?: number; days?: number; style?: CSSProperties;
}) {
  const newValue = Math.min(1, value + delta);
  return (
    <div
      className="sy-card-xl sy-card-elevated"
      style={{
        background: "linear-gradient(140deg, var(--accent-soft) 0%, var(--surface) 60%)",
        border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", overflow: "hidden",
        position: "relative", padding: 0, ...style,
      }}
    >
      <div style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span className="sy-chip sy-chip-accent" style={{ fontWeight: 600 }}>
            <span
              style={{
                position: "relative", display: "inline-block",
                width: 8, height: 8, borderRadius: "50%", background: "var(--accent)",
              }}
            />
            Projet en cours
          </span>
          <span className="sy-mono">{asso}</span>
        </div>

        <h2
          style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 36, lineHeight: 1.04,
            letterSpacing: "-0.025em", margin: 0,
            fontVariationSettings: "var(--display-var)", maxWidth: 460,
          }}
        >
          {title}
        </h2>

        <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 10 }}>
          <div
            className="sy-num"
            style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 64, lineHeight: 0.95,
              letterSpacing: "-0.035em", color: "var(--ink)",
              fontVariationSettings: "var(--display-var)",
            }}
          >
            €{collected.toLocaleString("fr-FR")}
          </div>
          <div className="sy-h3 sy-muted sy-num">collectés sur €{target.toLocaleString("fr-FR")}</div>
        </div>

        {/* dual progress with delta */}
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              position: "relative", height: 14, borderRadius: 999,
              background: "var(--surface-2)", overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${value * 100}%`, background: "var(--accent)", borderRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute", left: `${value * 100}%`, top: 0, bottom: 0,
                width: `${delta * 100}%`,
                background: `repeating-linear-gradient(45deg, var(--accent-deep) 0 5px, var(--accent) 5px 10px)`,
                borderTopRightRadius: 999, borderBottomRightRadius: 999,
              }}
            />
            <div
              style={{
                position: "absolute", left: `${value * 100}%`, top: -3, bottom: -3,
                width: 2, background: "var(--ink)", transform: "translateX(-1px)",
              }}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="sy-mono sy-num" style={{ color: "var(--ink-2)" }}>
              Aujourd&apos;hui · {Math.round(value * 100)}%
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="arrow" size={14} color="var(--accent-deep)" />
              <div
                className="sy-num"
                style={{
                  fontFamily: "var(--display)", fontWeight: 700, fontSize: 22,
                  fontVariationSettings: "var(--display-var)", color: "var(--accent-deep)",
                }}
              >
                {Math.round(newValue * 100)}%
              </div>
              <div className="sy-small" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>
                avec votre résa
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22, paddingTop: 18, borderTop: "1px dashed var(--line-2)",
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
          }}
        >
          <div>
            <div className="sy-mono">Votre apport</div>
            <div className="sy-h2 sy-num" style={{ marginTop: 4, color: "var(--accent-deep)" }}>
              +€{Math.round(bookingPrice * 0.3)}
            </div>
          </div>
          <div>
            <div className="sy-mono">Soutiens</div>
            <div className="sy-h2 sy-num" style={{ marginTop: 4 }}>{bookings}</div>
          </div>
          <div>
            <div className="sy-mono">Reste</div>
            <div className="sy-h2 sy-num" style={{ marginTop: 4 }}>{days}j</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────── ImpactMini (used inside cards) ───────
export function ImpactMini({
  title = "Tournoi national Espagne U17",
  asso = "USB Volley",
  value = 0.62,
  collected = 2480,
  target = 4000,
  style,
}: {
  title?: string; asso?: string; value?: number;
  collected?: number; target?: number; style?: CSSProperties;
}) {
  return (
    <div style={style}>
      <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>Finance · {asso}</div>
      <div className="sy-h4" style={{ marginTop: 2 }}>{title}</div>
      <Progress value={value} style={{ marginTop: 6 }} />
      <div className="sy-small sy-muted sy-num" style={{ marginTop: 4 }}>
        €{collected.toLocaleString("fr-FR")} / €{target.toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

// ─────── ImpactMap — visualizes contributions across nearby clubs ───────
export function ImpactMap({ style }: { style?: CSSProperties }) {
  const clubs: Array<{ x: number; y: number; size: "lg" | "md" | "sm"; pct: number; label: string; hot?: boolean }> = [
    { x: 18, y: 25, size: "lg", pct: 92, label: "USB Volley", hot: true },
    { x: 38, y: 60, size: "md", pct: 68, label: "AS Saint-Brieuc" },
    { x: 62, y: 32, size: "sm", pct: 32, label: "JA Strasbourg" },
    { x: 78, y: 70, size: "md", pct: 55, label: "RC Metz XV" },
    { x: 50, y: 18, size: "sm", pct: 18, label: "EC Nancy" },
  ];
  return (
    <div
      style={{
        position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
        background: "var(--surface-2)", aspectRatio: "16/10", ...style,
      }}
    >
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <pattern id="dotgrid" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.4" fill="var(--ink-3)" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="60" fill="url(#dotgrid)" />
        <path d="M 5 40 Q 25 25 45 35 T 95 30" stroke="var(--line-2)" fill="none" strokeWidth="0.6" />
        <path d="M 0 22 Q 30 12 60 22 T 100 18" stroke="var(--line-2)" fill="none" strokeWidth="0.5" />
        <path d="M 0 50 Q 35 42 65 50 T 100 48" stroke="var(--line-2)" fill="none" strokeWidth="0.4" />
      </svg>
      {clubs.map((c, i) => {
        const r = c.size === "lg" ? 30 : c.size === "md" ? 22 : 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: `${c.x}%`, top: `${c.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: r, height: r, borderRadius: "50%",
                background: c.hot ? "var(--accent)" : "var(--primary)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontWeight: 700, fontSize: r < 20 ? 9 : 11,
                boxShadow: "0 4px 12px rgba(20,36,31,.25)", position: "relative",
              }}
              title={c.label}
            >
              {c.pct}%
              {c.hot && (
                <span
                  style={{
                    position: "absolute", inset: -6, borderRadius: "50%",
                    border: "2px solid var(--accent)", opacity: 0.4,
                    animation: "sy-ping 2s ease-out infinite",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
      <style>{`@keyframes sy-ping { 0% { transform: scale(1); opacity: .6 } 100% { transform: scale(1.6); opacity: 0 } }`}</style>
      <div style={{ position: "absolute", left: 16, bottom: 16, right: 16 }}>
        <div
          className="sy-card"
          style={{
            background: "rgba(252,249,241,.95)", backdropFilter: "blur(12px)",
            padding: 14, borderRadius: "var(--radius-md)",
          }}
        >
          <div className="sy-mono">Cette semaine près de vous</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 4 }}>€8 320 collectés · 5 clubs actifs</div>
        </div>
      </div>
    </div>
  );
}

// ─────── Map for the marketplace (price pins on roads) ───────
export function MarketMap({ style }: { style?: CSSProperties }) {
  const pins: Array<{ x: number; y: number; price: number; hot?: boolean }> = [
    { x: 22, y: 30, price: 280, hot: true },
    { x: 42, y: 55, price: 180 },
    { x: 60, y: 22, price: 720 },
    { x: 72, y: 60, price: 350 },
    { x: 34, y: 75, price: 220 },
    { x: 58, y: 80, price: 420 },
    { x: 18, y: 60, price: 150 },
    { x: 82, y: 38, price: 480 },
  ];
  return (
    <div
      style={{
        position: "relative", height: "100%", overflow: "hidden",
        background: "var(--surface-2)", ...style,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <pattern id="dotgrid2" width="2.5" height="2.5" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.25" fill="var(--ink-3)" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dotgrid2)" />
        <path d="M 0 30 Q 30 22 50 32 T 100 25" stroke="var(--line-2)" fill="none" strokeWidth="1.2" />
        <path d="M 0 60 Q 35 50 60 60 T 100 55" stroke="var(--line-2)" fill="none" strokeWidth="0.9" />
        <path d="M 30 0 Q 35 30 30 60 T 35 100" stroke="var(--line-2)" fill="none" strokeWidth="0.8" />
        <path d="M 70 0 Q 72 40 68 70 T 70 100" stroke="var(--line-2)" fill="none" strokeWidth="0.8" />
        <path
          d="M 40 65 Q 55 60 65 72 Q 60 85 45 82 Q 38 75 40 65 Z"
          fill="var(--primary-soft)"
          opacity="0.7"
        />
      </svg>

      {pins.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="sy-num"
            style={{
              padding: "7px 14px", borderRadius: 999,
              background: p.hot ? "var(--accent)" : "var(--surface)",
              color: p.hot ? "#fff" : "var(--ink)",
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 13,
              border: `1.5px solid ${p.hot ? "var(--accent-deep)" : "var(--ink)"}`,
              boxShadow: "0 4px 12px rgba(20,36,31,.18)",
              fontVariationSettings: "var(--display-var)", whiteSpace: "nowrap",
            }}
          >
            €{p.price}
          </div>
        </div>
      ))}

      <div
        style={{
          position: "absolute", right: 16, top: 16,
          display: "flex", flexDirection: "column", gap: 4,
          background: "var(--surface)", borderRadius: 10, padding: 4,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <button className="sy-btn sy-btn-soft sy-btn-icon-sm" aria-label="Zoom +">
          <Icon name="plus" size={14} />
        </button>
        <button className="sy-btn sy-btn-soft sy-btn-icon-sm" aria-label="Zoom -">
          <Icon name="minus" size={14} />
        </button>
      </div>

      <div style={{ position: "absolute", left: 16, bottom: 16, right: 16 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            borderRadius: 999, background: "var(--ink)", color: "var(--surface)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%", background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
            }}
          >
            <Icon name="trophy" size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="sy-mono" style={{ color: "var(--highlight)" }}>cette semaine près de vous</div>
            <div className="sy-h4 sy-num" style={{ marginTop: 2, color: "var(--surface)" }}>
              €8 320 collectés · 5 clubs actifs
            </div>
          </div>
          <button
            className="sy-btn sy-btn-primary sy-btn-sm"
            style={{ borderRadius: 999 }}
            type="button"
          >
            Voir l&apos;impact <Icon name="arrow" size={13} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
