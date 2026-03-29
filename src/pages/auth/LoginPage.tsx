import { useState, useEffect, useRef, FormEvent } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { AuthTurnstile } from '../../components/auth/AuthTurnstile';
import { isTurnstileEnabled, verifyTurnstileToken } from '../../lib/turnstileVerify';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bannedNotice = searchParams.get('reason') === 'banned';
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!profile) {
      navigate('/completar-perfil', { replace: true });
      return;
    }
    navigate(profile.profile_completed ? '/dashboard' : '/completar-perfil', { replace: true });
  }, [authLoading, user, profile, navigate]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <p className="text-lg text-neutral-600">Cargando…</p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isTurnstileEnabled()) {
        if (!turnstileToken) {
          setError('Completa la verificación de seguridad antes de continuar.');
          setLoading(false);
          return;
        }
        const verify = await verifyTurnstileToken(turnstileToken);
        if (!verify.ok) {
          setError(verify.error ?? 'Verificación de seguridad no válida.');
          turnstileRef.current?.reset();
          setTurnstileToken(null);
          setLoading(false);
          return;
        }
      }

      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        if (signInError.message.includes('Invalid')) {
          setError('Correo o contraseña incorrectos');
        } else {
          setError('Error al iniciar sesión. Por favor intenta de nuevo.');
        }
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        setLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch {
      setError('Error inesperado. Por favor intenta de nuevo.');
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <LogIn className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Nación Silver</h1>
          <p className="text-lg text-neutral-600">Bienvenido de vuelta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {bannedNotice && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900 font-semibold">
                    Tu cuenta ha sido suspendida. Si crees que es un error, contacta al equipo.
                  </p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <Input
                type="email"
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <AuthTurnstile ref={turnstileRef} onTokenChange={setTurnstileToken} />

              <Button type="submit" fullWidth loading={loading} size="lg">
                Iniciar Sesión
              </Button>

              <div className="text-center pt-4">
                <p className="text-base text-neutral-600">
                  ¿No tienes cuenta?{' '}
                  <Link to="/registro" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
