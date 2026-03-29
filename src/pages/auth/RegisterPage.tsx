import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { UserPlus } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Este correo ya está registrado');
        } else {
          setError('Error al crear la cuenta. Por favor intenta de nuevo.');
        }
        setLoading(false);
        return;
      }

      navigate('/completar-perfil');
    } catch {
      setError('Error inesperado. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <UserPlus className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Nación Silver</h1>
          <p className="text-lg text-neutral-600">Únete a nuestra comunidad</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Completa el formulario para comenzar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="new-password"
                helperText="Mínimo 6 caracteres"
              />

              <Input
                type="password"
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <Button type="submit" fullWidth loading={loading} size="lg">
                Crear Cuenta
              </Button>

              <div className="text-center pt-4">
                <p className="text-base text-neutral-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                    Inicia sesión
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
