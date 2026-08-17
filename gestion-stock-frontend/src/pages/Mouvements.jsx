import { useState, useEffect, useCallback, useMemo } from 'react'
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

function phrase(m, personnes) {
  const p = personnes.find(x => x.id_p === m.id_p)
  const qui = p ? `${p.prenom} ${p.nom}` : `#${m.id_p}`
  const date = new Date(m.date_mouvement).toLocaleDateString('fr-FR')
  const article = `${m.item_ref} (${m.type_item === 'MOBILIER' ? 'mobilier' : 'consommable'})`
  const qte = `${m.quantite} ${m.quantite > 1 ? 'exemplaires' : 'exemplaire'}`

  switch (m.type_mouvement) {
    case 'ATTRIBUTION': return `Le ${date}, ${qui} a reçu ${qte} de ${article}.`
    case 'RESTITUTION': return `Le ${date}, ${qui} a restitué ${qte} de ${article}.`
    case 'TRANSFERT': return `Le ${date}, ${qte} de ${article} a été transféré${m.quantite > 1 ? 's' : ''} depuis ${qui}.`
    case 'APPROVISIONNEMENT': return `Le ${date}, réapprovisionnement de ${qte} de ${article}.`
    default: return `Le ${date}, opération ${m.type_mouvement} sur ${article} (${qui}).`
  }
}

export default function Mouvements() {
  const [list, setList] = useState([])
  const [personnes, setPersonnes] = useState([])
  const [mobiliers, setMobiliers] = useState([])
  const [consommables, setConsommables] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterItemType, setFilterItemType] = useState('')
  const [form, setForm] = useState({
    id_p: '', type_item: 'MOBILIER', item_ref: '', type_mouvement: 'ATTRIBUTION',
    quantite: 1, commentaire: '', id_p_dest: '',
  })

  const filtered = useMemo(() => {
    return list.filter(m => {
      if (filterType && m.type_mouvement !== filterType) return false
      if (filterItemType && m.type_item !== filterItemType) return false
      return true
    })
  }, [list, filterType, filterItemType])

  const load = useCallback(() => {
    api.get('/mouvements').then(r => setList(r.data)).catch(() => {})
    api.get('/personnes').then(r => setPersonnes(r.data)).catch(() => {})
    api.get('/mobiliers').then(r => setMobiliers(r.data)).catch(() => {})
    api.get('/consommables').then(r => setConsommables(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const items = form.type_item === 'MOBILIER' ? mobiliers : consommables
  const itemRefLabel = form.type_item === 'MOBILIER' ? 'le mobilier' : 'le consommable'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        id_p: parseInt(form.id_p, 10),
        type_item: form.type_item,
        item_ref: form.item_ref,
        type_mouvement: form.type_mouvement,
        quantite: parseInt(form.quantite, 10),
        commentaire: form.commentaire || undefined,
      }
      if (form.type_mouvement === 'TRANSFERT' && form.id_p_dest) {
        payload.id_p_dest = parseInt(form.id_p_dest, 10)
      }
      await api.post('/mouvements', payload)
      setShowForm(false)
      setForm(f => ({ ...f, id_p: '', item_ref: '', quantite: 1, commentaire: '', id_p_dest: '' }))
      load()
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création du mouvement")
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mouvements</h1>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowForm(true) }}>
          Nouveau mouvement
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <p>Aucun mouvement enregistré. Créez une attribution, une restitution ou un transfert.</p>
          <button className="btn btn-primary" onClick={() => { setError(''); setShowForm(true) }}>
            Créer le premier mouvement
          </button>
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="form-field" style={{marginBottom:0}}>
              <label className="filter-label">Type de mouvement</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">Tous</option>
                <option value="ATTRIBUTION">Attribution</option>
                <option value="RESTITUTION">Restitution</option>
                <option value="TRANSFERT">Transfert</option>
                <option value="APPROVISIONNEMENT">Réapprovisionnement</option>
              </select>
            </div>
            <div className="form-field" style={{marginBottom:0}}>
              <label className="filter-label">Type d'article</label>
              <select value={filterItemType} onChange={e => setFilterItemType(e.target.value)}>
                <option value="">Tous</option>
                <option value="MOBILIER">Mobilier</option>
                <option value="CONSOMMABLE">Consommable</option>
              </select>
            </div>
            <span className="filter-count">{filtered.length} sur {list.length} mouvements</span>
          </div>
          <div className="timeline">
          {filtered.map(m => (
            <div key={m.id} className="timeline-item">
              <span className="tl-date">{new Date(m.date_mouvement).toLocaleDateString('fr-FR')}</span>
              <span className="tl-phrase">{phrase(m, personnes)}</span>
              <span className="tl-badge">{badgeType(m.type_mouvement)}</span>
            </div>
          ))}
        </div>
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:560}}>
            <h2>Nouveau mouvement</h2>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Personne concernée</label>
                <select value={form.id_p} onChange={e => setForm(f => ({...f, id_p: e.target.value}))} required>
                  <option value="">Sélectionner une personne</option>
                  {personnes.map(p => (
                    <option key={p.id_p} value={p.id_p}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Type d'article</label>
                  <select value={form.type_item} onChange={e => setForm(f => ({...f, type_item: e.target.value, item_ref: '', quantite: e.target.value === 'MOBILIER' ? 1 : f.quantite}))}>
                    <option value="MOBILIER">Mobilier</option>
                    <option value="CONSOMMABLE">Consommable</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Article ({itemRefLabel})</label>
                  <select value={form.item_ref} onChange={e => setForm(f => ({...f, item_ref: e.target.value}))} required>
                    <option value="">Sélectionner un article</option>
                    {items.map(item => (
                      <option key={item.id_m || item.ref_c} value={item.id_m || item.ref_c}>
                        {item.id_m || item.ref_c} — {item.designation || item.libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Type de mouvement</label>
                  <select value={form.type_mouvement} onChange={e => setForm(f => ({...f, type_mouvement: e.target.value}))}>
                    <option value="ATTRIBUTION">Attribution</option>
                    <option value="RESTITUTION">Restitution</option>
                    <option value="TRANSFERT">Transfert</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Quantité</label>
                  {form.type_item === 'MOBILIER' ? (
                    <input type="number" value={1} disabled />
                  ) : (
                    <input type="number" min="1" value={form.quantite} onChange={e => setForm(f => ({...f, quantite: e.target.value}))} required />
                  )}
                </div>
              </div>

              {form.type_mouvement === 'TRANSFERT' && (
                <div className="form-field">
                  <label>Personne destinataire</label>
                  <select value={form.id_p_dest} onChange={e => setForm(f => ({...f, id_p_dest: e.target.value}))} required>
                    <option value="">Sélectionner la personne destinataire</option>
                    {personnes.filter(p => p.id_p !== parseInt(form.id_p)).map(p => (
                      <option key={p.id_p} value={p.id_p}>{p.prenom} {p.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field">
                <label>Commentaire (optionnel)</label>
                <textarea value={form.commentaire} onChange={e => setForm(f => ({...f, commentaire: e.target.value}))} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer le mouvement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
