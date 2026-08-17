---
name: react-frontend-uiux
description: Utiliser pour toute tâche frontend React de ce projet — composants, pages, routing, état d'authentification, et pour la conception de la landing page publique. Se déclenche pour la création de pages/composants ou toute question de design UI.
---

# Frontend React + UI/UX

## État d'authentification

- `AuthContext` doit interroger `GET /api/auth/me` au chargement de l'app (dans un
  `useEffect`), pas juste garder un `useState` local qui se perd au refresh.
- `PrivateRoute` doit réellement encapsuler toutes les routes protégées dans
  `App.jsx` (bug existant : le composant existe mais n'est jamais utilisé).
- `api.jsx` (axios) doit avoir `withCredentials: true` pour que les cookies httpOnly
  partent avec chaque requête.

## Landing page publique (`pages/Home.jsx`)

Utilisateur cible : le comptable du tribunal, non technique. La page doit rester
**minimaliste** :

- Logo/nom du tribunal, une phrase de présentation institutionnelle (2-3 lignes max).
- Un bouton "Se connecter" bien visible, menant à `/login`.
- Pas de données internes, pas de statistiques, pas de contenu nécessitant une
  authentification.
- Route `/` publique, distincte de `/login` — ne pas rediriger automatiquement
  vers `/login`, laisser la landing s'afficher pour un visiteur non connecté.

## Principes UI/UX pour ce projet

- Public non technique (comptable) : libellés en français clair, pas de jargon,
  boutons d'action explicites ("Ajouter un mobilier" plutôt qu'une icône seule).
- Cohérence avec l'existant : conserver la palette et les styles déjà en place
  (`styles/global.css`, `styles/dashboard.css`, etc.), ne pas réinventer l'identité
  visuelle sans raison.
- Formulaires : validation côté client immédiate (champs requis, types), messages
  d'erreur explicites et non techniques.
- Accessibilité de base : labels associés aux champs (`<label for>` correctement lié
  à l'`id` du champ — bug présent dans le `Login.jsx` actuel à corriger), contraste
  suffisant, navigation clavier possible sur les formulaires.
