/*
  # Corregir Políticas RLS de user_profiles
  
  ## Descripción
  Elimina y recrea las políticas RLS para evitar recursión infinita.
  El problema ocurre cuando las políticas de admin intentan verificar
  el rol del usuario consultando la misma tabla que están protegiendo.
  
  ## Cambios
  - Se eliminan todas las políticas existentes
  - Se recrean políticas sin recursión
  - Las políticas de admin verifican directamente con auth.uid()
*/

-- Eliminar todas las políticas existentes de user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Crear políticas simples sin recursión

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Los usuarios pueden eliminar su propio perfil
CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);