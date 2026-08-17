import { query } from '../../config/db.js'

export async function findAll() {
  const result = await query('SELECT * FROM CONSOMMABLE ORDER BY libelle')
  return result.rows
}

export async function findById(id) {
  const result = await query('SELECT * FROM CONSOMMABLE WHERE ref_c = $1', [id])
  return result.rows[0] || null
}

export async function create(data) {
  const result = await query(
    `INSERT INTO CONSOMMABLE (ref_c, libelle, categorie, qte)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.ref_c, data.libelle, data.categorie, data.qte]
  )
  return result.rows[0]
}

export async function update(id, data) {
  const result = await query(
    `UPDATE CONSOMMABLE SET libelle = $1, categorie = $2, qte = $3 WHERE ref_c = $4 RETURNING *`,
    [data.libelle, data.categorie, data.qte, id]
  )
  return result.rows[0] || null
}

export async function remove(id) {
  const result = await query('DELETE FROM CONSOMMABLE WHERE ref_c = $1 RETURNING ref_c', [id])
  return result.rows[0] || null
}

export async function updateStock(refC, delta) {
  const result = await query(
    'UPDATE CONSOMMABLE SET qte = qte + $1 WHERE ref_c = $2 RETURNING *',
    [delta, refC]
  )
  return result.rows[0] || null
}
