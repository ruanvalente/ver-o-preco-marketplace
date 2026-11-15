-- Break the conversations <-> products RLS dependency without broadening access.
CREATE OR REPLACE FUNCTION public.is_chat_product_participant(
  p_product_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
  SELECT
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.conversations AS c
      WHERE c.product_id = p_product_id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    );
$$;

ALTER FUNCTION public.is_chat_product_participant(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_chat_product_participant(UUID)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_chat_product_participant(UUID)
  TO authenticated;

DROP POLICY IF EXISTS "Conversation participants can read related listings"
  ON public.products;

CREATE POLICY "Conversation participants can read related listings"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (public.is_chat_product_participant(products.id));
