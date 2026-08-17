import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/config/db.js'
import { seedAdmin } from '../src/config/seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT now()
      )
    `)

    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const { rows } = await client.query('SELECT id FROM _migrations WHERE filename = $1', [file])
      if (rows.length > 0) {
        console.log(`  ✓ ${file} déjà appliquée`)
        continue
      }

      const sql = fs.readFileSync(path.join(__dirname, file), 'utf-8')
      console.log(`  → Application de ${file}...`)
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      console.log(`  ✓ ${file} appliquée`)
    }

    await seedAdmin()

    console.log('Migration terminée avec succès.')
  } finally {
    client.release()
  }
}

migrate().catch(err => {
  console.error('Erreur de migration :', err)
  process.exit(1)
})
