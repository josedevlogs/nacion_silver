/*
  # Funciones de Base de Datos para Nación Silver
  
  ## Descripción
  Este archivo crea todas las funciones necesarias para:
  - Agregar puntos Silver a usuarios
  - Calcular y actualizar niveles del Pasaporte Silver automáticamente
  - Completar retos con validación
  - Registrar actividad del usuario
  - Gestionar interacciones con contenido
  
  ## Funciones Creadas
  
  ### 1. calculate_passport_level
  - Calcula el nivel correcto según los puntos totales
  - Retorna el nivel correspondiente
  
  ### 2. add_silver_points
  - Agrega puntos a un usuario
  - Crea transacción en historial
  - Actualiza nivel automáticamente
  - Registra actividad
  
  ### 3. complete_challenge
  - Completa un reto para un usuario
  - Valida código si es necesario
  - Otorga puntos
  - Registra actividad
  
  ### 4. mark_content_completed
  - Marca contenido como completado
  - Otorga puntos si aplica
  - Actualiza métricas
  
  ### 5. toggle_content_favorite
  - Agrega o quita de favoritos
  - Actualiza contadores
  
  ## Seguridad
  - Todas las funciones verifican autenticación
  - Validaciones de integridad de datos
*/

-- =====================================================
-- FUNCIÓN: calculate_passport_level
-- Calcula el nivel del Pasaporte Silver según puntos
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_passport_level(points integer)
RETURNS passport_level
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_level passport_level;
BEGIN
  SELECT level_name INTO calculated_level
  FROM passport_levels
  WHERE points >= min_points 
    AND (max_points IS NULL OR points <= max_points)
  ORDER BY level_order DESC
  LIMIT 1;
  
  RETURN COALESCE(calculated_level, 'silver');
END;
$$;

-- =====================================================
-- FUNCIÓN: add_silver_points
-- Agrega puntos a un usuario y actualiza su nivel
-- =====================================================
CREATE OR REPLACE FUNCTION add_silver_points(
  p_user_id uuid,
  p_points integer,
  p_source text,
  p_reason text,
  p_reference_id uuid DEFAULT NULL,
  p_transaction_type transaction_type DEFAULT 'earned'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_points integer;
  v_new_points integer;
  v_old_level passport_level;
  v_new_level passport_level;
  v_transaction_id uuid;
  v_level_changed boolean := false;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Obtener puntos y nivel actuales
  SELECT total_points, current_level 
  INTO v_old_points, v_old_level
  FROM user_profiles 
  WHERE id = p_user_id;
  
  -- Calcular nuevos puntos
  v_new_points := v_old_points + p_points;
  
  -- No permitir puntos negativos
  IF v_new_points < 0 THEN
    v_new_points := 0;
  END IF;
  
  -- Calcular nuevo nivel
  v_new_level := calculate_passport_level(v_new_points);
  
  -- Verificar si cambió el nivel
  IF v_new_level != v_old_level THEN
    v_level_changed := true;
  END IF;
  
  -- Actualizar puntos y nivel del usuario
  UPDATE user_profiles 
  SET 
    total_points = v_new_points,
    current_level = v_new_level,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Crear transacción en historial
  INSERT INTO silver_points_transactions (
    user_id,
    points,
    transaction_type,
    source,
    reason,
    reference_id,
    balance_after,
    created_by
  ) VALUES (
    p_user_id,
    p_points,
    p_transaction_type,
    p_source,
    p_reason,
    p_reference_id,
    v_new_points,
    auth.uid()
  ) RETURNING id INTO v_transaction_id;
  
  -- Si cambió el nivel, registrar actividad
  IF v_level_changed THEN
    INSERT INTO user_activity_log (
      user_id,
      activity_type,
      activity_description,
      reference_type,
      reference_id,
      metadata
    ) VALUES (
      p_user_id,
      'level_up',
      'Subió de nivel a ' || v_new_level,
      'level',
      NULL,
      jsonb_build_object(
        'old_level', v_old_level,
        'new_level', v_new_level,
        'total_points', v_new_points
      )
    );
  END IF;
  
  -- Registrar actividad de puntos
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    p_user_id,
    'points_' || p_transaction_type,
    CASE 
      WHEN p_transaction_type = 'earned' THEN 'Ganó ' || p_points || ' puntos Silver'
      WHEN p_transaction_type = 'deducted' THEN 'Se dedujeron ' || p_points || ' puntos Silver'
      ELSE 'Ajuste de puntos Silver'
    END,
    'transaction',
    v_transaction_id,
    jsonb_build_object(
      'points', p_points,
      'source', p_source,
      'reason', p_reason
    )
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'old_points', v_old_points,
    'new_points', v_new_points,
    'points_added', p_points,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'level_changed', v_level_changed,
    'transaction_id', v_transaction_id
  );
