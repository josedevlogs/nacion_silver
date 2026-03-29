import type { Database, SubscriptionStatus } from './database.types';

type ProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type SubRow = Database['public']['Tables']['silver_club_subscriptions']['Row'] | null;

export function hasSilverClubAccess(profile: ProfileRow | null, subscription: SubRow): boolean {
  if (!profile) return false;
  if (profile.es_club_silver) return true;
  const s = subscription?.status as SubscriptionStatus | undefined;
  return s === 'active' || s === 'trial';
}

export function subscriptionLooksActive(sub: SubRow): boolean {
  const s = sub?.status;
  return s === 'active' || s === 'trial';
}
