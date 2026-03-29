import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PassportBadge } from '../components/PassportBadge';
import { Gift, Lock, Crown, CheckCircle } from 'lucide-react';
import type { Database, PassportLevel } from '../lib/database.types';

type BenefitRow = Database['public']['Tables']['benefits']['Row'];

const LEVEL_ORDER: Record<PassportLevel, number> = {
  silver: 1,
  residente_silver: 2,
  ciudadano_silver: 3,
  embajador_silver: 4,
};

export function BenefitsPage() {
  const { profile } = useAuth();
  const [benefits, setBenefits] = useState<BenefitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasClubAccess, setHasClubAccess] = useState(false);

  useEffect(() => {
    loadBenefits();
  }, [profile?.id, profile?.es_club_silver]);

  const loadBenefits = async () => {
    try {
      if (profile?.id) {
        const { data: sub } = await supabase
          .from('silver_club_subscriptions')
          .select('status')
          .eq('user_id', profile.id)
          .maybeSingle();
        const subActive = sub?.status === 'active' || sub?.status === 'trial';
        setHasClubAccess(!!profile.es_club_silver || subActive);
      } else {
        setHasClubAccess(false);
      }

      const { data } = await supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setBenefits(data);
      }
    } catch (error) {
      console.error('Error al cargar beneficios:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (benefit: BenefitRow) => {
    if (!profile) return false;
    const currentLevelOrder = LEVEL_ORDER[profile.current_level];
    const requiredLevelOrder = LEVEL_ORDER[benefit.required_level as PassportLevel];
    return currentLevelOrder >= requiredLevelOrder;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Beneficios</h1>
          <p className="text-lg text-neutral-600">Descubre todas las ventajas de ser parte de Nación Silver</p>
        </div>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Tu nivel actual</h3>
              <PassportBadge level={profile!.current_level} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600 mb-1">Puntos Silver</p>
              <p className="text-3xl font-bold text-primary-600">{profile?.total_points}</p>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-600">Cargando beneficios...</p>
          </div>
        ) : benefits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => {
              const unlocked = isUnlocked(benefit);
              const needsClub = benefit.requires_silver_club && !hasClubAccess;
              const accessible = unlocked && !needsClub;

              return (
                <Card key={benefit.id} padding="lg" className={!accessible ? 'opacity-75' : ''}>
                  {benefit.image_url && (
                    <img
                      src={benefit.image_url}
                      alt={benefit.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="neutral" size="sm">
                      {benefit.category}
                    </Badge>
                    {benefit.requires_silver_club && (
                      <Badge variant="warning" size="sm">
                        <Crown size={14} />
                        Silver Club
                      </Badge>
                    )}
                    {accessible && (
                      <Badge variant="success" size="sm">
                        <CheckCircle size={14} />
                        Desbloqueado
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{benefit.title}</h3>
                  <p className="text-base text-neutral-600 mb-4">{benefit.short_description}</p>

                  {!accessible && (
                    <div className="bg-neutral-100 border-2 border-neutral-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Lock size={20} />
                        <div>
                          {!unlocked && (
                            <p className="font-semibold">
                              Alcanza el nivel <PassportBadge level={benefit.required_level} size="sm" showIcon={false} /> para desbloquear
                            </p>
                          )}
                          {unlocked && needsClub && (
                            <p className="font-semibold">Requiere suscripción Silver Club</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {accessible && (
                    <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
                      <h4 className="font-bold text-primary-900 mb-2">Cómo obtenerlo:</h4>
                      <p className="text-sm text-primary-700">{benefit.redemption_instructions}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="lg">
            <div className="text-center py-12">
              <Gift className="text-neutral-400 mx-auto mb-4" size={64} />
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">No hay beneficios disponibles</h3>
              <p className="text-base text-neutral-600">Los beneficios estarán disponibles pronto</p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
