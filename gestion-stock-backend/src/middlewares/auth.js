import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function auth(req, res, next) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' })
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)
    req.user = { id: payload.id, username: payload.username, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}
