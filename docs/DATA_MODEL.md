# Modèle de données cible (PostgreSQL)

Base neuve, pas de migration de données existantes. Toutes les tables ci-dessous
doivent être créées via des fichiers dans `migrations/`, un fichier par étape logique.

## USER

| Colonne | Type | Contrainte |
|---|---|---|
| id | SERIAL | PK |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL (bcrypt) |
| role | VARCHAR(20) | NOT NULL DEFAULT 'admin' |
| created_at | TIMESTAMP | DEFAULT now() |

## PERSONNE (conservée, adaptée à Postgres)

| Colonne | Type |
|---|---|
| id_p | SERIAL PK |
| nom | VARCHAR(100) NOT NULL |
| prenom | VARCHAR(100) NOT NULL |
| sexe | VARCHAR(10) |
| grade | VARCHAR(100) |
| fonction | VARCHAR(100) |
| adresse | TEXT |
| telephone | VARCHAR(30) |

## MOBILIER

| Colonne | Type |
|---|---|
| id_m | VARCHAR(30) PK |
| designation | VARCHAR(150) NOT NULL |
| nomenclature | VARCHAR(150) |
| espece | VARCHAR(100) |
| pu | NUMERIC(12,2) |
| provenance | VARCHAR(150) |
| etat | VARCHAR(50) |
| observation | TEXT |

## CONSOMMABLE

| Colonne | Type |
|---|---|
| ref_c | VARCHAR(30) PK |
| libelle | VARCHAR(150) NOT NULL |
| categorie | VARCHAR(100) |
| qte | INTEGER NOT NULL DEFAULT 0 |

## POSSEDER (état courant — mobilier détenu par une personne)

| Colonne | Type |
|---|---|
| id_p | INTEGER FK → PERSONNE |
| id_m | VARCHAR(30) FK → MOBILIER |
| date_posseder | DATE |
| quantite_posseder | INTEGER |
| PK | (id_p, id_m) |

## PRENDRE (état courant — consommable pris par une personne)

| Colonne | Type |
|---|---|
| id_p | INTEGER FK → PERSONNE |
| ref_c | VARCHAR(30) FK → CONSOMMABLE |
| date_prendre | DATE |
| quantite_prendre | INTEGER |
| PK | (id_p, ref_c) |

## MOUVEMENT (nouveau — historique append-only, jamais supprimé)

| Colonne | Type | Détail |
|---|---|---|
| id | SERIAL | PK |
| user_id | INTEGER | FK → USER, qui a effectué le mouvement |
| id_p | INTEGER | FK → PERSONNE, personne/service concerné |
| type_item | VARCHAR(20) | 'MOBILIER' ou 'CONSOMMABLE' |
| item_ref | VARCHAR(30) | id_m ou ref_c selon type_item |
| type_mouvement | VARCHAR(20) | 'ATTRIBUTION', 'RESTITUTION', 'TRANSFERT' |
| quantite | INTEGER | NOT NULL |
| date_mouvement | TIMESTAMP | DEFAULT now() |
| commentaire | TEXT | optionnel |

`MOUVEMENT` est le journal de toutes les opérations. `POSSEDER`/`PRENDRE` restent la
vue "état actuel" rapide à requêter pour l'affichage courant — ne pas les fusionner.

## Index recommandés

- `MOUVEMENT(id_p, date_mouvement)` — historique par personne.
- `MOUVEMENT(item_ref, type_item)` — historique par article.
- `USER(username)` — déjà unique, l'index vient avec la contrainte.
