import pg from 'pg'
import { env } from './env.js'

export const pool = new pg.Pool({
  host: env.DB.host,
  port: env.DB.port,
  database: env.DB.database,
  user: env.DB.user,
  password: env.DB.password,
})

pool.on('error', (err) => {
  console.error('Erreur inattendue sur le pool PostgreSQL :', err)
})

export async function query(text, params) {
  return pool.query(text, params)
}
