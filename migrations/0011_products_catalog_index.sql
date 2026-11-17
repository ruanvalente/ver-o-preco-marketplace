-- Catalog audit (issue #17): partial composite index for city-filtered reads.
--
-- Public listings are read with `status = 'active'`, optional `city` filters and
-- `created_at DESC` ordering. The existing partial indexes cover status +
-- created_at (home/recent) and city alone. This one serves a single-city filter
-- with newest-first ordering without indexing drafts/paused/sold listings.
--
-- Apply with the Supabase SQL editor, or:
--   psql "$DATABASE_URL" -f migrations/0011_products_catalog_index.sql

CREATE INDEX IF NOT EXISTS products_active_city_created_at_idx
  ON public.products (city, created_at DESC)
  WHERE status = 'active';
