-- Seller chat metrics in a single round-trip.
--
-- The function runs as the caller so RLS remains in force. The explicit
-- auth.uid() check is defense in depth: a forged seller id must never expose
-- another seller's counters, even if a policy is misconfigured.
--
-- Apply after migrations/0011_products_catalog_index.sql.

CREATE OR REPLACE FUNCTION public.get_seller_chat_metrics(
  p_seller_id UUID
)
RETURNS TABLE (
  conversation_count BIGINT,
  received_message_count BIGINT,
  unread_message_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR p_seller_id <> (SELECT auth.uid()) THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    (
      SELECT count(*)::BIGINT
      FROM public.conversations AS c
      WHERE c.seller_id = p_seller_id
    ),
    (
      SELECT count(*)::BIGINT
      FROM public.messages AS m
      INNER JOIN public.conversations AS c ON c.id = m.conversation_id
      WHERE c.seller_id = p_seller_id
        AND m.sender_id <> p_seller_id
    ),
    (
      SELECT count(*)::BIGINT
      FROM public.messages AS m
      INNER JOIN public.conversations AS c ON c.id = m.conversation_id
      WHERE c.seller_id = p_seller_id
        AND m.sender_id <> p_seller_id
        AND m.read_at IS NULL
    );
END;
$$;

ALTER FUNCTION public.get_seller_chat_metrics(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_seller_chat_metrics(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_seller_chat_metrics(UUID) TO authenticated;
