import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { CONTENT_TYPE_LABELS } from '../lib/contentLabels';
import type { Database } from '../lib/database.types';
import { ArrowLeft, Calendar } from 'lucide-react';

type ContentRow = Database['public']['Tables']['contents']['Row'];

export function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ContentRow | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setItem(null);
      return;
    }
    const load = async () => {
      const { data, error } = await supabase.from('contents').select('*').eq('id', id).maybeSingle();

      if (error || !data) setItem(null);
      else setItem(data);
    };
    load();
  }, [id]);

  if (item === undefined) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-neutral-600">Cargando…</div>
      </PublicLayout>
    );
  }

  if (item === null) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-neutral-700 mb-6">No encontramos esta publicación o ya no está disponible.</p>
          <Link to="/novedades" className="text-primary-600 font-semibold hover:underline">
            Volver a novedades
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to="/novedades"
          className="inline-flex items-center gap-2 text-primary-600 font-semibold mb-8 hover:underline"
        >
          <ArrowLeft size={18} />
          Novedades
        </Link>

        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            className="w-full max-h-80 object-cover rounded-xl mb-8"
          />
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="neutral" size="sm">
            {CONTENT_TYPE_LABELS[item.content_type]}
          </Badge>
          {item.published_at && (
            <span className="text-sm text-neutral-500 inline-flex items-center gap-1">
              <Calendar size={16} />
              {new Date(item.published_at).toLocaleDateString('es-ES', {
                dateStyle: 'long',
              })}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">{item.title}</h1>

        {item.short_description && (
          <p className="text-xl text-neutral-600 mb-8 border-l-4 border-primary-500 pl-4">
            {item.short_description}
          </p>
        )}

        <div className="prose prose-neutral max-w-none">
          <div className="whitespace-pre-wrap text-neutral-800 leading-relaxed">{item.full_content}</div>
        </div>
      </article>
    </PublicLayout>
  );
}
