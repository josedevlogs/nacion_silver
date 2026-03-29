import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Award, CheckCircle, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import type { Database } from '../lib/database.types';

type ChallengeRow = Database['public']['Tables']['challenges']['Row'];
type UserChallengeRow = Database['public']['Tables']['user_challenges']['Row'];

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeRow | null>(null);
  const [userChallenge, setUserChallenge] = useState<UserChallengeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [validationCode, setValidationCode] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [id, profile]);

  const loadChallenge = async () => {
    if (!id || !profile) return;

    try {
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (challengeData) {
        setChallenge(challengeData);
      }

      const { data: userChallengeData } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', profile.id)
        .eq('challenge_id', id)
        .maybeSingle();

      if (userChallengeData) {
        setUserChallenge(userChallengeData);
      }
    } catch (error) {
      console.error('Error al cargar reto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!profile || !challenge) return;

    setError('');
    setCompleting(true);

    try {
      const { error: completeError } = await supabase.rpc('complete_challenge', {
        p_user_id: profile.id,
        p_challenge_id: challenge.id,
        p_validation_data: validationCode || undefined,
      });

      if (completeError) {
        if (completeError.message.includes('código')) {
          setError('Código de validación incorrecto');
        } else if (completeError.message.includes('completado')) {
          setError('Este reto ya fue completado');
        } else if (completeError.message.includes('límite')) {
          setError('Este reto alcanzó el límite de completaciones');
        } else {
          setError('Error al completar el reto. Por favor intenta de nuevo.');
        }
        setCompleting(false);
        return;
      }

      await refreshProfile();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/retos');
      }, 3000);
    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-lg text-neutral-600">Cargando reto...</p>
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <Card padding="lg">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Reto no encontrado</h2>
            <Button onClick={() => navigate('/retos')} className="mt-4">
              Volver a Retos
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }

  const isCompleted = userChallenge?.status === 'completed';

  if (showSuccess) {
    return (
      <Layout>
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Trophy className="text-white" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">¡Reto Completado!</h2>
            <p className="text-xl text-neutral-600 mb-4">
              Ganaste <span className="font-bold text-amber-600">{challenge.points_reward} puntos Silver</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-lg text-neutral-600">
              <Sparkles className="text-amber-500" size={24} />
              <span>Redirigiendo...</span>
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/retos')} size="md">
          <ArrowLeft size={20} />
          Volver a Retos
        </Button>

        <Card padding="lg">
          {challenge.image_url && (
            <img
              src={challenge.image_url}
              alt={challenge.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
            />
          )}

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
              <Award className="text-amber-600" size={24} />
              <span className="text-lg font-bold text-amber-700">{challenge.points_reward} puntos Silver</span>
            </div>
            {isCompleted && (
              <Badge variant="success" size="lg">
                <CheckCircle size={18} />
                Completado
              </Badge>
            )}
            {challenge.is_featured && (
              <Badge variant="primary" size="lg">
                Destacado
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 mb-4">{challenge.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            <Badge variant="neutral" size="md">
              {challenge.challenge_type === 'internal' ? 'Reto Interno' : 'Reto Externo'}
            </Badge>
            <Badge variant="neutral" size="md">
              Origen: {challenge.origin}
            </Badge>
            <Badge variant="neutral" size="md">
              Validación: {challenge.validation_method}
            </Badge>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-lg text-neutral-700 leading-relaxed">{challenge.description}</p>
            {challenge.full_description && (
              <div className="mt-4 text-base text-neutral-600">
                {challenge.full_description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {!isCompleted && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Completar Reto</h3>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {challenge.validation_method === 'code' && (
                <div className="mb-4">
                  <Input
                    label="Código de Validación"
                    placeholder="Ingresa el código"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value)}
                    required
                  />
                  <p className="mt-2 text-sm text-neutral-600">
                    Ingresa el código que recibiste para completar este reto
                  </p>
                </div>
              )}

              <Button onClick={handleComplete} loading={completing} size="lg" fullWidth>
                {challenge.validation_method === 'code' ? 'Validar y Completar' : 'Marcar como Completado'}
              </Button>
            </div>
          )}

          {isCompleted && (
            <div className="border-t border-neutral-200 pt-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
                <h3 className="text-2xl font-bold text-green-900 mb-2">¡Reto Completado!</h3>
                <p className="text-base text-green-700">
                  Completaste este reto el{' '}
                  {userChallenge.completed_at
                    ? new Date(userChallenge.completed_at).toLocaleDateString('es-ES')
                    : '—'}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
