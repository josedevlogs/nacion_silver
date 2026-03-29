import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { GroupForm } from './GroupForm';
import type { Database } from '../../lib/database.types';

type GroupRow = Database['public']['Tables']['community_groups']['Row'];

export function AdminGroupFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [row, setRow] = useState<GroupRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('community_groups').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) setErr(error?.message ?? 'Grupo no encontrado');
      else setRow(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <AdminPageHeader title="Editar grupo" backTo="/admin/grupos" />
        <p className="text-neutral-600">Cargando…</p>
      </div>
    );
  }

  if (err || !row) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <AdminPageHeader title="Editar grupo" backTo="/admin/grupos" />
        <p className="text-red-600">{err ?? 'Error'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <AdminPageHeader title="Editar grupo" backTo="/admin/grupos" />
      <GroupForm
        mode="edit"
        groupId={row.id}
        initial={row}
        onSuccess={(gid) => navigate(`/admin/grupos`)}
        onCancel={() => navigate('/admin/grupos')}
      />
    </div>
  );
}
