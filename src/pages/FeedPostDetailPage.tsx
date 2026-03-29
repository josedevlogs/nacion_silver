import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ExternalLink, Pin } from 'lucide-react';
import type { Database } from '../lib/database.types';

type FeedPostRow = Database['public']['Tables']['feed_posts']['Row'];
type ReactionRow = Database['public']['Tables']['feed_post_reactions']['Row'];

const TYPE_LABEL: Record<FeedPostRow['post_type'], string> = {
  announcement: 'Anuncio',
  poll: 'Encuesta',
  visual: 'Visual',
  activation: 'Activación',
};

const REACTION_EMOJIS = ['👍', '❤️', '🎉'];

export function FeedPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [post, setPost] = useState<FeedPostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [challengeTitle, setChallengeTitle] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const { data: p } = await supabase.from('feed_posts').select('*').eq('id', id).maybeSingle();
    setPost(p ?? null);

    if (p?.post_type === 'activation' && p.challenge_id) {
      const { data: ch } = await supabase.from('challenges').select('title').eq('id', p.challenge_id).maybeSingle();
      setChallengeTitle(ch?.title ?? null);
    }

    const { data: r } = await supabase.from('feed_post_reactions').select('*').eq('post_id', id);
    setReactions(r ?? []);

    if (p?.post_type === 'poll' && profile?.id) {
      const { data: v } = await supabase
        .from('feed_poll_votes')
        .select('option_index')
        .eq('post_id', id)
        .eq('user_id', profile.id)
        .maybeSingle();
      setMyVote(v?.option_index ?? null);

      const { data: allVotes } = await supabase.from('feed_poll_votes').select('option_index').eq('post_id', id);
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      (allVotes ?? []).forEach((row) => {
        counts[row.option_index] = (counts[row.option_index] ?? 0) + 1;
      });
      setVoteCounts(counts);
    }
    setLoading(false);
  }, [id, profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleReaction = async (emoji: string) => {
    if (!profile?.id || !id) return;
    const existing = reactions.find((r) => r.user_id === profile.id && r.emoji === emoji);
    if (existing) {
      await supabase.from('feed_post_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('feed_post_reactions').insert({ post_id: id, user_id: profile.id, emoji });
    }
    load();
  };

  const pollClosed = () => {
    if (!post || post.post_type !== 'poll') return true;
    if (post.poll_closed_manually) return true;
    if (post.poll_closes_at && new Date(post.poll_closes_at) <= new Date()) return true;
    return false;
  };

  const submitVote = async (optionIndex: number) => {
    if (!profile?.id || !id || post?.post_type !== 'poll' || pollClosed()) return;
    const payload = { post_id: id, user_id: profile.id, option_index: optionIndex };
    if (myVote != null) {
      await supabase.from('feed_poll_votes').update({ option_index: optionIndex }).eq('post_id', id).eq('user_id', profile.id);
    } else {
      await supabase.from('feed_poll_votes').insert(payload);
    }
    load();
  };

  if (!profile) return null;

  if (loading) {
    return (
      <Layout>
        <p className="text-neutral-600">Cargando…</p>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <p className="text-neutral-600">Publicación no encontrada.</p>
        <Link to="/comunidad" className="text-primary-600 font-semibold mt-4 inline-block">
          Volver al feed
        </Link>
      </Layout>
    );
  }

  const pollOptions = [post.poll_option_1, post.poll_option_2, post.poll_option_3].filter(Boolean) as string[];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/comunidad" className="text-primary-600 font-semibold text-sm hover:underline">
          ← Comunidad
        </Link>

        <Card padding="lg">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.is_pinned && (
              <Badge variant="neutral" size="sm" className="inline-flex items-center gap-1">
                <Pin size={12} /> Fijado
              </Badge>
            )}
            <span className="text-sm font-semibold text-primary-600">{TYPE_LABEL[post.post_type]}</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">{post.title}</h1>
          {post.body && <p className="text-neutral-700 whitespace-pre-wrap mb-4">{post.body}</p>}

          {post.post_type === 'visual' && post.external_media_url && (
            <div className="mb-4">
              <img
                src={post.external_media_url}
                alt=""
                className="max-w-full rounded-lg border border-neutral-200"
              />
            </div>
          )}

          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline mb-4"
            >
              <ExternalLink size={18} />
              Abrir enlace
            </a>
          )}

          {post.post_type === 'activation' && post.challenge_id && (
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-900 mb-2">
                Reto: {challengeTitle ?? '…'}
              </p>
              <Link to={`/retos/${post.challenge_id}`}>
                <Button variant="secondary" size="sm">
                  Ir al reto
                </Button>
              </Link>
            </div>
          )}

          {post.post_type === 'poll' && pollOptions.length > 0 && (
            <div className="space-y-3 mb-8">
              <p className="text-sm text-neutral-600">
                {pollClosed() ? 'Encuesta cerrada' : 'Elige una opción'}
              </p>
              {pollOptions.map((label, idx) => {
                const optionIndex = idx + 1;
                const count = voteCounts[optionIndex] ?? 0;
                const total = Object.values(voteCounts).reduce((a, b) => a + b, 0);
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={optionIndex}>
                    <Button
                      variant={myVote === optionIndex ? 'primary' : 'outline'}
                      disabled={pollClosed()}
                      className="w-full justify-start mb-1"
                      onClick={() => submitVote(optionIndex)}
                    >
                      {label}
                    </Button>
                    {pollClosed() && (
                      <div className="text-xs text-neutral-500">
                        {count} voto(s) · {pct}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-neutral-200 pt-6">
            <p className="text-sm font-semibold text-neutral-700 mb-3">Reacciones</p>
            <div className="flex flex-wrap gap-2">
              {REACTION_EMOJIS.map((emoji) => {
                const count = reactions.filter((r) => r.emoji === emoji).length;
                const mine = reactions.some((r) => r.user_id === profile.id && r.emoji === emoji);
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggleReaction(emoji)}
                    className={`px-3 py-2 rounded-lg border text-lg transition-colors ${
                      mine ? 'bg-primary-50 border-primary-300' : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {emoji} <span className="text-sm text-neutral-600">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
