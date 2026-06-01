"use client";

import { useState } from "react";
import { Btn, Chip, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

const CATEGORIES = ["Toutes", "BBQ", "Animation", "Buvette", "Événement", "Initiation", "Tournoi", "Stage"] as const;
const SORTS = ["Pertinence", "Prix ↑", "Note ★", "Distance"] as const;

type Category = (typeof CATEGORIES)[number];
type Sort = (typeof SORTS)[number];

export type FilterState = { category: Category; sort: Sort };

type Props = {
  onChange?: (filters: FilterState) => void;
};

export function MarketplaceFilters({ onChange }: Props) {
  const [category, setCategory] = useState<Category>("Toutes");
  const [sort, setSort] = useState<Sort>("Pertinence");

  function handleCategory(next: Category) {
    setCategory(next);
    onChange?.({ category: next, sort });
  }

  function handleSort(next: string) {
    const typedSort = next as Sort;
    setSort(typedSort);
    onChange?.({ category, sort: typedSort });
  }

  return (
    <div
      style={{
        padding: "14px var(--page-pad)",
        borderBottom: "1px solid var(--line)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Btn variant="outline" size="sm" icon={<Icon name="filter" size={13} />}>
        Filtres · 0
      </Btn>
      <div className="sy-divider-vert" style={{ height: 24, margin: "0 6px" }} />
      {CATEGORIES.map((c) => (
        <Chip
          key={c}
          variant={c === category ? "solid" : "outline"}
          onClick={() => handleCategory(c)}
        >
          {c}
        </Chip>
      ))}
      <div style={{ flex: 1 }} />
      <Tabs
        variant="pill"
        items={[...SORTS]}
        active={sort}
        onChange={handleSort}
      />
    </div>
  );
}
