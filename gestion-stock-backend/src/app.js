import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { auth } from './middlewares/auth.js'
import { errorHandler } from './middlewares/errorHandler.js'
import authRoutes from './modules/auth/auth.routes.js'
import personnesRoutes from './modules/personnes/personnes.routes.js'
import mobiliersRoutes from './modules/mobiliers/mobiliers.routes.js'
import consommablesRoutes from './modules/consommables/consommables.routes.js'
import mouvementsRoutes from './modules/mouvements/mouvements.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import publicRoutes from './modules/public/public.routes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/personnes', auth, personnesRoutes)
app.use('/api/mobiliers', auth, mobiliersRoutes)
app.use('/api/consommables', auth, consommablesRoutes)
app.use('/api/mouvements', auth, mouvementsRoutes)
app.use('/api/dashboard', auth, dashboardRoutes)

app.use(errorHandler)

export default app
