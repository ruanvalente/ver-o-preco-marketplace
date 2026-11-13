-- Products read domain: categories, products and product images.
--
-- Only `active` products are exposed to the public marketplace. Sellers keep
-- access to their own records (including drafts and paused listings) through
-- the ownership policies below.
--
-- Apply with the Supabase SQL editor, or:
--   psql "$DATABASE_URL" -f migrations/0003_products.sql
--
-- The development seed lives in `seeds/0001_products.sql` and must be applied
-- separately.

-- Trigram indexes make partial `ilike` search viable for the MVP without
-- introducing a dedicated search service.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name TEXT NOT NULL
    CHECK (char_length(name) BETWEEN 2 AND 60),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL
    CHECK (char_length(title) BETWEEN 3 AND 120),
  description TEXT NOT NULL DEFAULT ''
    CHECK (char_length(description) <= 5000),
  price NUMERIC(12, 2) NOT NULL
    CHECK (price >= 0),
  condition TEXT NOT NULL
    CHECK (condition IN ('new', 'like_new', 'excellent', 'good')),
  city TEXT NOT NULL
    CHECK (char_length(city) BETWEEN 2 AND 80),
  neighborhood TEXT
    CHECK (neighborhood IS NULL OR char_length(neighborhood) <= 80),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'sold', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL
    CHECK (char_length(storage_path) BETWEEN 1 AND 512),
  alt_text TEXT
    CHECK (alt_text IS NULL OR char_length(alt_text) <= 200),
  sort_order INTEGER NOT NULL DEFAULT 0
    CHECK (sort_order >= 0),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public catalog queries always filter by `status = 'active'`, so the indexes
-- are partial and stay small as drafts/sold listings accumulate.
CREATE INDEX IF NOT EXISTS products_active_created_at_idx
  ON public.products (created_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS products_active_category_created_at_idx
  ON public.products (category_id, created_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS products_active_price_idx
  ON public.products (price)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS products_active_city_idx
  ON public.products (city)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS products_seller_id_idx
  ON public.products (seller_id);

CREATE INDEX IF NOT EXISTS products_title_trgm_idx
  ON public.products USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS products_description_trgm_idx
  ON public.products USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS product_images_product_sort_idx
  ON public.product_images (product_id, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_idx
  ON public.product_images (product_id)
  WHERE is_primary;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Categories are reference data and can be read by everyone.
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public catalog: only published products.
CREATE POLICY "Active products are publicly readable" ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Sellers can read their own products regardless of status.
CREATE POLICY "Sellers can read own products" ON public.products
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Sellers can create own products" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Sellers can update own products" ON public.products
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = seller_id)
  WITH CHECK ((SELECT auth.uid()) = seller_id);

CREATE POLICY "Sellers can delete own products" ON public.products
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = seller_id);

-- Images inherit the visibility of the parent product.
CREATE POLICY "Images of active products are publicly readable"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id AND p.status = 'active'
    )
  );

CREATE POLICY "Sellers can read own product images" ON public.product_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Sellers can create own product images" ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Sellers can update own product images" ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.seller_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Sellers can delete own product images" ON public.product_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.seller_id = (SELECT auth.uid())
    )
  );

-- Category counts are computed in the database so the catalog never has to
-- fetch every product just to display a badge. `security_invoker` keeps the
-- caller's RLS rules, which means anonymous users only count active products.
CREATE OR REPLACE VIEW public.category_listing_counts
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.sort_order,
  count(p.id)::INTEGER AS product_count
FROM public.categories c
LEFT JOIN public.products p
  ON p.category_id = c.id
 AND p.status = 'active'
GROUP BY c.id, c.slug, c.name, c.sort_order;

GRANT SELECT ON public.category_listing_counts TO anon, authenticated;

-- Product images are public catalog assets. Uploads are restricted to the
-- seller's own folder (`<auth.uid()>/...`), matching the listings module.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public product images are readable" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Sellers can upload product images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY "Sellers can update own product images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );

CREATE POLICY "Sellers can delete own product images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
  );
