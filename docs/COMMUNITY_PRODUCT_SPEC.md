# Especificación de producto — Comunidad (feed guiado + grupos)

Fuente canónica en Git para complementar el plan de negocio. **Foros excluidos.** No se pretende una red social completa.

## Principio base

**Panel guiado:** el usuario no debe ver pantallas vacías sin orientación. Flujos con copy, CTAs y estados “siguiente paso” definidos en QA.

---

## Feed de comunidad (distinto de Novedades `contents`)

- **Novedades** (`contents`): editorial / marketing, lectura pública donde aplique RLS.
- **Feed de comunidad** (`feed_posts`): publicaciones del panel (anuncios, encuestas, visual, activación a retos).

### Tipos de publicación (MVP)

| Tipo | Contenido |
|------|-----------|
| Anuncio | Título + texto + enlace opcional |
| Encuesta | 1–3 opciones; cierre por tiempo y/o manual (admin) |
| Contenido visual | URL imagen o video |
| Activación | Enlace a reto existente (`challenges`) |

### Interacción

- Reacciones con emoji en el post.
- **Sin comentarios en el feed.**
- Pantalla de **detalle** por publicación.

### Orden v1 (sin algoritmo “inteligente”)

1. Publicaciones **fijadas** (`is_pinned`) primero.
2. Priorizar contenido **reciente** dentro de una ventana de **3–5 días** (constante de producto; p. ej. 5 días).
3. **Fecha descendente** (`published_at`) dentro de cada bloque.

### Estados vacíos (copy)

| Contexto | Mensaje v1 |
|----------|------------|
| Feed sin posts | “Aquí verás novedades de la comunidad. Vuelve pronto.” |
| Sin retos sugeridos (dashboard) | Sugerencia automática: enlaces a **Retos**, **Novedades** o **Beneficios** según contexto |

---

## Grupos

- **Solo admin** crea grupos y define el **modo de acceso**: abierto, cerrado, invitación, condicional (nivel Pasaporte y/o Silver Club).
- **Facilitador** asignado por admin; objetivo del grupo documentado.
- **v1: sin comentarios** en grupos (solo consumo / metadatos).
- Límites de miembros: configurable; techo sistema 1000; guía 30–80.

### Estado vacío (grupo sin actividad reciente)

- Mostrar **“Próxima sesión: …”** usando campos `next_session_at` / `next_session_label` cuando existan.

---

## Club Silver — pago manual (Venezuela)

- Sin procesador ni webhooks en v1.
- Tabla **`club_silver_requests`**: el usuario solicita; estados pendiente / en revisión / aprobada / rechazada; notas y referencia de pago opcional.
- Campo **`es_club_silver`** en **Pasaporte** (`user_profiles`): el **admin** lo activa tras verificar pago fuera de la app (Zelle, pago móvil, etc.).
- Convive con **`silver_club_subscriptions`** (histórico / planes): la app debe tratar **acceso Club** como `es_club_silver` **o** suscripción activa/trial, según reglas de negocio unificadas.

---

## Exclusiones explícitas

- **Foros:** no incluidos en producto ni en esquema.
- Relevancia por ML o scoring avanzado en feed: **post-MVP.**

---

## Despliegue del esquema (Supabase)

La app espera las migraciones aplicadas en el proyecto remoto (columna `es_club_silver`, tablas `feed_*`, `community_*`, `club_silver_requests`, políticas RLS, función `passport_level_rank` para grupos condicionales).

**Opción A — CLI (recomendado)**  
1. Instalar [Supabase CLI](https://supabase.com/docs/guides/cli).  
2. En la raíz del repo: `npm run db:link` (ref del proyecto en el dashboard).  
3. `npm run db:push` para aplicar migraciones pendientes.

**Opción B — SQL manual**  
Ejecutar en el SQL Editor del dashboard, en orden, los archivos de `supabase/migrations/` que aún no estén aplicados (en particular `20260328140000_community_feed_groups_club_silver.sql` y `20260328160000_community_groups_conditional_rls.sql`).

**Entorno local**  
Copiar [`.env.example`](../.env.example) a `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Para base local: `npm run db:start` y `npm run db:reset` (Docker).

### Unificación Club Silver (implementada en código)

- **Acceso a beneficios / lógica de miembro:** `es_club_silver` en `user_profiles` **o** suscripción `silver_club_subscriptions` en estado `active` / `trial`.  
- **Solicitudes manuales:** filas en `club_silver_requests`; el admin aprueba y activa `es_club_silver` desde `/admin/club-silver`. La tabla `silver_club_subscriptions` puede seguir usándose para histórico u otros flujos.
