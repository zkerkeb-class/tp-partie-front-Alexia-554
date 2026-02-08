import React, { useEffect, useState } from "react";
import './pokeCard.css';

// Presentational card — expects a `pokemon` object with fields used below.
// Will fetch a few move details (power) on mount to show attack damages.
const PokeCard = ({ pokemon, onClick, large = false }) => {
  if (!pokemon) return null;

  const primaryType = (pokemon.types && pokemon.types[0]) || 'normal';
  const typeClass = `type-${primaryType}`.toLowerCase();

  const [moves, setMoves] = useState([]); // [{ name, power }]

  useEffect(() => {
    let mounted = true;
    async function loadMoves() {
      setMoves([]);
      const rawMoves = (pokemon?.raw?.moves || []).slice(0, 4);
      if (!rawMoves.length) return;
      try {
        const promises = rawMoves.map((m) =>
          fetch(m.move.url)
            .then((r) => r.json())
            .then((md) => ({ name: m.move.name, power: md.power ?? null }))
            .catch(() => ({ name: m.move.name, power: null }))
        );
        const results = await Promise.all(promises);
        if (mounted) setMoves(results);
      } catch (err) {
        if (mounted) setMoves(rawMoves.map((m) => ({ name: m.move.name, power: null })));
      }
    }
    loadMoves();
    return () => { mounted = false; };
  }, [pokemon]);

  return (
    <article
      className={`pc-card ${large ? 'pc-card--large' : 'pc-card--compact'} ${typeClass}`}
      onClick={() => onClick && onClick(pokemon)}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(pokemon); }}
      aria-label={`Fiche de ${pokemon.name}`}
    >
      <div className="pc-card__chrome">
        <div className={`pc-type-logo pc-type--${primaryType}`} aria-hidden>
          <span className="pc-type-logo__abbr">{primaryType[0]?.toUpperCase()}</span>
        </div>

        <div className="pc-card__toprow">
          <div className="pc-nameWrap">
            <div className="pc-name">{pokemon.name}</div>
            <div className="pc-id">#{String(pokemon.id).padStart(3, '0')}</div>
          </div>
          <div className="pc-hp">PV <span className="pc-hp__value">{pokemon.hp ?? '—'}</span></div>
        </div>

        <div className="pc-card__art">
          <img src={pokemon.sprite || ''} alt={pokemon.name} className="pc-sprite" loading="lazy" />
        </div>

        <div className="pc-dim-and-attacks">
          <div className="pc-dimensions">
            <div className="pc-dim">{(pokemon.weight/10).toFixed(1)} kg</div>
            <div className="pc-dim">{(pokemon.height/10).toFixed(2)} m</div>
          </div>

          <div className="pc-attacks" aria-label="Attaques">
            {moves.length ? (
              moves.map((m) => (
                <div className="pc-attack" key={m.name}>
                  <div className="pc-attack__name">{m.name}</div>
                  <div className="pc-attack__power">{m.power ?? '—'}</div>
                </div>
              ))
            ) : (
              <div className="pc-attack pc-attack--placeholder">Aucune attaque affichée</div>
            )}
          </div>
        </div>

        <div className="pc-card__bottom">
          <div className="pc-desc pc-desc--small">{pokemon.description || 'Pas de description disponible.'}</div>
        </div>
      </div>
    </article>
  );
};

export default PokeCard;
