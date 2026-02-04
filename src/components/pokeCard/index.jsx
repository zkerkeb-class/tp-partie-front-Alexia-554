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
      <header className="pc-card__header">
        <div className="pc-card__id">#{String(pokemon.id).padStart(3, '0')}</div>
        <div className="pc-card__types">
          {pokemon.types.map((t) => (
            <span key={t} className={`pc-type pc-type--${t}`}>{t}</span>
          ))}
        </div>
      </header>

      <div className="pc-card__body">
        <div className="pc-card__art">
          <img
            src={pokemon.sprite || ''}
            alt={pokemon.name}
            loading="lazy"
            className="pc-sprite"
          />
        </div>

        <div className="pc-card__info">
          <h3 className="pc-name">{pokemon.name}</h3>

          <div className="pc-stats">
            <div className="pc-stat">
              <div className="pc-stat__label">PV</div>
              <div className="pc-stat__value">{pokemon.hp ?? '—'}</div>
            </div>
            <div className="pc-stat">
              <div className="pc-stat__label">ATQ</div>
              <div className="pc-stat__value">{pokemon.attack ?? '—'}</div>
            </div>
            <div className="pc-dimensions">
              <div>{(pokemon.weight/10).toFixed(1)} kg</div>
              <div>{(pokemon.height/10).toFixed(2)} m</div>
            </div>
          </div>

          {large ? (
            <p className="pc-desc">{pokemon.description || 'Pas de description disponible.'}</p>
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