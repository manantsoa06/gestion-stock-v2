import { query } from '../../config/db.js'

export async function findAll() {
  const result = await query('SELECT * FROM PERSONNE ORDER BY nom, prenom')
  return result.rows
}

export async function findById(id) {
  const result = await query('SELECT * FROM PERSONNE WHERE id_p = $1', [id])
  return result.rows[0] || null
}

export async function create(data) {
  const result = await query(
    `INSERT INTO PERSONNE (nom, prenom, sexe, grade, fonction, adresse, telephone)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.nom, data.prenom, data.sexe, data.grade, data.fonction, data.adresse, data.telephone]
  )
  return result.rows[0]
}

export async function update(id, data) {
  const result = await query(
    `UPDATE PERSONNE SET nom = $1, prenom = $2, sexe = $3, grade = $4, fonction = $5, adresse = $6, telephone = $7
     WHERE id_p = $8 RETURNING *`,
    [data.nom, data.prenom, data.sexe, data.grade, data.fonction, data.adresse, data.telephone, id]
  )
  return result.rows[0] || null
}

export async function remove(id) {
  const result = await query('DELETE FROM PERSONNE WHERE id_p = $1 RETURNING id_p', [id])
  return result.rows[0] || null
}
