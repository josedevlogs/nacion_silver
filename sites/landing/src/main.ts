import './style.css';
import { createClient } from '@supabase/supabase-js';
import { isTurnstileConfigured, verifyTurnstileToken } from './turnstileVerify';
import { loadTurnstileScript, waitForTurnstileApi } from './turnstileWidget';

document.documentElement.classList.add('js');

const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* Navegación móvil */
const navToggle = document.getElementById('nav-toggle');
const navPanel = document.getElementById('nav-panel');
const navOpen = document.querySelector('.nav-open');
const navClose = document.querySelector('.nav-close');

function setNavOpen(open: boolean) {
  if (!navPanel || !navToggle) return;
  navPanel.classList.toggle('hidden', !open);
  navPanel.classList.toggle('flex', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navOpen?.classList.toggle('hidden', open);
  navClose?.classList.toggle('hidden', !open);
}

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  setNavOpen(!open);
});

navPanel?.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 767px)').matches) setNavOpen(false);
  });
});

/* Revelado al scroll (una vez por sección) */
const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const revealEls = document.querySelectorAll<HTMLElement>('.reveal-once');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.reveal-once').forEach((el) => el.classList.add('is-visible'));
}

/* Waitlist (Supabase + Turnstile antes de insertar) */
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

const form = document.getElementById('waitlist-form') as HTMLFormElement | null;
const successEl = document.getElementById('waitlist-success');
const errorEl = document.getElementById('waitlist-error');
const configMissing = document.getElementById('waitlist-config-missing');
const turnstileConfigMissing = document.getElementById('waitlist-turnstile-missing');
const submitBtn = document.getElementById('waitlist-submit') as HTMLButtonElement | null;
const turnstileContainer = document.getElementById('turnstile-container');
const turnstileLoadError = document.getElementById('turnstile-load-error');

function showError(message: string) {
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  errorEl.focus();
}

function hideError() {
  errorEl?.classList.add('hidden');
}

let turnstileWidgetId: string | null = null;
let turnstileToken: string | null = null;

function resetTurnstileWidget() {
  turnstileToken = null;
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId);
  }
}

if (!url || !anon) {
  form?.classList.add('hidden');
  configMissing?.classList.remove('hidden');
} else if (!isTurnstileConfigured()) {
  form?.classList.add('hidden');
  turnstileConfigMissing?.classList.remove('hidden');
} else {
  const supabase = createClient(url, anon);

  void (async () => {
    try {
      await loadTurnstileScript();
      const api = await waitForTurnstileApi();
      if (!turnstileContainer || !turnstileSiteKey) return;

      turnstileWidgetId = api.render(turnstileContainer, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token) => {
          turnstileToken = token;
        },
        'expired-callback': () => {
          turnstileToken = null;
        },
        'error-callback': () => {
          turnstileToken = null;
        },
      });
      turnstileContainer.classList.remove('border-dashed', 'border-neutral-200', 'bg-neutral-50/80');
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'No se pudo cargar la verificación de seguridad.';
      if (turnstileLoadError) {
        turnstileLoadError.textContent = msg;
        turnstileLoadError.classList.remove('hidden');
      }
      submitBtn?.setAttribute('disabled', 'true');
    }
  })();

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const nameInput = document.getElementById('full_name') as HTMLInputElement | null;
    const email = emailInput?.value?.trim() ?? '';
    const fullName = nameInput?.value?.trim() || null;

    if (!email) {
      showError('Por favor escribe tu correo electrónico.');
      return;
    }

    if (!turnstileToken?.trim()) {
      showError('Completa la verificación de seguridad (casilla de Cloudflare) antes de enviar.');
      return;
    }

    submitBtn?.setAttribute('disabled', 'true');

    const verified = await verifyTurnstileToken(turnstileToken);
    if (!verified.ok) {
      showError(verified.error ?? 'Verificación de seguridad no válida.');
      resetTurnstileWidget();
      submitBtn?.removeAttribute('disabled');
      return;
    }

    const row: { email: string; source: string; full_name?: string | null } = {
      email,
      source: 'landing',
    };
    if (fullName) row.full_name = fullName;

    const { error } = await supabase.from('waitlist_signups').insert(row);

    submitBtn?.removeAttribute('disabled');

    if (error) {
      const dup =
        error.code === '23505' ||
        /duplicate key|unique constraint/i.test(error.message ?? '');
      if (dup) {
        showError('Este correo ya está en la lista de espera. Gracias por tu interés.');
      } else {
        showError(
          'No pudimos guardar tu correo en este momento. Comprueba tu conexión e inténtalo de nuevo en unos minutos.'
        );
      }
      resetTurnstileWidget();
      return;
    }

    form?.classList.add('hidden');
    successEl?.classList.remove('hidden');
    successEl?.focus();
  });
}
