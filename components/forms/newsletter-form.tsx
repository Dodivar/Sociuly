"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Btn, Field, Input } from "@/components/ds/components";
import { newsletterSchema, type NewsletterInput } from "@/lib/schemas/newsletter.schema";
import { subscribeNewsletter } from "@/actions/subscribeNewsletter";

type Props = { style?: React.CSSProperties };

export function NewsletterForm({ style }: Props) {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit(data: NewsletterInput) {
    const result = await subscribeNewsletter(data);
    if (result.success) {
      setDone(true);
      reset();
    }
  }

  if (done) {
    return (
      <p className="sy-small" style={{ color: "var(--primary)", ...style }}>
        ✓ Inscription confirmée — à bientôt !
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={style}>
      <Field error={errors.email?.message}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Input
            {...register("email")}
            type="email"
            placeholder="votre@email.fr"
            aria-invalid={!!errors.email}
            style={{
              flex: 1, minWidth: 200,
              ...(errors.email ? { borderColor: "var(--error, #d93025)" } : {}),
            }}
          />
          <Btn type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "…" : "S'inscrire"}
          </Btn>
        </div>
      </Field>
    </form>
  );
}
