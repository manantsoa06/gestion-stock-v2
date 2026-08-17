import * as model from './dashboard.model.js'

export async function getStats() {
  const [
    personnes, mobiliers, consommables, mobilierAttribue, consoStock,
    mouvementsCeMois, topStockFaible, topMobiliers, mouvementsParJour,
  ] = await Promise.all([
    model.countPersonnes(),
    model.countMobiliers(),
    model.countConsommables(),
    model.totalMobilierAttribue(),
    model.totalConsommableStock(),
    model.countMouvementsThisMonth(),
    model.topLowStockItems(),
    model.topAttributedMobiliers(),
    model.mouvementsByDay(30),
  ])
  return {
    personnes,
    mobiliers,
    consommables,
    mobilier_attribue: mobilierAttribue,
    conso_stock: consoStock,
    mouvements_ce_mois: mouvementsCeMois,
    top_stock_faible: topStockFaible,
    top_mobiliers_attribues: topMobiliers,
    mouvements_par_jour: mouvementsParJour,
  }
}
