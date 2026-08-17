import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const emptyForm = { ref_c: '', libelle: '', categorie: '', qte: 0 }

export default function Consommables() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [filterStock, setFilterStock] = useState('')

  const filtered = useMemo(() => {
    if (!filterStock) return list
    if (filterStock === 'bas') return list.filter(c => c.qte < 10)
    if (filterStock === 'normal') return list.filter(c => c.qte >= 10)
    return list
  }, [list, filterStock])

  const load = useCallback(() => {
    api.get('/consommables').then(r => setList(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true) }

  function openEdit(c) {
    setEditing(c)
    setForm({ ref_c: c.ref_c, libelle: c.libelle, categorie: c.categorie || '', qte: '' })
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, qte: parseInt(form.qte, 10) || 0 }
      if (editing) {
        await api.put(`/consommables/${editing.ref_c}`, payload)
      } else {
        await api.post('/consommables', payload)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || "Erreur d'enregistrement")
    }
  }

  async function handleDelete(ref) {
    if (!window.confirm('Supprimer ce consommable ?')) return
    try {
      await api.delete(`/consommables/${ref}`)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur de suppression')
    }
  }

  function niveauStock(qte) {
    if (qte <= 0) return <span className="badge badge-danger">Épuisé</span>
    if (qte < 10) return <span className="badge badge-danger">{qte} — Stock faible</span>
    if (qte < 50) return <span className="badge badge-warning">{qte} — Stock moyen</span>
    return <span className="badge badge-success">{qte} — Stock suffisant</span>
  }

  return (
    <div>
      <div className="page-header">
        <h1>Consommables</h1>
        <button className="btn btn-primary" onClick={openAdd}>Ajouter un consommable</button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <p>Aucun consommable enregistré.</p>
          <button className="btn btn-primary" onClick={openAdd}>Ajouter le premier consommable</button>
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="form-field" style={{marginBottom:0}}>
              <label className="filter-label">Niveau de stock</label>
              <select value={filterStock} onChange={e => setFilterStock(e.target.value)}>
                <option value="">Tous</option>
                <option value="bas">Stock bas (&lt; 10)</option>
                <option value="normal">Stock normal (&ge; 10)</option>
              </select>
            </div>
            <span className="filter-count">{filtered.length} sur {list.length} consommables</span>
          </div>
          <div className="data-card">
          <table className="data-table">
            <thead>
              <tr><th>Réf.</th><th>Libellé</th><th>Catégorie</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.ref_c}>
                  <td style={{fontFamily:'var(--ff-mono)',fontSize:'var(--fs-sm)'}}>{c.ref_c}</td>
                  <td>{c.libelle}</td>
                  <td>{c.categorie || '-'}</td>
                  <td>{niveauStock(c.qte)}</td>
                  <td className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/consommables/${c.ref_c}`)}>Voir détail</button>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)} style={{marginLeft:'.3rem'}}>Modifier</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.ref_c)} style={{marginLeft:'.3rem'}}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Modifier' : 'Ajouter'} un consommable</h2>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label>Référence</label>
                  <input value={form.ref_c} onChange={e => setForm(f => ({...f, ref_c: e.target.value}))} required disabled={!!editing} />
                </div>
                <div className="form-field">
                  <label>Libellé</label>
                  <input value={form.libelle} onChange={e => setForm(f => ({...f, libelle: e.target.value}))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Catégorie</label>
                  <input value={form.categorie} onChange={e => setForm(f => ({...f, categorie: e.target.value}))} />
                </div>
                <div className="form-field">
                  <label>Quantité en stock</label>
                  {editing ? (
                    <input type="number" value={editing.qte} disabled />
                  ) : (
                    <input type="number" min="0" value={form.qte} onChange={e => setForm(f => ({...f, qte: e.target.value}))} required />
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Enregistrer' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
