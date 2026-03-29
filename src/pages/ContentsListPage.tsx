import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { CONTENT_TYPE_LABELS } from '../lib/contentLabels';
import type { Database } from '../lib/database.types';
import { Calendar } from 'lucide-react';

type ContentRow = Database['public']['Tables']['contents']['Row'];

export function ContentsListPage() {
  const [items, setItems] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('status', 'published')
        .or(`published_at.is.null,published_at.lte.${now}`)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('published_at', { ascending: false });

      if (!error && data) setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Novedades</h1>
        <p className="text-lg text-neutral-600 mb-10">
          Artículos, anuncios y eventos de Nación Silver
        </p>

        {loading ? (
          <p className="text-neutral-600">Cargando…</p>
        ) : items.length === 0 ? (
          <Card padding="lg" className="text-center text-neutral-600">
            No hay publicaciones aún. Vuelve pronto.
          </Card>
        ) : (
          <ul className="space-y-6">
            {items.map((item) => (
              <li key={item.id}>
                <Link to={`/novedades/${item.id}`} className="block group">
                  <Card padding="lg" className="border border-neutral-200 group-hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-full sm:w-48 h-40 sm:h-32 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="neutral" size="sm">
                            {CONTENT_TYPE_LABELS[item.content_type]}
                          </Badge>
                          {item.published_at && (
                            <span className="text-xs text-neutral-500 inline-flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(item.published_at).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 group-hover:text-primary-700 mb-2">
                          {item.title}
                        </h2>
                        {item.short_description && (
                          <p className="text-neutral-600 line-clamp-2">{item.short_description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicLayout>
  );
}
