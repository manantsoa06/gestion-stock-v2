import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api'

const typeLabels = { ATTRIBUTION: 'Attribution', RESTITUTION: 'Restitution', TRANSFERT: 'Transfert' }
const chartColors = { ATTRIBUTION: '#2d5a27', RESTITUTION: '#b8863c', TRANSFERT: '#7a7062' }

function phrase(mouvement, personnes) {
  const p = personnes.find(x => x.id_p === mouvement.id_p)
  const qui = p ? `${p.prenom} ${p.nom}` : `#${mouvement.id_p}`
  const date = new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')
  const qte = `${mouvement.quantite} ex.`
  const article = `${mouvement.item_ref}`
  switch (mouvement.type_mouvement) {
    case 'ATTRIBUTION': return `${qui} a reçu ${qte} de ${article}`
    case 'RESTITUTION': return `${qui} a restitué ${qte} de ${article}`
    case 'TRANSFERT': return `Transfert de ${qte} ${article} depuis ${qui}`
    default: return `${mouvement.type_mouvement} — ${article} (${qui})`
  }
}

function buildChartData(rows) {
  const types = ['ATTRIBUTION', 'RESTITUTION', 'TRANSFERT']
  const map = {}
  for (const r of rows) {
    const key = r.jour.slice(0, 10)
    if (!map[key]) map[key] = { jour: key, ATTRIBUTION: 0, RESTITUTION: 0, TRANSFERT: 0 }
    map[key][r.type_mouvement] = r.count
  }
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([_, v]) => ({
    ...v,
    jour: new Date(v.jour + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
  }))
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [consommables, setConsommables] = useState([])
  const [mouvements, setMouvements] = useState([])
  const [personnes, setPersonnes] = useState([])

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data)).catch(() => {})
    api.get('/consommables').then(r => setConsommables(r.data)).catch(() => {})
    api.get('/mouvements').then(r => setMouvements(r.data.slice(0, 5))).catch(() => {})
    api.get('/personnes').then(r => setPersonnes(r.data)).catch(() => {})
  }, [])

  if (!stats) return <div className="loading">Chargement…</div>

  const stockFaible = consommables.filter(c => c.qte < 10)
  const chartData = buildChartData(stats.mouvements_par_jour || [])

  return (
    <div>
      <h1 style={{fontSize:'var(--fs-xl)',marginBottom:'var(--space-lg)'}}>Tableau de bord</h1>

      <div className="dashboard-grid">
        <div className="stat-card"><span className="stat-value">{stats.personnes}</span><span className="stat-label">Personnes</span></div>
        <div className="stat-card"><span className="stat-value">{stats.mobiliers}</span><span className="stat-label">Mobiliers</span></div>
        <div className="stat-card"><span className="stat-value">{stats.consommables}</span><span className="stat-label">Consommables</span></div>
        <div className="stat-card"><span className="stat-value">{stats.mobilier_attribue}</span><span className="stat-label">Mobiliers attribués</span></div>
        <div className="stat-card"><span className="stat-value">{stats.conso_stock}</span><span className="stat-label">Stock consommable total</span></div>
        <div className="stat-card"><span className="stat-value">{stats.mouvements_ce_mois}</span><span className="stat-label">Mouvements ce mois</span></div>
      </div>

      {chartData.length > 0 && (
        <div className="panel chart-panel">
          <h2 className="panel-title">Mouvements — 30 derniers jours</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6cec0" />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#7a7062' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7a7062' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #d6cec0', borderRadius: 6, fontSize: 13 }}
                formatter={(value, name) => [value, typeLabels[name] || name]}
              />
              {(['ATTRIBUTION', 'RESTITUTION', 'TRANSFERT']).map(t => (
                <Bar key={t} dataKey={t} stackId="a" fill={chartColors[t]} name={t} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="dashboard-panels">
        {stockFaible.length > 0 && (
          <div className="panel panel-warning">
            <h2 className="panel-title">Stock faible</h2>
            <ul className="panel-list">
              {stockFaible.map(c => (
                <li key={c.ref_c}>
                  <span className="badge badge-danger">{c.qte}</span>
                  {c.libelle} <span className="panel-meta">({c.ref_c})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stats.top_mobiliers_attribues && stats.top_mobiliers_attribues.length > 0 && (
          <div className="panel">
            <h2 className="panel-title">Mobiliers les plus attribués</h2>
            <ul className="panel-list">
              {stats.top_mobiliers_attribues.map(m => (
                <li key={m.id_m}>
                  <span className="badge badge-success">{m.total}</span>
                  {m.designation} <span className="panel-meta">({m.id_m})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="panel">
          <h2 className="panel-title">Derniers mouvements</h2>
          {mouvements.length === 0 ? (
            <p className="panel-empty">Aucun mouvement récent.</p>
          ) : (
            <ul className="panel-list panel-timeline">
              {mouvements.map(m => (
                <li key={m.id}>
                  <span className="panel-date">{new Date(m.date_mouvement).toLocaleDateString('fr-FR')}</span>
                  <span>{phrase(m, personnes)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
