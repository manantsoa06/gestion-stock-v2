import { query, pool } from '../src/config/db.js'

// Ne JAMAIS référencer la table user_account dans ce script

const userId = 1

function daysAgo(n) {
  const d = new Date(Date.now() - n * 86400000)
  return d.toISOString().slice(0, 10)
}

const PERSONNES = [
  ['Rakoto', 'Jean', 'Masculin', 'Magistrat', 'Président du tribunal'],
  ['Randriana', 'Solo', 'Masculin', 'Greffier', 'Greffe'],
  ['Rabe', 'Mamy', 'Féminin', 'Comptable', 'Comptabilité'],
  ['Razafy', 'Lala', 'Féminin', 'Secrétaire', 'Secrétariat'],
  ['Andrian', 'Tovo', 'Masculin', 'Greffier', 'Greffe'],
  ['Ramanana', 'Niry', 'Féminin', 'Magistrat', 'Juge'],
  ['Rakotoarisoa', 'Vero', 'Féminin', 'Agent administratif', 'Services généraux'],
  ['Rajaonarison', 'Hery', 'Masculin', 'Magistrat', 'Vice-président'],
  ['Rasolofo', 'Mialy', 'Féminin', 'Greffier', 'Greffe'],
  ['Randrianarisoa', 'Feno', 'Masculin', 'Comptable', 'Comptabilité'],
  ['Rakotondrabe', 'Tiana', 'Féminin', 'Secrétaire', 'Secrétariat'],
  ['Andriambahiny', 'Soa', 'Féminin', 'Agent administratif', 'Archives'],
  ['Ralanto', 'Mika', 'Masculin', 'Chauffeur', 'Parc auto'],
  ['Ralison', 'Jocelyn', 'Masculin', 'Agent administratif', 'Courrier'],
  ['Razakamanana', 'Bako', 'Féminin', 'Agent administratif', 'Nettoyage'],
  ['Randriamiandrisoa', 'Tafita', 'Masculin', 'Greffier', 'Greffe'],
  ['Rafanomezantsoa', 'Nantenaina', 'Masculin', 'Magistrat', 'Juge'],
  ['Ravao', 'Voahangy', 'Féminin', 'Agent administratif', 'Accueil'],
  ['Rakotoarimanana', 'Miora', 'Féminin', 'Secrétaire', 'Secrétariat'],
  ['Ratsimbazafy', 'Tolotra', 'Masculin', 'Agent administratif', 'Informatique'],
]

const MOBILIERS = [
  ['BUR01', 'Bureau présidentiel en bois massif', 'Mobilier', 'Bureau', 250000, 'Marché public 2023', 'Bon', null],
  ['BUR02', 'Bureau standard avec caisson', 'Mobilier', 'Bureau', 120000, 'Marché public 2023', 'Bon', null],
  ['BUR03', 'Bureau standard petit format', 'Mobilier', 'Bureau', 90000, 'Marché public 2024', 'Neuf', null],
  ['CHA01', 'Chaise de bureau ergonomique', 'Mobilier', 'Siège', 85000, 'Fournisseur agréé', 'Neuf', null],
  ['CHA02', 'Chaise visiteur', 'Mobilier', 'Siège', 35000, 'Fournisseur agréé', 'Bon', null],
  ['CHA03', 'Fauteuil de direction', 'Mobilier', 'Siège', 180000, 'Marché public 2023', 'Bon', null],
  ['ORD01', 'Ordinateur fixe Dell', 'Informatique', 'Matériel', 900000, 'DNI', 'Bon', null],
  ['ORD02', 'Ordinateur portable Lenovo', 'Informatique', 'Matériel', 1200000, 'DNI', 'Neuf', null],
  ['ORD03', 'Ordinateur fixe HP', 'Informatique', 'Matériel', 850000, 'DNI', 'Bon', null],
  ['IMP01', 'Imprimante laser HP', 'Informatique', 'Périphérique', 450000, 'DNI', 'Bon', null],
  ['IMP02', 'Imprimante multifonction Canon', 'Informatique', 'Périphérique', 580000, 'DNI', 'Neuf', null],
  ['ARM01', 'Armoire métallique 2 battants', 'Mobilier', 'Rangement', 200000, 'Marché public 2022', 'À réparer', 'Poignée gauche cassée'],
  ['ARM02', 'Armoire métallique 4 battants', 'Mobilier', 'Rangement', 320000, 'Marché public 2024', 'Neuf', null],
  ['TAB01', 'Table de conférence 6 places', 'Mobilier', 'Table', 350000, 'Marché public 2023', 'Bon', null],
  ['TAB02', 'Table bureau auxiliaire', 'Mobilier', 'Table', 75000, 'Fournisseur agréé', 'Bon', null],
  ['ETG01', 'Étagère bibliothèque métallique', 'Mobilier', 'Rangement', 150000, 'Marché public 2022', 'Dégradé', 'Étagère du milieu tordue'],
  ['CLIM01', 'Climatiseur split 9000 BTU', 'Informatique', 'Équipement', 650000, 'Marché public 2024', 'Neuf', null],
  ['TELE01', 'Téléphone fixe Gigaset', 'Informatique', 'Périphérique', 35000, 'Fournisseur agréé', 'Bon', null],
  ['SCAN01', 'Scanner documentaire', 'Informatique', 'Périphérique', 380000, 'DNI', 'Neuf', null],
]

