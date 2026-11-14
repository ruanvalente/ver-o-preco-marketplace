-- Private, listing-scoped conversations and messages.
-- Apply after migrations/0006_profile_avatars.sql.

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT conversations_distinct_participants CHECK (buyer_id <> seller_id),
  CONSTRAINT conversations_product_buyer_unique UNIQUE (product_id, buyer_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL
    REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image')),
  content TEXT,
  attachment_path TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT messages_valid_content CHECK (
    (
      message_type = 'text'
      AND content IS NOT NULL
      AND char_length(btrim(content)) BETWEEN 1 AND 2000
      AND attachment_path IS NULL
    )
    OR
    (
      message_type = 'image'
      AND content IS NULL
      AND attachment_path IS NOT NULL
      AND attachment_path LIKE (
        conversation_id::TEXT || '/' || sender_id::TEXT || '/%'
      )
      AND array_length(string_to_array(attachment_path, '/'), 1) = 3
      AND split_part(attachment_path, '/', 3) ~
        '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.](jpg|png|webp)$'
    )
  )
);

CREATE INDEX conversations_buyer_updated_idx
  ON public.conversations (buyer_id, updated_at DESC);
CREATE INDEX conversations_seller_updated_idx
  ON public.conversations (seller_id, updated_at DESC);
CREATE INDEX messages_conversation_created_idx
  ON public.messages (conversation_id, created_at DESC, id DESC);
CREATE INDEX messages_unread_conversation_idx
  ON public.messages (conversation_id, sender_id)
  WHERE read_at IS NULL;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can read conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
  );

CREATE POLICY "Buyers can start conversations for active listings"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_id = (SELECT auth.uid())
    AND seller_id <> (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_id
        AND p.seller_id = conversations.seller_id
        AND p.status = 'active'
    )
  );

CREATE POLICY "Conversation participants can read messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "Participants can send messages as themselves"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND read_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "Recipients can mark incoming messages as read"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id <> (SELECT auth.uid())
    AND read_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  )
  WITH CHECK (
    sender_id <> (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

-- A conversation participant may still need the listing context after it is
-- paused or sold. Public access remains limited to active products.
CREATE POLICY "Conversation participants can read related listings"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.product_id = products.id
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

REVOKE ALL ON public.conversations FROM anon, PUBLIC;
REVOKE ALL ON public.messages FROM anon, PUBLIC;
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT UPDATE (read_at) ON public.messages TO authenticated;

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_product_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id UUID := (SELECT auth.uid());
  v_seller_id UUID;
  v_conversation_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT p.seller_id
  INTO v_seller_id
  FROM public.products p
  WHERE p.id = p_product_id
    AND p.status = 'active';

  IF v_seller_id IS NULL OR v_seller_id = v_user_id THEN
    RAISE EXCEPTION 'listing_unavailable';
  END IF;

  INSERT INTO public.conversations (product_id, buyer_id, seller_id)
  VALUES (p_product_id, v_user_id, v_seller_id)
  ON CONFLICT (product_id, buyer_id) DO NOTHING;

  SELECT c.id
  INTO v_conversation_id
  FROM public.conversations c
  WHERE c.product_id = p_product_id
    AND c.buyer_id = v_user_id;

  IF v_conversation_id IS NULL THEN
    RAISE EXCEPTION 'conversation_unavailable';
  END IF;

  RETURN v_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.get_chat_conversations(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  conversation_id UUID,
  product_id UUID,
  product_title TEXT,
  product_price NUMERIC,
  product_city TEXT,
  product_neighborhood TEXT,
  product_image_path TEXT,
  other_user_id UUID,
  other_display_name TEXT,
  other_avatar_path TEXT,
  last_message_id UUID,
  last_message_type TEXT,
  last_message_content TEXT,
  last_message_sender_id UUID,
  last_message_created_at TIMESTAMPTZ,
  unread_count BIGINT,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  SELECT
    c.id,
    p.id,
    p.title,
    p.price,
    p.city,
    p.neighborhood,
    image.storage_path,
    other_profile.id,
    other_profile.display_name,
    other_profile.avatar_path,
    latest.id,
    latest.message_type,
    latest.content,
    latest.sender_id,
    latest.created_at,
    COALESCE(unread.message_count, 0),
    COALESCE(latest.created_at, c.created_at)
  FROM public.conversations c
  JOIN public.products p ON p.id = c.product_id
  LEFT JOIN public.profiles other_profile
    ON other_profile.id = CASE
      WHEN c.buyer_id = (SELECT auth.uid()) THEN c.seller_id
      ELSE c.buyer_id
    END
  LEFT JOIN LATERAL (
    SELECT pi.storage_path
    FROM public.product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.is_primary DESC, pi.sort_order, pi.created_at
    LIMIT 1
  ) image ON true
  LEFT JOIN LATERAL (
    SELECT m.id, m.message_type, m.content, m.sender_id, m.created_at
    FROM public.messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT 1
  ) latest ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS message_count
    FROM public.messages m
    WHERE m.conversation_id = c.id
      AND m.sender_id <> (SELECT auth.uid())
      AND m.read_at IS NULL
  ) unread ON true
  WHERE c.buyer_id = (SELECT auth.uid())
    OR c.seller_id = (SELECT auth.uid())
  ORDER BY COALESCE(latest.created_at, c.created_at) DESC, c.id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

REVOKE ALL ON FUNCTION public.get_chat_conversations(INTEGER, INTEGER)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_chat_conversations(INTEGER, INTEGER)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_message_read_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
    OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
    OR NEW.message_type IS DISTINCT FROM OLD.message_type
    OR NEW.content IS DISTINCT FROM OLD.content
    OR NEW.attachment_path IS DISTINCT FROM OLD.attachment_path
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR OLD.read_at IS NOT NULL
    OR NEW.read_at IS NULL
  THEN
    RAISE EXCEPTION 'message_fields_are_immutable';
  END IF;

  NEW.read_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_message_read_state() FROM PUBLIC;
CREATE TRIGGER protect_message_read_state
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_message_read_state();

CREATE OR REPLACE FUNCTION public.bump_conversation_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_conversation_activity() FROM PUBLIC;
CREATE TRIGGER bump_conversation_activity
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_conversation_activity();

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'chat-images',
  'chat-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can read chat images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND array_length(storage.foldername(name), 1) = 2
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id::TEXT = (storage.foldername(name))[1]
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "Participants can upload their own chat images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-images'
    AND array_length(storage.foldername(name), 1) = 2
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::TEXT
    AND storage.filename(name) ~
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[.](jpg|png|webp)$'
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id::TEXT = (storage.foldername(name))[1]
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "Users can remove their own chat image uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND array_length(storage.foldername(name), 1) = 2
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::TEXT
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id::TEXT = (storage.foldername(name))[1]
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "Participants can join their conversation channels"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE realtime.topic() = 'conversation:' || c.id::TEXT
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY "Participants can broadcast within their conversation channels"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE realtime.topic() = 'conversation:' || c.id::TEXT
        AND (
          c.buyer_id = (SELECT auth.uid())
          OR c.seller_id = (SELECT auth.uid())
        )
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END;
$$;
