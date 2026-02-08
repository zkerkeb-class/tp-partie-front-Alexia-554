// PokeCard — composant présentational
// But : afficher une carte Pokémon compacte et accessible.
// Où modifier :
//  - Taille globale : variables CSS dans `pokeCard.css` (--pc-card-w / --pc-card-h)
//  - Taille de l'image : `.pc-card__art { height: ... }`
//  - Espacement entre cartes : `.pc-card { margin: 10px; }`
//  - Position des types : `.pc-card__types` / `.pc-nameRow`
// Les commentaires dans ce fichier indiquent les endroits sûrs pour modifier.

import React from "react";
import './pokeCard.css';

// Presentational card — expects a `pokemon` object already containing the fields used below.
// pokemon: { id, name, types: [string], hp, attack, sprite, weight, height, description, abilities }
const PokeCard = ({ pokemon, onClick, large = false }) => {
  if (!pokemon) return null;

  const primaryType = (pokemon.types && pokemon.types[0]) || 'normal';
  const typeClass = `type-${primaryType}`.toLowerCase();

  return (
    <article
      className={`pc-card ${large ? 'pc-card--large' : 'pc-card--compact'} ${typeClass}`}
      onClick={() => onClick && onClick(pokemon)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick && onClick(pokemon); }}
      aria-label={`Détails de ${pokemon.name}`}
    >
      {//<header className="pc-card__header"></header>
      }
      <header></header>

      <div className="pc-card__body">
        <div className="pc-card__info">
          <div className="pc-nameRow">
            <div className="pc-card__types">
              {pokemon.types.map((t) => (
                <span key={t} className={`pc-type pc-type--${t}`}>{t}</span>
              ))}
            </div>
            <h3 className="pc-name">{pokemon.name}</h3>
            <div className="pc-card__id">#{String(pokemon.id).padStart(3, '0')}</div>
          </div>

          {/* illustration centrée SOUS le nom */}
          <div className="pc-card__art pc-card__art--centered">
            <img
              src={pokemon.sprite || ''}
              alt={pokemon.name}
              loading="lazy"
              className="pc-sprite"
            />
          </div>

          {/* stats : occuper toute la largeur sous l'image */}
          <div className="pc-stats">
            <div className="pc-statsRow">
              <div className="pc-stat">
                <div className="pc-stat__label">PV</div>
                <div className="pc-stat__value">{pokemon.hp ?? '—'}</div>
              </div>

              <div className="pc-stat">
                <div className="pc-stat__label">ATQ</div>
                <div className="pc-stat__value">{pokemon.attack ?? '—'}</div>
              </div>

              <div className="pc-dimensions">
                <div className="pc-dim">{(pokemon.weight/10).toFixed(1)} kg</div>
                <div className="pc-dim">{(pokemon.height/10).toFixed(2)} m</div>
              </div>
            </div>
          </div>

          {large ? (
            /* Dans la vue "large" on conserve le paragraphe descriptif DANS la carte (gauche)
               — la fiche détaillée (dl) est rendue par le parent dans la colonne de droite */
            <>
              <p className="pc-desc">{pokemon.description || 'Pas de description disponible.'}</p>
            </>
          ) : (
            <p className="pc-desc pc-desc--short">{pokemon.description ? `${pokemon.description.slice(0, 90)}…` : '—'}</p>
          )}

          <div className="pc-card__footer">
            <button className="pc-btn" onClick={(e) => { e.stopPropagation(); onClick && onClick(pokemon); }}>Voir détails</button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PokeCard;