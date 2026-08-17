import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middlewares/validate.js'
import * as service from './mouvements.service.js'

const router = Router()

const mouvementSchema = z.object({
  id_p: z.number().int().positive().optional(),
  type_item: z.enum(['MOBILIER', 'CONSOMMABLE']),
  item_ref: z.string().min(1),
  type_mouvement: z.enum(['ATTRIBUTION', 'RESTITUTION', 'TRANSFERT', 'APPROVISIONNEMENT']),
  quantite: z.number().int().positive(),
  commentaire: z.string().optional(),
  id_p_dest: z.number().int().positive().optional(),
}).refine(
  data => data.type_item !== 'MOBILIER' || data.quantite === 1,
  { message: 'Un mobilier ne peut être mouvementé qu\'à l\'unité', path: ['quantite'] }
).refine(
  data => data.type_mouvement !== 'APPROVISIONNEMENT' || data.type_item === 'CONSOMMABLE',
  { message: 'Seuls les consommables peuvent être réapprovisionnés', path: ['type_item'] }
).refine(
  data => data.type_mouvement !== 'APPROVISIONNEMENT' || !data.id_p,
  { message: 'Un réapprovisionnement n\'est pas lié à une personne', path: ['id_p'] }
).refine(
  data => data.type_mouvement === 'APPROVISIONNEMENT' || data.id_p != null,
  { message: 'Une personne est requise pour ce type de mouvement', path: ['id_p'] }
)

router.get('/', async (_req, res, next) => {
  try {
    const items = await service.getAll()
    res.json(items)
  } catch (err) { next(err) }
})

router.get('/personne/:idP', async (req, res, next) => {
  try {
    const items = await service.getByPersonne(parseInt(req.params.idP, 10))
    res.json(items)
  } catch (err) { next(err) }
})

router.get('/item/:typeItem/:itemRef', async (req, res, next) => {
  try {
    const items = await service.getByItem(req.params.typeItem, req.params.itemRef)
    res.json(items)
  } catch (err) { next(err) }
})

router.get('/etat/:idP', async (req, res, next) => {
  try {
    const state = await service.getCurrentState(parseInt(req.params.idP, 10))
    res.json(state)
  } catch (err) { next(err) }
})

router.post('/', validate(mouvementSchema), async (req, res, next) => {
  try {
    const item = await service.create(req.validatedBody, req.user.id)
    res.status(201).json(item)
  } catch (err) { next(err) }
})

export default router
