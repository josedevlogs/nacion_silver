import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['user_profiles']['Row'];
type UserRole = Profile['role'];
type PassportLevel = Profile['current_level'];

const LEVELS: PassportLevel[] = ['silver', 'residente_silver', 'ciudadano_silver', 'embajador_silver'];

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile: me } = useAuth();
  const navigate = useNavigate();
  const [row, setRow] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(0);
  const [dni, setDni] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [nationality, setNationality] = useState('');
  const [interestsStr, setInterestsStr] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [currentLevel, setCurrentLevel] = useState<PassportLevel>('silver');
  const [esClubSilver, setEsClubSilver] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const reload = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      setErr(error?.message ?? 'Perfil no encontrado');
      return;
    }
    setRow(data);
    setFullName(data.full_name);
    setAge(data.age);
    setDni(data.dni);
    setCity(data.city);
    setCountry(data.country);
    setNationality(data.nationality);
    setInterestsStr((data.interests ?? []).join(', '));
    setAvatarUrl(data.avatar_url ?? '');
    setRole(data.role);
    setCurrentLevel(data.current_level);
    setEsClubSilver(data.es_club_silver);
    setIsBanned(data.is_banned);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        setErr(error?.message ?? 'Perfil no encontrado');
        return;
      }
      setRow(data);
      setFullName(data.full_name);
      setAge(data.age);
      setDni(data.dni);
      setCity(data.city);
      setCountry(data.country);
      setNationality(data.nationality);
      setInterestsStr((data.interests ?? []).join(', '));
      setAvatarUrl(data.avatar_url ?? '');
      setRole(data.role);
      setCurrentLevel(data.current_level);
      setEsClubSilver(data.es_club_silver);
      setIsBanned(data.is_banned);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const applyRoleChange = async (next: UserRole) => {
    if (!id || !row) return;
    if (me?.id === id && row.role === 'admin' && next !== 'admin') {
      if (
        !confirm(
          'Vas a quitarte el rol de administrador. Perderás acceso al panel admin en la siguiente carga. ¿Continuar?'
        )
      ) {
        return;
      }
    }
    setSaving(true);
    setErr(null);
    const now = new Date().toISOString();
    const { error } = await supabase.from('user_profiles').update({ role: next, updated_at: now }).eq('id', id);
    setSaving(false);
    if (error) setErr(error.message);
    else {
      setRole(next);
      setRow((r) => (r ? { ...r, role: next } : r));
      if (me?.id === id && next !== 'admin') navigate('/dashboard');
    }
  };

  const toggleBan = async () => {
    if (!id || !row || me?.id === id) return;
    const next = !isBanned;
    if (
      !confirm(
        next
          ? '¿Suspender (banear) a este usuario? No podrá usar la app hasta que reviertas el estado.'
          : '¿Quitar la suspensión y permitir el acceso de nuevo?'
      )
    ) {
      return;
    }
    setSaving(true);
    setErr(null);
    const now = new Date().toISOString();
    const { error } = await supabase.from('user_profiles').update({ is_banned: next, updated_at: now }).eq('id', id);
    setSaving(false);
    if (error) setErr(error.message);
    else {
      setIsBanned(next);
      setRow((r) => (r ? { ...r, is_banned: next } : r));
    }
  };

  const deleteAccount = async () => {
    if (!id || !row || me?.id === id) return;
    if (
      !confirm(
        'Cerrar cuenta: se anonimizarán los datos del perfil, se suspenderá el acceso y no se podrá iniciar sesión con normalidad. No elimina el usuario en Auth (sin Edge Functions). ¿Continuar?'
      )
    ) {
      return;
    }
    setSaving(true);
    setErr(null);
    const { data, error: rpcErr } = await supabase.rpc('admin_delete_user_data', {
      p_target: id,
    });
    setSaving(false);
    if (rpcErr) {
      setErr(rpcErr.message);
      return;
    }
    const payload = data as { ok?: boolean; error?: string } | null;
    if (payload && payload.ok === false && payload.error) {
      setErr(
        payload.error === 'forbidden'
          ? 'No autorizado'
          : payload.error === 'cannot_delete_self'
            ? 'No puedes eliminar tu propia cuenta desde aquí'
            : payload.error === 'profile_not_found'
              ? 'Perfil no encontrado'
              : String(payload.error)
      );
      return;
    }
    navigate('/admin/usuarios');
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setErr(null);
    const now = new Date().toISOString();
    if (!row) return;
    const interests = interestsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ageNum = Math.floor(Number(age));
    const ageSafe = Number.isFinite(ageNum) && ageNum >= 1 && ageNum <= 120 ? ageNum : row.age;
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: fullName.trim(),
        age: ageSafe,
        dni: dni.trim(),
        city: city.trim(),
        country: country.trim(),
        nationality: nationality.trim(),
        interests,
        avatar_url: avatarUrl.trim() || null,
        current_level: currentLevel,
        es_club_silver: esClubSilver,
        updated_at: now,
      })
      .eq('id', id);
    setSaving(false);
    if (error) setErr(error.message);
    else void reload();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <AdminPageHeader title="Miembro" backTo="/admin/usuarios" />
        <p className="text-neutral-600">Cargando…</p>
      </div>
    );
  }

  if (err && !row) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <AdminPageHeader title="Miembro" backTo="/admin/usuarios" />
        <p className="text-red-600">{err}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <AdminPageHeader title={row?.full_name ?? 'Miembro'} backTo="/admin/usuarios" />
      <Card padding="lg" className="space-y-4">
        <p className="text-xs text-neutral-500 font-mono break-all">ID: {id}</p>
        {row && (
          <>
            <p className="text-sm text-neutral-600">
              Email (auth):{' '}
              <strong className="break-all">{row.email ?? '— (se sincroniza al migrar o al iniciar sesión)'}</strong>
            </p>
            <p className="text-sm text-neutral-600">
              Puntos totales: <strong>{row.total_points}</strong> (solo lectura)
            </p>
            {row.is_banned && (
              <p className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Cuenta suspendida (baneada): no puede usar la app.
              </p>
            )}
          </>
        )}
        <div>
          <span className="text-sm font-semibold text-neutral-800">Rol</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['user', 'moderator', 'admin'] as const).map((r) => (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={role === r ? 'primary' : 'outline'}
                disabled={saving}
                onClick={() => {
                  if (r !== role) void applyRoleChange(r);
                }}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
        {me?.id !== id && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
            <Button type="button" variant="secondary" loading={saving} onClick={() => void toggleBan()}>
              {isBanned ? 'Quitar suspensión (desbanear)' : 'Suspender cuenta (banear)'}
            </Button>
            <Button type="button" variant="danger" loading={saving} onClick={() => void deleteAccount()}>
              Cerrar cuenta (anonimizar + ban)
            </Button>
          </div>
        )}
      </Card>
      <Card padding="lg">
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Nombre completo</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">DNI</label>
              <input
                required
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Edad</label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">URL avatar (opcional)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Intereses (separados por coma)</label>
            <input
              value={interestsStr}
              onChange={(e) => setInterestsStr(e.target.value)}
              placeholder="música, lectura, …"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Ciudad</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">País</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Nacionalidad</label>
            <input value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Nivel Pasaporte</label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as PassportLevel)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={esClubSilver} onChange={(e) => setEsClubSilver(e.target.checked)} />
            Club Silver activo
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-3 flex-wrap">
            <Button type="submit" loading={saving}>
              Guardar datos
            </Button>
            <Link to="/admin/usuarios">
              <Button type="button" variant="outline">
                Volver al listado
              </Button>
            </Link>
          </div>
        </form>
      </Card>
      <p className="text-xs text-neutral-500">
        El email se sincroniza en <code className="bg-neutral-100 px-1 rounded">user_profiles.email</code>. “Cerrar
        cuenta” usa una función en base de datos (sin Edge Functions): banea y anonimiza el perfil. Para borrar también
        el registro en Auth, usa el panel de Supabase (Authentication) si lo necesitas.
      </p>
    </div>
  );
}
