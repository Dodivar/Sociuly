"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field, Input } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { lookupSiret } from "@/lib/actions/inscription-club";

const DRAFT_KEY = "sociuly_inscription_draft";

const SPORTS = [
  { value: "football",    label: "Football" },
  { value: "rugby",       label: "Rugby" },
  { value: "handball",    label: "Handball" },
  { value: "volleyball",  label: "Volleyball" },
  { value: "basketball",  label: "Basketball" },
  { value: "tennis",      label: "Tennis" },
  { value: "badminton",   label: "Badminton" },
  { value: "natation",    label: "Natation" },
  { value: "athletisme",  label: "Athlétisme" },
  { value: "cyclisme",    label: "Cyclisme" },
  { value: "judo",        label: "Judo" },
  { value: "karate",      label: "Karaté" },
  { value: "danse",       label: "Danse" },
  { value: "gymnastique", label: "Gymnastique" },
  { value: "autre",       label: "Autre" },
];

type FormState = {
  nomAssociation: string;
  siret: string;
  sport: string;
  ville: string;
  codePostal: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function formatSiret(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

function validate(data: FormState): FormErrors {
  const e: FormErrors = {};
  if (!data.nomAssociation.trim())
    e.nomAssociation = "Nom de l'association requis";
  else if (data.nomAssociation.trim().length < 3)
    e.nomAssociation = "Au moins 3 caractères";

  const digits = data.siret.replace(/\s/g, "");
  if (!digits) e.siret = "SIRET requis";
  else if (!/^\d{14}$/.test(digits)) e.siret = "Le SIRET doit contenir exactement 14 chiffres";

  if (!data.sport) e.sport = "Veuillez choisir un sport";
  if (!data.ville.trim()) e.ville = "Ville requise";
  if (!data.codePostal) e.codePostal = "Code postal requis";
  else if (!/^\d{5}$/.test(data.codePostal)) e.codePostal = "Code postal invalide (5 chiffres)";

  return e;
}

export default function Step1Form() {
  const router = useRouter();
  const [navigating, startNav] = useTransition();
  const [lookupPending, startLookup] = useTransition();

  const [form, setForm] = useState<FormState>({
    nomAssociation: "", siret: "", sport: "", ville: "", codePostal: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [siretState, setSiretState] = useState<"idle" | "ok" | "error">("idle");
  const [siretMsg, setSiretMsg] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.step1) setForm(draft.step1);
      }
    } catch { /* sessionStorage unavailable */ }
  }, []);

  const set = (key: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleLookup = () => {
    const digits = form.siret.replace(/\s/g, "");
    if (!/^\d{14}$/.test(digits)) {
      setErrors((p) => ({ ...p, siret: "Entrez un SIRET de 14 chiffres avant de vérifier" }));
      return;
    }
    setSiretState("idle");
    startLookup(async () => {
      const res = await lookupSiret(digits);
      if (res.success && res.nomAssociation) {
        setSiretState("ok");
        setSiretMsg(res.nomAssociation);
        setForm((p) => ({ ...p, nomAssociation: p.nomAssociation.trim() || res.nomAssociation! }));
      } else {
        setSiretState("error");
        setSiretMsg(res.error ?? "SIRET introuvable");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    startNav(() => {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        const draft = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, step1: form }));
      } catch { /* ignore */ }
      router.push("/inscription-club/etape/2");
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Nom de l'association */}
      <Field label="Nom de l'association" hint="Tel qu'il figure dans vos statuts déposés en préfecture" error={errors.nomAssociation}>
        <Input
          type="text"
          value={form.nomAssociation}
          onChange={(e) => set("nomAssociation", e.target.value)}
          placeholder="Ex : SIG Strasbourg"
          autoComplete="organization"
        />
      </Field>

      {/* SIRET */}
      <Field label="Numéro SIRET" hint="14 chiffres — association loi 1901 déclarée en préfecture" error={errors.siret}>
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            type="text"
            inputMode="numeric"
            value={form.siret}
            onChange={(e) => { set("siret", formatSiret(e.target.value)); setSiretState("idle"); }}
            placeholder="123 456 789 01234"
            maxLength={17}
            style={{ flex: 1 }}
          />
          <Btn
            type="button"
            variant="soft"
            onClick={handleLookup}
            disabled={lookupPending}
            style={{ flexShrink: 0, borderRadius: 10, height: 44 }}
          >
            {lookupPending ? "…" : "Vérifier"}
          </Btn>
        </div>

        {siretState === "ok" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8,
            padding: "8px 12px", background: "var(--primary-soft)", borderRadius: 8 }}>
            <Icon name="check" size={15} color="var(--primary-deep)" />
            <span className="sy-small" style={{ color: "var(--primary-deep)" }}>{siretMsg}</span>
          </div>
        )}
        {siretState === "error" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8,
            padding: "8px 12px", background: "var(--highlight-soft)", borderRadius: 8 }}>
            <Icon name="info" size={15} color="#6e5111" />
            <span className="sy-small" style={{ color: "#6e5111" }}>{siretMsg}</span>
          </div>
        )}
      </Field>

      {/* Sport */}
      <Field label="Sport principal" error={errors.sport}>
        <select
          className="sy-input"
          value={form.sport}
          onChange={(e) => set("sport", e.target.value)}
          style={{ cursor: "pointer" }}
        >
          <option value="">Choisir un sport…</option>
          {SPORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </Field>

      {/* Ville + Code postal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 12 }}>
        <Field label="Ville" error={errors.ville}>
          <Input
            type="text"
            value={form.ville}
            onChange={(e) => set("ville", e.target.value)}
            placeholder="Strasbourg"
            autoComplete="address-level2"
          />
        </Field>
        <Field label="Code postal" error={errors.codePostal}>
          <Input
            type="text"
            inputMode="numeric"
            value={form.codePostal}
            onChange={(e) => set("codePostal", e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="67000"
            maxLength={5}
          />
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <Btn type="submit" variant="primary" size="lg" disabled={navigating}
          iconRight={<Icon name="arrow" size={18} color="#fff" />}>
          Continuer
        </Btn>
      </div>
    </form>
  );
}
