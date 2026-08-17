import * as model from './consommables.model.js'

export async function getAll() {
  return model.findAll()
}

export async function getById(id) {
  const item = await model.findById(id)
  if (!item) {
    const err = new Error('Consommable introuvable')
    err.statusCode = 404
    err.expose = true
    throw err
  }
  return item
}

export async function create(data) {
  return model.create(data)
}

export async function update(id, data) {
  const item = await model.update(id, data)
  if (!item) {
    const err = new Error('Consommable introuvable')
    err.statusCode = 404
    err.expose = true
    throw err
  }
  return item
}

export async function remove(id) {
  const item = await model.remove(id)
  if (!item) {
    const err = new Error('Consommable introuvable')
    err.statusCode = 404
    err.expose = true
    throw err
  }
  return item
}
