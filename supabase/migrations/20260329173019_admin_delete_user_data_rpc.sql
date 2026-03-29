-- Borrado "lógico" sin Edge Functions: anonimiza perfil + baneo. No elimina auth.users (requeriría service role fuera de la BD).

CREATE OR REPLACE FUNCTION public.admin_delete_user_data(p_target uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dni text;
  n int;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('ok', false, 'error', 'forbidden');
  END IF;
  IF p_target = auth.uid() THEN
    RETURN json_build_object('ok', false, 'error', 'cannot_delete_self');
  END IF;

  v_dni := 'ELIM-' || replace(p_target::text, '-', '');

  UPDATE public.user_profiles
  SET
    is_banned = true,
    email = null,
    full_name = 'Cuenta cerrada',
    dni = v_dni,
    nationality = '—',
    country = '—',
    city = '—',
    interests = '{}',
    avatar_url = null,
    profile_completed = false,
    es_club_silver = false,
    updated_at = now()
  WHERE id = p_target;

  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN
    RETURN json_build_object('ok', false, 'error', 'profile_not_found');
  END IF;

  RETURN json_build_object('ok', true, 'mode', 'soft_delete');
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user_data(uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_delete_user_data(uuid) IS
  'Admin: anonimiza y banea perfil. No borra auth.users; el usuario no podrá usar la app (is_banned + cliente).';