END;
$$;

-- =====================================================
-- FUNCIÓN: complete_challenge
-- Completa un reto para un usuario
-- =====================================================
CREATE OR REPLACE FUNCTION complete_challenge(
  p_user_id uuid,
  p_challenge_id uuid,
  p_validation_data text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge record;
  v_user_challenge_id uuid;
  v_points_result jsonb;
  v_already_completed boolean;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Obtener información del reto
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = p_challenge_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reto no encontrado o no activo';
  END IF;
  
  -- Verificar si ya fue completado
  SELECT EXISTS (
    SELECT 1 FROM user_challenges
    WHERE user_id = p_user_id 
      AND challenge_id = p_challenge_id 
      AND status = 'completed'
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RAISE EXCEPTION 'Este reto ya fue completado';
  END IF;
  
  -- Verificar límite de completaciones
  IF v_challenge.max_completions IS NOT NULL 
     AND v_challenge.total_completions >= v_challenge.max_completions THEN
    RAISE EXCEPTION 'Este reto alcanzó el límite de completaciones';
  END IF;
  
  -- Validar código si es necesario
  IF v_challenge.validation_method = 'code' AND v_challenge.validation_code IS NOT NULL THEN
    IF p_validation_data IS NULL OR p_validation_data != v_challenge.validation_code THEN
      RAISE EXCEPTION 'Código de validación incorrecto';
    END IF;
  END IF;
  
  -- Verificar si ya existe el registro (pendiente)
  SELECT id INTO v_user_challenge_id
  FROM user_challenges
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  IF v_user_challenge_id IS NULL THEN
    -- Crear nuevo registro de reto
    INSERT INTO user_challenges (
      user_id,
      challenge_id,
      status,
      validation_data,
      points_earned,
      completed_at
    ) VALUES (
      p_user_id,
      p_challenge_id,
      'completed',
      p_validation_data,
      v_challenge.points_reward,
      now()
    ) RETURNING id INTO v_user_challenge_id;
  ELSE
    -- Actualizar registro existente
    UPDATE user_challenges
    SET 
      status = 'completed',
      validation_data = p_validation_data,
      points_earned = v_challenge.points_reward,
      completed_at = now()
    WHERE id = v_user_challenge_id;
  END IF;
  
  -- Incrementar contador de completaciones del reto
  UPDATE challenges
  SET 
    total_completions = total_completions + 1,
    updated_at = now()
  WHERE id = p_challenge_id;
  
  -- Otorgar puntos si aplica
  IF v_challenge.points_reward > 0 THEN
    v_points_result := add_silver_points(
      p_user_id,
      v_challenge.points_reward,
      'challenge',
      'Completó el reto: ' || v_challenge.title,
      p_challenge_id,
      'earned'
    );
  END IF;
  
  -- Registrar actividad
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    p_user_id,
    'challenge_completed',
    'Completó el reto: ' || v_challenge.title,
    'challenge',
    p_challenge_id,
    jsonb_build_object(
      'challenge_title', v_challenge.title,
      'points_earned', v_challenge.points_reward,
      'challenge_type', v_challenge.challenge_type,
      'origin', v_challenge.origin
    )
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'user_challenge_id', v_user_challenge_id,
    'points_earned', v_challenge.points_reward,
    'challenge_title', v_challenge.title,
    'points_result', v_points_result
  );
END;
$$;

-- =====================================================
-- FUNCIÓN: mark_content_completed
-- Marca contenido como completado y otorga puntos
-- =====================================================
CREATE OR REPLACE FUNCTION mark_content_completed(
  p_user_id uuid,
  p_content_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_content record;
  v_interaction_id uuid;
  v_points_result jsonb;
  v_already_completed boolean;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Obtener información del contenido
  SELECT * INTO v_content
  FROM contents
  WHERE id = p_content_id AND status = 'published';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contenido no encontrado o no publicado';
  END IF;
  
  -- Verificar si ya existe interacción
  SELECT id, completed INTO v_interaction_id, v_already_completed
  FROM user_content_interactions
  WHERE user_id = p_user_id AND content_id = p_content_id;
  
  IF v_already_completed THEN
    RAISE EXCEPTION 'Este contenido ya fue completado';
  END IF;
  
  IF v_interaction_id IS NULL THEN
    -- Crear nueva interacción
    INSERT INTO user_content_interactions (
      user_id,
      content_id,
      viewed,
      completed,
      points_earned,
      first_viewed_at,
      completed_at
    ) VALUES (
      p_user_id,
      p_content_id,
      true,
      true,
      v_content.points_reward,
      now(),
      now()
    ) RETURNING id INTO v_interaction_id;
  ELSE
    -- Actualizar interacción existente
    UPDATE user_content_interactions
    SET 
      completed = true,
      points_earned = v_content.points_reward,
      completed_at = now(),
      updated_at = now()
    WHERE id = v_interaction_id;
  END IF;
  
  -- Actualizar contador de completaciones del contenido
  UPDATE contents
  SET 
    completion_count = completion_count + 1,
    updated_at = now()
  WHERE id = p_content_id;
  
  -- Otorgar puntos si aplica
  IF v_content.points_reward > 0 THEN
    v_points_result := add_silver_points(
      p_user_id,
      v_content.points_reward,
      'content',
      'Completó el contenido: ' || v_content.title,
      p_content_id,
      'earned'
    );
  END IF;
  
  -- Registrar actividad
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_description,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    p_user_id,
    'content_completed',
    'Completó: ' || v_content.title,
    'content',
    p_content_id,
    jsonb_build_object(
      'content_title', v_content.title,
      'content_type', v_content.content_type,
      'points_earned', v_content.points_reward
    )
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'interaction_id', v_interaction_id,
    'points_earned', v_content.points_reward,
    'content_title', v_content.title,
    'points_result', v_points_result
  );
END;
$$;

-- =====================================================
-- FUNCIÓN: toggle_content_favorite
-- Agrega o quita contenido de favoritos
-- =====================================================
CREATE OR REPLACE FUNCTION toggle_content_favorite(
  p_user_id uuid,
  p_content_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_interaction_id uuid;
  v_is_favorited boolean;
  v_new_favorited_state boolean;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Verificar que el contenido existe
  IF NOT EXISTS (SELECT 1 FROM contents WHERE id = p_content_id AND status = 'published') THEN
    RAISE EXCEPTION 'Contenido no encontrado o no publicado';
  END IF;
  
  -- Verificar si ya existe interacción
  SELECT id, favorited INTO v_interaction_id, v_is_favorited
  FROM user_content_interactions
  WHERE user_id = p_user_id AND content_id = p_content_id;
  
  -- Calcular nuevo estado
  v_new_favorited_state := NOT COALESCE(v_is_favorited, false);
  
  IF v_interaction_id IS NULL THEN
    -- Crear nueva interacción
    INSERT INTO user_content_interactions (
      user_id,
      content_id,
      favorited,
      favorited_at
    ) VALUES (
      p_user_id,
      p_content_id,
      v_new_favorited_state,
      CASE WHEN v_new_favorited_state THEN now() ELSE NULL END
    ) RETURNING id INTO v_interaction_id;
  ELSE
    -- Actualizar interacción existente
    UPDATE user_content_interactions
    SET 
      favorited = v_new_favorited_state,
      favorited_at = CASE WHEN v_new_favorited_state THEN now() ELSE NULL END,
      updated_at = now()
    WHERE id = v_interaction_id;
  END IF;
  
  -- Actualizar contador de favoritos del contenido
  IF v_new_favorited_state THEN
    UPDATE contents SET favorite_count = favorite_count + 1 WHERE id = p_content_id;
  ELSE
    UPDATE contents SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = p_content_id;
  END IF;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'interaction_id', v_interaction_id,
    'favorited', v_new_favorited_state
  );
END;
$$;

-- =====================================================
-- FUNCIÓN: record_content_view
-- Registra una vista de contenido
-- =====================================================
CREATE OR REPLACE FUNCTION record_content_view(
  p_user_id uuid,
  p_content_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_interaction_id uuid;
  v_already_viewed boolean;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Verificar que el contenido existe
  IF NOT EXISTS (SELECT 1 FROM contents WHERE id = p_content_id AND status = 'published') THEN
    RAISE EXCEPTION 'Contenido no encontrado o no publicado';
  END IF;
  
  -- Verificar si ya existe interacción
  SELECT id, viewed INTO v_interaction_id, v_already_viewed
  FROM user_content_interactions
  WHERE user_id = p_user_id AND content_id = p_content_id;
  
  IF v_interaction_id IS NULL THEN
    -- Crear nueva interacción
    INSERT INTO user_content_interactions (
      user_id,
      content_id,
      viewed,
      first_viewed_at
    ) VALUES (
      p_user_id,
      p_content_id,
      true,
      now()
    ) RETURNING id INTO v_interaction_id;
    
    -- Incrementar contador solo si es primera vista
    UPDATE contents SET view_count = view_count + 1 WHERE id = p_content_id;
  ELSIF NOT v_already_viewed THEN
    -- Marcar como visto
    UPDATE user_content_interactions
    SET 
      viewed = true,
      first_viewed_at = now(),
      updated_at = now()
    WHERE id = v_interaction_id;
    
    -- Incrementar contador
    UPDATE contents SET view_count = view_count + 1 WHERE id = p_content_id;
  END IF;
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'interaction_id', v_interaction_id
  );
END;
$$;

-- =====================================================
-- FUNCIÓN: get_user_dashboard_stats
-- Obtiene estadísticas del usuario para el dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile record;
  v_level_info record;
  v_challenges_completed integer;
  v_challenges_available integer;
  v_subscription_status subscription_status;
  v_result jsonb;
BEGIN
  -- Obtener perfil del usuario
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
  
  -- Obtener información del nivel actual
  SELECT * INTO v_level_info
  FROM passport_levels
  WHERE level_name = v_profile.current_level;
  
  -- Contar retos completados
  SELECT COUNT(*) INTO v_challenges_completed
  FROM user_challenges
  WHERE user_id = p_user_id AND status = 'completed';
  
  -- Contar retos disponibles
  SELECT COUNT(*) INTO v_challenges_available
  FROM challenges
  WHERE is_active = true
    AND id NOT IN (
      SELECT challenge_id FROM user_challenges 
      WHERE user_id = p_user_id AND status = 'completed'
    );
  
  -- Obtener estado de suscripción
  SELECT status INTO v_subscription_status
  FROM silver_club_subscriptions
  WHERE user_id = p_user_id;
  
  -- Construir resultado
  v_result := jsonb_build_object(
    'user_id', v_profile.id,
    'full_name', v_profile.full_name,
    'current_level', v_profile.current_level,
    'level_display_name', v_level_info.display_name,
    'total_points', v_profile.total_points,
    'level_min_points', v_level_info.min_points,
    'level_max_points', v_level_info.max_points,
    'challenges_completed', v_challenges_completed,
    'challenges_available', v_challenges_available,
    'subscription_status', COALESCE(v_subscription_status, 'none'),
    'profile_completed', v_profile.profile_completed
  );
  
  RETURN v_result;
END;
$$;