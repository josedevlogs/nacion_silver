/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_TURNSTILE_SITE_KEY: string;
  /** Solo desarrollo: omitir POST a /api/verify-turnstile (no usar en producción). */
  readonly VITE_TURNSTILE_VERIFY_SKIP: string;
  /** URL del POST de verificación (opcional; por defecto /api/verify-turnstile). */
  readonly VITE_TURNSTILE_VERIFY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
