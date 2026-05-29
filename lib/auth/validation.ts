// Schémas de validation pour les flux d'auth.
// Pas de dépendance Zod — équivalent typé natif pour rester aligné avec
// la contrainte "pas de dépendance nouvelle non justifiée".

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export type LoginField = "email" | "password";

const EMAIL_RE =
  // RFC 5322 light — suffisant pour un front-end ; la vraie vérification reste serveur.
  /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function parseLogin(raw: FormData): {
  values: LoginInput;
  errors: FieldErrors<LoginField>;
} {
  const email = String(raw.get("email") ?? "").trim().toLowerCase();
  const password = String(raw.get("password") ?? "");
  const remember = raw.get("remember") === "on";

  const errors: FieldErrors<LoginField> = {};
  if (!email) errors.email = "Renseignez votre adresse e-mail.";
  else if (!EMAIL_RE.test(email)) errors.email = "Cette adresse e-mail ne semble pas valide.";

  if (!password) errors.password = "Renseignez votre mot de passe.";
  else if (password.length < 8) errors.password = "Le mot de passe doit faire au moins 8 caractères.";

  return { values: { email, password, remember }, errors };
}

export function isValid<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length === 0;
}
