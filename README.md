# Nación Silver

Hub digital para la comunidad SILVERMOON diseñado para personas mayores de 50 años.

## Características Principales

### Sistema de Gamificación
- **Pasaporte Silver**: 4 niveles de progresión (Silver, Residente Silver, Ciudadano Silver, Embajador Silver)
- **Puntos Silver**: Sistema de recompensas por completar actividades
- **Retos**: Desafíos internos y externos para ganar puntos

### Funcionalidades
- ✅ Registro e inicio de sesión con validación de edad (50+)
- ✅ Perfil completo con datos obligatorios
- ✅ Dashboard personalizado con estadísticas
- ✅ Sistema de retos con múltiples métodos de validación (manual, código, QR)
- ✅ Catálogo de beneficios por nivel
- ✅ Silver Club con suscripciones
- ✅ Integración preparada con plataformas del ecosistema SILVERMOON

### Diseño Accesible
- Textos grandes y claros
- Botones espaciados y de fácil interacción
- Navegación simple e intuitiva
- Colores de alto contraste (sin tonos púrpura/índigo)
- Responsive mobile-first

## Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: TailwindCSS con sistema de diseño personalizado
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Enrutamiento**: React Router v7

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (ya configuradas en .env)
# VITE_SUPABASE_URL=tu_url_de_supabase
# VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# Iniciar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## Estructura de la Base de Datos

### Tablas Principales
- `user_profiles`: Perfiles de usuario con datos completos
- `passport_levels`: Definición de niveles del Pasaporte Silver
- `silver_points_transactions`: Historial de transacciones de puntos
- `challenges`: Definición de retos
- `user_challenges`: Seguimiento de retos por usuario
- `contents`: Artículos, anuncios y eventos
- `benefits`: Beneficios y ventajas por nivel
- `silver_club_subscriptions`: Suscripciones premium

### Funciones de Base de Datos
- `add_silver_points()`: Agregar puntos y actualizar nivel automáticamente
- `complete_challenge()`: Completar reto con validación
- `mark_content_completed()`: Marcar contenido como completado
- `toggle_content_favorite()`: Agregar/quitar favoritos
- `get_user_dashboard_stats()`: Obtener estadísticas del usuario

## Flujo de Usuario

1. **Registro**: Email + contraseña
2. **Completar Perfil**: Datos obligatorios (nombre, edad 50+, DNI, ubicación, intereses)
3. **Dashboard**: Ver progreso, puntos, nivel y retos recomendados
4. **Retos**: Explorar y completar retos para ganar puntos
5. **Beneficios**: Desbloquear beneficios según nivel
6. **Silver Club**: Suscripción opcional para beneficios premium

## Datos de Prueba

El sistema incluye datos de ejemplo:
- 6 retos de diferentes categorías
- 6 beneficios para distintos niveles
- 1 reto especial con código: **SILVER2024**

## Próximos Pasos (No Implementados)

### Panel de Administrador
- Gestión completa de usuarios
- CMS para contenidos y retos
- Gestión de beneficios (crear, editar, eliminar)
- Sistema de analíticas y métricas
- Confirmación de pagos offline
- Asignación manual de puntos

### Sistema de Contenidos
- Feed con scroll infinito
- Interacciones (vistas, favoritos, completados)
- Categorías y filtros

### Integraciones
- Aula Silver (cursos)
- Microaula (contenidos cortos)
- Talentos Silver (empleo)
- Bienestar Silver (bienestar)

### Silver Club Completo
- Integración con PayPal
- Sistema de pagos offline con validación
- Períodos de prueba personalizados
- Contenido exclusivo

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas restrictivas por defecto
- Validación de edad en registro
- Autenticación con Supabase Auth
- Roles de usuario (user, moderator, admin)

## Notas Importantes

- La edad mínima para registro es 50 años
- Los puntos y niveles se actualizan automáticamente
- Las funciones de base de datos manejan la lógica de negocio
- El sistema está preparado para integración SSO con otras plataformas SILVERMOON
- El diseño es mobile-first y accesible para personas mayores

## Licencia

Propietario - SILVERMOON
