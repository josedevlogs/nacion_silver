import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Calendar, Users } from 'lucide-react';
import type { Database } from '../lib/database.types';

type GroupRow = Database['public']['Tables']['community_groups']['Row'];

const ACCESS_LABEL: Record<GroupRow['access_mode'], string> = {
  open: 'Abierto',
  closed: 'Cerrado',
  invitation: 'Por invitación',
  conditional: 'Condicional',
};

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [group, setGroup] = useState<GroupRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !profile?.id) return;
    const { data: g } = await supabase.from('community_groups').select('*').eq('id', id).maybeSingle();
    setGroup(g ?? null);

    const { data: mem } = await supabase
      .from('community_group_members')
      .select('id')
      .eq('group_id', id)
      .eq('user_id', profile.id)
      .maybeSingle();
    setIsMember(!!mem);

    const { count } = await supabase
      .from('community_group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', id);
    setMemberCount(count ?? 0);
    setLoading(false);
  }, [id, profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async () => {
    if (!profile?.id || !id || !group || group.access_mode !== 'open') return;
    setJoining(true);
    setJoinMsg(null);
    const { error } = await supabase.from('community_group_members').insert({
      group_id: id,
      user_id: profile.id,
    });
    if (error) {
      setJoinMsg('No se pudo unir al grupo. Puede estar lleno o no disponible.');
    } else {
      setJoinMsg('Te has unido al grupo.');
      load();
    }
    setJoining(false);
  };

  if (!profile) return null;

  if (loading) {
    return (
      <Layout>
        <p className="text-neutral-600">Cargando…</p>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <p className="text-neutral-600">Grupo no encontrado o sin acceso.</p>
        <Link to="/grupos" className="text-primary-600 font-semibold mt-4 inline-block">
          Volver a grupos
        </Link>
      </Layout>
    );
  }

  const sessionLabel =
    group.next_session_label ||
    (group.next_session_at
      ? `Próxima sesión: ${new Date(group.next_session_at).toLocaleString('es-ES')}`
      : null);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/grupos" className="text-primary-600 font-semibold text-sm hover:underline">
          ← Grupos
        </Link>

        <Card padding="lg">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="neutral" size="sm">{ACCESS_LABEL[group.access_mode]}</Badge>
            <span className="text-sm text-neutral-600 inline-flex items-center gap-1">
              <Users size={16} />
              {memberCount} / {group.max_members} miembros
            </span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">{group.name}</h1>
          {group.description && <p className="text-neutral-700 mb-4">{group.description}</p>}
          {group.objective && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-neutral-800 mb-1">Objetivo</p>
              <p className="text-neutral-600">{group.objective}</p>
            </div>
          )}
          {group.facilitator_display_name && (
            <p className="text-sm text-neutral-600 mb-4">
              Facilitador:{' '}
              <span className="font-semibold text-neutral-800">{group.facilitator_display_name}</span>
            </p>
          )}

          {sessionLabel && (
            <div className="flex items-start gap-2 p-4 bg-primary-50 rounded-lg border border-primary-100 mb-6">
              <Calendar className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-primary-900 font-medium">{sessionLabel}</p>
            </div>
          )}

          {!sessionLabel && memberCount === 0 && (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-6">
              <p className="text-neutral-700">
                Próxima sesión: por definir. Vuelve pronto o contacta al facilitador cuando esté asignado.
              </p>
            </div>
          )}

          {group.access_mode === 'open' && !isMember && (
            <Button
              size="lg"
              loading={joining}
              onClick={handleJoin}
              disabled={memberCount >= group.max_members}
            >
              {memberCount >= group.max_members ? 'Grupo completo' : 'Unirme al grupo'}
            </Button>
          )}
          {isMember && (
            <p className="text-green-700 font-semibold">Ya eres miembro de este grupo.</p>
          )}
          {group.access_mode === 'conditional' && !isMember && (
            <p className="text-neutral-600">
              Este grupo es condicional: cumples los requisitos visibles, pero el alta la coordina el equipo o
              una invitación.
            </p>
          )}
          {(group.access_mode === 'closed' || group.access_mode === 'invitation') && !isMember && (
            <p className="text-neutral-600">
              Este grupo no es abierto. Si te invitan, podrás acceder como miembro.
            </p>
          )}
          {joinMsg && <p className="text-sm text-neutral-700 mt-4">{joinMsg}</p>}
        </Card>
      </div>
    </Layout>
  );
}
