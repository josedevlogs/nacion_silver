# Fase A — Alcance y prioridades (Nación Silver)

Referencia: [nación_silver_roadmap_f4acb891.plan.md](../nación_silver_roadmap_f4acb891.plan.md), [COMMUNITY_PRODUCT_SPEC.md](COMMUNITY_PRODUCT_SPEC.md) y planes en Cursor.

## Estado actual (línea base)

- App miembro: auth Supabase, perfil, dashboard, retos, beneficios, Silver Club, perfil.
- **Landing** en `/`; **Novedades** (`/novedades`, detalle `/novedades/:id`) con lectura pública vía RLS `anon` en `contents`.
- Dashboard enlaza novedades destacadas cuando hay filas publicadas.
- **Comunidad:** feed guiado (`/comunidad`), grupos (`/grupos`), solicitudes Club Silver manual (`club_silver_requests`) + flag `es_club_silver` en perfil; panel admin mínimo en `/admin/club-silver`.
- Branding **Nación Silver** en la UI actual.

## Prioridades propuestas (orden sugerido)

1. **Landing pública + visibilidad sin login (si producto lo requiere)** — **Hecho**  
   - Rutas públicas: `/` (landing), `/novedades`, `/novedades/:id`.  
   - RLS: migración `contents_public_select_anon` — `anon` puede leer `contents` publicados.

2. **Contenidos (`contents`) en la app** — **Hecho (MVP)**  
   - Listado y detalle públicos; bloque en dashboard con enlace a novedades.

3. **Silver Club operativo (manual VE)** — **En curso / Hecho según entorno**  
   - `silver_club_subscriptions` puede coexistir con **`club_silver_requests`** y **`es_club_silver`** en `user_profiles`; ver [COMMUNITY_PRODUCT_SPEC.md](COMMUNITY_PRODUCT_SPEC.md).

4. **Comunidad (feed guiado + grupos)** — **Especificado; implementación por fases**  
   - **Feed** distinto de novedades editoriales; orden v1 y estados vacíos en spec.  
   - **Grupos** con modos de acceso; **foros excluidos.**  
   - Detalle: [COMMUNITY_PRODUCT_SPEC.md](COMMUNITY_PRODUCT_SPEC.md).

## Exclusiones hasta nueva decisión

- Cambiar de **Supabase Auth** como IdP (acordado: no Clerk en diseño vigente).
- **Third-Party Auth** en apps hijas: ver [IDP_THIRD_PARTY_AUTH.md](IDP_THIRD_PARTY_AUTH.md) (Fase B).
- **Foros** como producto (no tablas ni rutas de foros).

## Cómo actualizar este documento

Tras priorizar con el Word o stakeholders, marcar ítems como *en curso* / *hecho* y enlazar PRs o issues.
