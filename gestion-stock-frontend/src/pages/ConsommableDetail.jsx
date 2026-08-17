import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { jsPDF } from 'jspdf'
import api from '../api'

const typeLabels = { ATTRIBUTION: 'Attribution', RESTITUTION: 'Restitution', TRANSFERT: 'Transfert', APPROVISIONNEMENT: 'Réapprovisionnement' }

function badgeType(type) {
  const map = {
    ATTRIBUTION: 'badge badge-success',
    RESTITUTION: 'badge badge-warning',
    TRANSFERT: 'badge badge-neutral',
    APPROVISIONNEMENT: 'badge badge-primary',
  }
  return <span className={map[type] || 'badge badge-neutral'}>{typeLabels[type] || type}</span>
}

function historyPhrase(m, personnes) {
  const p = personnes.find(x => x.id_p === m.id_p)
  const qui = p ? `${p.prenom} ${p.nom}` : `#${m.id_p}`
  const date = new Date(m.date_mouvement).toLocaleDateString('fr-FR')
  const qte = `${m.quantite} ${m.quantite > 1 ? 'exemplaires' : 'exemplaire'}`
  switch (m.type_mouvement) {
    case 'ATTRIBUTION': return `Le ${date}, ${qui} a reçu ${qte}.`
    case 'RESTITUTION': return `Le ${date}, ${qui} a restitué ${qte}.`
    case 'TRANSFERT': return `Le ${date}, ${qte} a été transféré depuis ${qui}.`
    case 'APPROVISIONNEMENT': return `Le ${date}, réapprovisionnement de ${qte}.`
    default: return `Le ${date}, opération ${m.type_mouvement}.`
  }
}

function niveauStock(qte) {
  if (qte <= 0) return <span className="badge badge-danger">Épuisé</span>
  if (qte < 10) return <span className="badge badge-danger">{qte} — Stock faible</span>
  if (qte < 50) return <span className="badge badge-warning">{qte} — Stock moyen</span>
  return <span className="badge badge-success">{qte} — Stock suffisant</span>
}

function imprimerHistorique(conso, mouvements, personnes) {
  const doc = new jsPDF()

  const sorted = [...mouvements].sort((a, b) => new Date(a.date_mouvement) - new Date(b.date_mouvement))

  let stock = conso.qte
  for (const m of sorted) {
    if (m.type_mouvement === 'ATTRIBUTION') stock += m.quantite
    if (m.type_mouvement === 'RESTITUTION') stock -= m.quantite
    if (m.type_mouvement === 'APPROVISIONNEMENT') stock -= m.quantite
  }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text("REPOBLIKAN'I MADAGASIKARA", 14, 15)
  doc.setFont('helvetica', 'normal')
  doc.text('BUDGET: ', 100, 15)
  doc.text("Modèle n°: ", 170, 15)
  doc.line(190, 15, 200, 15)

  doc.setFontSize(9)
  doc.text('Tanindrazana - Fahafahana - Fandrosoana', 14, 20)
  doc.text('Chap: ', 90, 20)
  doc.line(100, 20, 120, 20)
  doc.text('Art : ', 122, 20)
  doc.line(130, 20, 150, 20)
  doc.text('Instruction Générale du ', 160, 20)
  doc.text('22 juillet 1955', 160, 25)
  doc.text('Article 24', 165, 30)
  doc.line(25, 25, 50, 25)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text("HISTORIQUE DES MOUVEMENTS", 60, 40)
  doc.text("DE CONSOMMABLE", 70, 48)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text("DU TRIBUNAL ADMINISTRATIF D'ANTANANARIVO", 55, 56)

  doc.setFontSize(10)
  doc.text(`Consommable : ${conso.libelle} (Réf. ${conso.ref_c})`, 14, 68)
  doc.setFont('helvetica', 'bold')
  doc.text(`Stock actuel : ${conso.qte}`, 14, 75)
  doc.setFont('helvetica', 'normal')

  doc.setFontSize(9)
  doc.text('_________________________________________________________________________________________________', 14, 80)
  doc.text('Date         Type                    Personne                  Quantité     Stock', 14, 86)
  doc.text('_________________________________________________________________________________________________', 14, 88)

  let y = 92
  for (const m of sorted) {
    if (y > 280) { doc.addPage(); y = 20 }

    const date = new Date(m.date_mouvement).toLocaleDateString('fr-FR')
    if (m.type_mouvement === 'ATTRIBUTION') stock -= m.quantite
    if (m.type_mouvement === 'RESTITUTION') stock += m.quantite
    if (m.type_mouvement === 'APPROVISIONNEMENT') stock += m.quantite

    let qui = ''
    if (m.id_p) {
      const p = personnes.find(x => x.id_p === m.id_p)
      qui = p ? `${p.prenom} ${p.nom}` : `#${m.id_p}`
    }

    const typeLabel = typeLabels[m.type_mouvement] || m.type_mouvement
    doc.text(date.padEnd(13), 14, y)
    doc.text(typeLabel.padEnd(22).slice(0, 22), 44, y)
    doc.text(qui.padEnd(24).slice(0, 24), 86, y)
    doc.text(String(m.quantite).padStart(8), 134, y)
    doc.text(String(Math.max(0, stock)).padStart(8), 156, y)
    y += 6
  }

  doc.text('_________________________________________________________________________________________________', 14, y)
  y += 7
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, y)

  doc.save(`Historique_${conso.libelle}_${conso.ref_c}.pdf`)
}

