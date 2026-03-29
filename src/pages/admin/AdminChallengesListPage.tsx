import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type Challenge = Database['public']['Tables']['challenges']['Row'];

export function AdminChallengesListPage() {
  const [rows, setRows] = useState<Challenge[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) setErr(error.message);
    else setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const deactivate = async (id: string) => {
    if (!confirm('¿Desactivar este reto? Los usuarios dejarán de verlo como activo.')) return;
    const { error } = await supabase.from('challenges').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setErr(error.message);
    else load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <AdminPageHeader title="Retos">
          <Link to="/admin/retos/nuevo">
            <Button>Nuevo reto</Button>
          </Link>
        </AdminPageHeader>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Card padding="none">
          {loading ? (
            <p className="p-6 text-neutral-600">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-neutral-600">No hay retos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Título</th>
                    <th className="text-left p-3 font-semibold">Activo</th>
                    <th className="text-left p-3 font-semibold">Puntos</th>
                    <th className="text-left p-3 font-semibold">Orden</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="p-3 font-medium text-neutral-900">{c.title}</td>
                      <td className="p-3">{c.is_active ? 'Sí' : 'No'}</td>
                      <td className="p-3">{c.points_reward}</td>
                      <td className="p-3">{c.display_order}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/admin/retos/${c.id}`} className="text-primary-600 font-semibold hover:underline">
                          Editar
                        </Link>
                        {c.is_active && (
                          <button type="button" onClick={() => deactivate(c.id)} className="text-amber-700 font-semibold hover:underline">
                            Desactivar
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
