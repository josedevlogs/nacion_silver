import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Crown, LayoutGrid, Users, Trophy, Newspaper, UserCog, Gift } from 'lucide-react';

export function AdminHomePage() {
  return (
    <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Administración</h1>
          <p className="text-neutral-600">Accesos rápidos para el equipo</p>
        </div>
        <div className="space-y-4">
          <Link to="/admin/club-silver">
            <Card hover padding="lg" className="flex items-center gap-4">
              <Crown className="text-amber-600 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Club Silver</h2>
                <p className="text-sm text-neutral-600">
                  Solicitudes manuales y activación de es_club_silver en el Pasaporte
                </p>
              </div>
            </Card>
          </Link>
          <Link to="/admin/retos">
            <Card hover padding="lg" className="flex items-center gap-4">
              <Trophy className="text-amber-700 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Retos</h2>
                <p className="text-sm text-neutral-600">Listado, alta y edición de retos</p>
              </div>
            </Card>
          </Link>
          <Link to="/admin/novedades">
            <Card hover padding="lg" className="flex items-center gap-4">
              <Newspaper className="text-primary-600 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Novedades</h2>
                <p className="text-sm text-neutral-600">Contenidos editoriales (contents)</p>
              </div>
            </Card>
          </Link>
          <Link to="/admin/comunidad">
            <Card hover padding="lg" className="flex items-center gap-4">
              <LayoutGrid className="text-primary-600 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Feed comunidad</h2>
                <p className="text-sm text-neutral-600">Publicaciones, encuestas y activaciones</p>
              </div>
            </Card>
          </Link>
          <Link to="/admin/grupos">
            <Card hover padding="lg" className="flex items-center gap-4">
              <Users className="text-secondary-600 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Grupos</h2>
                <p className="text-sm text-neutral-600">Listado y edición de grupos de comunidad</p>
              </div>
            </Card>
          </Link>
          <Link to="/admin/beneficios">
            <Card hover padding="lg" className="flex items-center gap-4">
              <Gift className="text-rose-600 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Beneficios</h2>
                <p className="text-sm text-neutral-600">Beneficios del Pasaporte (tabla benefits)</p>
              </div>
            </Card>
          </Link>
          <Link to="/admin/usuarios">
            <Card hover padding="lg" className="flex items-center gap-4">
              <UserCog className="text-neutral-700 shrink-0" size={32} />
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Miembros</h2>
                <p className="text-sm text-neutral-600">Búsqueda, roles y edición de perfiles</p>
              </div>
            </Card>
          </Link>
        </div>
        <Link to="/dashboard" className="text-primary-600 font-semibold text-sm hover:underline">
          ← Volver al inicio
        </Link>
      </div>
  );
}
