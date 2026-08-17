# Architecture cible

## Backend — structure en couches

```
gestion-stock-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # pool pg (PostgreSQL), lit process.env
│   │   └── env.js             # validation des variables d'environnement au démarrage
│   ├── middlewares/
│   │   ├── auth.js            # vérifie le JWT (cookie httpOnly), attache req.user
│   │   ├── validate.js        # validation des payloads (zod)
│   │   └── errorHandler.js    # centralise les réponses d'erreur, ne jamais exposer
│   │                           # de détails internes au client
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js   # bcrypt, génération/validation JWT
│   │   │   └── auth.model.js
│   │   ├── personnes/
│   │   ├── mobiliers/
│   │   ├── consommables/
│   │   ├── mouvements/         # historique append-only des affectations
│   │   ├── dashboard/
│   │   └── public/              # endpoint(s) pour la landing page si nécessaire
│   ├── app.js                   # montage express, cors, helmet, routes
│   └── server.js                # écoute du port
├── migrations/                  # scripts SQL versionnés (node-pg-migrate)
├── .env.example
└── package.json
```

Chaque module suit le triptyque **routes → service → model** :
- `routes` : uniquement le mapping HTTP (méthode, chemin, appel du service, réponse).
- `service` : logique métier (règles de gestion, calculs de quantité, orchestration).
- `model` : accès aux données uniquement (requêtes SQL paramétrées via `pg`).

## Frontend — structure

```
gestion-stock-frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx     # état d'auth persistant (appel /auth/me au chargement)
│   ├── hooks/
│   │   └── useApi.js           # centralise la gestion des 401 → redirection login
│   ├── components/
│   │   ├── Mouvements/         # nouveau module (affectations entre services)
│   │   ├── PrivateRoute.jsx    # à réellement brancher dans App.jsx cette fois
│   │   └── ... (existant conservé)
│   ├── pages/
│   │   ├── Home.jsx             # NOUVELLE landing page publique minimaliste
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── ... (existant conservé)
│   └── api.jsx                  # axios avec withCredentials: true
```

## Flux d'authentification

1. `POST /api/auth/login` → vérifie `bcrypt.compare()` → si OK, signe un JWT (15 min)
   et un refresh token (7 jours, stocké hashé en DB) → pose les deux en cookies
   `httpOnly`, `secure`, `sameSite=strict`.
2. Chaque requête vers `/api/*` (sauf routes publiques) passe par le middleware `auth`
   qui vérifie le cookie JWT et attache `req.user`.
3. Si le JWT est expiré mais le refresh token valide → `POST /api/auth/refresh` émet
   un nouveau JWT sans reforcer de saisie de mot de passe.
4. `POST /api/auth/logout` supprime les cookies et révoque le refresh token en base.

## Page d'accueil (landing)

- Route `/` publique, aucune donnée sensible.
- Contenu : nom du tribunal, logo, courte présentation institutionnelle, bouton
  "Se connecter" → `/login`.
- Reste statique côté frontend (pas besoin d'endpoint backend dédié sauf si le
  contenu doit être éditable — non prévu pour l'instant).
