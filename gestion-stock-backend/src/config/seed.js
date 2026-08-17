import bcrypt from 'bcryptjs'
import { query } from './db.js'
import { env } from './env.js'

export async function seedAdmin() {
  const existing = await query('SELECT id FROM user_account WHERE username = $1', [env.SEED_ADMIN_USERNAME])
  if (existing.rows.length > 0) {
    console.log('Compte admin existe déjà, seed ignoré.')
    return
  }

  const hash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10)
  await query(
    'INSERT INTO user_account (username, password_hash, role) VALUES ($1, $2, $3)',
    [env.SEED_ADMIN_USERNAME, hash, 'admin']
  )
  console.log(`Compte admin "${env.SEED_ADMIN_USERNAME}" créé.`)
}
