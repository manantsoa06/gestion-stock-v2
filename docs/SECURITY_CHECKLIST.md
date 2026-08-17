# Checklist sécurité — à valider avant toute mise en service

- [ ] Aucun secret (mot de passe DB, clé JWT) en dur dans le code source.
- [ ] `.env` présent dans `.gitignore`, `.env.example` versionné sans valeurs réelles.
- [ ] Mots de passe utilisateurs hashés avec bcrypt (coût ≥ 10), jamais loggés en clair.
- [ ] JWT signé avec une clé secrète forte (≥ 32 caractères aléatoires), stockée en
      variable d'environnement.
- [ ] Cookies d'authentification en `httpOnly`, `secure`, `sameSite=strict`.
- [ ] Toutes les routes `/api/*` sensibles protégées par le middleware d'auth —
      vérifier explicitement qu'aucune route de suppression/modification n'est
      accessible sans authentification.
- [ ] `cors` restreint à l'origine exacte du frontend, pas de wildcard `*` en
      production.
- [ ] `helmet` activé.
- [ ] Rate limiting sur `/api/auth/login` (ex. 5 tentatives / 15 min / IP).
- [ ] Toutes les requêtes SQL paramétrées, aucune concaténation de chaînes.
- [ ] Messages d'erreur génériques renvoyés au client, détails complets uniquement
      dans les logs serveur.
- [ ] Validation des payloads sur toutes les routes POST/PUT (types, longueurs,
      champs requis).
- [ ] Aucune donnée sensible visible sur la landing page publique.
- [ ] Dépendances à jour (`npm audit` sans vulnérabilité critique/haute non résolue).
