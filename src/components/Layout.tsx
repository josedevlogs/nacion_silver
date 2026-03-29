import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Target,
  Gift,
  Crown,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Newspaper,
  MessagesSquare,
  Users,
} from 'lucide-react';
import { PassportBadge } from './PassportBadge';
import { Button } from './ui/Button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: Home },
    { name: 'Comunidad', href: '/comunidad', icon: MessagesSquare },
    { name: 'Grupos', href: '/grupos', icon: Users },
    { name: 'Novedades', href: '/novedades', icon: Newspaper },
    { name: 'Retos', href: '/retos', icon: Target },
    { name: 'Beneficios', href: '/beneficios', icon: Gift },
    { name: 'Silver Club', href: '/silver-club', icon: Crown },
    { name: 'Perfil', href: '/perfil', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/novedades') return location.pathname.startsWith('/novedades');
    if (path === '/comunidad') return location.pathname.startsWith('/comunidad');
    if (path === '/grupos') return location.pathname.startsWith('/grupos');
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">NS</span>
                </div>
                <span className="text-2xl font-bold text-neutral-900 hidden sm:block">Nación Silver</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}

              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Shield size={20} />
                  Admin
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {profile && (
                <div className="flex flex-col items-end">
                  <PassportBadge level={profile.current_level} size="sm" />
                  <span className="text-xs text-neutral-600 mt-1">{profile.total_points} puntos</span>
                </div>
              )}
              <Button variant="ghost" onClick={handleSignOut} size="sm">
                <LogOut size={18} />
                Salir
              </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {profile && (
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg mb-3">
                  <PassportBadge level={profile.current_level} size="sm" />
                  <span className="text-sm font-semibold text-neutral-700">{profile.total_points} puntos</span>
                </div>
              )}

              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon size={22} />
                    {item.name}
                  </Link>
                );
              })}

              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Shield size={22} />
                  Panel Admin
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-error-500 hover:bg-red-50 w-full transition-all duration-200"
              >
                <LogOut size={22} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
