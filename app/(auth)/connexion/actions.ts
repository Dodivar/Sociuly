"use server";

import { redirect } from "next/navigation";
import { parseLogin, isValid, type FieldErrors, type LoginField } from "@/lib/auth/validation";

export type LoginActionState = {
  ok: boolean;
  // Erreur générale (mauvais identifiants, compte suspendu, erreur réseau, …)
  formError?: string;
  // Erreurs par champ — affichées sous chaque input.
  fieldErrors?: FieldErrors<LoginField>;
  // Renvoyé pour repeupler l'email (jamais le password).
  values?: { email: string; remember: boolean };
};

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const { values, errors } = parseLogin(formData);

  if (!isValid(errors)) {
    return {
      ok: false,
      fieldErrors: errors,
      values: { email: values.email, remember: values.remember },
    };
  }

  // ─── TODO BACKEND — Supabase Auth ───────────────────────────────────────────
  // 1. Créer un client Supabase côté serveur (cookies-aware) :
  //      import { createServerClient } from "@supabase/ssr";
  //      const supabase = createServerClient(URL, ANON_KEY, { cookies: cookies() });
  // 2. Appeler :
  //      const { data, error } = await supabase.auth.signInWithPassword({
  //        email: values.email, password: values.password,
  //      });
  // 3. Mapper les erreurs Supabase → messages FR :
  //      - "Invalid login credentials"     → "E-mail ou mot de passe incorrect."
  //      - "Email not confirmed"           → "Confirmez votre e-mail pour vous connecter."
  //      - rate-limit                       → "Trop de tentatives, réessayez dans 1 min."
  // 4. Durée de session :
  //      - remember = true  → cookie persistant (par défaut 30 j)
  //      - remember = false → cookie de session (à régler côté SSR client / middleware)
  // 5. Lire l'AssociationMember de l'utilisateur connecté pour déterminer le clubId
  //    de redirection (un user peut être membre de plusieurs clubs — choisir le
  //    premier par ordre `role` puis `joinedAt`, ou afficher un sélecteur si plusieurs).
  //
  // Pour l'instant on simule l'échec de credentials pour éviter une fausse
  // réussite tant que le provider n'est pas câblé.
  if (process.env.SUPABASE_URL === undefined) {
    return {
      ok: false,
      formError:
        "Provider d'authentification non configuré. (TODO backend : brancher Supabase Auth.)",
      values: { email: values.email, remember: values.remember },
    };
  }

  // const clubId = await resolveDefaultClubId(data.user.id); // TODO
  const clubId = "demo";
  redirect(`/console/${clubId}/dashboard`);
}
