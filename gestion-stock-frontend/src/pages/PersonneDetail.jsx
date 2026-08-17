import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import api from '../api'

const typeLabels = { ATTRIBUTION: 'Attribution', RESTITUTION: 'Restitution', TRANSFERT: 'Transfert' }

function badgeType(type) {
  const map = {
    ATTRIBUTION: 'badge badge-success',
    RESTITUTION: 'badge badge-warning',
    TRANSFERT: 'badge badge-neutral',
  }
  return <span className={map[type] || 'badge badge-neutral'}>{typeLabels[type] || type}</span>
}

function historyPhrase(m, personne) {
  const qui = personne ? `${personne.prenom} ${personne.nom}` : `#${m.id_p}`
  const date = new Date(m.date_mouvement).toLocaleDateString('fr-FR')
  const article = `${m.item_ref} (${m.type_item === 'MOBILIER' ? 'mobilier' : 'consommable'})`
  const qte = `${m.quantite} ${m.quantite > 1 ? 'exemplaires' : 'exemplaire'}`
  switch (m.type_mouvement) {
    case 'ATTRIBUTION': return `Le ${date}, ${qui} a reçu ${qte} de ${article}.`
    case 'RESTITUTION': return `Le ${date}, ${qui} a restitué ${qte} de ${article}.`
    case 'TRANSFERT': return `Le ${date}, ${qte} de ${article} a été transféré${m.quantite > 1 ? 's' : ''} depuis ${qui}.`
    default: return `Le ${date}, opération ${m.type_mouvement} sur ${article}.`
  }
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('fr-FR')
}

function imprimerFiche(personne, etat, mobiliers, consommables) {
  const doc = new jsPDF()

  const sex = personne.sexe === 'Masculin' ? 'Monsieur' : 'Madame'

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
  doc.text('INVENTAIRE DE MATERIEL', 70, 35)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text("DU TRIBUNAL ADMINISTRATIF D'ANTANANARIVO", 55, 40)

  doc.text('REMIS A UN DETENTEUR EFFECTIF', 70, 45)
  doc.setFontSize(9)
  doc.text('carnet', 60, 50)
  doc.setFontSize(11)
  doc.text('(BON DE DETENTEUR EFFECTIF) ', 72, 55)

  doc.setFontSize(9)
  doc.text('N° ____________', 160, 40)
  doc.text(" (d'inscription au ", 165, 45)
  doc.text('tenu dans les', 165, 55)
  doc.text("indiquées à l'article 24", 160, 60)
  doc.text('de l\'Instruction Générale)', 160, 65)

  doc.setFontSize(10)
  doc.text('Nom, grade et fonctions du dépositaire-comptable : Monsieur RAKOTOARINAIVO MAMINIAINA Jean Fidèle, ', 14, 75)
  doc.text('secrétaire du Commissariat  près le Tribunal Administratif d\'Antananarivo ;', 14, 80)
  doc.text(`Nom, grade, fonction et adresse exacte du détenteur : ${sex} ${personne.nom} ${personne.prenom}, ${personne.grade},`, 14, 90)
  doc.text(`${personne.fonction}, ${personne.adresse || 'N/C'} ;`, 14, 95)

  let y = 110

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Consommables attribués :', 14, y)
  y += 7
  doc.text('_____________________________________________________________________________________________', 14, y)
  y += 7
  doc.setFontSize(9)
  if (!etat || etat.consommables.length === 0) {
    doc.text('                     ------------------------------------              Aucun consommable attribué              ------------------------------------               ', 14, y)
    y += 10
  } else {
    etat.consommables.forEach((c, index) => {
      const lib = (consommables.find(x => x.ref_c === c.ref_c)?.libelle) || c.ref_c
      const cat = (consommables.find(x => x.ref_c === c.ref_c)?.categorie) || ''
      const ligne = `     ${index + 1}  —  Reference : ${c.ref_c}  —  Libelle : ${lib}  —  Categorie : ${cat}  —  Quantite : ${c.quantite_prendre}   (le ${formatDate(c.date_prendre)})`
      doc.text(ligne, 14, y)
      y += 5
      if (y > 280) { doc.addPage(); y = 20 }
    })
  }
  y += 5

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Mobiliers attribués', 14, y)
  y += 7
  doc.text('_____________________________________________________________________________________________', 14, y)
  y += 7
  doc.setFontSize(9)
  if (!etat || etat.mobiliers.length === 0) {
    doc.text('                     ------------------------------------              Aucun mobilier attribué              ------------------------------------               ', 14, y)
    y += 10
  } else {
    etat.mobiliers.forEach((m, index) => {
      const mob = mobiliers.find(x => x.id_m === m.id_m)
      const des = mob?.designation || m.id_m
      const eta = mob?.etat || ''
      const prov = mob?.provenance || ''
      const ligne = `     ${index + 1}  —  Designation : ${des}  —  Etat : ${eta}  —  Provenance : ${prov}  (le ${formatDate(m.date_posseder)})`
      doc.text(ligne, 14, y)
      y += 7
      if (y > 280) { doc.addPage(); y = 20 }
    })
  }

  doc.setFontSize(10)
  doc.text('_____________________________________________________________________________________________', 14, y)
  y += 7
  doc.text('En cas de perte ou de non réintégration, ces articles sont remboursés par le détenteur à leur valeur de remplacements ;', 14, y)
  y += 5
  doc.text(' les réparations de détériorations sont également à la charge du détenteur. ', 14, y)
  y += 10
  doc.text('Reconnu exact en quantités et qualité : 		                                  A Antananarivo, le_____________', 14, y)
  y += 10
  doc.text('     Le Détenteur,						                                                 Le Dépositaire-Comptable,', 14, y)
  y += 15
  doc.text('______________________ 		                                                           ______________________', 14, y)

  doc.save(`Fiche_${personne.nom}_${personne.prenom}.pdf`)
}

