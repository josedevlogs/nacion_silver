import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pin, MessageSquare } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { sortFeedPosts } from '../lib/feedSort';

type FeedPostRow = Database['public']['Tables']['feed_posts']['Row'];

const TYPE_LABEL: Record<FeedPostRow['post_type'], string> = {
  announcement: 'Anuncio',
  poll: 'Encuesta',
  visual: 'Visual',
  activation: 'Activación',
};

export function CommunityFeedPage() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<FeedPostRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('status', 'published')
      .or(`published_at.is.null,published_at.lte.${now}`)
      .order('published_at', { ascending: false });

    if (error) {
      console.error(error);
      setPosts([]);
    } else {
      setPosts(sortFeedPosts(data ?? []));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!profile) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Comunidad</h1>
            <p className="text-lg text-neutral-600">Novedades y anuncios del panel guiado</p>
          </div>
          <Link
            to="/grupos"
            className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-2"
          >
            <MessageSquare size={20} />
            Ver grupos
          </Link>
        </div>

        {loading ? (
          <p className="text-neutral-600">Cargando…</p>
        ) : posts.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12 max-w-md mx-auto">
              <p className="text-lg text-neutral-700 mb-2">
                Aquí verás novedades de la comunidad. Vuelve pronto.
              </p>
              <p className="text-sm text-neutral-600 mb-4">
                Mientras tanto puedes explorar retos, novedades editoriales o beneficios.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/retos"
                  className="text-primary-600 font-semibold hover:underline text-sm"
                >
                  Ir a retos
                </Link>
                <span className="text-neutral-300">|</span>
                <Link
                  to="/novedades"
                  className="text-primary-600 font-semibold hover:underline text-sm"
                >
                  Novedades
                </Link>
                <span className="text-neutral-300">|</span>
                <Link
                  to="/beneficios"
                  className="text-primary-600 font-semibold hover:underline text-sm"
                >
                  Beneficios
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.id}>
                <Link to={`/comunidad/${p.id}`}>
                  <Card hover padding="lg">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {p.is_pinned && (
                        <Badge variant="neutral" size="sm" className="inline-flex items-center gap-1">
                          <Pin size={12} /> Fijado
                        </Badge>
                      )}
                      <span className="text-xs font-semibold text-primary-600">
                        {TYPE_LABEL[p.post_type]}
                      </span>
                      {p.published_at && (
                        <span className="text-xs text-neutral-500">
                          {new Date(p.published_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">{p.title}</h2>
                    {p.body && (
                      <p className="text-neutral-600 line-clamp-2">{p.body}</p>
                    )}
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
