import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type BenefitInsert = Database['public']['Tables']['benefits']['Insert'];
type PassportLevel = Database['public']['Tables']['benefits']['Row']['required_level'];

const LEVELS: PassportLevel[] = ['silver', 'residente_silver', 'ciudadano_silver', 'embajador_silver'];

const empty = (): Omit<BenefitInsert, 'created_by'> => ({
  title: '',
  short_description: '',
  full_description: '',
  image_url: null,
  category: 'general',
  required_level: 'silver',
  requires_silver_club: false,
  redemption_instructions: '',
  redemption_code: null,
  terms_and_conditions: null,
  usage_limit: null,
  total_redemptions: 0,
  valid_from: null,
  valid_until: null,
  is_active: true,
  is_featured: false,
  display_order: 0,
});

export function AdminBenefitFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'nuevo';
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('benefits').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        setErr(error?.message ?? 'No encontrado');
        return;
      }
      setForm({
        title: data.title,
        short_description: data.short_description,
        full_description: data.full_description,
        image_url: data.image_url,
        category: data.category,
        required_level: data.required_level,
        requires_silver_club: data.requires_silver_club,
        redemption_instructions: data.redemption_instructions,
        redemption_code: data.redemption_code,
        terms_and_conditions: data.terms_and_conditions,
        usage_limit: data.usage_limit,
        total_redemptions: data.total_redemptions,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        is_active: data.is_active,
        is_featured: data.is_featured,
        display_order: data.display_order,
      });
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

    if (isNew) {
      const { error } = await supabase.from('benefits').insert({
        ...form,
        created_by: profile.id,
        created_at: now,
        updated_at: now,
      });
      setSaving(false);
      if (error) setErr(error.message);
      else navigate('/admin/beneficios');
      return;
    }

    const { error } = await supabase
      .from('benefits')
      .update({
        title: form.title,
        short_description: form.short_description,
        full_description: form.full_description,
        image_url: form.image_url,
        category: form.category,
        required_level: form.required_level,
        requires_silver_club: form.requires_silver_club,
        redemption_instructions: form.redemption_instructions,
        redemption_code: form.redemption_code,
        terms_and_conditions: form.terms_and_conditions,
        usage_limit: form.usage_limit,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
        is_active: form.is_active,
        is_featured: form.is_featured,
        display_order: form.display_order,
        updated_at: now,
      })
      .eq('id', id!);
    setSaving(false);
    if (error) setErr(error.message);
    else navigate('/admin/beneficios');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <AdminPageHeader title={isNew ? 'Nuevo beneficio' : 'Editar beneficio'} backTo="/admin/beneficios" />
        <p className="text-neutral-600">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <AdminPageHeader title={isNew ? 'Nuevo beneficio' : 'Editar beneficio'} backTo="/admin/beneficios" />
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
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Resumen</label>
              <textarea
                required
                rows={2}
                value={form.short_description}
                onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Descripción completa</label>
              <textarea
                required
                rows={6}
                value={form.full_description}
                onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
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
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Categoría</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value || 'general' }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Nivel mínimo Pasaporte</label>
                <select
                  value={form.required_level}
                  onChange={(e) => setForm((f) => ({ ...f, required_level: e.target.value as PassportLevel }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.requires_silver_club}
                onChange={(e) => setForm((f) => ({ ...f, requires_silver_club: e.target.checked }))}
              />
              Requiere Club Silver
            </label>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Instrucciones de canje</label>
              <textarea
                required
                rows={3}
                value={form.redemption_instructions}
                onChange={(e) => setForm((f) => ({ ...f, redemption_instructions: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Código de canje (opcional)</label>
              <input
                value={form.redemption_code ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, redemption_code: e.target.value || null }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Términos y condiciones</label>
              <textarea
                rows={3}
                value={form.terms_and_conditions ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, terms_and_conditions: e.target.value || null }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Límite de usos (vacío = ilimitado)</label>
                <input
                  type="number"
                  min={1}
                  value={form.usage_limit ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usage_limit: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Orden</label>
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
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Válido desde</label>
                <input
                  type="datetime-local"
                  value={form.valid_from ? form.valid_from.slice(0, 16) : ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      valid_from: e.target.value ? new Date(e.target.value).toISOString() : null,
                    }))
                  }
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Válido hasta</label>
                <input
                  type="datetime-local"
                  value={form.valid_until ? form.valid_until.slice(0, 16) : ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      valid_until: e.target.value ? new Date(e.target.value).toISOString() : null,
                    }))
                  }
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            {!isNew && (
              <p className="text-sm text-neutral-600">
                Canjes acumulados (solo lectura): <strong>{form.total_redemptions}</strong>
              </p>
            )}
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
            <div className="flex gap-3 flex-wrap">
              <Button type="submit" loading={saving}>
                {isNew ? 'Crear' : 'Guardar'}
              </Button>
              <Link to="/admin/beneficios">
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
