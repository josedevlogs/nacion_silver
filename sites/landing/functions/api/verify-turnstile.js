/**
 * Cloudflare Pages Function: valida el token de Turnstile con la API de Cloudflare.
 * Duplicado bajo sites/landing para despliegues con Root directory = sites/landing.
 * Variable de entorno (Functions): TURNSTILE_SECRET_KEY (secreta, no la del sitio).
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...cors,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}

/**
 * @param {{ request: Request; env: { TURNSTILE_SECRET_KEY?: string } }} context
 */
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const token = body?.token;
    if (!token || typeof token !== 'string') {
      return json({ success: false, error: 'missing_token' }, 400);
    }

    const secret = context.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return json({ success: false, error: 'server_misconfigured' }, 500);
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await verifyRes.json();
    return json({ success: outcome.success === true });
  } catch {
    return json({ success: false, error: 'internal' }, 500);
  }
}
