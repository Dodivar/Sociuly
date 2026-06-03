"use server";

// TODO Phase B: installer zod, @prisma/client, @supabase/ssr, stripe, resend
// puis brancher chaque stub sur la vraie implémentation.

export type Sport =
  | "football" | "rugby" | "handball" | "volleyball" | "basketball"
  | "tennis" | "badminton" | "natation" | "athletisme" | "cyclisme"
  | "judo" | "karate" | "danse" | "gymnastique" | "autre";

export type Step1Data = {
  nomAssociation: string;
  siret: string;
  sport: Sport | string;
  ville: string;
  codePostal: string;
};

export type Step2Data = {
  prenomPresident: string;
  nomPresident: string;
  emailPresident: string;
  telephone: string;
  nombreMembres: string;
};

export type Step3Data = {
  statutsName: string;
  ribName: string;
  assuranceName: string;
  siretScanName?: string;
};

export type InscriptionDraft = {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
};

// ─── Lookup SIRET via INSEE Sirene (stub Phase B) ────────────────────────────
export async function lookupSiret(siret: string): Promise<{
  success: boolean;
  nomAssociation?: string;
  error?: string;
}> {
  // TODO Phase B: GET https://api.insee.fr/entreprises/sirene/V3/siret/{siret}
  // Authorization: Bearer {process.env.INSEE_SIRENE_API_KEY}
  await new Promise((r) => setTimeout(r, 700));

  if (siret.replace(/\s/g, "") === "00000000000000") {
    return { success: false, error: "SIRET introuvable dans la base INSEE" };
  }
  return {
    success: true,
    nomAssociation: "Association récupérée automatiquement",
  };
}

// ─── Stripe Connect onboarding URL (stub Phase B) ────────────────────────────
export async function createStripeConnectLink(_email: string): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  // TODO Phase B:
  // const account = await stripe.accounts.create({ type: "express", email, country: "FR" })
  // const link = await stripe.accountLinks.create({ account: account.id,
  //   type: "account_onboarding",
  //   refresh_url: `${origin}/inscription-club/etape/4`,
  //   return_url: `${origin}/inscription-club/confirmation?stripe=done` })
  // return { success: true, url: link.url }
  await new Promise((r) => setTimeout(r, 800));
  return { success: true, url: "/inscription-club/confirmation?stripe=pending" };
}

// ─── Soumission finale du dossier (stub Phase B) ─────────────────────────────
export async function submitInscription(data: InscriptionDraft): Promise<{
  success: boolean;
  error?: string;
}> {
  // TODO Phase B (dans l'ordre) :
  // 1. Valider step1/step2/step3 avec Zod
  // 2. Supabase Auth: createUser({ email }) + envoi magic-link WelcomeClub via Resend
  // 3. Prisma: Club.create({ status: "pending_verification", ...step1, ...step2 })
  // 4. Supabase Storage: uploader statuts, RIB, assurance, siretScan dans bucket EU
  // 5. Prisma: ClubMember.create({ role: "president", userId, clubId })
  // 6. Notifier les admins (email Resend ou webhook)
  if (!data.step1 || !data.step2 || !data.step3) {
    return { success: false, error: "Dossier incomplet" };
  }
  await new Promise((r) => setTimeout(r, 1000));
  return { success: true };
}
