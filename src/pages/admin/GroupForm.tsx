import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserPicker } from '../../components/admin/UserPicker';
import type { Database } from '../../lib/database.types';

type AccessMode = Database['public']['Tables']['community_groups']['Row']['access_mode'];
type PassportLevel = Database['public']['Tables']['user_profiles']['Row']['current_level'];

export type GroupFormProps = {
  mode: 'create' | 'edit';
  groupId?: string;
  initial?: Database['public']['Tables']['community_groups']['Row'] | null;
  onSuccess: (id: string) => void;
  onCancel: () => void;
};

const LEVELS: PassportLevel[] = ['silver', 'residente_silver', 'ciudadano_silver', 'embajador_silver'];

export function GroupForm({ mode, groupId, initial, onSuccess, onCancel }: GroupFormProps) {
  const { profile } = useAuth();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [objective, setObjective] = useState(initial?.objective ?? '');
  const [accessMode, setAccessMode] = useState<AccessMode>(initial?.access_mode ?? 'open');
  const [minPassportLevel, setMinPassportLevel] = useState<PassportLevel | ''>(initial?.min_passport_level ?? '');
  const [requiresSilverClub, setRequiresSilverClub] = useState(initial?.requires_silver_club ?? false);
  const [facilitatorUserId, setFacilitatorUserId] = useState<string | null>(initial?.facilitator_user_id ?? null);
  const [facilitatorDisplayName, setFacilitatorDisplayName] = useState(initial?.facilitator_display_name ?? '');
  const [maxMembers, setMaxMembers] = useState(initial?.max_members ?? 80);
  const [nextSessionAt, setNextSessionAt] = useState(initial?.next_session_at ? initial.next_session_at.slice(0, 16) : '');
  const [nextSessionLabel, setNextSessionLabel] = useState(initial?.next_session_label ?? '');
  const [isListed, setIsListed] = useState(initial?.is_listed ?? true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setLoading(true);
    setErr(null);
    const now = new Date().toISOString();
    const nextAt = nextSessionAt ? new Date(nextSessionAt).toISOString() : null;

    const base = {
      name: name.trim(),
      description: description.trim() || null,
      objective: objective.trim() || null,
      access_mode: accessMode,
      min_passport_level: minPassportLevel || null,
      requires_silver_club: requiresSilverClub,
      facilitator_user_id: facilitatorUserId,
      facilitator_display_name: facilitatorDisplayName.trim() || null,
      max_members: Math.min(1000, Math.max(1, maxMembers)),
      next_session_at: nextAt,
      next_session_label: nextSessionLabel.trim() || null,
      is_listed: isListed,
      updated_at: now,
    };

    if (mode === 'create') {
      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          ...base,
          created_by: profile.id,
          created_at: now,
        })
        .select('id')
        .maybeSingle();
      setLoading(false);
      if (error) {
        setErr(error.message);
        return;
      }
      if (data?.id) onSuccess(data.id);
      return;
    }

    if (!groupId) {
      setLoading(false);
      setErr('Falta id de grupo');
      return;
    }

    const { error } = await supabase.from('community_groups').update(base).eq('id', groupId);
    setLoading(false);
    if (error) setErr(error.message);
    else onSuccess(groupId);
  };

  return (
    <Card padding="lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Nombre</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Objetivo</label>
          <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Modo de acceso</label>
          <select
            value={accessMode}
            onChange={(e) => setAccessMode(e.target.value as AccessMode)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          >
            <option value="open">Abierto</option>
            <option value="closed">Cerrado</option>
            <option value="invitation">Invitación</option>
            <option value="conditional">Condicional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Nivel mínimo Pasaporte (opcional)</label>
          <select
            value={minPassportLevel}
            onChange={(e) => setMinPassportLevel((e.target.value || '') as PassportLevel | '')}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          >
            <option value="">— Cualquiera —</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={requiresSilverClub} onChange={(e) => setRequiresSilverClub(e.target.checked)} />
          Requiere Club Silver
        </label>
        <UserPicker
          value={facilitatorUserId}
          onChange={(uid) => setFacilitatorUserId(uid)}
          label="Facilitador (cuenta)"
        />
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Nombre del facilitador (visible)</label>
          <input
            value={facilitatorDisplayName}
            onChange={(e) => setFacilitatorDisplayName(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Máx. miembros (≤1000)</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Próxima sesión (fecha/hora)</label>
          <input
            type="datetime-local"
            value={nextSessionAt}
            onChange={(e) => setNextSessionAt(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Próxima sesión (texto)</label>
          <input
            value={nextSessionLabel}
            onChange={(e) => setNextSessionLabel(e.target.value)}
            placeholder="Ej. Martes 10:00"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isListed} onChange={(e) => setIsListed(e.target.checked)} />
          Listado público
        </label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-3 flex-wrap">
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Crear grupo' : 'Guardar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
