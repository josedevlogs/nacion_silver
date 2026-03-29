/** Ventana “recientes” en días (producto v1). */
export const FEED_RECENT_DAYS = 5;

export interface FeedSortablePost {
  is_pinned: boolean;
  published_at: string | null;
}

export function sortFeedPosts<T extends FeedSortablePost>(posts: T[]): T[] {
  const now = Date.now();
  const cutoff = now - FEED_RECENT_DAYS * 24 * 60 * 60 * 1000;

  return [...posts].sort((a, b) => {
    const ap = a.is_pinned ? 1 : 0;
    const bp = b.is_pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;

    const at = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bt = b.published_at ? new Date(b.published_at).getTime() : 0;
    const ar = at >= cutoff ? 1 : 0;
    const br = bt >= cutoff ? 1 : 0;
    if (ar !== br) return br - ar;

    return bt - at;
  });
}