export default function PersonneDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personne, setPersonne] = useState(null)
  const [etat, setEtat] = useState(null)
  const [history, setHistory] = useState([])
  const [mobiliers, setMobiliers] = useState([])
  const [consommables, setConsommables] = useState([])

  useEffect(() => {
    api.get(`/personnes/${id}`).then(r => setPersonne(r.data)).catch(() => navigate('/personnes'))
    api.get(`/mouvements/etat/${id}`).then(r => setEtat(r.data)).catch(() => {})
    api.get(`/mouvements/personne/${id}`).then(r => setHistory(r.data)).catch(() => {})
    api.get('/mobiliers').then(r => setMobiliers(r.data)).catch(() => {})
    api.get('/consommables').then(r => setConsommables(r.data)).catch(() => {})
  }, [id, navigate])

  if (!personne) return <div className="loading">Chargement…</div>

  function mobilierNom(idM) {
    const m = mobiliers.find(x => x.id_m === idM)
    return m ? m.designation : idM
  }

  function consoNom(refC) {
    const c = consommables.find(x => x.ref_c === refC)
    return c ? c.libelle : refC
  }

  return (
    <div>
      <div className="page-header">
        <h1>{personne.prenom} {personne.nom}</h1>
        <div style={{display:'flex',gap:'var(--space-sm)'}}>
          <button className="btn btn-primary" onClick={() => imprimerFiche(personne, etat, mobiliers, consommables)}>
            Imprimer fiche
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/personnes')}>
            &larr; Retour
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2 className="panel-title">Informations</h2>
          <dl className="detail-dl">
            <dt>Grade</dt><dd>{personne.grade || '—'}</dd>
            <dt>Fonction</dt><dd>{personne.fonction || '—'}</dd>
            <dt>Sexe</dt><dd>{personne.sexe || '—'}</dd>
            <dt>Téléphone</dt><dd>{personne.telephone || '—'}</dd>
            <dt>Adresse</dt><dd>{personne.adresse || '—'}</dd>
          </dl>
        </div>

        <div className="panel">
          <h2 className="panel-title">Attributions en cours</h2>
          {(!etat || (etat.mobiliers.length === 0 && etat.consommables.length === 0)) ? (
            <p className="panel-empty">Aucune attribution en cours.</p>
          ) : (
            <>
              {etat.mobiliers.length > 0 && (
                <div style={{marginBottom:'var(--space-md)'}}>
                  <h3 style={{fontSize:'var(--fs-sm)',fontWeight:600,marginBottom:'var(--space-sm)',color:'var(--c-text-secondary)'}}>Mobiliers</h3>
                  <table className="data-table">
                    <thead>
                      <tr><th>Réf.</th><th>Désignation</th><th>Quantité</th><th>Depuis le</th></tr>
                    </thead>
                    <tbody>
                      {etat.mobiliers.map(m => (
                        <tr key={m.id_m}>
                          <td>{m.id_m}</td>
                          <td>{mobilierNom(m.id_m)}</td>
                          <td>{m.quantite_posseder}</td>
                          <td>{new Date(m.date_posseder).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {etat.consommables.length > 0 && (
                <div>
                  <h3 style={{fontSize:'var(--fs-sm)',fontWeight:600,marginBottom:'var(--space-sm)',color:'var(--c-text-secondary)'}}>Consommables</h3>
                  <table className="data-table">
                    <thead>
                      <tr><th>Réf.</th><th>Libellé</th><th>Quantité</th><th>Depuis le</th></tr>
                    </thead>
                    <tbody>
                      {etat.consommables.map(c => (
                        <tr key={c.ref_c}>
                          <td>{c.ref_c}</td>
                          <td>{consoNom(c.ref_c)}</td>
                          <td>{c.quantite_prendre}</td>
                          <td>{new Date(c.date_prendre).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="panel" style={{marginTop:'var(--space-lg)'}}>
        <h2 className="panel-title">Historique complet des mouvements</h2>
        {history.length === 0 ? (
          <p className="panel-empty">Aucun mouvement enregistré pour cette personne.</p>
        ) : (
          <div className="timeline">
            {history.map(m => (
              <div key={m.id} className="timeline-item">
                <span className="tl-date">{new Date(m.date_mouvement).toLocaleDateString('fr-FR')}</span>
                <span className="tl-phrase">{historyPhrase(m, personne)}</span>
                <span className="tl-badge">{badgeType(m.type_mouvement)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
