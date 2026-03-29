/*
  # Esquema Principal de Nación Silver
  
  ## Descripción
  Este archivo crea el esquema completo para la plataforma Nación Silver, incluyendo:
  - Perfiles de usuario con datos obligatorios
  - Sistema de niveles Pasaporte Silver
  - Sistema de puntos Silver con transacciones
  - Sistema de retos internos y externos
  - Sistema de contenidos (artículos, anuncios, eventos)
  - Sistema de beneficios por nivel
  - Sistema de suscripción Silver Club
  - Favoritos y actividad del usuario
  
  ## Tablas Creadas
  
  ### 1. user_profiles
  - Perfil completo del usuario con datos obligatorios
  - Campos: nombre, edad, DNI, nacionalidad, país, ciudad, intereses
  - Incluye nivel actual del Pasaporte Silver y puntos totales
  
  ### 2. passport_levels
  - Definición de los 4 niveles del Pasaporte Silver
  - Puntos requeridos para cada nivel
  
  ### 3. silver_points_transactions
  - Historial de todas las transacciones de puntos
  - Registro de origen, razón y balance
  
  ### 4. challenges
  - Definición de retos (internos y externos)
  - Tipo, origen, puntos que otorga, método de validación
  
  ### 5. user_challenges
  - Seguimiento de retos completados por usuario
  - Estado y fecha de completación
  
  ### 6. contents
  - Artículos, anuncios, eventos y contenido general
  - Tipo, puntos asociados, estado de publicación
  
  ### 7. user_content_interactions
  - Interacciones del usuario con contenido
  - Completado, favoritos, vistas
  
  ### 8. benefits
  - Beneficios y ventajas disponibles
  - Nivel requerido, exclusividad Silver Club
  
  ### 9. silver_club_subscriptions
  - Suscripciones al Silver Club
  - Estados, fechas, método de pago
  
  ### 10. user_activity_log
  - Log de todas las actividades del usuario
  
  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas por defecto
  - Acceso controlado por autenticación y rol
*/

-- Crear tipo ENUM para roles de usuario
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Crear tipo ENUM para niveles del Pasaporte Silver
CREATE TYPE passport_level AS ENUM ('silver', 'residente_silver', 'ciudadano_silver', 'embajador_silver');

-- Crear tipo ENUM para tipos de contenido
CREATE TYPE content_type AS ENUM ('article', 'announcement', 'event', 'challenge_promo');

-- Crear tipo ENUM para estados de contenido
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- Crear tipo ENUM para tipos de reto
CREATE TYPE challenge_type AS ENUM ('internal', 'external');

-- Crear tipo ENUM para origen de reto
CREATE TYPE challenge_origin AS ENUM ('nacion', 'aula', 'microaula', 'bienestar', 'event');

-- Crear tipo ENUM para método de validación de reto
CREATE TYPE validation_method AS ENUM ('manual', 'code', 'qr', 'integration');

-- Crear tipo ENUM para estado de reto
CREATE TYPE challenge_status AS ENUM ('pending', 'completed');

-- Crear tipo ENUM para estado de suscripción
CREATE TYPE subscription_status AS ENUM ('none', 'trial', 'active', 'expired', 'pending_confirmation');

-- Crear tipo ENUM para método de pago
CREATE TYPE payment_method AS ENUM ('paypal', 'offline');

-- Crear tipo ENUM para tipo de transacción de puntos
CREATE TYPE transaction_type AS ENUM ('earned', 'deducted', 'admin_adjustment');

-- =====================================================
-- TABLA: user_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos obligatorios del perfil
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18),
  dni text NOT NULL,
  nationality text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  interests text[] NOT NULL DEFAULT '{}',
  
  -- Sistema de Pasaporte Silver
  current_level passport_level NOT NULL DEFAULT 'silver',
  total_points integer NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  
  -- Rol del usuario
  role user_role NOT NULL DEFAULT 'user',
  
  -- Metadata
  profile_completed boolean NOT NULL DEFAULT false,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política: Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden actualizar todos los perfiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: passport_levels
