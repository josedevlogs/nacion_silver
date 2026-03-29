import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const btnPrimarySm =
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 px-4 py-2 text-sm';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">NS</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 hidden sm:inline">Nación Silver</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
            <Link to="/novedades" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Novedades
            </Link>
            {user && profile?.profile_completed ? (
              <Link to="/dashboard" className={btnPrimarySm}>
                Ir al panel
              </Link>
            ) : user ? (
              <Link to="/completar-perfil" className={btnPrimarySm}>
                Completar perfil
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-neutral-700 hover:text-primary-600 px-2">
                  Entrar
                </Link>
                <Link to="/registro" className={btnPrimarySm}>
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-neutral-200 bg-white/80 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-neutral-600">
          <p className="font-semibold text-neutral-800">SILVERMOON · Nación Silver</p>
          <p className="mt-1">Comunidad y pasaporte digital para personas 50+</p>
          <a
            href="https://silvermoonve.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline mt-2 inline-block"
          >
            silvermoonve.org
          </a>
        </div>
      </footer>
    </div>
  );
}
