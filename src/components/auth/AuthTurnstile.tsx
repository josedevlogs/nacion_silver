import { forwardRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { isTurnstileEnabled } from '../../lib/turnstileVerify';

type Props = {
  onTokenChange: (token: string | null) => void;
};

/**
 * Widget Turnstile (solo se renderiza si existe VITE_TURNSTILE_SITE_KEY).
 * El modo del desafío (p. ej. Managed) se define en el panel de Turnstile; aquí no forzamos `appearance` para no contradecirlo.
 * Usa ref para llamar a reset() tras errores de login/registro.
 */
export const AuthTurnstile = forwardRef<TurnstileInstance | undefined, Props>(
  function AuthTurnstile({ onTokenChange }, ref) {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    if (!isTurnstileEnabled() || !siteKey) {
      return null;
    }

    return (
      <div className="flex justify-center w-full min-h-[68px]">
        <Turnstile
          ref={ref}
          siteKey={siteKey}
          onSuccess={(token) => onTokenChange(token)}
          onExpire={() => onTokenChange(null)}
          onError={() => onTokenChange(null)}
          options={{
            language: 'es',
            theme: 'light',
          }}
        />
      </div>
    );
  }
);
