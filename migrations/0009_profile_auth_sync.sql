  -- Keep one public profile row for every Supabase Auth user.
  CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $$
  BEGIN
    INSERT INTO public.profiles (id, display_name, location)
    VALUES (
      NEW.id,
      NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'display_name'), ''),
      NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'municipality'), '')
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
  END;
  $$;

  ALTER FUNCTION public.create_profile_for_auth_user() OWNER TO postgres;
  REVOKE ALL ON FUNCTION public.create_profile_for_auth_user()
    FROM PUBLIC, anon, authenticated;

  DROP TRIGGER IF EXISTS create_profile_after_auth_user_insert ON auth.users;
  CREATE TRIGGER create_profile_after_auth_user_insert
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_auth_user();

  INSERT INTO public.profiles (id, display_name, location)
  SELECT
    auth_user.id,
    NULLIF(BTRIM(auth_user.raw_user_meta_data ->> 'display_name'), ''),
    NULLIF(BTRIM(auth_user.raw_user_meta_data ->> 'municipality'), '')
  FROM auth.users AS auth_user
  LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
  WHERE profile.id IS NULL
  ON CONFLICT (id) DO NOTHING;