const CONSOMMABLES = [
  ['RAM', 'Ramette A4 80g', 'Papeterie', 40],
  ['RAMA4C', 'Ramette A4 couleur 80g', 'Papeterie', 8],
  ['RAMA3', 'Ramette A3 80g', 'Papeterie', 6],
  ['STYLOB', 'Stylo bille bleu', 'Papeterie', 25],
  ['STYLOR', 'Stylo bille rouge', 'Papeterie', 15],
  ['STYLON', 'Stylo bille noir', 'Papeterie', 20],
  ['TONER', 'Toner HP 1 (CF280X)', 'Informatique', 2],
  ['TONERC', 'Toner Canon (CRG-137)', 'Informatique', 1],
  ['CLAS', 'Classeur 3 anneaux A4', 'Fournitures', 25],
  ['ENV', 'Enveloppe A4 kraft', 'Papeterie', 50],
  ['POST', 'Bloc Post-it 76×76mm', 'Papeterie', 7],
  ['AGRAF', 'Boîte agrafes 24/6', 'Fournitures', 5],
  ['RUBAN', 'Ruban adhésif transparent', 'Fournitures', 3],
  ['CAHIER', 'Cahier A4 96 pages', 'Papeterie', 12],
  ['CLIM', 'Nettoyant écran LCD', 'Informatique', 4],
]

async function resetBusinessTables() {
  console.log('Mode reset : suppression des données métier…')
  await query('DELETE FROM PRENDRE')
  await query('DELETE FROM POSSEDER')
  await query('DELETE FROM MOUVEMENT')
  await query('DELETE FROM CONSOMMABLE')
  await query('DELETE FROM MOBILIER')
  await query('DELETE FROM PERSONNE')
  await query("ALTER SEQUENCE personne_id_p_seq RESTART WITH 1")
  await query("ALTER SEQUENCE mouvement_id_seq RESTART WITH 1")
  console.log('Données métier effacées. Sequences réinitialisées.')
}

