"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Btn, Field } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

const DRAFT_KEY = "sociuly_inscription_draft";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 Mo
const ACCEPTED = ".pdf,.jpg,.jpeg,.png";

type FileSlot = {
  file: File | null;
  error: string;
};

type Slots = {
  statuts: FileSlot;
  rib: FileSlot;
  assurance: FileSlot;
  siretScan: FileSlot;
};

const INITIAL: FileSlot = { file: null, error: "" };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}

function validateFile(file: File | null, required: boolean): string {
  if (!file) return required ? "Document requis" : "";
  if (file.size > MAX_PDF_BYTES) return `Taille max 10 Mo (fichier : ${formatBytes(file.size)})`;
  const ok = /\.(pdf|jpg|jpeg|png)$/i.test(file.name);
  if (!ok) return "Format accepté : PDF, JPG, PNG";
  return "";
}

type UploadZoneProps = {
  label: string;
  hint?: string;
  required?: boolean;
  slot: FileSlot;
  onChange: (file: File | null, error: string) => void;
};

function UploadZone({ label, hint, required = false, slot, onChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (file: File) => {
    const err = validateFile(file, required);
    onChange(err ? null : file, err);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    pick(files[0]);
  };

  return (
    <Field label={`${label}${required ? " *" : " (optionnel)"}`} hint={hint} error={slot.error}>
      {slot.file ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", border: "1.5px solid var(--primary)", borderRadius: 10,
          background: "var(--primary-soft)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="check" size={16} color="var(--primary-deep)" />
            <div>
              <div className="sy-small" style={{ color: "var(--primary-deep)", fontWeight: 600 }}>
                {slot.file.name}
              </div>
              <div className="sy-small sy-muted">{formatBytes(slot.file.size)}</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Supprimer ce fichier"
            onClick={() => onChange(null, "")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--ink-3)" }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Sélectionner ${label}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "24px 16px",
            border: `1.5px dashed ${dragging ? "var(--primary)" : "var(--line-2)"}`,
            borderRadius: 10,
            background: dragging ? "var(--primary-soft)" : "var(--surface)",
            cursor: "pointer",
            transition: "border-color .15s, background .15s",
          }}
        >
          <Icon name="upload" size={22} color={dragging ? "var(--primary)" : "var(--ink-3)"} />
          <span className="sy-small" style={{ color: "var(--ink-2)", textAlign: "center" }}>
            <strong style={{ color: "var(--ink)" }}>Cliquez</strong> ou déposez votre fichier ici
          </span>
          <span className="sy-small sy-muted">PDF, JPG, PNG · max 10 Mo</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        tabIndex={-1}
        aria-hidden="true"
      />
    </Field>
  );
}

export default function Step3Form() {
  const router = useRouter();
  const [navigating, startNav] = useTransition();

  const [slots, setSlots] = useState<Slots>({
    statuts:   { ...INITIAL },
    rib:       { ...INITIAL },
    assurance: { ...INITIAL },
    siretScan: { ...INITIAL },
  });
  const [globalError, setGlobalError] = useState("");

  // Restore file names from sessionStorage (files themselves can't be persisted)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        // Files can't be restored, but we can show previous names as read-only text
        // (not re-populated here since File objects can't be serialized)
        void draft;
      }
    } catch { /* ignore */ }
  }, []);

  const setSlot = (key: keyof Slots) => (file: File | null, error: string) => {
    setSlots((p) => ({ ...p, [key]: { file, error } }));
    setGlobalError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required files
    const s = {
      statuts:   { ...slots.statuts,   error: validateFile(slots.statuts.file, true) },
      rib:       { ...slots.rib,       error: validateFile(slots.rib.file, true) },
      assurance: { ...slots.assurance, error: validateFile(slots.assurance.file, true) },
      siretScan: { ...slots.siretScan, error: validateFile(slots.siretScan.file, false) },
    };
    const hasErrors = s.statuts.error || s.rib.error || s.assurance.error || s.siretScan.error;
    if (hasErrors) { setSlots(s); return; }

    startNav(() => {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        const draft = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
          ...draft,
          step3: {
            statutsName:   slots.statuts.file?.name   ?? "",
            ribName:       slots.rib.file?.name       ?? "",
            assuranceName: slots.assurance.file?.name ?? "",
            siretScanName: slots.siretScan.file?.name,
          },
        }));
      } catch { /* ignore */ }
      router.push("/inscription-club/etape/4");
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Info banner */}
      <div style={{ display: "flex", gap: 10, padding: "12px 14px",
        background: "var(--accent-soft)", borderRadius: 10 }}>
        <Icon name="info" size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p className="sy-small" style={{ color: "var(--accent-deep)", margin: 0 }}>
          Vos documents sont transmis de façon sécurisée et servent uniquement à vérifier
          le statut loi 1901 de votre association. Ils ne seront jamais partagés publiquement.
        </p>
      </div>

      <UploadZone
        label="Statuts de l'association"
        hint="Document déposé en préfecture, signé par le bureau"
        required
        slot={slots.statuts}
        onChange={setSlot("statuts")}
      />

      <UploadZone
        label="RIB du club"
        hint="Relevé d'identité bancaire au nom du club (pas d'un particulier)"
        required
        slot={slots.rib}
        onChange={setSlot("rib")}
      />

      <UploadZone
        label="Attestation d'assurance responsabilité civile pro (RC pro)"
        hint="En cours de validité — couvre vos expériences auprès des entreprises"
        required
        slot={slots.assurance}
        onChange={setSlot("assurance")}
      />

      <UploadZone
        label="Extrait SIRET / Avis de situation"
        hint="Disponible sur le site annuaire-entreprises.data.gouv.fr"
        required={false}
        slot={slots.siretScan}
        onChange={setSlot("siretScan")}
      />

      {globalError && (
        <p className="sy-small" style={{ color: "var(--danger)", margin: 0 }}>{globalError}</p>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <Btn type="button" variant="ghost" onClick={() => router.push("/inscription-club/etape/2")}
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
