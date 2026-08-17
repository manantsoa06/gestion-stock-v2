import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../../config/env.js'
import * as authModel from './auth.model.js'

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function login(username, password) {
  const user = await authModel.findUserByUsername(username)
  if (!user) {
    const err = new Error('Identifiants incorrects')
    err.statusCode = 401
    err.expose = true
    throw err
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    const err = new Error('Identifiants incorrects')
    err.statusCode = 401
    err.expose = true
    throw err
  }

  const accessToken = signAccessToken(user)

  const refreshToken = crypto.randomBytes(40).toString('hex')
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000)
  await authModel.saveRefreshToken(user.id, tokenHash, expiresAt)

  return { accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role } }
}

export async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken)
  const stored = await authModel.findRefreshToken(tokenHash)
  if (!stored) {
    const err = new Error('Refresh token invalide ou expiré')
    err.statusCode = 401
    err.expose = true
    throw err
  }

  const user = await authModel.findUserById(stored.user_id)
  if (!user) {
    const err = new Error('Utilisateur introuvable')
    err.statusCode = 401
    err.expose = true
    throw err
  }

  await authModel.revokeRefreshToken(tokenHash)

  const accessToken = signAccessToken(user)

  const newRefreshToken = crypto.randomBytes(40).toString('hex')
  const newTokenHash = hashToken(newRefreshToken)
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000)
  await authModel.saveRefreshToken(user.id, newTokenHash, expiresAt)

  return { accessToken, refreshToken: newRefreshToken, user: { id: user.id, username: user.username, role: user.role } }
}

export async function logout(refreshToken) {
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await authModel.revokeRefreshToken(tokenHash)
  }
}

export async function getMe(userId) {
  const user = await authModel.findUserById(userId)
  if (!user) {
    const err = new Error('Utilisateur introuvable')
    err.statusCode = 404
    err.expose = true
    throw err
  }
  return user
}
