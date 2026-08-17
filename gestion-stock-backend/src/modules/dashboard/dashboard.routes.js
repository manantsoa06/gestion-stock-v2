import { Router } from 'express'
import * as service from './dashboard.service.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const stats = await service.getStats()
    res.json(stats)
  } catch (err) { next(err) }
})

export default router
