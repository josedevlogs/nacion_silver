import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { PassportBadge } from '../components/PassportBadge';
import { Button } from '../components/ui/Button';
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Briefcase,
  Heart,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '../lib/database.types';
import { CONTENT_TYPE_LABELS } from '../lib/contentLabels';

type ChallengeRow = Database['public']['Tables']['challenges']['Row'];
type ContentRow = Database['public']['Tables']['contents']['Row'];

interface DashboardStats {
  challenges_completed: number;
  challenges_available: number;
  level_min_points: number;
  level_max_points: number | null;
}

const EXTERNAL_PLATFORMS = [
  {
    name: 'Aula Silver',
    description: 'Cursos en video para aprender nuevas habilidades',
    icon: BookOpen,
    color: 'bg-blue-500',
    href: '#',
  },
  {
    name: 'Microaula',
    description: 'Contenidos cortos para aprender en minutos',
    icon: Sparkles,
    color: 'bg-purple-500',
    href: '#',
  },
  {
    name: 'Talentos Silver',
    description: 'Oportunidades laborales para personas 50+',
    icon: Briefcase,
    color: 'bg-green-500',
    href: '#',
  },
  {
    name: 'Bienestar Silver',
    description: 'Contenidos de bienestar y autocuidado',
    icon: Heart,
    color: 'bg-pink-500',
    href: '#',
  },
];

export function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeRow[]>([]);
  const [newsItems, setNewsItems] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    try {
      const { data: statsData } = await supabase.rpc('get_user_dashboard_stats', {
        p_user_id: profile.id,
      });

      if (statsData && typeof statsData === 'object' && !Array.isArray(statsData)) {
        setStats(statsData as unknown as DashboardStats);
      }

      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (challengesData) {
        const completedIds = await supabase
          .from('user_challenges')
          .select('challenge_id')
          .eq('user_id', profile.id)
          .eq('status', 'completed');

        const completedSet = new Set(completedIds.data?.map((c) => c.challenge_id) || []);
        const available = challengesData.filter((c) => !completedSet.has(c.id));
        setRecentChallenges(available.slice(0, 3));
      }

      const now = new Date().toISOString();
      const { data: newsData } = await supabase
        .from('contents')
        .select('*')
        .eq('status', 'published')
        .or(`published_at.is.null,published_at.lte.${now}`)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(3);
      if (newsData) setNewsItems(newsData);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const progressPercentage = stats?.level_max_points
    ? ((profile.total_points - stats.level_min_points) / (stats.level_max_points - stats.level_min_points)) * 100
    : 100;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            ¡Hola, {profile.full_name.split(' ')[0]}!
          </h1>
          <p className="text-lg text-neutral-600">Bienvenido de vuelta a Nación Silver</p>
        </div>

        <Card padding="lg" className="bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Comunidad</h2>
              <p className="text-neutral-600 text-sm mt-1">
                Feed guiado y grupos: novedades sin convertirse en red social.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/comunidad">
                <Button variant="secondary" size="sm">
                  Ir al feed
                </Button>
              </Link>
              <Link to="/grupos">
                <Button variant="outline" size="sm">
                  Grupos
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" padding="lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Tu Pasaporte Silver</h2>
                <PassportBadge level={profile.current_level} size="lg" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary-600">{profile.total_points}</div>
                <div className="text-sm text-neutral-600">Puntos Silver</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-neutral-700">
                  {stats?.level_max_points
                    ? `${profile.total_points - stats.level_min_points} / ${stats.level_max_points - stats.level_min_points} puntos`
                    : 'Nivel Máximo Alcanzado'}
                </span>
                {stats?.level_max_points && (
                  <span className="text-neutral-600">
                    {stats.level_max_points - profile.total_points} puntos para siguiente nivel
                  </span>
                )}
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-secondary-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{stats?.challenges_completed || 0}</div>
                <div className="text-sm text-neutral-600">Retos Completados</div>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                {stats?.challenges_available || 0} retos disponibles
              </div>
            </div>
          </Card>
        </div>

        {newsItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">Novedades</h2>
                <p className="text-base text-neutral-600 mt-1">Del ecosistema y la comunidad</p>
              </div>
              <Link to="/novedades">
                <Button variant="outline">Ver todas</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsItems.map((n) => (
                <Card key={n.id} hover padding="lg">
                  <Link to={`/novedades/${n.id}`}>
                    {n.image_url && (
                      <img
                        src={n.image_url}
                        alt=""
                        className="w-full h-36 object-cover rounded-lg mb-3"
                      />
                    )}
                    <span className="text-xs font-semibold text-primary-600">
                      {CONTENT_TYPE_LABELS[n.content_type]}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 mt-1 line-clamp-2">{n.title}</h3>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Retos Recomendados</h2>
              <p className="text-base text-neutral-600 mt-1">Completa retos para ganar puntos Silver</p>
            </div>
            <Link to="/retos">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">Cargando retos...</p>
            </div>
          ) : recentChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentChallenges.map((challenge) => (
                <Card key={challenge.id} hover padding="lg">
                  <Link to={`/retos/${challenge.id}`}>
                    {challenge.image_url && (
                      <img
                        src={challenge.image_url}
                        alt={challenge.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="text-amber-500" size={20} />
                      <span className="text-lg font-bold text-amber-600">{challenge.points_reward} puntos</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{challenge.title}</h3>
                    <p className="text-base text-neutral-600 line-clamp-2">{challenge.description}</p>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg">
              <div className="text-center py-8 max-w-lg mx-auto">
                <Target className="text-neutral-400 mx-auto mb-4" size={48} />
                <p className="text-lg text-neutral-700 mb-2">No hay retos nuevos para ti ahora mismo</p>
                <p className="text-sm text-neutral-600 mb-4">
                  Explora el catálogo completo, las novedades o los beneficios por nivel.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/retos" className="text-primary-600 font-semibold text-sm hover:underline">
                    Ver todos los retos
                  </Link>
                  <span className="text-neutral-300">|</span>
                  <Link to="/novedades" className="text-primary-600 font-semibold text-sm hover:underline">
                    Novedades
                  </Link>
                  <span className="text-neutral-300">|</span>
                  <Link to="/beneficios" className="text-primary-600 font-semibold text-sm hover:underline">
                    Beneficios
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-neutral-900">Plataformas del Ecosistema</h2>
            <p className="text-base text-neutral-600 mt-1">Explora más contenido y oportunidades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXTERNAL_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <Card key={platform.name} hover padding="lg">
                  <a href={platform.href} className="flex items-start gap-4">
                    <div className={`w-14 h-14 ${platform.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-neutral-900">{platform.name}</h3>
                        <ExternalLink size={16} className="text-neutral-400" />
                      </div>
                      <p className="text-base text-neutral-600">{platform.description}</p>
                    </div>
                  </a>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
