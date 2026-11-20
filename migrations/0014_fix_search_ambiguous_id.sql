-- Fix ambiguous column reference in the full-text search RPCs.
--
-- Both functions declare RETURNS TABLE (id uuid, ...), so `id` is also a
-- PL/pgSQL OUT variable. The `matches` CTE selected `id` unqualified from its
-- two source CTEs; with plpgsql.variable_conflict = error (the default) this
-- raises 42702 as soon as a search term makes the RETURN QUERY run, breaking
-- catalog search and seller dashboard search.
--
-- Qualifying the column with each source CTE removes the ambiguity without
-- changing signatures, return columns, ownership, grants or search_path.
-- Apply after migrations/0014_fix_search_ambiguous_id.sql.

CREATE OR REPLACE FUNCTION public.search_products(
  p_search_term text,
  p_category_slug text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_cities text[] DEFAULT NULL,
  p_condition text DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_sort text DEFAULT 'relevance'
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price numeric,
  condition text,
  city text,
  neighborhood text,
  created_at timestamptz,
  category_id uuid,
  category_slug text,
  category_name text,
  seller_id uuid,
  seller_display_name text,
  seller_avatar_path text,
  seller_location text,
  primary_image_path text,
  primary_image_alt text,
  rank real,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, extensions, public
AS $$
DECLARE
  v_query tsquery := public.build_product_search_query(p_search_term);
  v_term text := lower(
    public.unaccent_immutable(btrim(coalesce(p_search_term, '')))
  );
  v_sort text := CASE
    WHEN p_sort IN ('relevance', 'recent', 'price_asc', 'price_desc')
    THEN p_sort ELSE 'relevance'
  END;
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 48);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
BEGIN
  IF v_query IS NULL OR numnode(v_query) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH fts_matches AS (
    SELECT
      p.id,
      (
        ts_rank(
          ARRAY[0.0::real, 0.2::real, 0.4::real, 1.0::real],
          p.search_vector,
          v_query
        ) + CASE
          WHEN to_tsvector(
            'portuguese',
            public.unaccent_immutable(c.name)
          ) @@ v_query THEN 0.1::real
          ELSE 0::real
        END
      )::real AS relevance
    FROM public.products AS p
    INNER JOIN public.categories AS c ON c.id = p.category_id
    WHERE p.status = 'active'
      AND p.search_vector @@ v_query
      AND (p_category_slug IS NULL OR c.slug = p_category_slug)
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_condition IS NULL OR p.condition = p_condition)
      AND (
        p_cities IS NULL OR lower(public.unaccent_immutable(p.city)) = ANY (
          SELECT lower(public.unaccent_immutable(city_name))
          FROM unnest(p_cities) AS city_name
        )
      )
  ),
  fuzzy_matches AS (
    SELECT
      p.id,
      GREATEST(
        public.similarity(lower(public.unaccent_immutable(p.title)), v_term),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(p.title))
        ),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(p.description))
        )
      )::real AS relevance
    FROM public.products AS p
    INNER JOIN public.categories AS c ON c.id = p.category_id
    WHERE (SELECT count(*) FROM fts_matches) = 0
      AND p.status = 'active'
      AND public.word_similarity(
        v_term,
        lower(public.unaccent_immutable(p.title))
      ) > 0.3
      AND (p_category_slug IS NULL OR c.slug = p_category_slug)
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_condition IS NULL OR p.condition = p_condition)
      AND (
        p_cities IS NULL OR lower(public.unaccent_immutable(p.city)) = ANY (
          SELECT lower(public.unaccent_immutable(city_name))
          FROM unnest(p_cities) AS city_name
        )
      )
  ),
  matches AS (
    SELECT fts_matches.id, fts_matches.relevance FROM fts_matches
    UNION ALL
    SELECT fuzzy_matches.id, fuzzy_matches.relevance FROM fuzzy_matches
  )
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.condition,
    p.city,
    p.neighborhood,
    p.created_at,
    c.id,
    c.slug,
    c.name,
    s.id,
    s.display_name,
    s.avatar_path,
    s.location,
    img.storage_path,
    img.alt_text,
    m.relevance,
    count(*) OVER ()
  FROM matches AS m
  INNER JOIN public.products AS p ON p.id = m.id
  INNER JOIN public.categories AS c ON c.id = p.category_id
  LEFT JOIN public.profiles AS s ON s.id = p.seller_id
  LEFT JOIN LATERAL (
    SELECT i.storage_path, i.alt_text
    FROM public.product_images AS i
    WHERE i.product_id = p.id
    ORDER BY i.is_primary DESC, i.sort_order ASC, i.id ASC
    LIMIT 1
  ) AS img ON true
  ORDER BY
    CASE WHEN v_sort = 'relevance' THEN m.relevance END DESC NULLS LAST,
    CASE WHEN v_sort = 'price_asc' THEN p.price END ASC NULLS LAST,
    CASE WHEN v_sort = 'price_desc' THEN p.price END DESC NULLS LAST,
    CASE WHEN v_sort = 'recent' THEN p.created_at END DESC NULLS LAST,
    p.created_at DESC,
    p.id ASC
  LIMIT v_limit OFFSET v_offset;
END;
$$;

ALTER FUNCTION public.search_products(text, text, numeric, numeric, text[], text, integer, integer, text)
  OWNER TO postgres;
REVOKE ALL ON FUNCTION public.search_products(text, text, numeric, numeric, text[], text, integer, integer, text)
  FROM PUBLIC, service_role;
GRANT EXECUTE ON FUNCTION public.search_products(text, text, numeric, numeric, text[], text, integer, integer, text)
  TO anon, authenticated;

