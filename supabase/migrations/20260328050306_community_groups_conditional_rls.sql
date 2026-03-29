/*
  Visibilidad de grupos con access_mode = conditional:
  usuarios autenticados que cumplen nivel Pasaporte y (si aplica) Club Silver pueden ver el grupo listado.
*/

CREATE OR REPLACE FUNCTION public.passport_level_rank(p passport_level)
RETURNS smallint
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT CASE p
    WHEN 'silver' THEN 1::smallint
    WHEN 'residente_silver' THEN 2::smallint
    WHEN 'ciudadano_silver' THEN 3::smallint
    WHEN 'embajador_silver' THEN 4::smallint
  END;
$$;

CREATE POLICY "Eligible users can view conditional listed groups"
  ON community_groups FOR SELECT
  TO authenticated
  USING (
    access_mode = 'conditional'
    AND is_listed = true
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (
        community_groups.min_passport_level IS NULL
        OR public.passport_level_rank(up.current_level) >= public.passport_level_rank(community_groups.min_passport_level)
      )
      AND (
        NOT community_groups.requires_silver_club
        OR up.es_club_silver
        OR EXISTS (
          SELECT 1 FROM silver_club_subscriptions s
          WHERE s.user_id = up.id AND s.status IN ('active', 'trial')
        )
      )
    )
  );
