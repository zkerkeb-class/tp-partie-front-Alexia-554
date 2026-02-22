Guide rapide — composant PokeCard (en français)

But
----
Carte présente les informations d'un Pokémon. Ce guide indique où modifier visuellement le composant sans casser la logique.

Emplacements clés
-----------------
- Taille de la carte : `src/components/pokeCard/pokeCard.css` -> variables `--pc-card-w` / `--pc-card-h` (section `:root`).
- Taille de l'image (artwork) : `.pc-card__art { height: ... }` (réduire pour libérer de l'espace vertical).
- Espacement entre cartes : `.pc-card { margin: 10px; }` — garde toujours au moins 10px.
- Position des types : `.pc-card__types` et `.pc-nameRow` (les types sont affichés à gauche du nom).
- Comportement des noms d'attaque : `.pc-attack__name` — actuellement wrap (retour à la ligne). Pour tronquer, changer `white-space: normal` -> `nowrap` et ajouter `text-overflow: ellipsis`.
- Variantes de taille : classes `.pc-card--compact` et `.pc-card--large`.

Conseils de modification
------------------------
- Toujours modifier d'abord la variable `--pc-card-h` si vous changez la hauteur de la carte : cela évite les débordements.
- Pour tester rapidement : sauvegarder et relancer `npm run dev` (Vite se recharge à chaud la plupart du temps).
- Si un texte déborde : vérifier `min-width: 0` sur le parent flex (déjà présent dans `.pc-card__info`).

Fichiers à connaître
--------------------
- JSX : `src/components/pokeCard/index.jsx` (structure, où sont insérés les `types`, le `name`, etc.)
- CSS : `src/components/pokeCard/pokeCard.css` (styles et variables)

Si tu veux que je :
- réduise encore l'image (ex. 40% au lieu de 44%), dis "réduis image" ;
- ou que je fasse une PR avec tests visuels, dis‑moi et je prépare ça.
