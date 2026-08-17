import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="landing">
      <header>
        <h1>Tribunal Administratif</h1>
        <p className="subtitle">Gestion de stock de matériels et biens immobiliers</p>
      </header>
      <main>
        <p>
          Application interne de gestion des inventaires de mobiliers, consommables
          et mouvements de matériel au sein du tribunal administratif.
        </p>
        <Link to="/login" className="btn-primary">Se connecter</Link>
      </main>
    </div>
  )
}
