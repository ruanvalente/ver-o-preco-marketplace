-- Authorize chat-image access against conversation membership.
--
-- Signed URLs are minted from both the browser and the server. Storage RLS
-- covers direct bucket access, but issuance itself bypasses it, so the check
-- must happen before signing. The helper reads auth.uid() server-side because
-- client-supplied user ids are spoofable.
--
-- Apply with the Supabase SQL editor, or:
--   psql "$DATABASE_URL" -f migrations/0010_chat_signed_url_authorization.sql

CREATE OR REPLACE FUNCTION public.is_conversation_participant(
  p_conversation_id UUID
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
      WHERE c.id = p_conversation_id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    );
$$;

ALTER FUNCTION public.is_conversation_participant(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_conversation_participant(UUID)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID)
  TO authenticated;
