"use client";

import { useState } from "react";
import { Btn } from "@/components/ds/components";

const PRESET_TIPS = [0, 5, 10, 20] as const;

type Props = {
  projectName?: string;
  onChange?: (amount: number) => void;
};

export function TipSelector({ projectName = "le projet", onChange }: Props) {
  const [selected, setSelected] = useState<number>(10);
  const [custom, setCustom] = useState(false);

  function handleSelect(amount: number) {
    setSelected(amount);
    setCustom(false);
    onChange?.(amount);
  }

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {PRESET_TIPS.map((v) => (
        <Btn
          key={v}
          variant={!custom && v === selected ? "primary" : "soft"}
          size="sm"
          onClick={() => handleSelect(v)}
        >
          {v === 0 ? "aucun" : `+€${v}`}
        </Btn>
      ))}
      <Btn
        variant={custom ? "primary" : "soft"}
        size="sm"
        onClick={() => {
          setCustom(true);
          onChange?.(selected);
        }}
      >
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
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
              setSelected(val);
              onChange?.(val);
            }}
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
