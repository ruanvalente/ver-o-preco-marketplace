-- Atomic image replacement for the listings module.
--
-- `product_images` has a partial unique index that allows only one primary
-- image per product. Replacing the image set through multiple client requests
-- (clear primaries, delete removed rows, insert new rows, promote primary)
-- leaves the listing in an inconsistent state when one step fails.
--
-- This function replaces the whole set inside a single transaction. It keeps
-- `SECURITY INVOKER`, so the caller's RLS policies remain active, and it also
-- validates ownership explicitly to return a stable error.
--
-- Apply with the Supabase SQL editor, or:
--   psql "$DATABASE_URL" -f migrations/0004_listing_images.sql

CREATE OR REPLACE FUNCTION public.replace_product_images(
  p_product_id UUID,
  p_images JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_seller_id UUID;
  v_image_count INTEGER;
  v_primary_ordinality BIGINT;
BEGIN
  SELECT seller_id
  INTO v_seller_id
  FROM public.products
  WHERE id = p_product_id;

  IF v_seller_id IS NULL OR v_seller_id <> (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'listing_not_found';
  END IF;

  IF p_images IS NULL OR jsonb_typeof(p_images) <> 'array' THEN
    RAISE EXCEPTION 'invalid_listing_images';
  END IF;

  v_image_count := jsonb_array_length(p_images);

  IF v_image_count > 8 THEN
    RAISE EXCEPTION 'too_many_listing_images';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_images) AS t(item)
    WHERE jsonb_typeof(item) <> 'object'
      OR NOT (item ? 'storage_path')
      OR item->>'storage_path' IS NULL
      OR char_length(item->>'storage_path') NOT BETWEEN 1 AND 512
  ) THEN
    RAISE EXCEPTION 'invalid_listing_images';
  END IF;

  SELECT ordinality
  INTO v_primary_ordinality
  FROM jsonb_array_elements(p_images) WITH ORDINALITY AS t(item, ordinality)
  WHERE (item->>'is_primary') = 'true'
  ORDER BY ordinality
  LIMIT 1;

  DELETE FROM public.product_images
  WHERE product_id = p_product_id;

  INSERT INTO public.product_images (
    product_id,
    storage_path,
    alt_text,
    sort_order,
    is_primary
  )
  SELECT
    p_product_id,
    item->>'storage_path',
    NULLIF(left(COALESCE(item->>'alt_text', ''), 200), ''),
    CASE
      WHEN item->>'sort_order' ~ '^\d+$'
        THEN (item->>'sort_order')::INTEGER
      ELSE (ordinality - 1)::INTEGER
    END,
    (ordinality = v_primary_ordinality)
  FROM jsonb_array_elements(p_images) WITH ORDINALITY AS t(item, ordinality);

  -- The server always sends a primary image when the list is not empty, but
  -- promoting the first image here keeps direct RPC calls consistent too.
  IF v_image_count > 0 AND v_primary_ordinality IS NULL THEN
    UPDATE public.product_images
    SET is_primary = true
    WHERE id = (
      SELECT id
      FROM public.product_images
      WHERE product_id = p_product_id
      ORDER BY sort_order, created_at
      LIMIT 1
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.replace_product_images(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_product_images(UUID, JSONB) TO authenticated;
