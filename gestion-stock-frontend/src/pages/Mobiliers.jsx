import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../api'

const emptyForm = { id_m: '', designation: '', nomenclature: '', espece: '', pu: '', provenance: '', etat: '', observation: '' }

export default function Mobiliers() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [filterEtat, setFilterEtat] = useState('')

  const etatOptions = useMemo(() => {
    const s = new Set(list.map(m => m.etat).filter(Boolean))
    return ['', ...s].sort()
  }, [list])

  const filtered = useMemo(() => {
    if (!filterEtat) return list
    return list.filter(m => m.etat === filterEtat)
  }, [list, filterEtat])

  const load = useCallback(() => {
    api.get('/mobiliers').then(r => setList(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true) }

  function openEdit(m) {
    setEditing(m)
    setForm({
      id_m: m.id_m, designation: m.designation, nomenclature: m.nomenclature || '',
      espece: m.espece || '', pu: m.pu ?? '', provenance: m.provenance || '',
      etat: m.etat || '', observation: m.observation || ''
    })
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, pu: form.pu === '' ? null : parseFloat(form.pu) }
      if (editing) {
        await api.put(`/mobiliers/${editing.id_m}`, payload)
      } else {
        await api.post('/mobiliers', payload)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || "Erreur d'enregistrement")
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce mobilier ?')) return
    try {
      await api.delete(`/mobiliers/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur de suppression')
    }
  }

  function badgeEtat(etat) {
    switch (etat) {
      case 'Bon': case 'Neuf': return <span className="badge badge-success">{etat}</span>
      case 'À réparer': case 'Dégradé': return <span className="badge badge-danger">{etat}</span>
      case 'Réformé': return <span className="badge badge-neutral">{etat}</span>
      default: return etat || <span className="badge badge-neutral">-</span>
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mobiliers</h1>
        <button className="btn btn-primary" onClick={openAdd}>Ajouter un mobilier</button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <p>Aucun mobilier enregistré.</p>
          <button className="btn btn-primary" onClick={openAdd}>Ajouter le premier mobilier</button>
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="form-field" style={{marginBottom:0}}>
              <label className="filter-label">État</label>
              <select value={filterEtat} onChange={e => setFilterEtat(e.target.value)}>
                <option value="">Tous</option>
                {etatOptions.filter(Boolean).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <span className="filter-count">{filtered.length} sur {list.length} mobiliers</span>
          </div>
          <div className="data-card">
          <table className="data-table">
            <thead>
              <tr><th>Référence</th><th>Désignation</th><th>État</th><th>Prix unitaire</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id_m}>
                  <td style={{fontFamily:'var(--ff-mono)',fontSize:'var(--fs-sm)'}}>{m.id_m}</td>
                  <td>{m.designation}</td>
                  <td>{badgeEtat(m.etat)}</td>
                   <td>{m.pu != null ? m.pu.toLocaleString('fr-FR') + ' Ar' : '-'}</td>
                  <td className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(m)}>Modifier</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id_m)} style={{marginLeft:'.3rem'}}>Supprimer</button>
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
            <h2>{editing ? 'Modifier' : 'Ajouter'} un mobilier</h2>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label>Référence</label>
                  <input value={form.id_m} onChange={e => setForm(f => ({...f, id_m: e.target.value}))} required disabled={!!editing} />
                </div>
                <div className="form-field">
                  <label>Désignation</label>
                  <input value={form.designation} onChange={e => setForm(f => ({...f, designation: e.target.value}))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Nomenclature</label>
                  <input value={form.nomenclature} onChange={e => setForm(f => ({...f, nomenclature: e.target.value}))} />
                </div>
                <div className="form-field">
                  <label>Espèce</label>
                  <input value={form.espece} onChange={e => setForm(f => ({...f, espece: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Prix unitaire (Ar)</label>
                  <input type="number" step="0.01" min="0" value={form.pu} onChange={e => setForm(f => ({...f, pu: e.target.value}))} />
                </div>
                <div className="form-field">
                  <label>État</label>
                  <select value={form.etat} onChange={e => setForm(f => ({...f, etat: e.target.value}))}>
                    <option value="">--</option><option>Neuf</option><option>Bon</option><option>À réparer</option><option>Dégradé</option><option>Réformé</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Provenance</label>
                <input value={form.provenance} onChange={e => setForm(f => ({...f, provenance: e.target.value}))} />
              </div>
              <div className="form-field">
                <label>Observation</label>
                <textarea value={form.observation} onChange={e => setForm(f => ({...f, observation: e.target.value}))} />
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
