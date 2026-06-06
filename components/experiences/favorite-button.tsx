"use client";

// Bouton « Sauver » de la page détail — bascule le favori (partagé avec la
// marketplace et la carte via le hook useFavorites). Cœur rouge plein une fois
// sauvé. Client Component car favoris = état localStorage côté navigateur.

import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { useFavorites } from "@/lib/marketplace/favorites";

export function FavoriteButton({ experienceId }: { experienceId: string }) {
  const { ready, isFavorite, toggle } = useFavorites();
  const saved = ready && isFavorite(experienceId);

  return (
    <Btn
      variant={saved ? "outline" : "ghost"}
      size="sm"
      onClick={() => toggle(experienceId)}
      aria-pressed={saved}
      icon={
        <Icon
          name="heart"
          size={14}
          filled={saved}
          color={saved ? "var(--danger)" : undefined}
        />
      }
    >
      {saved ? "Sauvé" : "Sauver"}
    </Btn>
  );
}
