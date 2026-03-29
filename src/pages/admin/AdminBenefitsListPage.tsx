import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type Benefit = Database['public']['Tables']['benefits']['Row'];

export function AdminBenefitsListPage() {
  const [rows, setRows] = useState<Benefit[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('benefits')
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
    if (!confirm('¿Desactivar este beneficio? Dejará de mostrarse a los miembros.')) return;
    const { error } = await supabase.from('benefits').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setErr(error.message);
    else load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <AdminPageHeader title="Beneficios">
          <Link to="/admin/beneficios/nuevo">
            <Button>Nuevo beneficio</Button>
          </Link>
        </AdminPageHeader>
        <p className="text-sm text-neutral-600 max-w-2xl">
          Alta y edición de beneficios del Pasaporte (requisitos de nivel, Club Silver, canje, vigencia). Lo que marques aquí se refleja en la página pública de beneficios cuando el registro está activo.
        </p>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Card padding="none">
          {loading ? (
            <p className="p-6 text-neutral-600">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-neutral-600">No hay beneficios.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Título</th>
                    <th className="text-left p-3 font-semibold">Activo</th>
                    <th className="text-left p-3 font-semibold">Nivel req.</th>
                    <th className="text-left p-3 font-semibold">Club</th>
                    <th className="text-left p-3 font-semibold">Orden</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="p-3 font-medium text-neutral-900">{b.title}</td>
                      <td className="p-3">{b.is_active ? 'Sí' : 'No'}</td>
                      <td className="p-3">{b.required_level}</td>
                      <td className="p-3">{b.requires_silver_club ? 'Sí' : 'No'}</td>
                      <td className="p-3">{b.display_order}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/beneficios`} className="text-primary-600 font-semibold hover:underline" target="_blank" rel="noreferrer">
                          Ver público
                        </Link>
                        <Link to={`/admin/beneficios/${b.id}`} className="text-primary-600 font-semibold hover:underline">
                          Editar
                        </Link>
                        {b.is_active && (
                          <button type="button" onClick={() => deactivate(b.id)} className="text-amber-700 font-semibold hover:underline">
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
