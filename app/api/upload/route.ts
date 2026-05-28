import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { createServerSupabase } from "@/lib/supabase/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_SHARP_FORMATS = new Set(["jpeg", "png", "webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "prestations";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Magic-byte check (defense-in-depth before sharp) ────────────────────────

function hasValidMagicBytes(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e &&
    buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a
  ) return true;
  // WebP: RIFF????WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return true;
  return false;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// ─── POST /api/upload ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Parse multipart form ──────────────────────────────────────────────────
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Requête invalide : multipart/form-data attendu", 400);
  }

  const file = form.get("file");
  const clubId = form.get("club_id");

  // TODO (Phase B): replace club_id from form with the value from the
  // authenticated session token once NextAuth / Supabase Auth is wired up.
  // Example:
  //   const session = await getServerSession(authOptions);
  //   const clubId  = session?.user?.clubId;

  if (!(file instanceof File)) {
    return fail("Champ 'file' manquant", 400);
  }
  if (typeof clubId !== "string" || !UUID_RE.test(clubId)) {
    return fail("Champ 'club_id' manquant ou invalide (UUID attendu)", 400);
  }

  // ── MIME type check (header) ──────────────────────────────────────────────
  if (!ALLOWED_MIME.has(file.type)) {
    return fail(
      "Type de fichier non supporté. Formats acceptés : JPEG, PNG, WebP",
      415
    );
  }

  // ── Size check ────────────────────────────────────────────────────────────
  if (file.size > MAX_BYTES) {
    return fail("Fichier trop volumineux (limite : 5 Mo)", 413);
  }

  // ── Read buffer ───────────────────────────────────────────────────────────
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // ── Magic-byte validation (anti MIME-spoofing) ────────────────────────────
  if (!hasValidMagicBytes(inputBuffer)) {
    return fail("Signature de fichier invalide", 415);
  }

  // ── Sharp: validate real format + convert to WebP ─────────────────────────
  let webpBuffer: Buffer;
  try {
    const image = sharp(inputBuffer);
    const meta = await image.metadata();

    if (!meta.format || !ALLOWED_SHARP_FORMATS.has(meta.format)) {
      return fail("Format d'image non reconnu par le serveur", 415);
    }

    webpBuffer = await image
      .resize({
        width: 1600,
        height: 900,
        fit: "inside",
        withoutEnlargement: true, // never upscale small images
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch {
    return fail("Impossible de traiter l'image", 422);
  }

  // ── Build storage path (UUID prevents path-traversal) ─────────────────────
  const uuid = randomUUID();
  const storagePath = `clubs/${clubId}/${uuid}.webp`;

  // ── Upload to Supabase Storage ────────────────────────────────────────────
  let supabase: ReturnType<typeof createServerSupabase>;
  try {
    supabase = createServerSupabase();
  } catch {
    return fail("Configuration serveur incorrecte", 500);
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, webpBuffer, {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
      upsert: false,
    });

  if (uploadError) {
    console.error("[api/upload] Supabase upload error:", uploadError.message);
    return fail("Échec de l'envoi vers le stockage", 502);
  }

  // ── Return public URL ─────────────────────────────────────────────────────
  // The bucket is public — getPublicUrl constructs the URL without a token.
  // Switch to createSignedUrl() if the bucket is made private in the future.
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json(
    { url: publicUrl, path: storagePath },
    { status: 201 }
  );
}
