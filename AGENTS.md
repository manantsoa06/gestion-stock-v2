# AGENTS.md — Gestion de stock matériels et biens immobiliers (Tribunal Administratif)

Ce fichier est lu automatiquement par OpenCode au démarrage. Il définit le contexte
du projet, les règles non négociables, et renvoie vers les skills/agents détaillés.

## Contexte

Application web de gestion de stock (mobiliers, consommables) et des mouvements de
matériel entre personnes/services au sein d'un tribunal administratif. Utilisateur
final principal : **le comptable**, non technique, qui gère uniquement le matériel
(pas d'admin technique multi-rôles pour l'instant).

Ce dossier est un **projet neuf**, généré de zéro selon l'architecture cible décrite
dans `docs/`. Il n'y a pas de code applicatif existant à modifier ici.

## Ancien projet (référence, ne pas modifier)

Un premier prototype existe séparément à `~/Documents/Projet-Js-Avance` (MySQL, auth
en dur, routes plates). Il ne fait pas partie de ce dossier et ne doit jamais être
modifié depuis ce projet. Il peut être consulté en lecture seule pour :
- les libellés métier et noms de champs déjà utilisés (`Nom`, `Prenom`, `Designation`,
  `RefC`, etc.) — à conserver en français dans le nouveau schéma pour rester cohérent
  avec le vocabulaire du tribunal ;
- la logique métier des routes existantes (`posseder.js`, `prendre.js`,
  `dashboard.js`) comme base fonctionnelle à reproduire, mais réécrite selon
  l'architecture en couches et la stack cible (PostgreSQL, JWT).

Ne jamais copier de fichier depuis l'ancien projet sans passer par la structure
routes/service/model et les conventions décrites ci-dessous.

## Stack cible

- Backend : Node.js + Express 5, PostgreSQL (migration depuis MySQL, base neuve),
  `pg` comme driver, requêtes SQL paramétrées (pas d'ORM lourd sauf décision contraire).
- Auth : JWT en cookie `httpOnly` + `secure` + `sameSite=strict`, bcrypt pour le hash,
  refresh token stocké hashé en base. Un seul rôle utilisateur pour l'instant (`admin`),
  mais colonne `role` prévue en DB pour évolution future.
- Frontend : React 18 + Vite, `react-router-dom`, `axios` avec `withCredentials: true`.
- Nouvelle page publique : landing minimaliste présentant le tribunal, accessible sans
  connexion, avec un bouton "Se connecter" menant à `/login`.

## Règles non négociables

1. **Jamais de secret en dur dans le code.** Tout passe par `.env` (voir `.env.example`).
   `.env` doit être dans `.gitignore`.
2. **Toutes les routes `/api/*` sont protégées par le middleware d'authentification**,
   sauf `/api/auth/login`, `/api/auth/refresh`, et les routes explicitement publiques
   (consultation de la landing page si elle a un endpoint dédié).
3. **Aucune requête SQL construite par concaténation de chaînes.** Uniquement des
   requêtes paramétrées (`$1, $2...` avec `pg`).
4. **Toute nouvelle table/colonne passe par une migration versionnée** dans
   `migrations/`, jamais de modification manuelle de schéma.
5. **Les mots de passe ne sont jamais stockés ni loggés en clair.**
6. **Les erreurs internes (stack trace, requêtes SQL, structure DB) ne sont jamais
   renvoyées au client** — utiliser le middleware `errorHandler` centralisé.
7. **Le code livré doit être testé avant d'être considéré "terminé"** — au minimum un
   test smoke sur les routes critiques (login, création de mouvement).
8. **La landing page reste minimaliste** : présentation du tribunal, pas de contenu
   sensible, pas de données internes visibles sans connexion.

## Ordre de travail recommandé

Suivre le plan détaillé dans `docs/TASKS.md`. Ne pas paralléliser les tâches qui
dépendent du système d'auth — c'est la fondation de tout le reste.

## Skills et agents disponibles

- `.opencode/skill/backend-express-postgres/` — conventions backend, structure en
  couches routes/services/models, migrations Postgres.
- `.opencode/skill/auth-security/` — implémentation JWT/bcrypt, checklist sécurité
  (OWASP-lite adapté à ce projet).
- `.opencode/skill/react-frontend-uiux/` — conventions frontend, design de la landing
  page, accessibilité de base.
- `.opencode/skill/testing-qa/` — stratégie de tests minimale mais suffisante.
- `.opencode/agent/backend-dev.md`, `frontend-dev.md`, `security-reviewer.md`,
  `qa-tester.md` — agents spécialisés, à invoquer selon la tâche en cours.

## Documentation de référence

- `docs/ARCHITECTURE.md` — architecture en couches, structure de dossiers complète.
- `docs/DATA_MODEL.md` — schéma de données PostgreSQL cible (avec table `MOUVEMENT`).
- `docs/TASKS.md` — plan de développement phasé.
- `docs/SECURITY_CHECKLIST.md` — checklist sécurité à valider avant toute mise en service.
