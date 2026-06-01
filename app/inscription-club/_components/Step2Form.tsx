"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Input } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

const DRAFT_KEY = "sociuly_inscription_draft";

type FormState = {
  prenomPresident: string;
  nomPresident: string;
  emailPresident: string;
  telephone: string;
  nombreMembres: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(data: FormState): FormErrors {
  const e: FormErrors = {};

  if (!data.prenomPresident.trim()) e.prenomPresident = "Prénom requis";
  else if (data.prenomPresident.trim().length < 2) e.prenomPresident = "Au moins 2 caractères";

  if (!data.nomPresident.trim()) e.nomPresident = "Nom requis";
  else if (data.nomPresident.trim().length < 2) e.nomPresident = "Au moins 2 caractères";

  if (!data.emailPresident.trim()) e.emailPresident = "Email requis";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailPresident))
    e.emailPresident = "Email invalide";

  if (data.telephone.trim() && !/^(\+33|0)[1-9](\s?\d{2}){4}$/.test(data.telephone.trim()))
    e.telephone = "Numéro français invalide (ex : 06 12 34 56 78)";

  if (!data.nombreMembres.trim()) e.nombreMembres = "Nombre de membres requis";
  else if (Number.isNaN(Number(data.nombreMembres)) || Number(data.nombreMembres) < 1)
    e.nombreMembres = "Valeur invalide";

  return e;
}

export default function Step2Form() {
  const router = useRouter();
  const [navigating, startNav] = useTransition();

  const [form, setForm] = useState<FormState>({
    prenomPresident: "", nomPresident: "", emailPresident: "",
    telephone: "", nombreMembres: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.step2) setForm(draft.step2);
      }
    } catch { /* ignore */ }
  }, []);

  const set = (key: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    startNav(() => {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        const draft = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, step2: form }));
      } catch { /* ignore */ }
      router.push("/inscription-club/etape/3");
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Nom du président */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Prénom" error={errors.prenomPresident}>
          <Input
            type="text"
            value={form.prenomPresident}
            onChange={(e) => set("prenomPresident", e.target.value)}
            placeholder="Marie"
            autoComplete="given-name"
          />
        </Field>
        <Field label="Nom" error={errors.nomPresident}>
          <Input
            type="text"
            value={form.nomPresident}
            onChange={(e) => set("nomPresident", e.target.value)}
            placeholder="Dupont"
            autoComplete="family-name"
          />
        </Field>
      </div>

      {/* Email */}
      <Field
        label="Adresse e-mail"
        hint="Vous recevrez un lien de connexion à cet email pour accéder à la console club"
        error={errors.emailPresident}
      >
        <Input
          type="email"
          value={form.emailPresident}
          onChange={(e) => set("emailPresident", e.target.value)}
          placeholder="president@monclub.fr"
          autoComplete="email"
          icon={<Icon name="lock" size={15} />}
        />
      </Field>

      {/* Téléphone */}
      <Field label="Téléphone" hint="Optionnel — pour vous contacter durant la vérification" error={errors.telephone}>
        <Input
          type="tel"
          value={form.telephone}
          onChange={(e) => set("telephone", e.target.value)}
          placeholder="06 12 34 56 78"
          autoComplete="tel"
        />
      </Field>

      {/* Nombre de membres */}
      <Field label="Nombre de licenciés" hint="Estimation — sera affiché sur votre profil public" error={errors.nombreMembres}>
        <Input
          type="number"
          inputMode="numeric"
          value={form.nombreMembres}
          onChange={(e) => set("nombreMembres", e.target.value)}
          placeholder="120"
          min="1"
          max="10000"
        />
      </Field>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <Btn type="button" variant="ghost" onClick={() => router.push("/inscription-club/etape/1")}
          icon={<Icon name="arrowLeft" size={18} />}>
          Précédent
        </Btn>
        <Btn type="submit" variant="primary" size="lg" disabled={navigating}
          iconRight={<Icon name="arrow" size={18} color="#fff" />}>
          Continuer
        </Btn>
      </div>
    </form>
  );
}
