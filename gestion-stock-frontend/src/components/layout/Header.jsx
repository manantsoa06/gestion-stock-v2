import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <span className="header-user">{user?.username}</span>
      <button onClick={logout} className="btn btn-outline">Déconnexion</button>
    </header>
  )
}
