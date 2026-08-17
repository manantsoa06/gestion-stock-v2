import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/personnes', label: 'Personnes' },
  { to: '/mobiliers', label: 'Mobiliers' },
  { to: '/consommables', label: 'Consommables' },
  { to: '/mouvements', label: 'Mouvements' },
]

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">Gestion de stock</div>
      <ul>
        {links.map(l => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.to === '/dashboard'} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
