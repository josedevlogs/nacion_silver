# Revisión: proyecto Supabase remoto vs migraciones

Objetivo: el estado del Postgres remoto (tablas, RLS, funciones) debe coincidir con lo definido en [`supabase/migrations/`](../supabase/migrations/).

## 1. Confirmar entorno

- **URL del proyecto** (desde `.env`): `VITE_SUPABASE_URL` → el *ref* es el subdominio (`https://<ref>.supabase.co`).
- Las claves no deben commitearse; solo verificar que apuntan al proyecto **Nación Silver** deseado.

## 2. Herramientas

- **Supabase CLI** (`npx supabase`): enlazar, diff, push.
- **Dashboard**: Table Editor, Authentication, Database → Policies.
- **MCP** `user-supabase` en Cursor (si está configurado): inspección rápida.

## 3. Inicialización local (ya hecha)

Existe [`supabase/config.toml`](../supabase/config.toml) tras `supabase init`. Permite:

```powershell
cd "ruta\a\nacion_silver"
npx supabase login
npx supabase link --project-ref <TU_PROJECT_REF>
```

Luego:

```powershell
npx supabase db diff
```

o, para capturar drift desde remoto:

```powershell
npx supabase db pull
```

(revisar el SQL generado antes de commitear).

Para **aplicar** migraciones pendientes al remoto:

```powershell
npx supabase db push
```

(Usar en staging primero; en producción seguir el flujo del equipo.)

## 4. Inventario esperado (migraciones actuales)

Orden aplicado (prefijos de fecha):

| Archivo | Contenido principal |
|--------|----------------------|
| `20251130182129_create_core_schema.sql` | Tipos ENUM, tablas `user_profiles`, `passport_levels`, `silver_points_transactions`, `challenges`, `user_challenges`, `contents`, `user_content_interactions`, `benefits`, `silver_club_subscriptions`, `user_activity_log`, RLS base |
| `20251130182237_create_database_functions.sql` | Funciones RPC (`add_silver_points`, `complete_challenge`, `get_user_dashboard_stats`, etc.) |
| `20251130183212_update_benefits_created_by.sql` | Ajustes `benefits` |
| `20251130183231_seed_sample_data.sql` | Datos de ejemplo |
| `20251130184248_fix_user_profiles_rls_policies.sql` | Corrección RLS recursivo en `user_profiles` |
| `20251130184304_fix_all_recursive_rls_policies.sql` | Corrección RLS en más tablas |

### Tablas `public` esperadas

`user_profiles`, `passport_levels`, `silver_points_transactions`, `challenges`, `user_challenges`, `contents`, `user_content_interactions`, `benefits`, `silver_club_subscriptions`, `user_activity_log`.

### Comprobación rápida en SQL (Dashboard → SQL Editor)

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
```

Comparar con la lista anterior. Repetir para **políticas RLS** (`pg_policies`) y **funciones** en `public` si hace falta.

## 5. Criterio de éxito

- `db push` (o migraciones aplicadas manualmente) sin error.
- Flujos de la app (`AuthContext`, retos, beneficios, dashboard RPC) coherentes con RLS.
- Sin tablas duplicadas por migraciones conflictivas (revisar orden y `IF NOT EXISTS`).

## 6. Estado de esta revisión

La alineación **remota ↔ repo** debe ejecutarse con credenciales del proyecto; este documento fija el procedimiento y el inventario. Tras cada `db pull` o cambio en dashboard, actualizar migraciones o documentar la excepción.

## Migración aplicada (MCP, proyecto `nacion_silver`)

- **`20260328033247_security_hardening_functions_and_rls`**: `SET search_path = public` en las funciones RPC públicas; eliminación de políticas INSERT demasiado permisivas en `silver_points_transactions` y `user_activity_log` (inserts solo vía `SECURITY DEFINER`).
- **`20260328033610_contents_public_select_anon`**: lectura pública (`anon`) de filas `contents` con `status = published` y fecha de publicación efectiva (landing / novedades sin sesión).

### Auth: contraseñas filtradas (dashboard, no SQL)

Tras la migración SQL, el advisor de seguridad puede seguir mostrando **Leaked Password Protection Disabled**. Actívalo en [Authentication](https://supabase.com/dashboard/project/_/auth/providers) → **Email** → **Password strength** / protección contra contraseñas filtradas (HaveIBeenPwned), según [documentación](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## CI (GitHub Actions)

En el repo, el workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) ejecuta en push y pull request a `main` / `master`: `npm ci`, `npm run lint`, `npm run typecheck` y `npm run build`. No aplica migraciones al remoto; solo valida el código y el build.
