---
name: backend-express-postgres
description: Utiliser pour toute tâche backend Node.js/Express de ce projet — structure en couches routes/service/model, requêtes PostgreSQL paramétrées, migrations. Se déclenche pour la création ou modification de routes API, de services métier, ou de migrations de schéma.
---

# Backend Express + PostgreSQL

## Structure obligatoire

Chaque ressource suit le triptyque `routes/service/model` (voir `docs/ARCHITECTURE.md`).
Ne jamais écrire de logique métier ou de requête SQL directement dans un fichier `routes`.

## Conventions PostgreSQL (via `pg`)

- Requêtes paramétrées avec `$1, $2, ...` — jamais de concaténation de chaînes dans le SQL.
- Utiliser `RETURNING *` sur les `INSERT`/`UPDATE` pour récupérer la ligne modifiée sans
  requête supplémentaire.
- Le pool de connexion est unique, exporté depuis `src/config/db.js`, jamais recréé
  ailleurs.
- Toute création/modification de table passe par une migration versionnée dans
  `migrations/` (outil : `node-pg-migrate`). Nommer les fichiers avec un préfixe
  numérique ordonné (`001_create_users.js`, `002_create_mouvements.js`...).

## Gestion des erreurs

- Chaque route est enveloppée pour transmettre les erreurs au middleware
  `errorHandler` central (via `next(err)` ou un wrapper async).
- Ne jamais renvoyer `err` brut au client (`res.json({ error: err })` est interdit) —
  logguer côté serveur, renvoyer un message générique + code HTTP approprié au client.

## Exemple de route minimale

```js
// modules/mobiliers/mobiliers.routes.js
const router = require("express").Router();
const service = require("./mobiliers.service");

router.get("/", async (req, res, next) => {
  try {
    const mobiliers = await service.listAll();
    res.json(mobiliers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

```js
// modules/mobiliers/mobiliers.model.js
const db = require("../../config/db");

async function findAll() {
  const { rows } = await db.query("SELECT * FROM mobilier ORDER BY id_m");
  return rows;
}

module.exports = { findAll };
```

## Table MOUVEMENT — règle métier importante

Toute opération créant/modifiant une ligne dans `POSSEDER` ou `PRENDRE` doit
**systématiquement** insérer une ligne correspondante dans `MOUVEMENT` (dans la même
transaction SQL — utiliser `BEGIN`/`COMMIT`/`ROLLBACK` explicite via `pg`). Ne jamais
supprimer une ligne de `MOUVEMENT` — c'est un journal append-only.
