import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type GroupRow = Database['public']['Tables']['community_groups']['Row'];

export function AdminGroupsListPage() {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.from('community_groups').select('*').order('name');
    setLoading(false);
    if (error) setErr(error.message);
    else setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <AdminPageHeader title="Grupos">
          <Link to="/admin/grupos/nuevo">
            <Button>Nuevo grupo</Button>
          </Link>
        </AdminPageHeader>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Card padding="none">
          {loading ? (
            <p className="p-6 text-neutral-600">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-neutral-600">No hay grupos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nombre</th>
                    <th className="text-left p-3 font-semibold">Acceso</th>
                    <th className="text-left p-3 font-semibold">Listado</th>
                    <th className="text-left p-3 font-semibold">Máx.</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g) => (
                    <tr key={g.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="p-3 font-medium text-neutral-900">{g.name}</td>
                      <td className="p-3">{g.access_mode}</td>
                      <td className="p-3">{g.is_listed ? 'Sí' : 'No'}</td>
                      <td className="p-3">{g.max_members}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/grupos/${g.id}`} className="text-primary-600 font-semibold hover:underline" target="_blank" rel="noreferrer">
                          Ver
                        </Link>
                        <Link to={`/admin/grupos/${g.id}`} className="text-primary-600 font-semibold hover:underline">
                          Editar
                        </Link>
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
