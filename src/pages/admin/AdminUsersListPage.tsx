import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Database['public']['Tables']['user_profiles']['Row']['role'];
type PassportLevel = Database['public']['Tables']['user_profiles']['Row']['current_level'];

const PAGE_SIZE = 20;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LEVELS: PassportLevel[] = ['silver', 'residente_silver', 'ciudadano_silver', 'embajador_silver'];

export function AdminUsersListPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<PassportLevel | 'all'>('all');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const safe = qDebounced.replace(/%/g, '');
    const pat = `%${safe}%`;

    let query = supabase.from('user_profiles').select('*', { count: 'exact' });

    if (safe.length >= 2) {
      if (UUID_RE.test(safe)) {
        query = query.eq('id', safe);
      } else {
        query = query.or(`full_name.ilike.${pat},dni.ilike.${pat},email.ilike.${pat}`);
      }
    }
    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }
    if (levelFilter !== 'all') {
      query = query.eq('current_level', levelFilter);
    }

    const { data, error, count: c } = await query.order('created_at', { ascending: false }).range(from, to);
    setLoading(false);
    if (error) {
      setErr(error.message);
      setRows([]);
      setCount(0);
      return;
    }
    setRows(data ?? []);
    setCount(c ?? 0);
  }, [page, qDebounced, roleFilter, levelFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [qDebounced, roleFilter, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <AdminPageHeader title="Miembros" />
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-col lg:flex-row flex-wrap gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-neutral-800 mb-1">
                Buscar (nombre, DNI, email o UUID completo)
              </label>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nombre, DNI, email (min. 2) o UUID exacto"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Rol</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                className="w-full sm:w-44 border border-neutral-300 rounded-lg px-3 py-2"
              >
                <option value="all">Todos</option>
                <option value="user">Usuario</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Nivel Pasaporte</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as PassportLevel | 'all')}
                className="w-full sm:w-48 border border-neutral-300 rounded-lg px-3 py-2"
              >
                <option value="all">Todos</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Card padding="none">
          {loading ? (
            <p className="p-6 text-neutral-600">Cargando…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-neutral-600">Sin resultados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nombre</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">DNI</th>
                    <th className="text-left p-3 font-semibold">Rol</th>
                    <th className="text-left p-3 font-semibold">Nivel</th>
                    <th className="text-left p-3 font-semibold">Estado</th>
                    <th className="text-right p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <td className="p-3 font-medium text-neutral-900">{p.full_name}</td>
                      <td className="p-3 text-xs max-w-[180px] truncate" title={p.email ?? ''}>
                        {p.email ?? '—'}
                      </td>
                      <td className="p-3">{p.dni}</td>
                      <td className="p-3">{p.role}</td>
                      <td className="p-3">{p.current_level}</td>
                      <td className="p-3 text-xs">{p.is_banned ? 'Baneado' : 'Activo'}</td>
                      <td className="p-3 text-right">
                        <Link to={`/admin/usuarios/${p.id}`} className="text-primary-600 font-semibold hover:underline">
                          Ver / editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        {count > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">
              Página {page + 1} de {totalPages} ({count} miembros)
            </span>
            <div className="space-x-2">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
