-- ============================================================
-- Sociuly · Supabase Storage — bucket "prestations"
-- Path structure : clubs/{club_id}/{uuid}.webp
-- ============================================================
-- Prérequis : table public.profiles(id uuid PK, club_id uuid NOT NULL)
-- Exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Bucket ────────────────────────────────────────────────
-- Public = true  → lecture sans authentification (marketplace publique).
-- Les écritures restent isolées par les policies INSERT/UPDATE/DELETE.
-- file_size_limit sert de garde-fou supplémentaire côté Supabase.
-- allowed_mime_types : uniquement WebP — le serveur convertit avant upload.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'prestations',
  'prestations',
  true,                             -- lisible publiquement sans token
  5242880,                          -- 5 Mo max
  ARRAY['image/webp']               -- WebP uniquement (conversion côté API)
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. SELECT — tout visiteur peut lire les images ───────────
-- Utile si le bucket passe en privé à l'avenir (signed URLs).

CREATE POLICY "prestations_select_public"
ON storage.objects
FOR SELECT
USING (bucket_id = 'prestations');

-- ── 3. INSERT — uniquement le membre authentifié du club ─────
--
-- Décomposition du path :
--   clubs  /  {club_id}  /  {uuid}.webp
--   [1]       [2]
--
-- storage.foldername(name) retourne un tableau des segments de dossiers.
-- On compare le 2e segment avec le club_id de l'utilisateur connecté.

CREATE POLICY "prestations_insert_own_club"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'prestations'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'clubs'
  AND (storage.foldername(name))[2] = (
    SELECT club_id::text
    FROM   public.profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- ── 4. UPDATE — même isolation que INSERT ────────────────────

CREATE POLICY "prestations_update_own_club"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'prestations'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'clubs'
  AND (storage.foldername(name))[2] = (
    SELECT club_id::text
    FROM   public.profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- ── 5. DELETE — même isolation ───────────────────────────────

CREATE POLICY "prestations_delete_own_club"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'prestations'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'clubs'
  AND (storage.foldername(name))[2] = (
    SELECT club_id::text
    FROM   public.profiles
    WHERE  id = auth.uid()
    LIMIT  1
  )
);

-- ── 6. Index recommandé pour la performance ──────────────────
-- La sous-requête sur profiles est exécutée à chaque row évaluée ;
-- cet index rend la lookup O(1) au lieu d'un seq scan.

CREATE INDEX IF NOT EXISTS profiles_club_id_idx
ON public.profiles (id, club_id);
