import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type FeedPost = Database['public']['Tables']['feed_posts']['Row'];

export function AdminFeedPostsListPage() {
  const [rows, setRows] = useState<FeedPost[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.from('feed_posts').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (error) setErr(error.message);
    else setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const archive = async (id: string) => {
    if (!confirm('¿Archivar esta publicación?')) return;
    const { error } = await supabase
      .from('feed_posts')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) setErr(error.message);
    else load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <AdminPageHeader title="Feed comunidad">
          <Link to="/admin/comunidad/nuevo">
            <Button>Nueva publicación</Button>
          </Link>
        </AdminPageHeader>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Card padding="none">
          {loading ? (
            <p className="p-6 text-neutral-600">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-neutral-600">No hay publicaciones.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Título</th>
                    <th className="text-left p-3 font-semibold">Tipo</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="p-3 font-medium text-neutral-900 max-w-xs truncate">{p.title}</td>
                      <td className="p-3">{p.post_type}</td>
                      <td className="p-3">{p.status}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/comunidad/${p.id}`} className="text-primary-600 font-semibold hover:underline" target="_blank" rel="noreferrer">
                          Ver
                        </Link>
                        <Link to={`/admin/comunidad/${p.id}`} className="text-primary-600 font-semibold hover:underline">
                          Editar
                        </Link>
                        {p.status !== 'archived' && (
                          <button type="button" onClick={() => archive(p.id)} className="text-amber-700 font-semibold hover:underline">
                            Archivar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
    </div>
  );
}
