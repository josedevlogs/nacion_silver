-- Email en perfil (sincronizado desde auth.users), baneo, y función is_admin() para RLS sin recursión

-- Columnas
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_profiles.email IS 'Copia del email de auth.users; mantener vía trigger';
COMMENT ON COLUMN public.user_profiles.is_banned IS 'Si es true, la app no debe permitir el acceso (sesión invalidada en cliente)';

-- Función helper: admin sin recursión en políticas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Sincronizar email desde auth.users hacia user_profiles
CREATE OR REPLACE FUNCTION public.sync_profile_email_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET email = NEW.email,
      updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_user_email_sync ON auth.users;
CREATE TRIGGER trg_auth_user_email_sync
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email_from_auth();

-- Backfill email existente
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE au.id = up.id
  AND (up.email IS NULL OR up.email = '');

-- Políticas admin (recrear usando is_admin para evitar recursión)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.user_profiles;
CREATE POLICY "Admins can delete all profiles"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());
