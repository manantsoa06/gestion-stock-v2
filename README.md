# Gestion de Stock — Tribunal Administratif d'Antananarivo

Application web de gestion de stock (mobiliers et consommables) et des mouvements de matériel entre personnes/services au sein du Tribunal Administratif d'Antananarivo.

Utilisateur cible : **le comptable**, qui gère les attributions, restitutions, transferts et approvisionnements de matériel.

---

## Stack technique

### Backend

| Composant | Technologie |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| Base de données | PostgreSQL (driver `pg`) |
| Authentification | JWT (cookie `httpOnly`) + bcrypt |
| Validation | Zod |
| Sécurité | Helmet, CORS, express-rate-limit |
| Tests | Vitest + Supertest |

### Frontend

| Composant | Technologie |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Routing | react-router-dom |
| Client HTTP | axios (`withCredentials: true`) |
| Graphiques | Recharts |
| PDF | jsPDF |
| Linting | oxlint |

---

## Fonctionnalités

- **Authentification** — Login/logout avec JWT en cookie `httpOnly`, refresh token rotation, rate limiting (5 tentatives / 15 min)
- **Personnes** — CRUD du personnel du tribunal (nom, prénom, grade, fonction, adresse, téléphone)
- **Mobiliers** — CRUD du matériel (désignation, nomenclature, espèce, prix unitaire, état)
- **Consommables** — CRUD des consommables avec gestion des quantités en stock
- **Mouvements** — Attribution, restitution, transfert et approvisionnement avec journal append-only (`MOUVEMENT`)
- **Dashboard** — Statistiques agrégées, graphiques Recharts (mouvements sur 30 jours, évolution du stock), alertes stock bas
- **Fiches PDF** — Génération de fiches d'inventaire personnel et historiques de mouvements (format officiel malgache)
- **Landing page** — Page publique de présentation du tribunal, accessible sans connexion

---

## Architecture

Structure en couches : **routes → service → model**

```
gestion-stock-v2/
├── gestion-stock-backend/        # Backend Node.js + Express
│   ├── src/
│   │   ├── config/               # Connexion DB, validation env, seed admin
│   │   ├── middlewares/          # Auth JWT, validation Zod, gestion d'erreurs
│   │   ├── modules/
│   │   │   ├── auth/             # Login, logout, refresh, /me
│   │   │   ├── personnes/        # CRUD personnes
│   │   │   ├── mobiliers/        # CRUD mobiliers
│   │   │   ├── consommables/     # CRUD consommables
│   │   │   ├── mouvements/       # Logique métier des mouvements
│   │   │   ├── dashboard/        # Statistiques agrégées
│   │   │   └── public/           # Endpoint info tribunal (public)
│   │   └── __tests__/            # Tests smoke (Vitest)
│   └── migrations/               # Scripts SQL versionnés
├── gestion-stock-frontend/       # Frontend React + Vite
│   ├── src/
│   │   ├── context/              # AuthContext (état d'auth global)
│   │   ├── components/           # PrivateRoute, layout (Sidebar, Header)
│   │   ├── pages/                # Home, Login, Dashboard, Personnes, etc.
│   │   └── styles/               # Design tokens + composants CSS
│   └── dist/                     # Build de production
└── docs/                         # Documentation projet
```

Chaque module backend suit le triptyque :
- **routes** — Mapping HTTP (méthode, chemin, appel du service)
- **service** — Logique métier (règles de gestion, calculs)
- **model** — Accès aux données (requêtes SQL paramétrées)

---

## Installation

### Prérequis

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm

### 1. Cloner le projet

```bash
git clone <url-du-depot>
cd gestion-stock-v2
```

### 2. Configurer l'environnement backend

```bash
cp gestion-stock-backend.env.example gestion-stock-backend/.env
```

Éditer `gestion-stock-backend/.env` :

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_stock
DB_USER=app_user
DB_PASSWORD=<votre_mot_de_passe>
JWT_SECRET=<au_moins_32_caracteres_aleatoires>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=<mot_de_passe_admin>
```

### 3. Créer la base de données PostgreSQL

```sql
CREATE DATABASE gestion_stock;
CREATE USER app_user WITH PASSWORD '<votre_mot_de_passe>';
GRANT ALL PRIVILEGES ON DATABASE gestion_stock TO app_user;
```

### 4. Exécuter les migrations

```bash
cd gestion-stock-backend
npm install
npm run migrate
```

Cela crée toutes les tables et initialise le compte admin.

### 5. (Optionnel) Charger les données de démo

```bash
npm run seed:demo
```

Insère 20 personnes, 19 mobiliers, 15 consommables et ~55 mouvements réalistes.

### 6. Lancer le backend

```bash
npm run dev     # développement (auto-reload)
# ou
npm start       # production
```

Le serveur démarre sur `http://localhost:5000`.

### 7. Lancer le frontend

```bash
cd ../gestion-stock-frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`.

---

## Variables d'environnement

### Requises (le serveur démarre sans ces variables)

| Variable | Description |
|---|---|
| `DB_HOST` | Hôte PostgreSQL |
| `DB_PORT` | Port PostgreSQL |
| `DB_NAME` | Nom de la base (`gestion_stock`) |
| `DB_USER` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Clé secrète JWT (≥ 32 caractères) |

