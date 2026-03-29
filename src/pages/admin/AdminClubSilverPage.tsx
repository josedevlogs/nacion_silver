import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Database } from '../../lib/database.types';

type RequestRow = Database['public']['Tables']['club_silver_requests']['Row'];

const STATUS_LABEL: Record<RequestRow['status'], string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

export function AdminClubSilverPage() {
  const { profile, refreshProfile } = useAuth();
  const [rows, setRows] = useState<
    (RequestRow & { user_profiles?: { full_name: string } | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [toggleUserId, setToggleUserId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('club_silver_requests')
      .select('*, user_profiles(full_name)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data ?? []) as typeof rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approveRequest = async (r: RequestRow) => {
    if (!profile?.id) return;
    setBusyId(r.id);
    setMsg(null);
    const { error: u1 } = await supabase
      .from('club_silver_requests')
      .update({
        status: 'approved',
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', r.id);
    if (u1) {
      setMsg(u1.message);
      setBusyId(null);
      return;
    }
    const { error: u2 } = await supabase
      .from('user_profiles')
      .update({ es_club_silver: true, updated_at: new Date().toISOString() })
      .eq('id', r.user_id);
    if (u2) setMsg(u2.message);
    else setMsg('Solicitud aprobada y es_club_silver activado.');
    await load();
    await refreshProfile();
    setBusyId(null);
  };

  const rejectRequest = async (r: RequestRow) => {
    if (!profile?.id) return;
    setBusyId(r.id);
    setMsg(null);
    const { error } = await supabase
      .from('club_silver_requests')
      .update({
        status: 'rejected',
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', r.id);
    if (error) setMsg(error.message);
    else setMsg('Solicitud rechazada.');
    await load();
    setBusyId(null);
  };

  const toggleClubSilverByUserId = async (activate: boolean) => {
    const uid = toggleUserId.trim();
    if (!uid) {
      setMsg('Introduce un UUID de usuario.');
      return;
    }
    setBusyId('toggle');
    setMsg(null);
    const { error } = await supabase
      .from('user_profiles')
      .update({ es_club_silver: activate, updated_at: new Date().toISOString() })
      .eq('id', uid);
    if (error) setMsg(error.message);
    else setMsg(activate ? 'es_club_silver activado para el usuario.' : 'es_club_silver desactivado.');
    setBusyId(null);
  };

  const filtered = userSearch.trim()
    ? rows.filter(
        (r) =>
          r.user_id.includes(userSearch) ||
          (r.user_profiles?.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ?? false)
      )
    : rows;

  return (
    <div className="space-y-8 max-w-4xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Club Silver (manual)</h1>
            <p className="text-neutral-600">
              Tras verificar el pago fuera de la app, aprueba la solicitud o activa{' '}
              <code className="text-sm bg-neutral-100 px-1 rounded">es_club_silver</code> en el perfil.
            </p>
          </div>
          <Link to="/admin" className="text-primary-600 font-semibold text-sm hover:underline">
            ← Admin
          </Link>
        </div>

        <Card padding="lg">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Activar / desactivar por ID de usuario</h2>
          <p className="text-sm text-neutral-600 mb-3">
            UUID del usuario (mismo que en Supabase Auth / user_profiles).
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={toggleUserId}
              onChange={(e) => setToggleUserId(e.target.value)}
              placeholder="uuid del usuario"
              className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              loading={busyId === 'toggle'}
              onClick={() => toggleClubSilverByUserId(true)}
            >
              Activar Club
            </Button>
            <Button
              type="button"
              variant="outline"
              loading={busyId === 'toggle'}
              onClick={() => toggleClubSilverByUserId(false)}
            >
              Desactivar
            </Button>
          </div>
        </Card>

        {msg && (
          <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200 text-sm text-neutral-800">
            {msg}
          </div>
        )}

        <div>
          <input
            type="search"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Filtrar por nombre o UUID…"
            className="w-full max-w-md border border-neutral-300 rounded-lg px-3 py-2 text-sm mb-4"
          />
          {loading ? (
            <p className="text-neutral-600">Cargando…</p>
          ) : filtered.length === 0 ? (
            <Card padding="lg">
              <p className="text-neutral-600">No hay solicitudes que coincidan.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <Card key={r.id} padding="lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {r.user_profiles?.full_name ?? 'Usuario'}
                      </p>
                      <p className="text-xs text-neutral-500 font-mono">{r.user_id}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Plan: {r.plan_type} · {new Date(r.created_at).toLocaleString('es-ES')}
                      </p>
                      {r.user_notes && (
                        <p className="text-sm text-neutral-700 mt-2">Notas: {r.user_notes}</p>
                      )}
                      {r.payment_reference && (
                        <p className="text-sm text-neutral-700">Ref. pago: {r.payment_reference}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <Badge variant="neutral" size="sm">
                        {STATUS_LABEL[r.status]}
                      </Badge>
                      {(r.status === 'pending' || r.status === 'in_review') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={busyId === r.id}
                            onClick={() => approveRequest(r)}
                          >
                            Aprobar + Club
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            loading={busyId === r.id}
                            onClick={() => rejectRequest(r)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
