import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Award, CheckCircle, Clock, Target } from 'lucide-react';
import type { Database } from '../lib/database.types';

type ChallengeRow = Database['public']['Tables']['challenges']['Row'];

type ChallengeWithStatus = ChallengeRow & {
  completed: boolean;
};

export function ChallengesPage() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithStatus[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [profile, filter]);

  const loadChallenges = async () => {
    if (!profile) return;

    try {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (!challengesData) {
        setLoading(false);
        return;
      }

      const { data: completedData } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', profile.id)
        .eq('status', 'completed');

      const completedSet = new Set(completedData?.map((c) => c.challenge_id) || []);

      const challengesWithStatus = challengesData.map((challenge) => ({
        ...challenge,
        completed: completedSet.has(challenge.id),
      }));

      let filtered = challengesWithStatus;
      if (filter === 'pending') {
        filtered = challengesWithStatus.filter((c) => !c.completed);
      } else if (filter === 'completed') {
        filtered = challengesWithStatus.filter((c) => c.completed);
      }

      setChallenges(filtered);
    } catch (error) {
      console.error('Error al cargar retos:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: challenges.length,
    completed: challenges.filter((c) => c.completed).length,
    pending: challenges.filter((c) => !c.completed).length,
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Retos</h1>
          <p className="text-lg text-neutral-600">Completa retos para ganar puntos Silver y subir de nivel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Target className="text-primary-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                <div className="text-sm text-neutral-600">Total de Retos</div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.completed}</div>
                <div className="text-sm text-neutral-600">Completados</div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats.pending}</div>
                <div className="text-sm text-neutral-600">Pendientes</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
            size="md"
          >
            Todos
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
            size="md"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
            size="md"
          >
            Completados
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-600">Cargando retos...</p>
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} hover padding="lg">
                <Link to={`/retos/${challenge.id}`}>
                  {challenge.image_url && (
                    <img
                      src={challenge.image_url}
                      alt={challenge.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full">
                      <Award className="text-amber-600" size={18} />
                      <span className="text-sm font-bold text-amber-700">{challenge.points_reward} puntos</span>
                    </div>
                    {challenge.completed && (
                      <Badge variant="success" size="sm">
                        <CheckCircle size={14} />
                        Completado
                      </Badge>
                    )}
                    {challenge.is_featured && (
                      <Badge variant="primary" size="sm">
                        Destacado
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{challenge.title}</h3>
                  <p className="text-base text-neutral-600 line-clamp-3 mb-4">{challenge.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="neutral" size="sm">
                      {challenge.challenge_type === 'internal' ? 'Interno' : 'Externo'}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {challenge.origin}
                    </Badge>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <div className="text-center py-12">
              <Target className="text-neutral-400 mx-auto mb-4" size={64} />
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">No hay retos disponibles</h3>
              <p className="text-base text-neutral-600">
                {filter === 'completed'
                  ? 'Aún no has completado ningún reto'
                  : 'No hay retos disponibles en este momento'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
