-- Public profile avatars live in a dedicated bucket so the existing private
-- `veropreco` bucket does not become publicly readable.
--
-- Object paths use: <auth.uid()>/avatar.<jpg|jpeg|png|webp>
-- Apply with the Supabase SQL editor, or:
--   psql "$DATABASE_URL" -f migrations/0006_profile_avatars.sql

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public avatar images are readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'avatars'
  AND array_length(storage.foldername(name), 1) = 1
  AND split_part(name, '/', 2) ~ '^avatar[.](jpg|jpeg|png|webp)$'
);

CREATE POLICY "Users can upload own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  AND array_length(storage.foldername(name), 1) = 1
  AND split_part(name, '/', 2) ~ '^avatar[.](jpg|jpeg|png|webp)$'
);

CREATE POLICY "Users can update own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  AND array_length(storage.foldername(name), 1) = 1
  AND split_part(name, '/', 2) ~ '^avatar[.](jpg|jpeg|png|webp)$'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  AND array_length(storage.foldername(name), 1) = 1
  AND split_part(name, '/', 2) ~ '^avatar[.](jpg|jpeg|png|webp)$'
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  AND array_length(storage.foldername(name), 1) = 1
  AND split_part(name, '/', 2) ~ '^avatar[.](jpg|jpeg|png|webp)$'
);
