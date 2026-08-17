---
name: auth-security
description: Utiliser pour toute tâche liée à l'authentification (login, JWT, sessions, cookies), à la protection des routes, ou à un audit de sécurité de ce projet. Se déclenche pour tout ce qui touche à l'auth, aux mots de passe, ou avant toute mise en service.
---

# Authentification et sécurité

## Implémentation attendue

1. Table `USER` avec `password_hash` (bcrypt, coût ≥ 10) — jamais de mot de passe en clair.
2. `POST /api/auth/login` : vérifie `bcrypt.compare(password, user.password_hash)`.
   Si succès, signe un JWT (payload minimal : `{ id, role }`, expiration 15 min) et
   un refresh token (expiration 7 jours, stocké **hashé** en base pour pouvoir le
   révoquer au logout).
3. Les deux tokens sont posés en cookies `httpOnly`, `secure`, `sameSite=strict` —
   jamais dans `localStorage` ou `sessionStorage` (vulnérable au XSS).
4. `POST /api/auth/refresh` : vérifie le refresh token, émet un nouveau JWT.
5. `POST /api/auth/logout` : supprime les cookies, révoque le refresh token en base.
6. Middleware `auth.js` : lit le cookie JWT, vérifie la signature et l'expiration,
   attache `req.user`. Appliqué à toutes les routes `/api/*` sauf `/api/auth/*`.

## Ce qu'il ne faut jamais faire

- Comparer un mot de passe avec `===` en clair.
- Mettre une clé secrète JWT en dur dans le code.
- Renvoyer un message d'erreur différent selon que l'identifiant existe ou non
  (permet l'énumération de comptes) — toujours "Identifiants incorrects" générique.
- Stocker le refresh token en clair en base.

## Rate limiting

`/api/auth/login` doit être protégé par `express-rate-limit` (ex. 5 tentatives par
15 minutes par IP) pour limiter le brute-force.

## Avant toute mise en service

Dérouler intégralement `docs/SECURITY_CHECKLIST.md` et cocher chaque point.
