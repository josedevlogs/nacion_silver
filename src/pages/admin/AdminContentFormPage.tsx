import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type ContentInsert = Database['public']['Tables']['contents']['Insert'];
type ContentType = Database['public']['Tables']['contents']['Row']['content_type'];
type ContentStatus = Database['public']['Tables']['contents']['Row']['status'];

function tagsToStr(tags: string[]) {
  return tags.join(', ');
}
function strToTags(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

const emptyForm = (): Omit<ContentInsert, 'created_by'> => ({
  title: '',
  short_description: null,
  full_content: '',
  image_url: null,
  content_type: 'article',
  category: null,
  tags: [],
  points_reward: 0,
  status: 'draft',
  published_at: null,
  scheduled_for: null,
  view_count: 0,
  completion_count: 0,
  favorite_count: 0,
  is_featured: false,
  display_order: 0,
});

export function AdminContentFormPage() {
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
      const { data, error } = await supabase.from('contents').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        setErr(error?.message ?? 'No encontrado');
        return;
      }
      setForm({
        title: data.title,
        short_description: data.short_description,
        full_content: data.full_content,
        image_url: data.image_url,
        content_type: data.content_type,
        category: data.category,
        tags: data.tags,
        points_reward: data.points_reward,
        status: data.status,
        published_at: data.published_at,
        scheduled_for: data.scheduled_for,
        view_count: data.view_count,
        completion_count: data.completion_count,
        favorite_count: data.favorite_count,
        is_featured: data.is_featured,
        display_order: data.display_order,
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
    const publishedAt =
      form.status === 'published' && !form.published_at ? now : form.published_at;

    if (isNew) {
      const { error } = await supabase.from('contents').insert({
        ...form,
        tags,
        published_at: publishedAt,
        created_by: profile.id,
        created_at: now,
        updated_at: now,
      });
      setSaving(false);
      if (error) setErr(error.message);
      else navigate('/admin/novedades');
      return;
    }

    const { error } = await supabase
      .from('contents')
      .update({
        title: form.title,
        short_description: form.short_description,
        full_content: form.full_content,
        image_url: form.image_url,
        content_type: form.content_type,
        category: form.category,
        tags,
        points_reward: form.points_reward,
        status: form.status,
        published_at: publishedAt,
        scheduled_for: form.scheduled_for,
        is_featured: form.is_featured,
        display_order: form.display_order,
        updated_at: now,
      })
      .eq('id', id!);
    setSaving(false);
    if (error) setErr(error.message);
    else navigate('/admin/novedades');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <AdminPageHeader title={isNew ? 'Nueva novedad' : 'Editar novedad'} />
        <p className="text-neutral-600">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <AdminPageHeader title={isNew ? 'Nueva novedad' : 'Editar novedad'} />
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
                rows={2}
                value={form.short_description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value || null }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Contenido completo</label>
              <textarea
                required
                rows={10}
                value={form.full_content}
                onChange={(e) => setForm((f) => ({ ...f, full_content: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 font-mono text-sm"
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
                  value={form.content_type}
                  onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value as ContentType }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="article">Artículo</option>
                  <option value="announcement">Anuncio</option>
                  <option value="event">Evento</option>
                  <option value="challenge_promo">Promo reto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ContentStatus }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
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
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Etiquetas (coma)</label>
              <input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
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
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Orden</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Publicado en (ISO, opcional)</label>
              <input
                type="datetime-local"
                value={form.published_at ? form.published_at.slice(0, 16) : ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    published_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                  }))
                }
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
              />
              Destacado
            </label>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                {isNew ? 'Crear' : 'Guardar'}
              </Button>
              <Link to="/admin/novedades">
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