-- Seller dashboard search. The caller is read from auth.uid(), never from an
-- argument; RLS still limits the rows even if a policy is misconfigured.
CREATE OR REPLACE FUNCTION public.search_owner_listings(
  p_search_term text,
  p_status text DEFAULT 'all',
  p_sort text DEFAULT 'recent',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  seller_id uuid,
  title text,
  description text,
  price numeric,
  condition text,
  city text,
  neighborhood text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  category_id uuid,
  category_slug text,
  category_name text,
  primary_image_path text,
  primary_image_alt text,
  rank real,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, extensions, public
AS $$
DECLARE
  v_query tsquery := public.build_product_search_query(p_search_term);
  v_term text := lower(
    public.unaccent_immutable(btrim(coalesce(p_search_term, '')))
  );
  v_owner_id uuid := (SELECT auth.uid());
  v_status text := CASE
    WHEN p_status IN ('all', 'draft', 'active', 'paused', 'sold')
    THEN p_status ELSE 'all'
  END;
  v_sort text := CASE
    WHEN p_sort IN ('recent', 'price_asc', 'price_desc') THEN p_sort
    ELSE 'recent'
  END;
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 24);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
BEGIN
  IF v_owner_id IS NULL OR v_query IS NULL OR numnode(v_query) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH fts_matches AS (
    SELECT
      p.id,
      (
        ts_rank(
          ARRAY[0.0::real, 0.2::real, 0.4::real, 1.0::real],
          p.search_vector,
          v_query
        ) + CASE
          WHEN to_tsvector(
            'portuguese',
            public.unaccent_immutable(c.name)
          ) @@ v_query THEN 0.1::real
          ELSE 0::real
        END + CASE
          WHEN to_tsvector(
            'portuguese',
            public.unaccent_immutable(coalesce(p.city, ''))
          ) @@ v_query THEN 0.08::real
          ELSE 0::real
        END + CASE
          WHEN to_tsvector(
            'portuguese',
            public.unaccent_immutable(coalesce(p.neighborhood, ''))
          ) @@ v_query THEN 0.05::real
          ELSE 0::real
        END
      )::real AS relevance
    FROM public.products AS p
    INNER JOIN public.categories AS c ON c.id = p.category_id
    WHERE p.seller_id = v_owner_id
      AND p.status <> 'removed'
      AND (v_status = 'all' OR p.status = v_status)
      AND (
        p.search_vector @@ v_query
        OR to_tsvector(
          'portuguese', public.unaccent_immutable(coalesce(p.city, ''))
        ) @@ v_query
        OR to_tsvector(
          'portuguese', public.unaccent_immutable(coalesce(p.neighborhood, ''))
        ) @@ v_query
        OR to_tsvector(
          'portuguese', public.unaccent_immutable(c.name)
        ) @@ v_query
      )
  ),
  fuzzy_matches AS (
    SELECT
      p.id,
      GREATEST(
        public.similarity(lower(public.unaccent_immutable(p.title)), v_term),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(p.title))
        ),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(p.description))
        ),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(coalesce(p.city, '')))
        ),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(coalesce(p.neighborhood, '')))
        ),
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(c.name))
        )
      )::real AS relevance
    FROM public.products AS p
    INNER JOIN public.categories AS c ON c.id = p.category_id
    WHERE (SELECT count(*) FROM fts_matches) = 0
      AND p.seller_id = v_owner_id
      AND p.status <> 'removed'
      AND (v_status = 'all' OR p.status = v_status)
      AND (
        public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(p.title))
        ) > 0.3
        OR public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(p.description))
        ) > 0.3
        OR public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(coalesce(p.city, '')))
        ) > 0.3
        OR public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(coalesce(p.neighborhood, '')))
        ) > 0.3
        OR public.word_similarity(
          v_term,
          lower(public.unaccent_immutable(c.name))
        ) > 0.3
      )
  ),
  matches AS (
    SELECT fts_matches.id, fts_matches.relevance FROM fts_matches
    UNION ALL
    SELECT fuzzy_matches.id, fuzzy_matches.relevance FROM fuzzy_matches
  )
  SELECT
    p.id,
    p.seller_id,
    p.title,
    p.description,
    p.price,
    p.condition,
    p.city,
    p.neighborhood,
    p.status,
    p.created_at,
    p.updated_at,
    c.id,
    c.slug,
    c.name,
    img.storage_path,
    img.alt_text,
    m.relevance,
    count(*) OVER ()
  FROM matches AS m
  INNER JOIN public.products AS p ON p.id = m.id
  INNER JOIN public.categories AS c ON c.id = p.category_id
  LEFT JOIN LATERAL (
    SELECT i.storage_path, i.alt_text
    FROM public.product_images AS i
    WHERE i.product_id = p.id
    ORDER BY i.is_primary DESC, i.sort_order ASC, i.id ASC
    LIMIT 1
  ) AS img ON true
  ORDER BY
    CASE WHEN v_sort = 'price_asc' THEN p.price END ASC NULLS LAST,
    CASE WHEN v_sort = 'price_desc' THEN p.price END DESC NULLS LAST,
    CASE WHEN v_sort = 'recent' THEN p.created_at END DESC NULLS LAST,
    m.relevance DESC,
    p.created_at DESC,
    p.id ASC
  LIMIT v_limit OFFSET v_offset;
END;
$$;

ALTER FUNCTION public.search_owner_listings(text, text, text, integer, integer)
  OWNER TO postgres;
REVOKE ALL ON FUNCTION public.search_owner_listings(text, text, text, integer, integer)
  FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.search_owner_listings(text, text, text, integer, integer)
  TO authenticated;
