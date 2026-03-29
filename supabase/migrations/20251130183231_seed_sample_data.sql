/*
  # Datos de Ejemplo para Testing
  
  ## Descripción
  Inserta datos de prueba para retos, beneficios y contenidos
*/

-- Insertar retos de ejemplo
INSERT INTO challenges (
  title,
  description,
  full_description,
  challenge_type,
  origin,
  points_reward,
  validation_method,
  is_active,
  is_featured,
  display_order,
  category
) VALUES
(
  'Completa tu Primer Curso en Aula Silver',
  'Inscríbete y completa cualquier curso en la plataforma Aula Silver',
  'Accede a Aula Silver y explora nuestro catálogo de cursos. Elige el que más te interese y complétalo para ganar puntos Silver.',
  'external',
  'aula',
  100,
  'integration',
  true,
  true,
  1,
  'Educación'
),
(
  'Invita a un Amigo',
  'Comparte Nación Silver con un amigo y que se registre usando tu código',
  'Cada vez que invitas a un amigo y se registra, ganas puntos Silver. Comparte el código que encontrarás en tu perfil.',
  'internal',
  'nacion',
  50,
  'manual',
  true,
  true,
  2,
  'Comunidad'
),
(
  'Explora una Microaula',
  'Completa cualquier microaula para aprender algo nuevo en minutos',
  'Accede a Microaula, elige un tema que te interese y completa el contenido. ¡Aprende algo nuevo en solo minutos!',
  'external',
  'microaula',
  75,
  'integration',
  true,
  false,
  3,
  'Educación'
),
(
  'Lee un Artículo de Bienestar',
  'Lee cualquier artículo publicado en la sección de Bienestar',
  'Explora nuestros artículos sobre bienestar, salud y autocuidado. Al leer y marcar como completado, ganarás puntos Silver.',
  'internal',
  'bienestar',
  25,
  'manual',
  true,
  false,
  4,
  'Bienestar'
),
(
  'Asiste a un Evento SILVERMOON',
  'Participa en cualquier evento organizado por SILVERMOON',
  'Cuando asistas a un evento presencial o virtual de SILVERMOON, escanea el código QR en el lugar del evento.',
  'external',
  'event',
  150,
  'qr',
  true,
  true,
  5,
  'Eventos'
),
(
  'Reto Especial: Código Secreto',
  'Ingresa el código secreto para ganar puntos bonus',
  'Este es un reto especial con código secreto. El código es: SILVER2024',
  'internal',
  'nacion',
  200,
  'code',
  true,
  true,
  6,
  'Especial'
)
ON CONFLICT DO NOTHING;

-- Actualizar el código de validación
UPDATE challenges 
SET validation_code = 'SILVER2024' 
WHERE title = 'Reto Especial: Código Secreto' AND validation_code IS NULL;

-- Insertar beneficios de ejemplo
INSERT INTO benefits (
  title,
  short_description,
  full_description,
  category,
  required_level,
  requires_silver_club,
  redemption_instructions,
  is_active,
  is_featured,
  display_order
) VALUES
(
  '10% de Descuento en Cursos de Aula Silver',
  'Obtén descuento en todos los cursos de la plataforma educativa',
  'Todos los miembros Silver tienen acceso a un 10% de descuento en los cursos de Aula Silver. El descuento se aplica automáticamente al momento de la compra.',
  'Educación',
  'silver',
  false,
  'El descuento se aplica automáticamente al iniciar sesión con tu cuenta de Nación Silver',
  true,
  true,
  1
),
(
  'Acceso Prioritario a Eventos',
  'Inscripción anticipada a todos los eventos SILVERMOON',
  'Como Residente Silver, tendrás acceso prioritario para inscribirte en eventos antes que el público general.',
  'Eventos',
  'residente_silver',
  false,
  'Recibirás un email con el enlace de inscripción anticipada 48 horas antes del lanzamiento público',
  true,
  true,
  2
),
(
  'Asesoría Profesional Gratuita',
  'Una sesión de asesoría profesional al mes con expertos',
  'Los Ciudadanos Silver tienen derecho a una sesión mensual gratuita de asesoría profesional con expertos en diferentes áreas.',
  'Profesional',
  'ciudadano_silver',
  false,
  'Reserva tu sesión a través del portal de Talentos Silver en la sección de Beneficios',
  true,
  false,
  3
),
(
  'Acceso VIP a Experiencias Exclusivas',
  'Invitaciones a experiencias VIP y encuentros especiales',
  'Los Embajadores Silver reciben invitaciones exclusivas a experiencias VIP, encuentros con personalidades y eventos especiales.',
  'Experiencias VIP',
  'embajador_silver',
  false,
  'Las invitaciones se envían directamente a tu correo registrado',
  true,
  true,
  4
),
(
  'Contenido Exclusivo Silver Club',
  'Acceso ilimitado a contenido premium y exclusivo',
  'Los miembros del Silver Club tienen acceso a contenido exclusivo, incluyendo webinars, talleres especiales y materiales descargables.',
  'Contenido Premium',
  'silver',
  true,
  'Accede al contenido exclusivo desde la sección Silver Club una vez activada tu suscripción',
  true,
  true,
  5
),
(
  'Descuento del 20% en Comercios Aliados',
  'Descuentos especiales en una red de comercios aliados',
  'Disfruta de descuentos especiales en restaurantes, tiendas y servicios de nuestra red de comercios aliados.',
  'Descuentos',
  'residente_silver',
  false,
  'Presenta tu credencial digital de Nación Silver en los comercios aliados. Encuentra el listado completo en la app.',
  true,
  false,
  6
)
ON CONFLICT DO NOTHING;