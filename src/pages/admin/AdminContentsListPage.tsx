import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type ContentRow = Database['public']['Tables']['contents']['Row'];
type ContentStatus = Database['public']['Tables']['contents']['Row']['status'];

const FILTERS: { key: ContentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'draft', label: 'Borrador' },
  { key: 'published', label: 'Publicados' },
  { key: 'archived', label: 'Archivados' },
];

export function AdminContentsListPage() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    let q = supabase.from('contents').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data, error } = await q;
    setLoading(false);
    if (error) setErr(error.message);
    else setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const setArchived = async (id: string) => {
    if (!confirm('¿Archivar esta novedad?')) return;
    const { error } = await supabase
      .from('contents')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) setErr(error.message);
    else load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <AdminPageHeader title="Novedades (contents)">
          <Link to="/admin/novedades/nuevo">
            <Button>Nueva novedad</Button>
          </Link>
        </AdminPageHeader>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                filter === f.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Card padding="none">
          {loading ? (
            <p className="p-6 text-neutral-600">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-neutral-600">No hay contenidos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Título</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                    <th className="text-left p-3 font-semibold">Tipo</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="p-3 font-medium text-neutral-900">{c.title}</td>
                      <td className="p-3">{c.status}</td>
                      <td className="p-3">{c.content_type}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/admin/novedades/${c.id}`} className="text-primary-600 font-semibold hover:underline">
                          Editar
                        </Link>
                        {c.status !== 'archived' && (
                          <button type="button" onClick={() => setArchived(c.id)} className="text-amber-700 font-semibold hover:underline">
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
