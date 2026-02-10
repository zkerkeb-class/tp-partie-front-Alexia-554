Résumé rapide — où modifier l'application (fichiers commentés)

But
----
Ce document récapitule les endroits clés du code commentés en français pour te permettre de modifier l'UI et le comportement rapidement.

Fichiers source commentés
-------------------------
- `src/main.jsx` — point d'entrée : changez le composant racine si nécessaire.
- `src/index.css` — styles globaux (polices, couleurs, thème clair/sombre).
- `src/App.jsx` — assemblage des composants visibles (où ajouter/enlever des composants).
- `src/App.css` — layout global et utilitaires (grille, modal, responsive).

Composants
----------
- `src/components/pokeCard/`
  - `index.jsx` — structure de la carte, où modifier le rendu (types, nom, stats).
  - `pokeCard.css` — variables `--pc-card-w`, `--pc-card-h`, `.pc-card__art { height }`, et `.pc-attack__name` (wrap vs ellipsis).
  - `README.md` — guide spécifique au composant.

- `src/components/pokelist/`
  - `index.jsx` — logique de fetch, normalisation, filtres et sliders (commenté en français).
  - `pokelist.css` — sliders, pills de type et layout des filtres.

- `src/components/title/`
  - `index.jsx` & `index.css` — composant de titre simple (prop `label`).

- `src/components/counter/`
  - `index.jsx` — exemple `useState` / `useEffect` (facile à modifier pour vos tests).

Conseils pratiques
------------------
- Tester les changements rapidement : `npm run dev` (Vite + HMR).
- Si un texte déborde dans un flex container : vérifier `min-width: 0` sur le parent (déjà appliqué dans les composants adaptés).
- Pour l'apparence, privilégier la modification des variables CSS en tête des fichiers (`:root` ou `--*`).

Souhaites‑tu que je :
- crée une PR avec ces commentaires et un changelog ?
- ou que j'applique d'autres ajustements visuels (ex. réduire l'image à 40%) ?

