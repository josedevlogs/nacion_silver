import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PassportBadge } from '../components/PassportBadge';
import { User, MapPin, Heart, Calendar, Crown } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Mi Perfil</h1>
          <p className="text-lg text-neutral-600">Información personal y progreso</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card padding="lg" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Nombre Completo</p>
                    <p className="text-lg font-semibold text-neutral-900">{profile.full_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-secondary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Ubicación</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {profile.city}, {profile.country}
                    </p>
                    <p className="text-base text-neutral-600">{profile.nationality}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Edad</p>
                    <p className="text-lg font-semibold text-neutral-900">{profile.age} años</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="text-pink-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-2">Intereses</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm font-semibold"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Pasaporte Silver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <PassportBadge level={profile.current_level} size="lg" />
                  {profile.es_club_silver && (
                    <div className="mt-3 flex justify-center">
                      <Badge variant="warning" size="sm" className="inline-flex items-center gap-1">
                        <Crown size={14} /> Club Silver (Pasaporte)
                      </Badge>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-primary-600">{profile.total_points}</div>
                    <div className="text-sm text-neutral-600">Puntos Silver</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>Miembro desde</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-neutral-900">
                  {new Date(profile.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
