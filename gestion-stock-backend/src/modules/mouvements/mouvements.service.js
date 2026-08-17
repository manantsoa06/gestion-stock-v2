import { pool } from '../../config/db.js'
import * as model from './mouvements.model.js'

export async function getAll() {
  return model.getAllMouvements()
}

export async function getByPersonne(idP) {
  return model.findMouvementsByPersonne(idP)
}

export async function getByItem(typeItem, itemRef) {
  return model.findMouvementsByItem(typeItem, itemRef)
}

export async function getCurrentState(idP) {
  const [mobiliers, consommables] = await Promise.all([
    model.findPossederByPersonne(idP),
    model.findPrendreByPersonne(idP),
  ])
  return { mobiliers, consommables }
}

export async function create(data, userId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (data.type_item === 'CONSOMMABLE') {
      const stock = await model.getConsommableStock(data.item_ref, client)
      if (stock === null) {
        const err = new Error('Consommable introuvable')
        err.statusCode = 404
        err.expose = true
        throw err
      }
      if (data.type_mouvement === 'ATTRIBUTION' && data.quantite > stock) {
        const message = `Stock insuffisant : ${stock} disponible(s), ${data.quantite} demandé(s)`
        const err = new Error(message)
        err.statusCode = 400
        err.expose = true
        throw err
      }
    }

    const mouvement = await model.createMouvement({
      user_id: userId,
      id_p: data.id_p ?? null,
      type_item: data.type_item,
      item_ref: data.item_ref,
      type_mouvement: data.type_mouvement,
      quantite: data.quantite,
      commentaire: data.commentaire || null,
    }, client)

    switch (data.type_mouvement) {
      case 'APPROVISIONNEMENT':
        await model.updateConsommableStock(data.item_ref, data.quantite, client)
        break
      case 'ATTRIBUTION':
        if (data.type_item === 'MOBILIER') {
          await model.setPosseder(data.id_p, data.item_ref, new Date(), client)
        } else {
          await model.upsertPrendre(data.id_p, data.item_ref, data.quantite, new Date(), client)
          await model.updateConsommableStock(data.item_ref, -data.quantite, client)
        }
        break

      case 'RESTITUTION': {
        const ok = data.type_item === 'MOBILIER'
          ? await model.decrementPosseder(data.id_p, data.item_ref, data.quantite, client)
          : await model.decrementPrendre(data.id_p, data.item_ref, data.quantite, client)
        if (ok === null) {
          const err = new Error('Aucune quantité à restituer pour cet article')
          err.statusCode = 400
          err.expose = true
          throw err
        }
        if (data.type_item === 'CONSOMMABLE') {
          await model.updateConsommableStock(data.item_ref, data.quantite, client)
        }
        break
      }

      case 'TRANSFERT':
        if (!data.id_p_dest) {
          const err = new Error('id_p_dest requis pour un transfert')
          err.statusCode = 400
          err.expose = true
          throw err
        }
        if (data.id_p === data.id_p_dest) {
          const err = new Error('La personne source et destination sont identiques')
          err.statusCode = 400
          err.expose = true
          throw err
        }
        const decOk = data.type_item === 'MOBILIER'
          ? await model.decrementPosseder(data.id_p, data.item_ref, data.quantite, client)
          : await model.decrementPrendre(data.id_p, data.item_ref, data.quantite, client)
        if (decOk === null) {
          const err = new Error('Aucune quantité à transférer pour cet article')
          err.statusCode = 400
          err.expose = true
          throw err
        }
        if (data.type_item === 'MOBILIER') {
          await model.setPosseder(data.id_p_dest, data.item_ref, new Date(), client)
        } else {
          await model.upsertPrendre(data.id_p_dest, data.item_ref, data.quantite, new Date(), client)
        }
        await model.createMouvement({
          user_id: userId,
          id_p: data.id_p_dest,
          type_item: data.type_item,
          item_ref: data.item_ref,
          type_mouvement: 'ATTRIBUTION',
          quantite: data.quantite,
          commentaire: `Transfert depuis ${data.id_p}`,
        }, client)
        break
    }

    await client.query('COMMIT')
    return mouvement
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
