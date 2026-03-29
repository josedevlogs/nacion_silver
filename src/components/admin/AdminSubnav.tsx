import { NavLink } from 'react-router-dom';

const links: { to: string; label: string }[] = [
  { to: '/admin', label: 'Inicio' },
  { to: '/admin/club-silver', label: 'Club Silver' },
  { to: '/admin/retos', label: 'Retos' },
  { to: '/admin/novedades', label: 'Novedades' },
  { to: '/admin/comunidad', label: 'Feed' },
  { to: '/admin/grupos', label: 'Grupos' },
  { to: '/admin/beneficios', label: 'Beneficios' },
  { to: '/admin/usuarios', label: 'Miembros' },
];

export function AdminSubnav() {
  return (
    <nav
      className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm sticky top-20 z-40 -mx-4 px-4 sm:mx-0 sm:px-0"
      aria-label="Administración"
    >
      <div className="max-w-7xl mx-auto py-2 overflow-x-auto">
        <ul className="flex flex-wrap gap-1 min-w-0">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `inline-block px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'bg-primary-100 text-primary-800' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
