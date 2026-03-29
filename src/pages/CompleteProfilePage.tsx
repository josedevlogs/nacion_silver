import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { User, CheckCircle, LogOut } from 'lucide-react';

const INTERESTS_OPTIONS = [
  'Empleo',
  'Emprendimiento',
  'Bienestar',
  'Tecnología',
  'Arte',
  'Cultura',
  'Deportes',
  'Viajes',
  'Educación',
  'Salud',
];

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, refreshProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    dni: '',
    nationality: '',
    country: '',
    city: '',
    interests: [] as string[],
  });

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('No se encontró el usuario');
      return;
    }

    const age = parseInt(formData.age);
    if (age < 50) {
      setError('Debes tener al menos 50 años para unirte a Nación Silver');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Por favor selecciona al menos un interés');
      return;
    }

    setLoading(true);

    try {
      console.log('Intentando crear perfil para usuario:', user.id);

      const { data: insertData, error: insertError } = await supabase.from('user_profiles').insert({
        id: user.id,
        full_name: formData.full_name,
        age: age,
        dni: formData.dni,
        nationality: formData.nationality,
        country: formData.country,
        city: formData.city,
        interests: formData.interests,
        profile_completed: true,
      }).select();

      if (insertError) {
        console.error('Error al crear perfil:', insertError);
        setError(`Error al guardar el perfil: ${insertError.message}`);
        setLoading(false);
        return;
      }

      console.log('Perfil creado exitosamente:', insertData);

      // Otorgar puntos por completar perfil
      const { data: pointsData, error: pointsError } = await supabase.rpc('add_silver_points', {
        p_user_id: user.id,
        p_points: 50,
        p_source: 'profile',
        p_reason: 'Completó su perfil',
        p_transaction_type: 'earned',
      });

      if (pointsError) {
        console.error('Error al otorgar puntos:', pointsError);
      } else {
        console.log('Puntos otorgados:', pointsData);
      }

      // Refrescar el perfil en el contexto
      console.log('Refrescando perfil...');
      const updatedProfile = await refreshProfile();

      console.log('Perfil actualizado:', updatedProfile);

      if (updatedProfile && updatedProfile.profile_completed) {
        console.log('Perfil completado correctamente, navegando al dashboard...');
        navigate('/dashboard', { replace: true });
      } else {
        console.error('El perfil no se actualizó correctamente');
        setError('Error al actualizar el perfil. Por favor recarga la página.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Error completo:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" onClick={handleLogout} size="sm">
            <LogOut size={18} />
            Cerrar Sesión
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-600 rounded-full mb-4">
            <User className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">¡Bienvenido a Nación Silver!</h1>
          <p className="text-lg text-neutral-600">Completa tu perfil para comenzar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Estos datos nos ayudarán a personalizar tu experiencia</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre Completo"
                  placeholder="Juan Pérez"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />

                <Input
                  type="number"
                  label="Edad"
                  placeholder="50"
                  min="18"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  helperText="Debes tener 50+ años"
                />
              </div>

              <Input
                label="Documento de Identidad (DNI/Cédula)"
                placeholder="12345678"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nacionalidad"
                  placeholder="Venezolano/a"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  required
                />

                <Input
                  label="País"
                  placeholder="Venezuela"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Ciudad"
                placeholder="Caracas"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />

              <div>
                <label className="block text-base font-semibold text-neutral-700 mb-3">
                  Intereses <span className="text-error-500">*</span>
                </label>
                <p className="text-sm text-neutral-600 mb-3">Selecciona todos los que apliquen</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERESTS_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`
                        p-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200
                        ${
                          formData.interests.includes(interest)
                            ? 'bg-primary-100 border-primary-500 text-primary-700'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.interests.includes(interest) && <CheckCircle size={16} />}
                        {interest}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Completar Perfil y Comenzar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
