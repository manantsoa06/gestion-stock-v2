import { query } from '../../config/db.js'

export async function findAll() {
  const result = await query('SELECT * FROM MOBILIER ORDER BY designation')
  return result.rows
}

export async function findById(id) {
  const result = await query('SELECT * FROM MOBILIER WHERE id_m = $1', [id])
  return result.rows[0] || null
}

export async function create(data) {
  const result = await query(
    `INSERT INTO MOBILIER (id_m, designation, nomenclature, espece, pu, provenance, etat, observation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.id_m, data.designation, data.nomenclature, data.espece, data.pu, data.provenance, data.etat, data.observation]
  )
  return result.rows[0]
}

export async function update(id, data) {
  const result = await query(
    `UPDATE MOBILIER SET designation = $1, nomenclature = $2, espece = $3, pu = $4, provenance = $5, etat = $6, observation = $7
     WHERE id_m = $8 RETURNING *`,
    [data.designation, data.nomenclature, data.espece, data.pu, data.provenance, data.etat, data.observation, id]
  )
  return result.rows[0] || null
}

export async function remove(id) {
  const result = await query('DELETE FROM MOBILIER WHERE id_m = $1 RETURNING id_m', [id])
  return result.rows[0] || null
}
