import { query } from '../../config/db.js'

export async function countPersonnes() {
  const result = await query('SELECT COUNT(*)::int AS count FROM PERSONNE')
  return result.rows[0].count
}

export async function countMobiliers() {
  const result = await query('SELECT COUNT(*)::int AS count FROM MOBILIER')
  return result.rows[0].count
}

export async function countConsommables() {
  const result = await query('SELECT COUNT(*)::int AS count FROM CONSOMMABLE')
  return result.rows[0].count
}

export async function totalMobilierAttribue() {
  const result = await query('SELECT COALESCE(SUM(quantite_posseder), 0)::int AS count FROM POSSEDER')
  return result.rows[0].count
}

export async function totalConsommableStock() {
  const result = await query('SELECT COALESCE(SUM(qte), 0)::int AS count FROM CONSOMMABLE')
  return result.rows[0].count
}

export async function countMouvementsThisMonth() {
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM MOUVEMENT
     WHERE date_mouvement >= date_trunc('month', CURRENT_DATE)`
  )
  return result.rows[0].count
}

export async function topLowStockItems(limit = 3) {
  const result = await query(
    'SELECT ref_c, libelle, qte FROM CONSOMMABLE ORDER BY qte ASC LIMIT $1',
    [limit]
  )
  return result.rows
}

export async function topAttributedMobiliers(limit = 3) {
  const result = await query(
    `SELECT p.id_m, m.designation, SUM(p.quantite_posseder)::int AS total
     FROM POSSEDER p
     JOIN MOBILIER m ON m.id_m = p.id_m
     GROUP BY p.id_m, m.designation
     ORDER BY total DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}

export async function mouvementsByDay(days = 30) {
  const result = await query(
    `SELECT
       DATE(date_mouvement) AS jour,
       type_mouvement,
       COUNT(*)::int AS count
     FROM MOUVEMENT
     WHERE date_mouvement >= CURRENT_DATE - $1::int
     GROUP BY DATE(date_mouvement), type_mouvement
     ORDER BY jour ASC`,
    [days]
  )
  return result.rows
}
