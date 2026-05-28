"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Btn, Field, Input, Textarea } from "@/components/ds/components";
import { avisSchema, type AvisInput } from "@/lib/schemas/avis.schema";
import { submitAvis } from "@/actions/submitAvis";

type Props = {
  prestationId: string;
  onSuccess?: (id: string) => void;
};

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
            fontSize: 22, lineHeight: 1,
            color: n <= active ? "var(--accent)" : "var(--line-2)",
            transition: "color .1s",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function AvisForm({ prestationId, onSuccess }: Props) {
  const [done, setDone] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AvisInput>({
    resolver: zodResolver(avisSchema),
    defaultValues: { prestationId, note: 0, auteur: "", commentaire: "" },
  });

  async function onSubmit(data: AvisInput) {
    const result = await submitAvis(data);
    if (result.success) {
      setDone(true);
      reset();
      onSuccess?.(result.data.id);
    }
  }

  if (done) {
    return (
      <p className="sy-small" style={{ color: "var(--primary)", padding: "12px 0" }}>
        ✓ Merci pour votre avis — il sera publié après modération.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Votre nom" error={errors.auteur?.message}>
        <Input
          {...register("auteur")}
          aria-invalid={!!errors.auteur}
          placeholder="Prénom Nom"
          style={errors.auteur ? { borderColor: "var(--error, #d93025)" } : undefined}
        />
      </Field>

      <Field label="Note" error={errors.note?.message}>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <StarPicker value={field.value} onChange={field.onChange} />
          )}
        />
      </Field>

      <Field
        label="Votre avis"
        hint="Entre 10 et 500 caractères"
        error={errors.commentaire?.message}
      >
        <Textarea
          {...register("commentaire")}
          aria-invalid={!!errors.commentaire}
          placeholder="Décrivez votre expérience…"
          style={errors.commentaire ? { borderColor: "var(--error, #d93025)" } : undefined}
        />
      </Field>

      {/* prestationId hidden — déjà dans defaultValues */}
      <input type="hidden" {...register("prestationId")} />

      <div>
        <Btn type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Envoi en cours…" : "Publier l'avis"}
        </Btn>
      </div>
    </form>
  );
}
