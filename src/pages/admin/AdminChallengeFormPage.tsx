import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];
type ChallengeType = Database['public']['Tables']['challenges']['Row']['challenge_type'];
type ChallengeOrigin = Database['public']['Tables']['challenges']['Row']['origin'];
type ValidationMethod = Database['public']['Tables']['challenges']['Row']['validation_method'];

const emptyForm = (): Omit<ChallengeInsert, 'id'> => ({
  title: '',
  description: '',
  full_description: null,
  image_url: null,
  challenge_type: 'internal',
  origin: 'nacion',
  points_reward: 0,
  validation_method: 'manual',
  validation_code: null,
  category: null,
  tags: [],
  is_active: true,
  is_featured: false,
  display_order: 0,
  max_completions: null,
  total_completions: 0,
  created_by: null,
});

function tagsToStr(tags: string[]) {
  return tags.join(', ');
}
function strToTags(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function AdminChallengeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'nuevo' || !id;
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [tagsStr, setTagsStr] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('challenges').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        setErr(error?.message ?? 'No encontrado');
        return;
      }
      setForm({
        title: data.title,
        description: data.description,
        full_description: data.full_description,
        image_url: data.image_url,
        challenge_type: data.challenge_type,
        origin: data.origin,
        points_reward: data.points_reward,
        validation_method: data.validation_method,
        validation_code: data.validation_code,
        category: data.category,
        tags: data.tags,
        is_active: data.is_active,
        is_featured: data.is_featured,
        display_order: data.display_order,
        max_completions: data.max_completions,
        total_completions: data.total_completions,
        created_by: data.created_by,
      });
      setTagsStr(tagsToStr(data.tags));
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setErr(null);
    const now = new Date().toISOString();
    const tags = strToTags(tagsStr);
    const payload = {
      ...form,
      tags,
      updated_at: now,
    };

    if (isNew) {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...payload,
          created_by: profile.id,
          created_at: now,
        })
        .select('id')
        .maybeSingle();
      setSaving(false);
      if (error) {
        setErr(error.message);
        return;
      }
      navigate(data?.id ? `/admin/retos/${data.id}` : '/admin/retos');
      return;
    }

    const { error } = await supabase
      .from('challenges')
      .update({
        title: payload.title,
        description: payload.description,
        full_description: payload.full_description,
        image_url: payload.image_url,
        challenge_type: payload.challenge_type,
        origin: payload.origin,
        points_reward: payload.points_reward,
        validation_method: payload.validation_method,
        validation_code: payload.validation_code,
        category: payload.category,
        tags: payload.tags,
        is_active: payload.is_active,
        is_featured: payload.is_featured,
        display_order: payload.display_order,
        max_completions: payload.max_completions,
        updated_at: now,
      })
      .eq('id', id!);
    setSaving(false);
    if (error) setErr(error.message);
    else navigate('/admin/retos');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <AdminPageHeader title={isNew ? 'Nuevo reto' : 'Editar reto'} />
        <p className="text-neutral-600">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <AdminPageHeader title={isNew ? 'Nuevo reto' : 'Editar reto'} />
        <Card padding="lg">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Título</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Descripción corta</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Descripción completa</label>
              <textarea
                rows={5}
                value={form.full_description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value || null }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">URL imagen</label>
              <input
                type="url"
                value={form.image_url ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value || null }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Tipo</label>
                <select
                  value={form.challenge_type}
                  onChange={(e) => setForm((f) => ({ ...f, challenge_type: e.target.value as ChallengeType }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="internal">Interno</option>
                  <option value="external">Externo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Origen</label>
                <select
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value as ChallengeOrigin }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="nacion">Nación</option>
                  <option value="aula">Aula</option>
                  <option value="microaula">Microaula</option>
                  <option value="bienestar">Bienestar</option>
                  <option value="event">Evento</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Puntos recompensa</label>
                <input
                  type="number"
                  min={0}
                  value={form.points_reward}
                  onChange={(e) => setForm((f) => ({ ...f, points_reward: Number(e.target.value) }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Orden visual</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Validación</label>
                <select
                  value={form.validation_method}
                  onChange={(e) => setForm((f) => ({ ...f, validation_method: e.target.value as ValidationMethod }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="manual">Manual</option>
                  <option value="code">Código</option>
                  <option value="qr">QR</option>
                  <option value="integration">Integración</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Código de validación</label>
                <input
                  value={form.validation_code ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, validation_code: e.target.value || null }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Categoría</label>
              <input
                value={form.category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value || null }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Etiquetas (separadas por coma)</label>
              <input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Máx. completaciones (vacío = sin límite)</label>
              <input
                type="number"
                min={1}
                value={form.max_completions ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    max_completions: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Activo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                />
                Destacado
              </label>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                {isNew ? 'Crear' : 'Guardar'}
              </Button>
              <Link to="/admin/retos">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>
    </div>
  );
}
