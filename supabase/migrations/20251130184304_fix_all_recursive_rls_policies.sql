/*
  # Corregir Todas las Políticas RLS Recursivas
  
  ## Descripción
  Elimina las políticas que causan recursión infinita en todas las tablas.
  Por ahora, solo mantenemos las políticas básicas de acceso de usuario.
  Las funcionalidades de admin se pueden manejar mediante funciones RPC
  que usan SECURITY DEFINER.
  
  ## Cambios
  - Eliminar políticas de admin recursivas
  - Mantener solo políticas de usuario básicas
*/

-- =====================================================
-- TABLA: silver_points_transactions
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all transactions" ON silver_points_transactions;

-- =====================================================
-- TABLA: challenges
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all challenges" ON challenges;
DROP POLICY IF EXISTS "Admins can insert challenges" ON challenges;
DROP POLICY IF EXISTS "Admins can update challenges" ON challenges;
DROP POLICY IF EXISTS "Admins can delete challenges" ON challenges;

-- =====================================================
-- TABLA: user_challenges
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all user challenges" ON user_challenges;

-- =====================================================
-- TABLA: contents
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all content" ON contents;
DROP POLICY IF EXISTS "Admins can insert content" ON contents;
DROP POLICY IF EXISTS "Admins can update content" ON contents;
DROP POLICY IF EXISTS "Admins can delete content" ON contents;

-- =====================================================
-- TABLA: user_content_interactions
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all interactions" ON user_content_interactions;

-- =====================================================
-- TABLA: benefits
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all benefits" ON benefits;
DROP POLICY IF EXISTS "Admins can insert benefits" ON benefits;
DROP POLICY IF EXISTS "Admins can update benefits" ON benefits;
DROP POLICY IF EXISTS "Admins can delete benefits" ON benefits;

-- =====================================================
-- TABLA: silver_club_subscriptions
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON silver_club_subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON silver_club_subscriptions;

-- =====================================================
-- TABLA: user_activity_log
-- =====================================================
DROP POLICY IF EXISTS "Admins can view all activity logs" ON user_activity_log;

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Las funcionalidades de administrador se pueden implementar mediante:
-- 1. Funciones RPC con SECURITY DEFINER que verifican el rol internamente
-- 2. Service role key en el backend
-- 3. Políticas que usen claims JWT personalizados (sin consultar user_profiles)