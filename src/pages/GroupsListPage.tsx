import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Users } from 'lucide-react';
import type { Database } from '../lib/database.types';

type GroupRow = Database['public']['Tables']['community_groups']['Row'];

const ACCESS_LABEL: Record<GroupRow['access_mode'], string> = {
  open: 'Abierto',
  closed: 'Cerrado',
  invitation: 'Por invitación',
  conditional: 'Condicional',
};

export function GroupsListPage() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    // Una sola lectura: RLS devuelve abiertos listados, miembros, condicionales si el usuario cumple requisitos, etc.
    const { data, error } = await supabase
      .from('community_groups')
      .select('*')
      .eq('is_listed', true)
      .order('name');
    if (error) console.error(error);
    setGroups(data ?? []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => [...groups].sort((a, b) => a.name.localeCompare(b.name)), [groups]);

  if (!profile) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Grupos</h1>
            <p className="text-lg text-neutral-600">Espacios guiados por la comunidad</p>
          </div>
          <Link to="/comunidad" className="text-primary-600 font-semibold hover:underline">
            Ir al feed
          </Link>
        </div>

        {loading ? (
          <p className="text-neutral-600">Cargando…</p>
        ) : sorted.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-12 max-w-lg mx-auto">
              <Users className="mx-auto text-neutral-300 mb-4" size={48} />
              <p className="text-lg text-neutral-700 mb-2">
                Aún no hay grupos listados para tu perfil.
              </p>
              <p className="text-sm text-neutral-600 mb-4">
                Cuando el equipo publique grupos (abiertos, condicionales a tu nivel o te invite a uno),
                aparecerán aquí.
              </p>
              <Link to="/dashboard" className="text-primary-600 font-semibold text-sm hover:underline">
                Volver al inicio
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sorted.map((g) => (
              <Link key={g.id} to={`/grupos/${g.id}`}>
                <Card hover padding="lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-xl font-bold text-neutral-900">{g.name}</h2>
                    <Badge variant="neutral" size="sm">
                      {ACCESS_LABEL[g.access_mode]}
                    </Badge>
                  </div>
                  {g.objective && (
                    <p className="text-neutral-600 text-sm line-clamp-3 mb-0">{g.objective}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
