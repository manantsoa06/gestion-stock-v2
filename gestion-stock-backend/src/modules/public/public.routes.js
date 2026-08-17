import { Router } from 'express'

const router = Router()

router.get('/info', (_req, res) => {
  res.json({
    tribunal: 'Tribunal Administratif',
    description: 'Application de gestion de stock de matériels et biens immobiliers.',
  })
})

export default router
