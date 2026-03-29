# Nación Silver

Hub digital para la comunidad SILVERMOON (personas mayores de 50 años): perfil, retos, beneficios, comunidad, panel de administración y Supabase como backend.

**Repositorio:** [github.com/josedevlogs/nacion_silver](https://github.com/josedevlogs/nacion_silver)

---

## Stack

| Área | Tecnología |
|------|------------|
| Frontend | React 18, TypeScript, Vite 8 |
| Estilos | Tailwind CSS |
| Rutas | React Router v7 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Iconos | Lucide React |

---

## Requisitos

- **Node.js** 20 o superior (recomendado; CI usa 20).
- **npm** 9+ (incluido con Node).
- Cuenta y proyecto en **Supabase** vinculado a este esquema (migraciones en `supabase/migrations/`).

---

## Puesta en marcha (local)

```bash
# Clonar (ajusta la URL si usas fork u otra organización)
git clone https://github.com/josedevlogs/nacion_silver.git
cd nacion_silver

# Dependencias
npm install

# Variables de entorno (obligatorio)
copy .env.example .env   # Windows PowerShell/CMD: copy; macOS/Linux: cp
# Edita .env y pega URL y anon key del proyecto Supabase (Settings → API)

# Desarrollo — http://localhost:5173 (puerto por defecto de Vite)
npm run dev
```

Si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, la app falla al iniciar (ver `src/lib/supabase.ts`).

### Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción → carpeta `dist/` |
| `npm run preview` | Previsualizar el build local |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir archivos |
| `npm run db:link` | Enlazar CLI Supabase al proyecto remoto |
| `npm run db:push` | Aplicar migraciones al remoto (requiere Supabase CLI y enlace) |
| `npm run db:start` | Supabase local (Docker) |

---

## Variables de entorno

Defínelas en un archivo **`.env`** en la raíz (no lo subas a git; ya está en `.gitignore`).

| Variable | Dónde obtenerla | Uso |
|----------|-----------------|-----|
| `VITE_SUPABASE_URL` | Supabase → **Project Settings → API → Project URL** | URL del proyecto |
| `VITE_SUPABASE_ANON_KEY` | Supabase → **Project Settings → API → anon public** | Clave pública del cliente (segura con RLS) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile → tu widget → **Site Key** | Protege login/registro (opcional en local si se deja vacío) |
| `VITE_TURNSTILE_VERIFY_SKIP` | Solo desarrollo: `true` | Omite la llamada al endpoint de verificación si pruebas con site key en local sin Pages Functions |
| `VITE_TURNSTILE_VERIFY_URL` | Opcional | URL absoluta del `POST` de verificación si no usas el path por defecto |

**No** uses la *service role* en el frontend. Cualquier variable expuesta al bundle debe llevar prefijo `VITE_` en Vite.

Plantilla: copia `.env.example` a `.env` y rellena los valores.

---

## Base de datos (Supabase)

- Esquema y políticas RLS viven en **`supabase/migrations/`** (orden cronológico por nombre de archivo).
- Para alinear un entorno remoto: Supabase Dashboard (**SQL** o migraciones**) o** Supabase CLI (`npm run db:link` / `npm run db:push`) según tu flujo.
- Datos de ejemplo opcionales: ver migraciones `seed` si aplican a tu entorno.

---

## Alojamiento y despliegue

### Frontend (producción)

El sitio está pensado para alojarse como **sitio estático** tras `npm run build`.

**Cloudflare Pages** (configuración recomendada y probada):

| Ajuste | Valor |
|--------|--------|
| **Build command** | `npm run build` (no uses solo `vite build`: Vite no está global en el runner) |
| **Build output directory** | `dist` (sin espacios ni barras extra) |
| **Root directory** | `/` (raíz del repo) |
| **Framework preset** | None o Vite, siempre que el comando sea `npm run build` |

**Variables de entorno en Cloudflare** (Production / Preview según necesites):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TURNSTILE_SITE_KEY` — misma **Site Key** pública del widget Turnstile.

**Turnstile (verificación en servidor):** el repo incluye una **Pages Function** en `functions/api/verify-turnstile.js` que llama a la API `siteverify` de Cloudflare. Añade una variable **secreta** para Functions (no es `VITE_*`; no va en el bundle del front):

- `TURNSTILE_SECRET_KEY` — **Secret Key** del mismo sitio Turnstile (Turnstile → tu widget → Secret Key). Configúrala en Pages → **Settings** → **Environment variables** en el apartado correspondiente a **Functions** (o variables cifradas disponibles para el build de Functions, según la UI actual).

Sin `TURNSTILE_SECRET_KEY` en el entorno de Functions, el endpoint devolverá error y el login/registro no pasarán la verificación.

En el panel de Turnstile, añade en **Hostnames** tu dominio de producción y, si pruebas en local, `localhost` (y el origen que uses, p. ej. `127.0.0.1`).

**Rutas SPA (React Router):** en el repo hay `public/_redirects` con regla `/* → /index.html` (200) para que las recargas en rutas profundas funcionen en Pages.

### Repositorio Git

Ramas habituales (misma base, flujo por equipo):

- `main` — integración / producción en Pages si esa es la rama de producción.
- `qa`, `dev`, `nsfront`, `nsback` — entornos o líneas de trabajo; ajusta en Cloudflare qué rama dispara cada deploy.

### CI (GitHub Actions)

En **`.github/workflows/ci.yml`**: en cada push/PR a `main` se ejecutan `npm ci`, lint, typecheck y `npm run build`.

---

## Estructura relevante del proyecto

```
src/                 # App React (páginas, componentes, contexts)
src/lib/supabase.ts  # Cliente Supabase + env VITE_*
src/lib/turnstileVerify.ts  # POST del token Turnstile al endpoint
functions/api/verify-turnstile.js  # Pages Function: siteverify con TURNSTILE_SECRET_KEY
public/_redirects    # SPA fallback (Cloudflare / estáticos)
supabase/migrations/ # SQL versionado
.env.example         # Plantilla de variables (sin secretos)
```

---

## Características (resumen)

- Registro e inicio de sesión (Supabase Auth), perfil y dashboard.
- Retos, beneficios, contenidos, comunidad (feed, grupos), Club Silver.
- Panel de administración (rutas `/admin/...`) para contenidos, retos, usuarios, etc.
- RLS en Supabase; rol `admin` y políticas que usan `is_admin()` donde aplica.

---

## Licencia

Propietario — SILVERMOON.
