import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const emptyForm = { nom: '', prenom: '', sexe: '', grade: '', fonction: '', adresse: '', telephone: '' }

const requiredFields = {
  nom: 'Le nom est requis',
  sexe: 'Le sexe est requis',
  grade: 'Le grade est requis',
  fonction: 'La fonction est requise',
  adresse: "L'adresse est requise",
  telephone: 'Le téléphone est requis',
}

export default function Personnes() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const load = useCallback(() => {
    api.get('/personnes').then(r => setList(r.data)).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setFieldErrors({})
    setShowForm(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({ nom: p.nom, prenom: p.prenom, sexe: p.sexe || '', grade: p.grade || '', fonction: p.fonction || '', adresse: p.adresse || '', telephone: p.telephone || '' })
    setError('')
    setFieldErrors({})
    setShowForm(true)
  }

  function validate() {
    const errs = {}
    for (const [key, msg] of Object.entries(requiredFields)) {
      if (!form[key]?.trim()) errs[key] = msg
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      if (editing) {
        await api.put(`/personnes/${editing.id_p}`, form)
      } else {
        await api.post('/personnes', form)
      }
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || "Erreur d'enregistrement")
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette personne ?')) return
    try {
      await api.delete(`/personnes/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur de suppression')
    }
  }

  function wrapField(name, label, child) {
    const err = fieldErrors[name]
    return (
      <div className="form-field">
        <label>
          {label}{requiredFields[name] && <span style={{color:'var(--c-danger)',marginLeft:2}}>*</span>}
        </label>
        {child}
        {err && <p style={{fontSize:'var(--fs-xs)',color:'var(--c-danger)',marginTop:4}}>{err}</p>}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Personnes</h1>
        <button className="btn btn-primary" onClick={openAdd}>Ajouter une personne</button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <p>Aucune personne enregistrée.</p>
          <button className="btn btn-primary" onClick={openAdd}>Ajouter la première personne</button>
        </div>
      ) : (
        <div className="data-card">
          <table className="data-table">
            <thead>
              <tr><th>Nom</th><th>Prénom</th><th>Grade</th><th>Fonction</th><th>Téléphone</th><th></th></tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id_p}>
                  <td>{p.nom}</td><td>{p.prenom}</td><td>{p.grade}</td><td>{p.fonction}</td><td>{p.telephone}</td>
                  <td className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/personnes/${p.id_p}`)}>Voir détail</button>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)} style={{marginLeft:'.3rem'}}>Modifier</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id_p)} style={{marginLeft:'.3rem'}}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Modifier' : 'Ajouter'} une personne</h2>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                {wrapField('nom', 'Nom',
                  <input value={form.nom} onChange={e => { setForm(f => ({...f, nom: e.target.value})); setFieldErrors(f => ({...f, nom: ''})) }} required />)}
                {wrapField('prenom', 'Prénom',
                  <input value={form.prenom} onChange={e => setForm(f => ({...f, prenom: e.target.value}))} />)}
              </div>
              <div className="form-row">
                {wrapField('sexe', 'Sexe',
                  <select value={form.sexe} onChange={e => { setForm(f => ({...f, sexe: e.target.value})); setFieldErrors(f => ({...f, sexe: ''})) }} required>
                    <option value="">--</option><option>Masculin</option><option>Féminin</option>
                  </select>)}
                {wrapField('grade', 'Grade',
                  <input value={form.grade} onChange={e => { setForm(f => ({...f, grade: e.target.value})); setFieldErrors(f => ({...f, grade: ''})) }} required />)}
              </div>
              {wrapField('fonction', 'Fonction',
                <input value={form.fonction} onChange={e => { setForm(f => ({...f, fonction: e.target.value})); setFieldErrors(f => ({...f, fonction: ''})) }} required />)}
              {wrapField('adresse', 'Adresse',
                <textarea value={form.adresse} onChange={e => { setForm(f => ({...f, adresse: e.target.value})); setFieldErrors(f => ({...f, adresse: ''})) }} required />)}
              {wrapField('telephone', 'Téléphone',
                <input value={form.telephone} onChange={e => { setForm(f => ({...f, telephone: e.target.value})); setFieldErrors(f => ({...f, telephone: ''})) }} required />)}
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
