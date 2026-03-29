import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import type { Database } from '../../lib/database.types';

type FeedPost = Database['public']['Tables']['feed_posts']['Row'];
type PostType = FeedPost['post_type'];
type FeedStatus = FeedPost['status'];

type ChallengeOption = { id: string; title: string };

export function AdminFeedPostFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'nuevo' || !id;
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeOption[]>([]);
  const [postType, setPostType] = useState<PostType>('announcement');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [externalMediaUrl, setExternalMediaUrl] = useState('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [poll1, setPoll1] = useState('');
  const [poll2, setPoll2] = useState('');
  const [poll3, setPoll3] = useState('');
  const [pollClosesAt, setPollClosesAt] = useState('');
  const [pollClosedManually, setPollClosedManually] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<FeedStatus>('published');
  const [publishedAt, setPublishedAt] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('challenges').select('id, title').eq('is_active', true).order('title');
      setChallenges(data ?? []);
    })();
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('feed_posts').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        setErr(error?.message ?? 'No encontrado');
        return;
      }
      setPostType(data.post_type);
      setTitle(data.title);
      setBody(data.body ?? '');
      setLinkUrl(data.link_url ?? '');
      setExternalMediaUrl(data.external_media_url ?? '');
      setChallengeId(data.challenge_id ?? '');
      setPoll1(data.poll_option_1 ?? '');
      setPoll2(data.poll_option_2 ?? '');
      setPoll3(data.poll_option_3 ?? '');
      setPollClosesAt(data.poll_closes_at ? data.poll_closes_at.slice(0, 16) : '');
      setPollClosedManually(data.poll_closed_manually);
      setIsPinned(data.is_pinned);
      setStatus(data.status);
      setPublishedAt(data.published_at ? data.published_at.slice(0, 16) : '');
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const buildPayload = (): Omit<FeedPost, 'id' | 'created_at' | 'updated_at' | 'created_by'> => {
    const nowIso = new Date().toISOString();
    const pub = publishedAt ? new Date(publishedAt).toISOString() : status === 'published' ? nowIso : null;
    return {
      post_type: postType,
      title: title.trim(),
      body: body.trim() || null,
      link_url: linkUrl.trim() || null,
      external_media_url: postType === 'visual' ? externalMediaUrl.trim() || null : null,
      challenge_id: postType === 'activation' && challengeId ? challengeId : null,
      poll_option_1: postType === 'poll' ? poll1.trim() || null : null,
      poll_option_2: postType === 'poll' ? poll2.trim() || null : null,
      poll_option_3: postType === 'poll' ? poll3.trim() || null : null,
      poll_closes_at: postType === 'poll' && pollClosesAt ? new Date(pollClosesAt).toISOString() : null,
      poll_closed_manually: postType === 'poll' ? pollClosedManually : false,
      is_pinned: isPinned,
      published_at: pub,
      status,
    };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    if (postType === 'poll' && !poll1.trim() && !poll2.trim() && !poll3.trim()) {
      setErr('Añade al menos una opción de encuesta.');
      return;
    }
    if (postType === 'activation' && !challengeId) {
      setErr('Selecciona un reto para la activación.');
      return;
    }
    setSaving(true);
    setErr(null);
    const now = new Date().toISOString();
    const payload = buildPayload();

    if (isNew) {
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          ...payload,
          created_by: profile.id,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .maybeSingle();
      setSaving(false);
      if (error) {
        setErr(error.message);
        return;
      }
      navigate(data?.id ? `/admin/comunidad` : '/admin/comunidad');
      return;
    }

    const { error } = await supabase
      .from('feed_posts')
      .update({
        ...payload,
        updated_at: now,
      })
      .eq('id', id!);
    setSaving(false);
    if (error) setErr(error.message);
    else navigate('/admin/comunidad');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <AdminPageHeader title={isNew ? 'Nueva publicación' : 'Editar publicación'} backTo="/admin/comunidad" />
        <p className="text-neutral-600">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <AdminPageHeader title={isNew ? 'Nueva publicación' : 'Editar publicación'} backTo="/admin/comunidad" />
        <Card padding="lg">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Tipo</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              >
                <option value="announcement">Anuncio</option>
                <option value="visual">Visual</option>
                <option value="activation">Activación (reto)</option>
                <option value="poll">Encuesta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Título</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Texto</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">Enlace (opcional)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2"
              />
            </div>
            {postType === 'visual' && (
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">URL imagen / media externa</label>
                <input
                  type="url"
                  value={externalMediaUrl}
                  onChange={(e) => setExternalMediaUrl(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
            )}
            {postType === 'activation' && (
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Reto</label>
                <select
                  required
                  value={challengeId}
                  onChange={(e) => setChallengeId(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="">— Seleccionar —</option>
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {postType === 'poll' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Opción 1</label>
                  <input value={poll1} onChange={(e) => setPoll1(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Opción 2</label>
                  <input value={poll2} onChange={(e) => setPoll2(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Opción 3</label>
                  <input value={poll3} onChange={(e) => setPoll3(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 mb-1">Cierra encuesta (fecha/hora local)</label>
                  <input
                    type="datetime-local"
                    value={pollClosesAt}
                    onChange={(e) => setPollClosesAt(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={pollClosedManually} onChange={(e) => setPollClosedManually(e.target.checked)} />
                  Cerrada manualmente
                </label>
              </>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FeedStatus)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1">Publicado en</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              Fijar en el feed
            </label>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <div className="flex gap-3 flex-wrap">
              <Button type="submit" loading={saving}>
                {isNew ? 'Publicar' : 'Guardar'}
              </Button>
              <Link to="/admin/comunidad">
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
