---
name: testing-qa
description: Utiliser pour écrire ou revoir des tests sur ce projet — tests backend (routes, services) et vérifications avant toute livraison. Se déclenche en fin de chaque étape du plan de développement.
---

# Tests et QA

## Niveau attendu (pragmatique, pas d'over-engineering)

Ce projet n'a pas besoin d'une couverture exhaustive, mais chaque fonctionnalité
critique doit avoir au moins un test smoke avant d'être considérée terminée.

## Tests minimums obligatoires

1. **Auth** : login avec identifiants valides (200 + cookie posé), login avec
   identifiants invalides (message générique, pas de 500), accès à une route
   protégée sans token (401).
2. **Mouvements** : création d'une attribution de mobilier crée bien une ligne dans
   `MOUVEMENT` ET met à jour `POSSEDER`.
3. **Consommables** : la quantité (`qte`) diminue correctement après une prise, ne
   passe jamais en négatif (vérifier qu'il y a bien un contrôle métier dans le
   service, pas seulement en base).

## Outils recommandés

- Backend : `jest` ou `vitest` + `supertest` pour tester les routes HTTP directement.
- Utiliser une base PostgreSQL de test séparée (ou un schéma dédié), jamais la base
  de développement/production pour les tests automatisés.

## Avant chaque livraison d'étape

- Lancer les tests existants, vérifier qu'aucun ne casse.
- Dérouler manuellement le parcours utilisateur concerné dans le navigateur.
- Vérifier les logs serveur : aucune erreur inattendue lors du parcours normal.
