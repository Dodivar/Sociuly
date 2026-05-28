"use client";

import { useState } from "react";
import { Btn } from "@/components/ds/components";

const PRESET_TIPS = [0, 5, 10, 20] as const;

type Props = {
  projectName?: string;
  /** Valeur en euros. Fourni → mode contrôlé ; absent → état interne. */
  value?: number;
  onChange?: (euros: number) => void;
};

export function TipSelector({ projectName = "le projet", value, onChange }: Props) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<number>(10);
  const [custom, setCustom] = useState(false);

  const selected = isControlled ? value : internal;

  function select(euros: number) {
    if (!isControlled) setInternal(euros);
    setCustom(false);
    onChange?.(euros);
  }

  function openCustom() {
    setCustom(true);
    onChange?.(selected);
  }

  function handleCustomInput(raw: string) {
    const euros = Math.max(0, parseInt(raw, 10) || 0);
    if (!isControlled) setInternal(euros);
    onChange?.(euros);
  }

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {PRESET_TIPS.map((v) => (
        <Btn
          key={v}
          variant={!custom && v === selected ? "primary" : "soft"}
          size="sm"
          onClick={() => select(v)}
        >
          {v === 0 ? "aucun" : `+€${v}`}
        </Btn>
      ))}
      <Btn variant={custom ? "primary" : "soft"} size="sm" onClick={openCustom}>
        autre
      </Btn>
      {custom && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontFamily: "var(--sans)", color: "var(--ink-2)" }}>€</span>
          <input
            type="number"
            min={1}
            max={500}
            defaultValue={selected || 15}
            onChange={(e) => handleCustomInput(e.target.value)}
            style={{
              width: 72, padding: "6px 10px", borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--ink)", fontFamily: "var(--sans)",
              fontSize: 14, outline: "none", background: "var(--surface)", color: "var(--ink)",
            }}
          />
        </div>
      )}
      {selected > 0 && (
        <span className="sy-small sy-muted" style={{ marginLeft: 4 }}>
          → 100% reversé à {projectName}
        </span>
      )}
    </div>
  );
}