-- =====================================================
CREATE TABLE IF NOT EXISTS passport_levels (
  id serial PRIMARY KEY,
  level_name passport_level NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text NOT NULL,
  min_points integer NOT NULL CHECK (min_points >= 0),
  max_points integer CHECK (max_points IS NULL OR max_points >= min_points),
  level_order integer NOT NULL UNIQUE,
  benefits_description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE passport_levels ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver los niveles
CREATE POLICY "Authenticated users can view levels"
  ON passport_levels FOR SELECT
  TO authenticated
  USING (true);

-- Insertar los 4 niveles del Pasaporte Silver
INSERT INTO passport_levels (level_name, display_name, description, min_points, max_points, level_order, benefits_description)
VALUES
  ('silver', 'Silver', 'Nivel inicial de bienvenida a la comunidad Nación Silver', 0, 499, 1, 'Acceso a contenido básico y retos introductorios'),
  ('residente_silver', 'Residente Silver', 'Miembro activo de la comunidad con participación regular', 500, 1499, 2, 'Acceso a más retos y beneficios exclusivos para residentes'),
  ('ciudadano_silver', 'Ciudadano Silver', 'Miembro comprometido con la comunidad', 1500, 3999, 3, 'Beneficios premium y acceso prioritario a eventos'),
  ('embajador_silver', 'Embajador Silver', 'Nivel más alto de la comunidad, líder y referente', 4000, NULL, 4, 'Todos los beneficios más acceso VIP a eventos y contenido exclusivo');

-- =====================================================
-- TABLA: silver_points_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS silver_points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Detalles de la transacción
  points integer NOT NULL,
  transaction_type transaction_type NOT NULL DEFAULT 'earned',
  
  -- Origen y razón
  source text NOT NULL, -- 'challenge', 'content', 'profile', 'referral', 'admin', etc.
  reason text NOT NULL,
  reference_id uuid, -- ID del reto, contenido, etc.
  
  -- Balance después de la transacción
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  
  -- Metadata
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE silver_points_transactions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias transacciones
CREATE POLICY "Users can view own transactions"
  ON silver_points_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: Los admins pueden ver todas las transacciones
CREATE POLICY "Admins can view all transactions"
  ON silver_points_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Solo el sistema (funciones) puede insertar transacciones
CREATE POLICY "System can insert transactions"
  ON silver_points_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- TABLA: challenges
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  title text NOT NULL,
  description text NOT NULL,
  full_description text,
  image_url text,
  
  -- Tipo y origen
  challenge_type challenge_type NOT NULL DEFAULT 'internal',
  origin challenge_origin NOT NULL DEFAULT 'nacion',
  
  -- Puntos y validación
  points_reward integer NOT NULL DEFAULT 0 CHECK (points_reward >= 0),
  validation_method validation_method NOT NULL DEFAULT 'manual',
  validation_code text, -- Para retos con código
  
  -- Categorías y tags
  category text,
  tags text[] DEFAULT '{}',
  
  -- Estado y visibilidad
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer DEFAULT 0,
  
  -- Límites
  max_completions integer, -- NULL = ilimitado
  total_completions integer NOT NULL DEFAULT 0,
  
  -- Metadata
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver retos activos
CREATE POLICY "Authenticated users can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Política: Los admins pueden ver todos los retos
CREATE POLICY "Admins can view all challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden crear retos
CREATE POLICY "Admins can insert challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden actualizar retos
CREATE POLICY "Admins can update challenges"
  ON challenges FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden eliminar retos
CREATE POLICY "Admins can delete challenges"
  ON challenges FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: user_challenges
-- =====================================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Estado
  status challenge_status NOT NULL DEFAULT 'pending',
  
  -- Validación
  validation_data text, -- Código ingresado, QR escaneado, etc.
  
  -- Puntos otorgados
  points_earned integer NOT NULL DEFAULT 0,
  
  -- Fechas
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  
  -- Constraint: Un usuario no puede tener el mismo reto múltiples veces
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios retos
CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios retos
CREATE POLICY "Users can insert own challenges"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios retos
CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los admins pueden ver todos los retos de usuarios
CREATE POLICY "Admins can view all user challenges"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: contents
-- =====================================================
CREATE TABLE IF NOT EXISTS contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  title text NOT NULL,
  short_description text,
  full_content text NOT NULL,
  image_url text,
  
  -- Tipo y categoría
  content_type content_type NOT NULL DEFAULT 'article',
  category text,
  tags text[] DEFAULT '{}',
  
  -- Puntos asociados (si aplica)
  points_reward integer DEFAULT 0 CHECK (points_reward >= 0),
  
  -- Estado y publicación
  status content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  scheduled_for timestamptz,
  
  -- Métricas
  view_count integer NOT NULL DEFAULT 0,
  completion_count integer NOT NULL DEFAULT 0,
  favorite_count integer NOT NULL DEFAULT 0,
  
  -- Display
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer DEFAULT 0,
  
  -- Metadata
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver contenido publicado
CREATE POLICY "Authenticated users can view published content"
  ON contents FOR SELECT
  TO authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Política: Los admins pueden ver todo el contenido
CREATE POLICY "Admins can view all content"
  ON contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden crear contenido
CREATE POLICY "Admins can insert content"
  ON contents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden actualizar contenido
CREATE POLICY "Admins can update content"
  ON contents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden eliminar contenido
CREATE POLICY "Admins can delete content"
  ON contents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: user_content_interactions
-- =====================================================
CREATE TABLE IF NOT EXISTS user_content_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  
  -- Tipo de interacción
  viewed boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  favorited boolean NOT NULL DEFAULT false,
  
  -- Puntos otorgados
  points_earned integer NOT NULL DEFAULT 0,
  
  -- Fechas
  first_viewed_at timestamptz,
  completed_at timestamptz,
  favorited_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraint: Un usuario solo puede tener una interacción por contenido
  UNIQUE(user_id, content_id)
);

