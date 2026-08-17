import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middlewares/validate.js'
import * as service from './personnes.service.js'

const router = Router()

const personneSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  prenom: z.string().max(100).optional().default(''),
  sexe: z.string().min(1, 'Le sexe est requis').max(10),
  grade: z.string().min(1, 'Le grade est requis').max(100),
  fonction: z.string().min(1, 'La fonction est requise').max(100),
  adresse: z.string().min(1, "L'adresse est requise"),
  telephone: z.string().min(1, 'Le téléphone est requis').max(30),
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

router.post('/', validate(personneSchema), async (req, res, next) => {
  try {
    const item = await service.create(req.validatedBody)
    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.put('/:id', validate(personneSchema), async (req, res, next) => {
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
