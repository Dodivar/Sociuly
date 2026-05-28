"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  success: string | null;
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  return null;
}

export async function signIn(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Tous les champs sont obligatoires.", success: null };
  }
  if (!validateEmail(email)) {
    return { error: "Adresse email invalide.", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email ou mot de passe incorrect.", success: null };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        error: "Veuillez confirmer votre adresse email avant de vous connecter.",
        success: null,
      };
    }
    return { error: error.message, success: null };
  }

  redirect("/club");
}

export async function signUp(
  _prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const clubName = (formData.get("club_name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirmPassword = (formData.get("confirm_password") as string | null) ?? "";

  if (!clubName || !email || !password || !confirmPassword) {
    return { error: "Tous les champs sont obligatoires.", success: null };
  }
  if (clubName.length < 2) {
    return { error: "Le nom du club doit contenir au moins 2 caractères.", success: null };
  }
  if (!validateEmail(email)) {
    return { error: "Adresse email invalide.", success: null };
  }

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError, success: null };

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas.", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { club_name: clubName, role: "club" },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("User already registered")) {
      return { error: "Un compte existe déjà avec cette adresse email.", success: null };
    }
    return { error: error.message, success: null };
  }

  return {
    error: null,
    success:
      "Compte créé ! Vérifiez vos emails pour confirmer votre adresse, puis connectez-vous.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
