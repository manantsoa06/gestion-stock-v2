# Package de configuration OpenCode — Gestion de stock (Tribunal Administratif)

Ce dossier ne contient **pas le code applicatif** : il contient les instructions,
agents et skills qu'OpenCode utilisera pour générer/compiler le projet directement
sur ta machine Ubuntu.

## ⚠️ Correction par rapport à la demande initiale

OpenCode utilise réellement `AGENTS.md` (avec un S) à la racine, et range les agents
et skills dans `.opencode/agent/` et `.opencode/skill/` — pas `.agent/`. C'est cette
convention officielle qui a été suivie ici pour que le package fonctionne réellement.

## 1. Installer OpenCode

```bash
curl -fsSL https://opencode.ai/install | bash
```

Vérifie l'installation :

```bash
opencode --version
```

## 2. Installer PostgreSQL (nouvelle base, remplace MySQL)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER app_user WITH PASSWORD 'change_me';"
sudo -u postgres psql -c "CREATE DATABASE gestion_stock OWNER app_user;"
```

Adapte le mot de passe, et reporte-le dans le `.env` (étape 4).

## 3. Placer ce package dans ton projet

Décompresse l'archive `gestion-stock-opencode.zip` **à la racine de ton dossier de
projet** (celui qui contiendra `gestion-stock-backend/` et `gestion-stock-frontend/`).
La structure finale attendue :

```
mon-projet/
├── AGENTS.md
├── opencode.json
├── docs/
├── migrations/
├── .opencode/
│   ├── agent/
│   └── skill/
├── gestion-stock-backend.env.example
├── gestion-stock-backend/       # ton code existant (ou généré par OpenCode)
└── gestion-stock-frontend/      # ton code existant (ou généré par OpenCode)
```

Si tu repars de ton projet existant (celui déjà partagé), place ce package à la
racine du dossier `gestion-stock/` qui contient déjà `gestion-stock-backend/` et
`gestion-stock-frontend/`.

## 4. Configurer les variables d'environnement

```bash
cp gestion-stock-backend.env.example gestion-stock-backend/.env
```

Édite `gestion-stock-backend/.env` et renseigne au minimum :
- `DB_PASSWORD` (celui créé à l'étape 2)
- `JWT_SECRET` (génère-en un avec `openssl rand -hex 32`)
- `SEED_ADMIN_PASSWORD` (mot de passe du premier compte comptable)

Vérifie que `.env` est bien listé dans `gestion-stock-backend/.gitignore` — sinon
ajoute la ligne.

## 5. Lancer OpenCode

Depuis la racine du projet (là où se trouve `AGENTS.md`) :

```bash
opencode
```

OpenCode charge automatiquement `AGENTS.md`, `opencode.json`, et tous les fichiers
dans `.opencode/agent/` et `.opencode/skill/`.

### Premières instructions à donner à OpenCode

Donne les tâches dans l'ordre du plan (`docs/TASKS.md`). Exemple de premier message :

> Lis AGENTS.md et docs/ARCHITECTURE.md. Commence par l'étape 0 et l'étape 1 de
> docs/TASKS.md : initialise les migrations PostgreSQL pour toutes les tables de
> docs/DATA_MODEL.md, puis implémente le module d'authentification complet en
> suivant le skill auth-security. Utilise l'agent backend-dev pour cette tâche.

Pour une revue de sécurité avant mise en service :

> Utilise l'agent security-reviewer pour auditer le module d'authentification et
> toutes les routes /api/*.

## 6. Vérifier que tout tourne

```bash
cd gestion-stock-backend && npm install && npm run dev
```

Dans un autre terminal :

```bash
cd gestion-stock-frontend && npm install && npm run dev
```

Le frontend doit être accessible sur `http://localhost:5173`, avec la landing page
publique sur `/` et le formulaire de connexion sur `/login`.

## Contenu du package

| Fichier/dossier | Rôle |
|---|---|
| `AGENTS.md` | Instructions principales, lues automatiquement par OpenCode |
| `opencode.json` | Config OpenCode, référence les fichiers de doc comme instructions |
| `docs/ARCHITECTURE.md` | Architecture en couches détaillée |
| `docs/DATA_MODEL.md` | Schéma PostgreSQL cible complet |
| `docs/TASKS.md` | Plan de développement phasé |
| `docs/SECURITY_CHECKLIST.md` | Checklist à valider avant mise en service |
| `.opencode/skill/` | Compétences (backend, auth/sécurité, frontend/UI-UX, tests) |
| `.opencode/agent/` | Agents spécialisés (backend-dev, frontend-dev, security-reviewer, qa-tester) |
| `gestion-stock-backend.env.example` | Modèle de configuration d'environnement |
