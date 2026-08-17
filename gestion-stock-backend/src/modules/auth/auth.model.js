import { query } from '../../config/db.js'

export async function findUserByUsername(username) {
  const result = await query('SELECT * FROM user_account WHERE username = $1', [username])
  return result.rows[0] || null
}

export async function findUserById(id) {
  const result = await query('SELECT id, username, role FROM user_account WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function saveRefreshToken(userId, tokenHash, expiresAt) {
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  )
}

export async function findRefreshToken(tokenHash) {
  const result = await query(
    'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  )
  return result.rows[0] || null
}

export async function revokeRefreshToken(tokenHash) {
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash])
}

export async function revokeAllUserTokens(userId) {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId])
}
