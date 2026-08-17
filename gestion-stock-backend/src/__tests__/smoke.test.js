import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'

const api = request(app)

async function clearData() {
  await pool.query(`
    TRUNCATE TABLE
      MOUVEMENT, POSSEDER, PRENDRE, refresh_tokens, CONSOMMABLE, MOBILIER, PERSONNE, user_account
    RESTART IDENTITY CASCADE
  `)
}

let agent

beforeAll(async () => {
  await clearData()

  const hash = await bcrypt.hash('test_pass', 10)
  await pool.query(
    `INSERT INTO user_account (username, password_hash, role) VALUES ($1, $2, $3)`,
    ['admin', hash, 'admin']
  )

  agent = request.agent(app)
})

afterAll(async () => {
  await clearData()
  await pool.end()
})

describe('Auth', () => {
  it('POST /api/auth/login - succès', async () => {
    const res = await api.post('/api/auth/login').send({ username: 'admin', password: 'test_pass' })
    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.username).toBe('admin')
  })

  it('POST /api/auth/login - mauvais mot de passe', async () => {
    const res = await api.post('/api/auth/login').send({ username: 'admin', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Identifiants incorrects')
  })

  it('GET /api/personnes - 401 sans token', async () => {
    const res = await api.get('/api/personnes')
    expect(res.status).toBe(401)
  })
})

describe('Mouvements', () => {
  let cookies

  beforeAll(async () => {
    const res = await api.post('/api/auth/login').send({ username: 'admin', password: 'test_pass' })
    cookies = res.headers['set-cookie']
  })

  it('attribution mobilier crée MOUVEMENT et POSSEDER', async () => {
    await api.post('/api/personnes').set('Cookie', cookies).send({
      nom: 'Test', prenom: 'User', sexe: 'Masculin', grade: 'Agent', fonction: 'Test', adresse: 'N/A', telephone: '000',
    })
    await api.post('/api/mobiliers').set('Cookie', cookies).send({ id_m: 'B001', designation: 'Bureau' })

    const res = await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'MOBILIER', item_ref: 'B001', type_mouvement: 'ATTRIBUTION', quantite: 1,
    })

    expect(res.status).toBe(201)
    expect(res.body.type_mouvement).toBe('ATTRIBUTION')

    const { rows: mouvements } = await pool.query("SELECT * FROM MOUVEMENT WHERE item_ref = 'B001'")
    expect(mouvements.length).toBe(1)
    expect(mouvements[0].quantite).toBe(1)

    const { rows: posseder } = await pool.query("SELECT * FROM POSSEDER WHERE id_m = 'B001'")
    expect(posseder.length).toBe(1)
    expect(posseder[0].quantite_posseder).toBe(1)
  })

  it('attribution consommable décrémente le stock', async () => {
    await api.post('/api/consommables').set('Cookie', cookies).send({ ref_c: 'RAM01', libelle: 'Ramette', qte: 50 })

    const res = await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'CONSOMMABLE', item_ref: 'RAM01', type_mouvement: 'ATTRIBUTION', quantite: 10,
    })

    expect(res.status).toBe(201)

    const { rows: conso } = await pool.query("SELECT qte FROM CONSOMMABLE WHERE ref_c = 'RAM01'")
    expect(conso[0].qte).toBe(40)
  })

  it('attribution consommable au-dessus du stock est rejetée', async () => {
    const res = await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'CONSOMMABLE', item_ref: 'RAM01', type_mouvement: 'ATTRIBUTION', quantite: 100,
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Stock insuffisant')

    const { rows: conso } = await pool.query("SELECT qte FROM CONSOMMABLE WHERE ref_c = 'RAM01'")
    expect(conso[0].qte).toBe(40)
  })

  it('restitution mobilier', async () => {
    const res = await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'MOBILIER', item_ref: 'B001', type_mouvement: 'RESTITUTION', quantite: 1,
    })
    expect(res.status).toBe(201)

    const { rows: posseder } = await pool.query("SELECT * FROM POSSEDER WHERE id_m = 'B001'")
    expect(posseder.length).toBe(0)

    const { rows: mouvements } = await pool.query(
      "SELECT * FROM MOUVEMENT WHERE item_ref = 'B001' AND type_mouvement = 'RESTITUTION'"
    )
    expect(mouvements.length).toBe(1)
  })

  it('restitution sans possession préalable est rejetée', async () => {
    const res = await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'MOBILIER', item_ref: 'B001', type_mouvement: 'RESTITUTION', quantite: 1,
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Aucune quantité à restituer')
  })

  it('restitution consommable remet à jour le stock', async () => {
    await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'CONSOMMABLE', item_ref: 'RAM01', type_mouvement: 'RESTITUTION', quantite: 5,
    })
    const { rows: conso } = await pool.query("SELECT qte FROM CONSOMMABLE WHERE ref_c = 'RAM01'")
    expect(conso[0].qte).toBe(45)
  })

  it('transfert mobilier entre deux personnes', async () => {
    await api.post('/api/personnes').set('Cookie', cookies).send({
      nom: 'Second', prenom: 'User', sexe: 'Féminin', grade: 'Agent', fonction: 'Test', adresse: 'N/A', telephone: '000',
    })
    await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'MOBILIER', item_ref: 'B001', type_mouvement: 'ATTRIBUTION', quantite: 1,
    })
    const res = await api.post('/api/mouvements').set('Cookie', cookies).send({
      id_p: 1, type_item: 'MOBILIER', item_ref: 'B001', type_mouvement: 'TRANSFERT', quantite: 1, id_p_dest: 2,
    })
    expect(res.status).toBe(201)

    const { rows: source } = await pool.query("SELECT * FROM POSSEDER WHERE id_p = 1 AND id_m = 'B001'")
    expect(source.length).toBe(0)

    const { rows: dest } = await pool.query("SELECT quantite_posseder FROM POSSEDER WHERE id_p = 2 AND id_m = 'B001'")
    expect(dest[0].quantite_posseder).toBe(1)
  })
})
