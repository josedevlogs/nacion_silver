/** Carga el script oficial y expone render/reset del widget (embed HTML / API). */

export type TurnstileAPI = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      theme?: 'light' | 'dark';
    }
  ) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

export function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-turnstile-api]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Turnstile')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.dataset.turnstileApi = 'true';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar Turnstile'));
    document.head.appendChild(s);
  });
}

export async function waitForTurnstileApi(maxMs = 8000): Promise<TurnstileAPI> {
  const start = Date.now();
  for (;;) {
    const t = window.turnstile;
    if (t) return t;
    if (Date.now() - start > maxMs) throw new Error('Turnstile no disponible');
    await new Promise((r) => setTimeout(r, 50));
  }
}
