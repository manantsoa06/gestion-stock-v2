---
name: frontend-design
description: Utiliser pour toute tâche de conception visuelle des pages de ce projet (Personnes, Mobiliers, Consommables, Mouvements, Dashboard, landing page). Se déclenche pour la création ou l'amélioration de composants UI, de tableaux de données, de formulaires, ou d'états vides.
---

# Frontend design — outil interne institutionnel

Ce projet n'est pas un site vitrine : c'est un **outil de gestion interne** utilisé
au quotidien par un comptable non technique au sein d'un tribunal administratif.
Le design doit servir la clarté et l'efficacité, pas impressionner. Éviter tout
excès décoratif — mais éviter aussi le rendu "table Bootstrap par défaut" qui ne
dit rien de l'usage réel de la page.

## Principe directeur

Chaque page a un seul métier : montrer un état (liste de personnes, de mobiliers...)
et permettre une action claire dessus (ajouter, modifier, attribuer, restituer).
La structure visuelle doit refléter ce métier, pas le décorer.

## Système de tokens à respecter (cohérence entre toutes les pages)

- **Couleurs** : reprendre la palette déjà présente dans `src/styles/global.css`
  (institution/tribunal — probablement des tons sobres, bleu/gris institutionnel).
  Si aucune palette claire n'existe encore, en définir une sobre : 1 couleur
  primaire institutionnelle, 1 couleur d'accent pour les actions (boutons "Ajouter",
  "Attribuer"), des gris neutres pour le texte et les bordures, une couleur de
  succès et une d'alerte (ex. stock bas, rejet de mouvement).
- **Typographie** : une seule famille de police pour l'ensemble de l'app, hiérarchie
  claire (titres de page, en-têtes de colonnes de tableau, corps de texte, légendes).
- **Composants réutilisables** : un style de tableau unique (utilisé par Personnes,
  Mobiliers, Consommables, Mouvements), un style de formulaire unique (ajout/édition),
  un style de bouton primaire/secondaire unique. Ne pas réinventer le style à chaque
  page.

## Ce que chaque page de données doit contenir

Pour Personnes, Mobiliers, Consommables :
- Un titre de page clair et une action principale visible ("+ Ajouter une personne").
- Un tableau avec tri/recherche basique si la liste peut devenir longue.
- Un **état vide explicite** si la table est vide : pas juste un tableau sans lignes,
  mais un message qui explique quoi faire ("Aucun mobilier enregistré pour l'instant.
  Ajoutez le premier avec le bouton ci-dessus.").
- Actions par ligne : modifier, supprimer, voir le détail (pour Personnes : voir ses
  attributions en cours).

Pour Mouvements :
- Formulaire de création de mouvement (attribution/restitution/transfert) avec des
  champs compréhensibles pour un non-technicien : sélection de la personne, sélection
  de l'article (mobilier ou consommable), quantité, commentaire optionnel.
- Historique des mouvements sous forme de liste chronologique, pas juste un tableau
  brut — chaque ligne doit se lire comme une phrase ("Jean Dupont a reçu 2 stylos
  le 21/07/2026").
- Messages d'erreur du backend (ex. "Stock insuffisant") affichés clairement près du
  formulaire, dans un langage compréhensible, jamais le message technique brut.

Pour le Dashboard :
- Les statistiques déjà affichées (Personnes, Mobiliers, Consommables, stock) restent,
  mais organisées en cartes visuellement distinctes plutôt qu'en liste plate.
- Ajouter des raccourcis vers les actions fréquentes (ajouter un mouvement, voir les
  stocks bas) si pertinent.

## Écriture (labels, messages, boutons)

- Verbes d'action explicites : "Ajouter une personne" plutôt que "+" seul ou "Nouveau".
- Le nom d'un bouton doit correspondre exactement à ce qu'il produit : un bouton
  "Attribuer" déclenche une action nommée pareil dans le message de confirmation
  ("Attribution enregistrée"), jamais un mélange ("Créé avec succès" pour un bouton
  "Attribuer").
- Pas de jargon système : "quantité disponible" plutôt que "qte", même si la colonne
  DB s'appelle `qte` en interne.
- Messages d'erreur : dire ce qui s'est passé et quoi faire, jamais un message vague
  ("Erreur serveur") ni un message technique brut ("500 Internal Server Error").

## Restreindre les effets

Pas d'animation décorative, pas de dégradés, pas d'ombres portées excessives. Une
seule micro-interaction discrète est suffisante (ex. un léger changement au survol
des lignes de tableau ou des boutons). L'app doit être utilisable et lisible sans
JavaScript avancé — c'est un outil de travail quotidien, pas une démonstration.

## Accessibilité (non négociable ici)

- Contraste suffisant (le comptable peut être amené à l'utiliser toute la journée).
- Chaque champ de formulaire a un `<label>` correctement associé via `htmlFor`/`id`.
- Navigation clavier fonctionnelle sur les tableaux et formulaires.
- Focus visible sur tous les éléments interactifs.
