/**
 * Verifica el token de Turnstile contra el endpoint del servidor (Pages Function en producción).
 */

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export function isTurnstileEnabled(): boolean {
  return Boolean(siteKey?.trim());
}

export async function verifyTurnstileToken(token: string): Promise<{ ok: boolean; error?: string }> {
  if (!token.trim()) {
    return { ok: false, error: 'Falta la verificación de seguridad.' };
  }

  if (import.meta.env.DEV && import.meta.env.VITE_TURNSTILE_VERIFY_SKIP === 'true') {
    return { ok: true };
  }

  const endpoint =
    import.meta.env.VITE_TURNSTILE_VERIFY_URL?.trim() || '/api/verify-turnstile';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };

    if (!res.ok) {
      return { ok: false, error: 'No se pudo verificar la seguridad. Intenta de nuevo.' };
    }

    if (!data.success) {
      return { ok: false, error: 'La verificación de seguridad no es válida. Vuelve a intentarlo.' };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        'No hay conexión con el servicio de verificación. Si estás en local, configura el endpoint o VITE_TURNSTILE_VERIFY_SKIP=true.',
    };
  }
}
