import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middlewares/validate.js'
import * as service from './consommables.service.js'

const router = Router()

const consommableSchema = z.object({
  ref_c: z.string().min(1).max(30),
  libelle: z.string().min(1).max(150),
  categorie: z.string().max(100).optional().default(''),
  qte: z.number().int().min(0).default(0),
})

router.get('/', async (_req, res, next) => {
  try {
    const items = await service.getAll()
    res.json(items)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const item = await service.getById(req.params.id)
    res.json(item)
  } catch (err) { next(err) }
})

router.post('/', validate(consommableSchema), async (req, res, next) => {
  try {
    const item = await service.create(req.validatedBody)
    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.put('/:id', validate(consommableSchema), async (req, res, next) => {
  try {
    const item = await service.update(req.params.id, req.validatedBody)
    res.json(item)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await service.remove(req.params.id)
    res.status(204).end()
  } catch (err) { next(err) }
})

export default router
