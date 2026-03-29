import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Crown, Check, Sparkles } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { hasSilverClubAccess } from '../lib/clubSilver';

type SubscriptionRow = Database['public']['Tables']['silver_club_subscriptions']['Row'];
type RequestRow = Database['public']['Tables']['club_silver_requests']['Row'];

const BENEFITS = [
  'Acceso a contenido exclusivo',
  'Beneficios ampliados en aliados',
  'Acceso prioritario a eventos',
  'Descuentos especiales',
  'Soporte preferencial',
  'Experiencias VIP',
];

function statusLabel(sub: SubscriptionRow | null, passportClub: boolean): string {
  if (passportClub) return 'Miembro Club (Pasaporte)';
  if (!sub) return 'Sin suscripción';
  switch (sub.status) {
    case 'active':
      return 'Activa';
    case 'trial':
      return 'Prueba';
    case 'expired':
      return 'Expirada';
    case 'pending_confirmation':
      return 'Pendiente de confirmación';
    case 'none':
      return 'Sin suscripción';
    default:
      return 'Sin suscripción';
  }
}

function hasPendingRequest(req: RequestRow | null): boolean {
  if (!req) return false;
  return req.status === 'pending' || req.status === 'in_review';
}

export function SilverClubPage() {
  const { profile, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [latestRequest, setLatestRequest] = useState<RequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'monthly' | 'annual' | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [userNotes, setUserNotes] = useState('');

  const loadAll = useCallback(async () => {
    if (!profile?.id) return;
    const [subRes, reqRes] = await Promise.all([
      supabase.from('silver_club_subscriptions').select('*').eq('user_id', profile.id).maybeSingle(),
      supabase
        .from('club_silver_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setSubscription(subRes.data ?? null);
    setLatestRequest(reqRes.data ?? null);
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      await loadAll();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, loadAll]);

  const passportClub = profile?.es_club_silver ?? false;
  const isActiveMember = hasSilverClubAccess(profile, subscription);
  const pendingFromRequest = hasPendingRequest(latestRequest);
  const pendingFromLegacySub = subscription?.status === 'pending_confirmation';
  const pendingReview = pendingFromRequest || pendingFromLegacySub;

  const canRequestNew =
    !passportClub &&
    !isActiveMember &&
    !pendingFromRequest &&
    (!subscription || subscription.status === 'none' || subscription.status === 'expired');

  const handleSolicitar = async (plan: 'monthly' | 'annual') => {
    if (!profile?.id || !canRequestNew) return;
    setActionMessage(null);
    setSubmitting(plan);
    try {
      const { error } = await supabase.from('club_silver_requests').insert({
        user_id: profile.id,
        plan_type: plan,
        status: 'pending',
        user_notes: userNotes.trim() || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      setActionMessage({
        type: 'ok',
        text: 'Solicitud registrada. El equipo verificará el pago (Zelle, pago móvil, etc.) y activará tu Club en el Pasaporte.',
      });
      await loadAll();
      await refreshProfile();
    } catch {
      setActionMessage({
        type: 'err',
        text: 'No se pudo registrar la solicitud. Intenta de nuevo o contacta soporte.',
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-6">
            <Crown className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Silver Club</h1>
          <p className="text-xl text-neutral-600">
            Accede a beneficios exclusivos y experiencias premium
          </p>
        </div>

        <Card padding="lg" className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Tu suscripción</h2>
              {loading ? (
                <p className="text-neutral-600 mt-1">Cargando estado…</p>
              ) : (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={isActiveMember || passportClub ? 'success' : 'neutral'} size="sm">
                      {statusLabel(subscription, passportClub)}
                    </Badge>
                    {subscription?.plan_type && (
                      <span className="text-sm text-neutral-600">Plan: {subscription.plan_type}</span>
                    )}
                  </div>
                  {subscription?.end_date && (
                    <p className="text-sm text-neutral-600 mt-2">
                      {subscription.status === 'active'
                        ? `Renovación / fin: ${new Date(subscription.end_date).toLocaleDateString('es-ES')}`
                        : `Referencia: ${new Date(subscription.end_date).toLocaleDateString('es-ES')}`}
                    </p>
                  )}
                </>
              )}
            </div>
            {(isActiveMember || passportClub) && (
              <Link to="/beneficios" className="text-primary-600 font-semibold text-sm hover:underline">
                Ver beneficios desbloqueados
              </Link>
            )}
          </div>
        </Card>

        {actionMessage && (
          <div
            className={`max-w-2xl mx-auto p-4 rounded-lg border-2 text-sm font-medium ${
              actionMessage.type === 'ok'
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {pendingReview && (
          <p className="text-center text-neutral-600 max-w-2xl mx-auto">
            Tienes una solicitud en revisión. Te avisaremos cuando se confirme el pago o el estado en el
            Pasaporte.
          </p>
        )}

        <div className="max-w-2xl mx-auto">
          <label className="block text-sm font-semibold text-neutral-800 mb-2">
            Notas para el equipo (opcional)
          </label>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            rows={2}
            placeholder="Referencia de pago, banco, etc."
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm mb-6"
            disabled={!canRequestNew || !!submitting}
          />
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Plan Mensual</CardTitle>
              <CardDescription>Flexibilidad mes a mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary-600 mb-2">$9.99</div>
                <div className="text-base text-neutral-600">por mes</div>
              </div>

              <ul className="space-y-3 mb-8">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-base text-neutral-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-neutral-600 mb-4">
                Sin pasarela: registramos tu solicitud en <strong>club_silver_requests</strong>. Un
                administrador verifica el pago y activa <strong>es_club_silver</strong> en tu Pasaporte.
              </p>
              <Button
                fullWidth
                size="lg"
                loading={submitting === 'monthly'}
                disabled={!canRequestNew || pendingReview || !!submitting}
                onClick={() => handleSolicitar('monthly')}
              >
                Solicitar plan mensual
              </Button>
            </CardContent>
          </Card>

          <Card padding="lg" className="border-4 border-amber-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-yellow-500 text-white px-4 py-2 text-sm font-bold">
              MÁS POPULAR
            </div>
            <CardHeader>
              <CardTitle>Plan Anual</CardTitle>
              <CardDescription>Ahorra 20% pagando anualmente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary-600 mb-2">$95.99</div>
                <div className="text-base text-neutral-600">por año</div>
                <div className="text-sm text-green-600 font-semibold mt-2">Ahorras $23.89 al año</div>
              </div>

              <ul className="space-y-3 mb-8">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-base text-neutral-700">{benefit}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <Sparkles className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-base text-amber-700 font-semibold">Insignia de miembro anual</span>
                </li>
              </ul>

              <Button
                fullWidth
                size="lg"
                variant="secondary"
                loading={submitting === 'annual'}
                disabled={!canRequestNew || pendingReview || !!submitting}
                onClick={() => handleSolicitar('annual')}
              >
                Solicitar plan anual
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card padding="lg" className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Pago manual (Venezuela)</CardTitle>
            <CardDescription>
              Transferencia, pago móvil, Zelle u otros canales: el equipo confirma por fuera y actualiza tu
              Pasaporte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base text-neutral-700 mb-4">
              Tu solicitud queda en <code className="text-sm bg-neutral-100 px-1 rounded">club_silver_requests</code>
              . Cuando el pago esté verificado, un administrador marca{' '}
              <code className="text-sm bg-neutral-100 px-1 rounded">es_club_silver = true</code> en tu perfil.
            </p>
            <Button variant="outline" size="lg" type="button">
              Contactar soporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