### Optionnelles

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `5000` | Port du serveur |
| `NODE_ENV` | `development` | Mode (affecte le flag `secure` des cookies) |
| `JWT_EXPIRES_IN` | `15m` | Durée de vie du token d'accès |
| `REFRESH_TOKEN_EXPIRES_IN` | `7` (jours) | Durée de vie du refresh token |
| `FRONTEND_URL` | `http://localhost:5173` | Origine CORS autorisée |
| `SEED_ADMIN_USERNAME` | `admin` | Nom du compte admin seed |
| `SEED_ADMIN_PASSWORD` | — | Mot de passe du compte admin (requis au premier run) |

---

## Endpoints API

### Routes publiques

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/public/info` | Informations publiques sur le tribunal |
| `POST` | `/api/auth/login` | Connexion (rate-limité : 5 req / 15 min) |
| `POST` | `/api/auth/refresh` | Renouvellement des tokens |
| `POST` | `/api/auth/logout` | Déconnexion + révocation du refresh token |

### Authentification (protégé)

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |

### Personnes (protégé)

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/personnes` | Liste de toutes les personnes |
| `GET` | `/api/personnes/:id` | Détail d'une personne |
| `POST` | `/api/personnes` | Créer une personne |
| `PUT` | `/api/personnes/:id` | Modifier une personne |
| `DELETE` | `/api/personnes/:id` | Supprimer une personne |

### Mobiliers (protégé)

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/mobiliers` | Liste de tous les mobiliers |
| `GET` | `/api/mobiliers/:id` | Détail d'un mobilier |
| `POST` | `/api/mobiliers` | Créer un mobilier |
| `PUT` | `/api/mobiliers/:id` | Modifier un mobilier |
| `DELETE` | `/api/mobiliers/:id` | Supprimer un mobilier |

### Consommables (protégé)

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/consommables` | Liste de tous les consommables |
| `GET` | `/api/consommables/:id` | Détail d'un consommable |
| `POST` | `/api/consommables` | Créer un consommable |
| `PUT` | `/api/consommables/:id` | Modifier un consommable |
| `DELETE` | `/api/consommables/:id` | Supprimer un consommable |

### Mouvements (protégé)

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/mouvements` | Historique complet des mouvements |
| `GET` | `/api/mouvements/personne/:idP` | Mouvements d'une personne |
| `GET` | `/api/mouvements/item/:typeItem/:itemRef` | Mouvements d'un article |
| `GET` | `/api/mouvements/etat/:idP` | État courant des attributions d'une personne |
| `POST` | `/api/mouvements` | Créer un mouvement |

### Dashboard (protégé)

| Méthode | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Statistiques agrégées (comptes, résumés) |

---

## Modèle de données

| Table | Description |
|---|---|
| `USER` (→ `user_account`) | Utilisateurs (auth) |
| `PERSONNE` | Personnel du tribunal |
| `MOBILIER` | Matériel / mobilier |
| `CONSOMMABLE` | Consommables avec stock |
| `POSSEDER` | État courant : mobilier détenu par une personne |
| `PRENDRE` | État courant : consommable détenu par une personne |
| `MOUVEMENT` | Journal append-only de tous les mouvements |

---

## Scripts npm

### Backend (`gestion-stock-backend/`)

| Script | Commande | Description |
|---|---|---|
| `npm run dev` | `node --watch src/server.js` | Développement avec auto-reload |
| `npm start` | `node src/server.js` | Démarrage production |
| `npm run migrate` | `node migrations/migrate.js` | Exécuter les migrations + seed admin |
| `npm run seed:demo` | `node migrations/seed-demo.js` | Charger les données de démo |
| `npm test` | `vitest run` | Exécuter les tests |
| `npm run test:watch` | `vitest` | Tests en mode watch |

### Frontend (`gestion-stock-frontend/`)

| Script | Commande | Description |
|---|---|---|
| `npm run dev` | `vite` | Serveur de développement |
| `npm run build` | `vite build` | Build de production |
| `npm run preview` | `vite preview` | Prévisualiser le build |
| `npm run lint` | `oxlint src -c .oxlintrc.json` | Linter le code |

---

## Tests

```bash
cd gestion-stock-backend
npm test
```

Couverture des tests smoke :
- Auth : login succès/échec, 01 sans token
- Mouvements : attribution mobilier/consommable, restitution, transfert, rejet stock insuffisant

---

## Sécurité

- JWT en cookie `httpOnly`, `secure` (production), `sameSite=strict`
- Refresh token rotation (révoqué après utilisation, stocké hashé en SHA-256 en base)
- Mots de passe hashés avec bcrypt (coût 10)
- Requêtes SQL entièrement paramétrées (aucune concaténation)
- Validation Zod sur toutes les routes d'écriture
- `helmet` activé, CORS restreint à l'origine du frontend
- Rate limiting sur `/api/auth/login` (5 tentatives / 15 min / IP)
- Messages d'erreur génériques (pas de fuite de détails internes)

---

## Licence

Projet interne — Tribunal Administratif d'Antananarivo.
