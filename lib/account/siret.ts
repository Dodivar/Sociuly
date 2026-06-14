// Vérification / enrichissement SIRET via l'API INSEE Sirene — SERVEUR UNIQUEMENT.
//
// Sert à deux endroits (CLAUDE.md §4 — KYC club, §6 — onboarding entreprise) :
//   • valider qu'un SIRET à 14 chiffres existe bien dans la base entreprises ;
//   • pré-remplir la raison sociale (denominationUniteLegale / nom-prénom).
//
// L'appel n'est tenté que si `INSEE_SIRENE_API_KEY` est défini (sinon on retourne
// `verified: false` sans bloquer — la vérification stricte reste un gate KYC admin,
// pas un point dur du formulaire). Échec réseau/HTTP → dégradé, jamais d'exception.

import "server-only";

export type SiretLookup = {
  /** SIRET trouvé et actif dans la base INSEE. */
  verified: boolean;
  /** Raison sociale (dénomination personne morale, sinon nom + prénom). */
  name?: string;
  /** Message d'erreur explicite (introuvable, format, API indisponible). */
  error?: string;
};

/** Normalise un SIRET (retire espaces) et vérifie le format 14 chiffres. */
export function normalizeSiret(raw: string): string | null {
  const digits = raw.replace(/\s+/g, "");
  return /^\d{14}$/.test(digits) ? digits : null;
}

export function isInseeConfigured(): boolean {
  return Boolean(process.env.INSEE_SIRENE_API_KEY);
}

/**
 * Recherche un établissement par SIRET dans l'API Sirene v3.11.
 * Retourne `verified: false` (sans erreur bloquante) si la clé API n'est pas
 * configurée — la vérification ferme reste à la charge de la validation KYC admin.
 */
export async function lookupSiret(rawSiret: string): Promise<SiretLookup> {
  const siret = normalizeSiret(rawSiret);
  if (!siret) return { verified: false, error: "SIRET invalide (14 chiffres attendus)." };

  if (!isInseeConfigured()) {
    // Pas de clé : on n'échoue pas le parcours, la vérification est différée (KYC).
    return { verified: false };
  }

  try {
    const res = await fetch(`https://api.insee.fr/api-sirene/3.11/siret/${siret}`, {
      headers: {
        "X-INSEE-Api-Key-Integration": process.env.INSEE_SIRENE_API_KEY!,
        Accept: "application/json",
      },
      // Données stables : on autorise un cache court côté fetch Next.
      next: { revalidate: 86_400 },
    });

    if (res.status === 404) return { verified: false, error: "SIRET introuvable dans la base INSEE." };
    if (!res.ok) return { verified: false, error: "Service INSEE momentanément indisponible." };

    const data = (await res.json()) as {
      etablissement?: {
        uniteLegale?: {
          denominationUniteLegale?: string | null;
          nomUniteLegale?: string | null;
          prenom1UniteLegale?: string | null;
        };
      };
    };

    const ul = data.etablissement?.uniteLegale;
    const name =
      ul?.denominationUniteLegale ||
      [ul?.prenom1UniteLegale, ul?.nomUniteLegale].filter(Boolean).join(" ") ||
      undefined;

    return { verified: true, name: name ?? undefined };
  } catch {
    return { verified: false, error: "Service INSEE momentanément indisponible." };
  }
}
