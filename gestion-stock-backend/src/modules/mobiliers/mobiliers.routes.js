import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middlewares/validate.js'
import * as service from './mobiliers.service.js'

const router = Router()

const mobilierSchema = z.object({
  id_m: z.string().min(1).max(30),
  designation: z.string().min(1).max(150),
  nomenclature: z.string().max(150).optional().default(''),
  espece: z.string().max(100).optional().default(''),
  pu: z.number().positive().optional(),
  provenance: z.string().max(150).optional().default(''),
  etat: z.string().max(50).optional().default(''),
  observation: z.string().optional().default(''),
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

router.post('/', validate(mobilierSchema), async (req, res, next) => {
  try {
    const item = await service.create(req.validatedBody)
    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.put('/:id', validate(mobilierSchema), async (req, res, next) => {
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
