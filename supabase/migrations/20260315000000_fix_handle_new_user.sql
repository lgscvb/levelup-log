-- Fix handle_new_user trigger:
-- 1. Handle username conflicts with fallback to UUID
-- 2. Also check 'picture' field (Google uses this, not 'avatar_url')
-- 3. Add EXCEPTION handler so trigger never blocks auth signup

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_counter  INTEGER := 0;
BEGIN
  -- Build initial username candidate
  v_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_username'), ''),
    'user_' || REPLACE(LEFT(NEW.id::text, 8), '-', '')
  );

  -- Resolve username collision
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_counter  := v_counter + 1;
    v_username := 'user_' || REPLACE(LEFT(NEW.id::text, 8), '-', '') || v_counter::text;
    IF v_counter > 100 THEN
      v_username := 'user_' || REPLACE(NEW.id::text, '-', '');
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    v_username,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup due to profile creation failure
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
