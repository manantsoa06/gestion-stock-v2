import { query } from '../../config/db.js'

export async function createMouvement(data, client) {
  const q = client || { query }
  const result = await q.query(
    `INSERT INTO MOUVEMENT (user_id, id_p, type_item, item_ref, type_mouvement, quantite, commentaire)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.user_id, data.id_p, data.type_item, data.item_ref, data.type_mouvement, data.quantite, data.commentaire]
  )
  return result.rows[0]
}

export async function getAllMouvements() {
  const result = await query('SELECT * FROM MOUVEMENT ORDER BY date_mouvement DESC')
  return result.rows
}

export async function findMouvementsByPersonne(idP) {
  const result = await query(
    'SELECT * FROM MOUVEMENT WHERE id_p = $1 ORDER BY date_mouvement DESC',
    [idP]
  )
  return result.rows
}

export async function findMouvementsByItem(typeItem, itemRef) {
  const result = await query(
    'SELECT * FROM MOUVEMENT WHERE type_item = $1 AND item_ref = $2 ORDER BY date_mouvement DESC',
    [typeItem, itemRef]
  )
  return result.rows
}

export async function findPossederByPersonne(idP) {
  const result = await query('SELECT * FROM POSSEDER WHERE id_p = $1', [idP])
  return result.rows
}

export async function findPrendreByPersonne(idP) {
  const result = await query('SELECT * FROM PRENDRE WHERE id_p = $1', [idP])
  return result.rows
}

export async function setPosseder(idP, idM, date, client) {
  const q = client || { query }
  await q.query(
    `INSERT INTO POSSEDER (id_p, id_m, date_posseder, quantite_posseder)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (id_p, id_m)
     DO UPDATE SET quantite_posseder = 1, date_posseder = EXCLUDED.date_posseder`,
    [idP, idM, date]
  )
}

export async function upsertPosseder(idP, idM, quantite, date, client) {
  const q = client || { query }
  await q.query(
    `INSERT INTO POSSEDER (id_p, id_m, date_posseder, quantite_posseder)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_p, id_m)
     DO UPDATE SET quantite_posseder = POSSEDER.quantite_posseder + EXCLUDED.quantite_posseder, date_posseder = EXCLUDED.date_posseder`,
    [idP, idM, date, quantite]
  )
}

export async function upsertPrendre(idP, refC, quantite, date, client) {
  const q = client || { query }
  await q.query(
    `INSERT INTO PRENDRE (id_p, ref_c, date_prendre, quantite_prendre)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_p, ref_c)
     DO UPDATE SET quantite_prendre = PRENDRE.quantite_prendre + EXCLUDED.quantite_prendre, date_prendre = EXCLUDED.date_prendre`,
    [idP, refC, date, quantite]
  )
}

export async function decrementPosseder(idP, idM, quantite, client) {
  const q = client || { query }
  const current = await q.query('SELECT quantite_posseder FROM POSSEDER WHERE id_p = $1 AND id_m = $2', [idP, idM])
  if (current.rows.length === 0) return null
  const newQte = current.rows[0].quantite_posseder - quantite
  if (newQte <= 0) {
    await q.query('DELETE FROM POSSEDER WHERE id_p = $1 AND id_m = $2', [idP, idM])
  } else {
    await q.query('UPDATE POSSEDER SET quantite_posseder = $1 WHERE id_p = $2 AND id_m = $3', [newQte, idP, idM])
  }
  return true
}

export async function decrementPrendre(idP, refC, quantite, client) {
  const q = client || { query }
  const current = await q.query('SELECT quantite_prendre FROM PRENDRE WHERE id_p = $1 AND ref_c = $2', [idP, refC])
  if (current.rows.length === 0) return null
  const newQte = current.rows[0].quantite_prendre - quantite
  if (newQte <= 0) {
    await q.query('DELETE FROM PRENDRE WHERE id_p = $1 AND ref_c = $2', [idP, refC])
  } else {
    await q.query('UPDATE PRENDRE SET quantite_prendre = $1 WHERE id_p = $2 AND ref_c = $3', [newQte, idP, refC])
  }
  return true
}

export async function getConsommableStock(refC, client) {
  const q = client || { query }
  const result = await q.query('SELECT qte FROM CONSOMMABLE WHERE ref_c = $1', [refC])
  return result.rows[0]?.qte ?? null
}

export async function updateConsommableStock(refC, delta, client) {
  const q = client || { query }
  const result = await q.query(
    'UPDATE CONSOMMABLE SET qte = qte + $1 WHERE ref_c = $2 RETURNING qte',
    [delta, refC]
  )
  return result.rows[0]?.qte
}
