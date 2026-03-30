/**
 * Verificación del token Turnstile contra Pages Function (misma ruta que la app).
 */

export function isTurnstileConfigured(): boolean {
  return Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim());
}

export async function verifyTurnstileToken(token: string): Promise<{ ok: boolean; error?: string }> {
  if (!token.trim()) {
    return { ok: false, error: 'Completa la verificación de seguridad antes de enviar.' };
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
        'No hay conexión con el servicio de verificación. En local, prueba VITE_TURNSTILE_VERIFY_SKIP=true o despliega la Pages Function.',
    };
  }
}
