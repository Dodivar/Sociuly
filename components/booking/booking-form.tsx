"use client";

import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ds/components";
import { Btn, Field, Input, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { TipSelector } from "./tip-selector";
import { reservationSchema, type ReservationInput } from "@/lib/schemas/reservation.schema";
import { createReservation } from "@/actions/createReservation";

type Props = {
  prestationRef: string;
  defaultNom?: string;
};

export function BookingForm({ prestationRef, defaultNom = "" }: Props) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      nom: defaultNom,
      telephone: "",
      message: "",
      tipCents: 1000,
      idempotencyKey: crypto.randomUUID(),
      prestationRef,
    },
  });

  const onSubmit = useCallback(
    async (data: ReservationInput) => {
      const result = await createReservation(data);
      if (!result.success) {
        for (const [field, message] of Object.entries(result.errors)) {
          setError(field as keyof ReservationInput, { message });
        }
        return;
      }
      router.push(`/reserver/${result.data.bookingNumber}/confirmation`);
    },
    [router, setError],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="Votre nom" error={errors.nom?.message}>
        <Input
          {...register("nom")}
          aria-invalid={!!errors.nom}
          placeholder="Prénom Nom"
          style={errors.nom ? { borderColor: "var(--error, #d93025)" } : undefined}
        />
      </Field>

      <div style={{ height: 14 }} />

      <Field
        label="Téléphone (optionnel)"
        hint="Pour faciliter la coordination le jour J"
        error={errors.telephone?.message}
      >
        <Input
          {...register("telephone")}
          type="tel"
          aria-invalid={!!errors.telephone}
          placeholder="06 12 34 56 78"
          style={errors.telephone ? { borderColor: "var(--error, #d93025)" } : undefined}
        />
      </Field>

      <div style={{ height: 14 }} />

      <Field
        label="Message au club"
        hint="Précisez vos attentes, allergies, contraintes d'accès…"
        error={errors.message?.message}
      >
        <Textarea
          {...register("message")}
          aria-invalid={!!errors.message}
          style={errors.message ? { borderColor: "var(--error, #d93025)" } : undefined}
        />
      </Field>

      <div style={{ height: 14 }} />

      <Card variant="accent" style={{ padding: 16, borderRadius: "var(--radius-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Icon name="sparkle" size={16} color="var(--accent-deep)" />
          <div className="sy-h4">Ajouter un coup de pouce au projet ?</div>
        </div>
        <div className="sy-small" style={{ color: "var(--ink-2)" }}>
          100% reversé au tournoi U17. Optionnel et déductible d&apos;impôts.
        </div>
        <Controller
          name="tipCents"
          control={control}
          render={({ field }) => (
            <TipSelector
              projectName="le tournoi U17"
              value={field.value / 100}
              onChange={(euros) => field.onChange(euros * 100)}
            />
          )}
        />
      </Card>

      {errors.root && (
        <div
          style={{
            marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)",
            background: "rgba(217, 48, 37, 0.08)", color: "var(--error, #d93025)", fontSize: 14,
          }}
        >
          {errors.root.message}
        </div>
      )}

      <div
        style={{
          display: "flex", justifyContent: "space-between", marginTop: 20,
          flexWrap: "wrap", gap: 8,
        }}
      >
        <Btn type="button" variant="ghost" onClick={() => router.back()}>
          ← Étape précédente
        </Btn>
        <Btn
          type="submit"
          variant="dark"
          disabled={isSubmitting}
          iconRight={
            isSubmitting ? undefined : <Icon name="arrow" size={14} color="#fff" />
          }
        >
          {isSubmitting ? "Envoi en cours…" : "Continuer vers le paiement"}
        </Btn>
      </div>
    </form>
  );
}