ALTER TABLE user_content_interactions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias interacciones
CREATE POLICY "Users can view own interactions"
  ON user_content_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden crear sus propias interacciones
CREATE POLICY "Users can insert own interactions"
  ON user_content_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias interacciones
CREATE POLICY "Users can update own interactions"
  ON user_content_interactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los admins pueden ver todas las interacciones
CREATE POLICY "Admins can view all interactions"
  ON user_content_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: benefits
-- =====================================================
CREATE TABLE IF NOT EXISTS benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  title text NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  image_url text,
  
  -- Categoría
  category text NOT NULL DEFAULT 'general',
  
  -- Requisitos de nivel
  required_level passport_level NOT NULL DEFAULT 'silver',
  requires_silver_club boolean NOT NULL DEFAULT false,
  
  -- Redención
  redemption_instructions text NOT NULL,
  redemption_code text,
  terms_and_conditions text,
  
  -- Límites y validez
  usage_limit integer, -- NULL = ilimitado
  total_redemptions integer NOT NULL DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  
  -- Estado y visibilidad
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer DEFAULT 0,
  
  -- Metadata
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver beneficios activos
CREATE POLICY "Authenticated users can view active benefits"
  ON benefits FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Política: Los admins pueden ver todos los beneficios
CREATE POLICY "Admins can view all benefits"
  ON benefits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden crear beneficios
CREATE POLICY "Admins can insert benefits"
  ON benefits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden actualizar beneficios
CREATE POLICY "Admins can update benefits"
  ON benefits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden eliminar beneficios
CREATE POLICY "Admins can delete benefits"
  ON benefits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: silver_club_subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS silver_club_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Estado de suscripción
  status subscription_status NOT NULL DEFAULT 'none',
  
  -- Plan
  plan_type text NOT NULL DEFAULT 'monthly', -- 'monthly', 'annual', etc.
  
  -- Fechas
  start_date timestamptz,
  end_date timestamptz,
  trial_end_date timestamptz,
  next_billing_date timestamptz,
  
  -- Pago
  payment_method payment_method,
  payment_reference text, -- ID de PayPal, número de transferencia, etc.
  amount_paid numeric(10,2),
  currency text DEFAULT 'USD',
  
  -- Comprobante de pago (para pagos offline)
  payment_proof_url text,
  
  -- Notas del admin
  admin_notes text,
  
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  confirmed_by uuid REFERENCES user_profiles(id),
  confirmed_at timestamptz,
  
  -- Constraint: Un usuario solo puede tener una suscripción activa
  UNIQUE(user_id)
);

ALTER TABLE silver_club_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propia suscripción
CREATE POLICY "Users can view own subscription"
  ON silver_club_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propia suscripción
CREATE POLICY "Users can insert own subscription"
  ON silver_club_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propia suscripción
CREATE POLICY "Users can update own subscription"
  ON silver_club_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los admins pueden ver todas las suscripciones
CREATE POLICY "Admins can view all subscriptions"
  ON silver_club_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Los admins pueden actualizar todas las suscripciones
CREATE POLICY "Admins can update all subscriptions"
  ON silver_club_subscriptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TABLA: user_activity_log
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Tipo de actividad
  activity_type text NOT NULL, -- 'challenge_completed', 'content_viewed', 'level_up', etc.
  activity_description text NOT NULL,
  
  -- Referencias
  reference_type text, -- 'challenge', 'content', 'benefit', etc.
  reference_id uuid,
  
  -- Metadata
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio log de actividad
CREATE POLICY "Users can view own activity log"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: El sistema puede insertar en el log de actividad
CREATE POLICY "System can insert activity log"
  ON user_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Los admins pueden ver todo el log de actividad
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(current_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Índices para silver_points_transactions
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON silver_points_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_source ON silver_points_transactions(source);

-- Índices para challenges
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_origin ON challenges(origin);

-- Índices para user_challenges
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge ON user_challenges(challenge_id);

-- Índices para contents
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_featured ON contents(is_featured, display_order);

-- Índices para user_content_interactions
CREATE INDEX IF NOT EXISTS idx_content_interactions_user ON user_content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_content ON user_content_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_favorited ON user_content_interactions(user_id, favorited) WHERE favorited = true;

-- Índices para benefits
CREATE INDEX IF NOT EXISTS idx_benefits_level ON benefits(required_level);
CREATE INDEX IF NOT EXISTS idx_benefits_club ON benefits(requires_silver_club);
CREATE INDEX IF NOT EXISTS idx_benefits_active ON benefits(is_active, display_order);

-- Índices para silver_club_subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON silver_club_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON silver_club_subscriptions(end_date) WHERE status = 'active';

-- Índices para user_activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON user_activity_log(activity_type);