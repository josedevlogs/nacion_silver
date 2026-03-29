/*
  # Endurecimiento de seguridad (advisors Supabase)

  - Establece search_path fijo en funciones públicas (lint 0011_function_search_path_mutable).
  - Elimina políticas INSERT con WITH CHECK (true) en tablas donde los inserts
    deben ocurrir solo vía funciones SECURITY DEFINER (lint 0024_permissive_rls_policy).

  La protección de contraseñas filtradas (HaveIBeenPwned) se activa en el dashboard:
  Authentication → Providers → Email → Password strength.
*/

-- search_path inmutable (evita ataques de schema hijacking)
ALTER FUNCTION public.calculate_passport_level(integer) SET search_path = public;

ALTER FUNCTION public.add_silver_points(
  uuid,
  integer,
  text,
  text,
  uuid,
  transaction_type
) SET search_path = public;

ALTER FUNCTION public.complete_challenge(uuid, uuid, text) SET search_path = public;

ALTER FUNCTION public.mark_content_completed(uuid, uuid) SET search_path = public;

ALTER FUNCTION public.toggle_content_favorite(uuid, uuid) SET search_path = public;

ALTER FUNCTION public.record_content_view(uuid, uuid) SET search_path = public;

ALTER FUNCTION public.get_user_dashboard_stats(uuid) SET search_path = public;

-- Inserts solo vía funciones SECURITY DEFINER (bypass RLS como owner); no INSERT directo desde cliente
DROP POLICY IF EXISTS "System can insert transactions" ON public.silver_points_transactions;
DROP POLICY IF EXISTS "System can insert activity log" ON public.user_activity_log;