function buildStockChart(mouvements, currentStock) {
  const sorted = [...mouvements].sort((a, b) => new Date(a.date_mouvement) - new Date(b.date_mouvement))
  let stock = currentStock
  for (const m of sorted) {
    if (m.type_mouvement === 'ATTRIBUTION') stock += m.quantite
    if (m.type_mouvement === 'RESTITUTION') stock -= m.quantite
    if (m.type_mouvement === 'APPROVISIONNEMENT') stock -= m.quantite
  }
  const points = [{ date: sorted[0]?.date_mouvement || new Date().toISOString(), stock }]
  for (const m of sorted) {
    if (m.type_mouvement === 'ATTRIBUTION') stock -= m.quantite
    if (m.type_mouvement === 'RESTITUTION') stock += m.quantite
    if (m.type_mouvement === 'APPROVISIONNEMENT') stock += m.quantite
    points.push({ date: m.date_mouvement, stock })
  }
  const finalDate = points.length > 0 ? points[points.length - 1].date : null
  points.push({ date: finalDate || new Date().toISOString(), stock: currentStock })
  return points.map(p => ({
    ...p,
    date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    stock: Math.max(0, p.stock),
  }))
}

export default function ConsommableDetail() {
  const { refC } = useParams()
  const navigate = useNavigate()
  const [conso, setConso] = useState(null)
  const [mouvements, setMouvements] = useState([])
  const [personnes, setPersonnes] = useState([])
  const [replenishQte, setReplenishQte] = useState('')
  const [replenishComment, setReplenishComment] = useState('')
  const [replenishError, setReplenishError] = useState('')

  useEffect(() => {
    api.get(`/consommables/${refC}`).then(r => setConso(r.data)).catch(() => navigate('/consommables'))
    api.get(`/mouvements/item/CONSOMMABLE/${refC}`).then(r => setMouvements(r.data)).catch(() => {})
    api.get('/personnes').then(r => setPersonnes(r.data)).catch(() => {})
  }, [refC, navigate])

  if (!conso) return <div className="loading">Chargement…</div>

  const qteParPersonne = {}
  for (const m of mouvements) {
    if (!m.id_p) continue
    if (!qteParPersonne[m.id_p]) qteParPersonne[m.id_p] = 0
    if (m.type_mouvement === 'ATTRIBUTION') qteParPersonne[m.id_p] += m.quantite
    if (m.type_mouvement === 'RESTITUTION') qteParPersonne[m.id_p] -= m.quantite
  }
  const detenteurs = Object.entries(qteParPersonne)
    .filter(([_, qte]) => qte > 0)
    .map(([id, qte]) => ({ id_p: parseInt(id), qte }))
    .sort((a, b) => b.qte - a.qte)

  const chartData = buildStockChart(mouvements, conso.qte)

  return (
    <div>
      <div className="page-header">
        <h1>{conso.libelle}</h1>
        <div style={{display:'flex',gap:'var(--space-sm)'}}>
          <button className="btn btn-primary" onClick={() => imprimerHistorique(conso, mouvements, personnes)}>
            Imprimer l'historique
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/consommables')}>
            &larr; Retour
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2 className="panel-title">Informations</h2>
          <dl className="detail-dl">
            <dt>Référence</dt><dd style={{fontFamily:'var(--ff-mono)',fontSize:'var(--fs-sm)'}}>{conso.ref_c}</dd>
            <dt>Catégorie</dt><dd>{conso.categorie || '—'}</dd>
            <dt>Stock actuel</dt><dd>{niveauStock(conso.qte)}</dd>
          </dl>
        </div>

        <div className="panel">
          <h2 className="panel-title">Détenteurs</h2>
          {detenteurs.length === 0 ? (
            <p className="panel-empty">Aucun détenteur actuellement.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Personne</th><th>Quantité</th></tr>
              </thead>
              <tbody>
                {detenteurs.map(d => {
                  const p = personnes.find(x => x.id_p === d.id_p)
                  return (
                    <tr key={d.id_p}>
                      <td>{p ? `${p.prenom} ${p.nom}` : `#${d.id_p}`}</td>
                      <td><span className="badge badge-neutral">{d.qte}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel" style={{marginTop:'var(--space-lg)'}}>
        <h2 className="panel-title">Réapprovisionner</h2>
        {replenishError && <p className="form-error">{replenishError}</p>}
        <form onSubmit={async e => {
          e.preventDefault()
          setReplenishError('')
          try {
            await api.post('/mouvements', {
              type_item: 'CONSOMMABLE',
              item_ref: conso.ref_c,
              type_mouvement: 'APPROVISIONNEMENT',
              quantite: parseInt(replenishQte, 10),
              commentaire: replenishComment || undefined,
            })
            setReplenishQte('')
            setReplenishComment('')
            const [c, m] = await Promise.all([
              api.get(`/consommables/${refC}`),
              api.get(`/mouvements/item/CONSOMMABLE/${refC}`),
            ])
            setConso(c.data)
            setMouvements(m.data)
          } catch (err) {
            setReplenishError(err.response?.data?.error || "Erreur lors du réapprovisionnement")
          }
        }} style={{display:'flex', gap:'var(--space-sm)', alignItems:'flex-end'}}>
          <div className="form-field" style={{marginBottom:0,flex:1}}>
            <label>Quantité à ajouter</label>
            <input type="number" min="1" value={replenishQte} onChange={e => setReplenishQte(e.target.value)} required placeholder="ex: 20" />
          </div>
          <div className="form-field" style={{marginBottom:0,flex:2}}>
            <label>Commentaire (optionnel)</label>
            <input value={replenishComment} onChange={e => setReplenishComment(e.target.value)} placeholder="Motif du réapprovisionnement" />
          </div>
          <button type="submit" className="btn btn-primary">Ajouter au stock</button>
        </form>
      </div>

      {chartData.length > 1 && (
        <div className="panel chart-panel" style={{marginTop:'var(--space-lg)'}}>
          <h2 className="panel-title">Évolution du stock</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6cec0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7a7062' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#7a7062' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #d6cec0', borderRadius: 6, fontSize: 13 }}
                formatter={(value) => [value, 'Stock']}
              />
              <Line type="stepAfter" dataKey="stock" stroke="#1a2b3c" strokeWidth={2} dot={{ r: 3, fill: '#1a2b3c' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="panel" style={{marginTop:'var(--space-lg)'}}>
        <h2 className="panel-title">Historique des mouvements</h2>
        {mouvements.length === 0 ? (
          <p className="panel-empty">Aucun mouvement enregistré pour ce consommable.</p>
        ) : (
          <div className="timeline">
            {mouvements.map(m => (
              <div key={m.id} className="timeline-item">
                <span className="tl-date">{new Date(m.date_mouvement).toLocaleDateString('fr-FR')}</span>
                <span className="tl-phrase">{historyPhrase(m, personnes)}</span>
                <span className="tl-badge">{badgeType(m.type_mouvement)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
