import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import { CONTENT_TYPE_LABELS } from '../lib/contentLabels';
import type { Database } from '../lib/database.types';
import { ArrowRight, Sparkles, Users, Shield } from 'lucide-react';

type ContentRow = Database['public']['Tables']['contents']['Row'];

export function LandingPage() {
  const [featured, setFeatured] = useState<ContentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('contents')
        .select('*')
        .eq('status', 'published')
        .or(`published_at.is.null,published_at.lte.${now}`)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(3);

      if (data) setFeatured(data);
    };
    load();
  }, []);

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <Badge variant="neutral" size="sm" className="mb-4">
          SILVERMOON Venezuela
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Nación Silver
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
          Tu hub de identidad y comunidad: Pasaporte Silver, retos, beneficios y conexión con el ecosistema
          Aula Silver, Microaula, Talentos y más.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/registro"
            className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 px-8 py-4 text-lg"
          >
            Crear cuenta
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-4 focus:ring-primary-200 px-8 py-4 text-lg"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card padding="lg" className="text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-primary-600" size={28} />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Pasaporte Silver</h2>
            <p className="text-neutral-600 text-sm">
              Sube de nivel con puntos, retos y participación en la comunidad.
            </p>
          </Card>
          <Card padding="lg" className="text-center">
            <div className="w-14 h-14 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-secondary-600" size={28} />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Ecosistema</h2>
            <p className="text-neutral-600 text-sm">
              Un mismo perfil para conectar con formación, bienestar y oportunidades.
            </p>
          </Card>
          <Card padding="lg" className="text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-amber-700" size={28} />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Identidad central</h2>
            <p className="text-neutral-600 text-sm">
              Supabase Auth: tus datos de acceso con estándares actuales de seguridad.
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-white/70 border-y border-neutral-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Novedades</h2>
            <Link
              to="/novedades"
              className="text-primary-600 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              Ver todas
              <ArrowRight size={18} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="text-neutral-600 text-center py-8">
              Pronto publicaremos artículos, eventos y anuncios aquí.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item) => (
                <Link key={item.id} to={`/novedades/${item.id}`} className="group">
                  <Card
                    padding="lg"
                    className="h-full transition-shadow group-hover:shadow-lg border border-neutral-200"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <Badge variant="neutral" size="sm" className="mb-2">
                      {CONTENT_TYPE_LABELS[item.content_type]}
                    </Badge>
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-700 mb-2">
                      {item.title}
                    </h3>
                    {item.short_description && (
                      <p className="text-neutral-600 text-sm line-clamp-3">{item.short_description}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
