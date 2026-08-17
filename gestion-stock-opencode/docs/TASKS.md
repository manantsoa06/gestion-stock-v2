# Plan de développement — à suivre dans l'ordre

Chaque étape doit être livrable et testable indépendamment. Ne pas passer à l'étape
suivante tant que la précédente n'est pas fonctionnelle.

## Étape 0 — Initialisation

- Initialiser PostgreSQL local (base `gestion_stock`), créer `.env` à partir de
  `.env.example`.
- Mettre en place `node-pg-migrate` (ou équivalent) et écrire la première migration
  créant toutes les tables de `docs/DATA_MODEL.md`.
- Vérifier que le serveur backend démarre et se connecte à Postgres sans erreur.

## Étape 1 — Authentification (fondation, ne pas sauter)

- Créer le module `auth` (routes/service/model) avec bcrypt + JWT en cookie httpOnly.
- Créer un script de seed pour un premier compte admin (via variables d'env, jamais
  de mot de passe en dur dans le code).
- Middleware `auth.js` appliqué à toutes les routes `/api/*` sauf `/api/auth/*`.
- Tester manuellement : login, accès à une route protégée, logout, refresh.

## Étape 2 — Restructuration des modules existants

- Migrer `personnes`, `mobiliers`, `consommables`, `posseder`, `prendre`, `dashboard`
  vers la structure routes/service/model, requêtes adaptées à la syntaxe PostgreSQL
  (`$1, $2` au lieu de `?`, `RETURNING *` pour récupérer l'id après un INSERT).

## Étape 3 — Fonctionnalité mouvements (priorité fonctionnelle)

- Créer le module `mouvements` : chaque attribution/restitution de mobilier ou
  consommable crée une ligne dans `MOUVEMENT` en plus de la mise à jour de
  `POSSEDER`/`PRENDRE`.
- Endpoint de consultation de l'historique par personne et par article.

## Étape 4 — Frontend : auth réelle + landing page

- Implémenter `AuthContext` (appel `/api/auth/me` au chargement, pas de `useState`
  local perdu au refresh).
- Brancher réellement `PrivateRoute` dans `App.jsx` sur toutes les routes protégées.
- Créer `pages/Home.jsx` : landing minimaliste (nom du tribunal, présentation courte,
  bouton "Se connecter"), route `/` publique et distincte de `/login`.
- Ajouter `withCredentials: true` dans `api.jsx`.

## Étape 5 — Durcissement sécurité

- `helmet`, `cors` restreint à l'origine du frontend avec `credentials: true`.
- `express-rate-limit` sur `/api/auth/login`.
- Validation systématique des payloads (zod) sur toutes les routes d'écriture.
- Vérifier `docs/SECURITY_CHECKLIST.md` intégralement avant mise en service.

## Étape 6 — Tests

- Tests smoke minimum : login (succès/échec), création d'un mouvement, calcul de
  quantité restante d'un consommable après attribution.