async function seedDemo() {
  const existing = await query('SELECT COUNT(*)::int AS count FROM PERSONNE')
  if (existing.rows[0].count > 0) {
    console.log('Données de démo déjà présentes dans PERSONNE. Passez --reset pour réinitialiser.')
    return
  }

  const flat = arr => arr.reduce((a, r) => a.concat(r), [])

  // --- Personnes ---
  console.log(`Insertion de ${PERSONNES.length} personnes…`)
  {
    const values = PERSONNES.map(p => `($${PERSONNES.indexOf(p) * 5 + 1},$${PERSONNES.indexOf(p) * 5 + 2},$${PERSONNES.indexOf(p) * 5 + 3},$${PERSONNES.indexOf(p) * 5 + 4},$${PERSONNES.indexOf(p) * 5 + 5})`).join(',')
    await query(`INSERT INTO PERSONNE (nom, prenom, sexe, grade, fonction) VALUES ${values}`, flat(PERSONNES))
  }

  // --- Mobiliers ---
  console.log(`Insertion de ${MOBILIERS.length} mobiliers…`)
  {
    const values = MOBILIERS.map((_, i) => `($${i * 8 + 1},$${i * 8 + 2},$${i * 8 + 3},$${i * 8 + 4},$${i * 8 + 5},$${i * 8 + 6},$${i * 8 + 7},$${i * 8 + 8})`).join(',')
    await query(`INSERT INTO MOBILIER (id_m, designation, nomenclature, espece, pu, provenance, etat, observation) VALUES ${values}`, flat(MOBILIERS))
  }

  // --- Consommables ---
  console.log(`Insertion de ${CONSOMMABLES.length} consommables…`)
  {
    const values = CONSOMMABLES.map((_, i) => `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4})`).join(',')
    await query(`INSERT INTO CONSOMMABLE (ref_c, libelle, categorie, qte) VALUES ${values}`, flat(CONSOMMABLES))
  }

  // --- Mouvements ---
  console.log('Insertion des mouvements et mise à jour des tables d\'état…')

  const mouvements = [
    // Mobiliers — attributions initiales (jours 50-35)
    { id_p: 1, ti: 'MOBILIER', ir: 'BUR01', tm: 'ATTRIBUTION', q: 1, j: 50 },
    { id_p: 1, ti: 'MOBILIER', ir: 'ORD01', tm: 'ATTRIBUTION', q: 1, j: 48 },
    { id_p: 1, ti: 'MOBILIER', ir: 'CHA01', tm: 'ATTRIBUTION', q: 1, j: 48 },
    { id_p: 2, ti: 'MOBILIER', ir: 'BUR02', tm: 'ATTRIBUTION', q: 1, j: 45 },
    { id_p: 2, ti: 'MOBILIER', ir: 'CHA02', tm: 'ATTRIBUTION', q: 2, j: 45 },
    { id_p: 3, ti: 'MOBILIER', ir: 'ORD02', tm: 'ATTRIBUTION', q: 1, j: 42 },
    { id_p: 3, ti: 'MOBILIER', ir: 'CHA01', tm: 'ATTRIBUTION', q: 1, j: 42 },
    { id_p: 4, ti: 'MOBILIER', ir: 'IMP01', tm: 'ATTRIBUTION', q: 1, j: 40 },
    { id_p: 5, ti: 'MOBILIER', ir: 'BUR03', tm: 'ATTRIBUTION', q: 1, j: 38 },
    { id_p: 5, ti: 'MOBILIER', ir: 'TAB02', tm: 'ATTRIBUTION', q: 1, j: 38 },
    { id_p: 6, ti: 'MOBILIER', ir: 'CHA03', tm: 'ATTRIBUTION', q: 1, j: 35 },
    { id_p: 8, ti: 'MOBILIER', ir: 'CHA03', tm: 'ATTRIBUTION', q: 1, j: 35 },
    { id_p: 9, ti: 'MOBILIER', ir: 'ORD03', tm: 'ATTRIBUTION', q: 1, j: 33 },
    { id_p: 10, ti: 'MOBILIER', ir: 'ARM01', tm: 'ATTRIBUTION', q: 1, j: 30 },

    // Transferts mobiliers
    { id_p: 3, ti: 'MOBILIER', ir: 'ORD02', tm: 'TRANSFERT', q: 1, j: 28, dest: 6 },
    { id_p: 1, ti: 'MOBILIER', ir: 'CHA01', tm: 'TRANSFERT', q: 1, j: 20, dest: 16 },
    { id_p: 8, ti: 'MOBILIER', ir: 'CHA03', tm: 'TRANSFERT', q: 1, j: 15, dest: 12 },

    // Restitutions mobiliers
    { id_p: 1, ti: 'MOBILIER', ir: 'CHA01', tm: 'RESTITUTION', q: 1, j: 22 },
    { id_p: 5, ti: 'MOBILIER', ir: 'TAB02', tm: 'RESTITUTION', q: 1, j: 10 },

    // Consommables — attributions (jours 45-2)
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'RAM', tm: 'ATTRIBUTION', q: 3, j: 45 },
    { id_p: 3, ti: 'CONSOMMABLE', ir: 'RAM', tm: 'ATTRIBUTION', q: 2, j: 40 },
    { id_p: 4, ti: 'CONSOMMABLE', ir: 'RAM', tm: 'ATTRIBUTION', q: 5, j: 30 },
    { id_p: 8, ti: 'CONSOMMABLE', ir: 'RAM', tm: 'ATTRIBUTION', q: 3, j: 20 },
    { id_p: 2, ti: 'CONSOMMABLE', ir: 'RAM', tm: 'ATTRIBUTION', q: 2, j: 28 },
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'STYLOB', tm: 'ATTRIBUTION', q: 5, j: 42 },
    { id_p: 2, ti: 'CONSOMMABLE', ir: 'STYLOB', tm: 'ATTRIBUTION', q: 3, j: 35 },
    { id_p: 5, ti: 'CONSOMMABLE', ir: 'STYLOB', tm: 'ATTRIBUTION', q: 4, j: 25 },
    { id_p: 3, ti: 'CONSOMMABLE', ir: 'STYLOR', tm: 'ATTRIBUTION', q: 2, j: 38 },
    { id_p: 4, ti: 'CONSOMMABLE', ir: 'STYLOR', tm: 'ATTRIBUTION', q: 2, j: 22 },
    { id_p: 7, ti: 'CONSOMMABLE', ir: 'STYLOR', tm: 'ATTRIBUTION', q: 1, j: 12 },
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'STYLON', tm: 'ATTRIBUTION', q: 3, j: 36 },
    { id_p: 9, ti: 'CONSOMMABLE', ir: 'STYLON', tm: 'ATTRIBUTION', q: 2, j: 18 },
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'ENV', tm: 'ATTRIBUTION', q: 10, j: 40 },
    { id_p: 3, ti: 'CONSOMMABLE', ir: 'ENV', tm: 'ATTRIBUTION', q: 5, j: 15 },
    { id_p: 4, ti: 'CONSOMMABLE', ir: 'CLAS', tm: 'ATTRIBUTION', q: 3, j: 28 },
    { id_p: 6, ti: 'CONSOMMABLE', ir: 'CLAS', tm: 'ATTRIBUTION', q: 5, j: 14 },
    { id_p: 2, ti: 'CONSOMMABLE', ir: 'CLAS', tm: 'ATTRIBUTION', q: 2, j: 5 },
    { id_p: 4, ti: 'CONSOMMABLE', ir: 'POST', tm: 'ATTRIBUTION', q: 2, j: 25 },
    { id_p: 10, ti: 'CONSOMMABLE', ir: 'POST', tm: 'ATTRIBUTION', q: 1, j: 8 },
    { id_p: 7, ti: 'CONSOMMABLE', ir: 'TONER', tm: 'ATTRIBUTION', q: 1, j: 32 },
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'CAHIER', tm: 'ATTRIBUTION', q: 2, j: 35 },
    { id_p: 4, ti: 'CONSOMMABLE', ir: 'CAHIER', tm: 'ATTRIBUTION', q: 1, j: 18 },
    { id_p: 5, ti: 'CONSOMMABLE', ir: 'CAHIER', tm: 'ATTRIBUTION', q: 3, j: 6 },
    { id_p: 2, ti: 'CONSOMMABLE', ir: 'RAMA4C', tm: 'ATTRIBUTION', q: 2, j: 30 },
    { id_p: 5, ti: 'CONSOMMABLE', ir: 'RAMA3', tm: 'ATTRIBUTION', q: 1, j: 22 },
    { id_p: 3, ti: 'CONSOMMABLE', ir: 'AGRAF', tm: 'ATTRIBUTION', q: 1, j: 16 },
    { id_p: 8, ti: 'CONSOMMABLE', ir: 'AGRAF', tm: 'ATTRIBUTION', q: 1, j: 4 },
    { id_p: 3, ti: 'CONSOMMABLE', ir: 'RUBAN', tm: 'ATTRIBUTION', q: 1, j: 12 },
    { id_p: 10, ti: 'CONSOMMABLE', ir: 'CLIM', tm: 'ATTRIBUTION', q: 1, j: 20 },
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'CLIM', tm: 'ATTRIBUTION', q: 1, j: 3 },

    // Restitutions consommables (partielles)
    { id_p: 1, ti: 'CONSOMMABLE', ir: 'STYLOB', tm: 'RESTITUTION', q: 2, j: 20 },
    { id_p: 3, ti: 'CONSOMMABLE', ir: 'RAM', tm: 'RESTITUTION', q: 1, j: 18 },
    { id_p: 4, ti: 'CONSOMMABLE', ir: 'CLAS', tm: 'RESTITUTION', q: 1, j: 10 },

    // APPROVISIONNEMENT (sans id_p) — répartis dans le temps
    { ti: 'CONSOMMABLE', ir: 'RAM', tm: 'APPROVISIONNEMENT', q: 30, j: 35 },
    { ti: 'CONSOMMABLE', ir: 'RAM', tm: 'APPROVISIONNEMENT', q: 20, j: 7 },
    { ti: 'CONSOMMABLE', ir: 'STYLOB', tm: 'APPROVISIONNEMENT', q: 20, j: 30 },
    { ti: 'CONSOMMABLE', ir: 'STYLOB', tm: 'APPROVISIONNEMENT', q: 15, j: 2 },
    { ti: 'CONSOMMABLE', ir: 'STYLON', tm: 'APPROVISIONNEMENT', q: 15, j: 25 },
    { ti: 'CONSOMMABLE', ir: 'ENV', tm: 'APPROVISIONNEMENT', q: 40, j: 28 },
    { ti: 'CONSOMMABLE', ir: 'ENV', tm: 'APPROVISIONNEMENT', q: 30, j: 5 },
    { ti: 'CONSOMMABLE', ir: 'CLAS', tm: 'APPROVISIONNEMENT', q: 20, j: 20 },
    { ti: 'CONSOMMABLE', ir: 'POST', tm: 'APPROVISIONNEMENT', q: 15, j: 15 },
    { ti: 'CONSOMMABLE', ir: 'TONER', tm: 'APPROVISIONNEMENT', q: 4, j: 15 },
    { ti: 'CONSOMMABLE', ir: 'CAHIER', tm: 'APPROVISIONNEMENT', q: 15, j: 12 },
    { ti: 'CONSOMMABLE', ir: 'RAMA4C', tm: 'APPROVISIONNEMENT', q: 12, j: 18 },
    { ti: 'CONSOMMABLE', ir: 'RAMA3', tm: 'APPROVISIONNEMENT', q: 8, j: 10 },
    { ti: 'CONSOMMABLE', ir: 'AGRAF', tm: 'APPROVISIONNEMENT', q: 10, j: 8 },
    { ti: 'CONSOMMABLE', ir: 'RUBAN', tm: 'APPROVISIONNEMENT', q: 8, j: 6 },
  ]

  for (const m of mouvements) {
    const dateMvt = daysAgo(m.j)
    if (m.ti === 'MOBILIER' || m.tm !== 'APPROVISIONNEMENT') {
      await query(
        `INSERT INTO MOUVEMENT (user_id, id_p, type_item, item_ref, type_mouvement, quantite, date_mouvement)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, m.id_p, m.ti, m.ir, m.tm, m.q, dateMvt]
      )
    } else {
      await query(
        `INSERT INTO MOUVEMENT (user_id, id_p, type_item, item_ref, type_mouvement, quantite, date_mouvement)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, null, m.ti, m.ir, m.tm, m.q, dateMvt]
      )
    }

    if (m.tm === 'TRANSFERT' && m.dest) {
      await query(
        `INSERT INTO MOUVEMENT (user_id, id_p, type_item, item_ref, type_mouvement, quantite, date_mouvement, commentaire)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, m.dest, m.ti, m.ir, 'ATTRIBUTION', m.q, dateMvt, `Transfert depuis ${m.id_p}`]
      )
    }

    // POSSEDER / PRENDRE / stock
    if (m.ti === 'MOBILIER') {
      if (m.tm === 'ATTRIBUTION') {
        const dest = m.dest || m.id_p
        await query(
          `INSERT INTO POSSEDER (id_p, id_m, date_posseder, quantite_posseder) VALUES ($1, $2, $3, 1)
           ON CONFLICT (id_p, id_m) DO UPDATE SET quantite_posseder = 1, date_posseder = EXCLUDED.date_posseder`,
          [dest, m.ir, dateMvt]
        )
      } else if (m.tm === 'RESTITUTION') {
        const cur = await query('SELECT quantite_posseder FROM POSSEDER WHERE id_p = $1 AND id_m = $2', [m.id_p, m.ir])
        if (cur.rows.length > 0) {
          const nq = cur.rows[0].quantite_posseder - m.q
          if (nq <= 0) {
            await query('DELETE FROM POSSEDER WHERE id_p = $1 AND id_m = $2', [m.id_p, m.ir])
          } else {
            await query('UPDATE POSSEDER SET quantite_posseder = $1, date_posseder = $2 WHERE id_p = $3 AND id_m = $4', [nq, dateMvt, m.id_p, m.ir])
          }
        }
      } else if (m.tm === 'TRANSFERT') {
        const cur = await query('SELECT quantite_posseder FROM POSSEDER WHERE id_p = $1 AND id_m = $2', [m.id_p, m.ir])
        if (cur.rows.length > 0) {
          const nq = cur.rows[0].quantite_posseder - m.q
          if (nq <= 0) {
            await query('DELETE FROM POSSEDER WHERE id_p = $1 AND id_m = $2', [m.id_p, m.ir])
          } else {
            await query('UPDATE POSSEDER SET quantite_posseder = $1 WHERE id_p = $2 AND id_m = $3', [nq, m.id_p, m.ir])
          }
        }
        await query(
          `INSERT INTO POSSEDER (id_p, id_m, date_posseder, quantite_posseder) VALUES ($1, $2, $3, 1)
           ON CONFLICT (id_p, id_m) DO UPDATE SET quantite_posseder = 1, date_posseder = EXCLUDED.date_posseder`,
          [m.dest, m.ir, dateMvt]
        )
      }
    } else if (m.tm === 'ATTRIBUTION') {
      const dest = m.id_p
      await query(
        `INSERT INTO PRENDRE (id_p, ref_c, date_prendre, quantite_prendre) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_p, ref_c) DO UPDATE SET
         quantite_prendre = PRENDRE.quantite_prendre + EXCLUDED.quantite_prendre, date_prendre = EXCLUDED.date_prendre`,
        [dest, m.ir, dateMvt, m.q]
      )
      await query('UPDATE CONSOMMABLE SET qte = qte - $1 WHERE ref_c = $2', [m.q, m.ir])
    } else if (m.tm === 'RESTITUTION') {
      const cur = await query('SELECT quantite_prendre FROM PRENDRE WHERE id_p = $1 AND ref_c = $2', [m.id_p, m.ir])
      if (cur.rows.length > 0) {
        const nq = cur.rows[0].quantite_prendre - m.q
        if (nq <= 0) {
          await query('DELETE FROM PRENDRE WHERE id_p = $1 AND ref_c = $2', [m.id_p, m.ir])
        } else {
          await query('UPDATE PRENDRE SET quantite_prendre = $1, date_prendre = $2 WHERE id_p = $3 AND ref_c = $4', [nq, dateMvt, m.id_p, m.ir])
        }
      }
      await query('UPDATE CONSOMMABLE SET qte = qte + $1 WHERE ref_c = $2', [m.q, m.ir])
    } else if (m.tm === 'APPROVISIONNEMENT') {
      await query('UPDATE CONSOMMABLE SET qte = qte + $1 WHERE ref_c = $2', [m.q, m.ir])
    }
  }

  console.log('Données de démo insérées avec succès.')
}

const args = process.argv.slice(2)
if (args.includes('--reset')) {
  await resetBusinessTables()
  await seedDemo()
} else {
  await seedDemo()
}
