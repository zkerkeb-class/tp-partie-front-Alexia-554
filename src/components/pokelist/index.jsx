import React, { useEffect, useMemo, useState } from 'react';
import PokeCard from '../pokeCard';
import './pokelist.css';

const DEFAULT_LIMIT = 80; // sensible default for dev — user can charger plus

const fetchJson = (url) => fetch(url).then((r) => r.json());

const PokeList = () => {
  const [all, setAll] = useState([]); // full detailed objects
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // UI state
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const [hpRange, setHpRange] = useState([0, 255]);
  const [weightRange, setWeightRange] = useState([0, 1000]);
  const [attackRange, setAttackRange] = useState([0, 200]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await fetchJson(`https://pokeapi.co/api/v2/pokemon?limit=${Math.max(limit, 20)}`);
        // fetch details in parallel (but limited number)
        const detailPromises = list.results.map((p) => fetchJson(p.url).catch(() => null));
        const details = await Promise.all(detailPromises);

        // For description we need species endpoint — fetch in parallel but only when available
        const speciesPromises = details.map((d) => (d && d.species ? fetchJson(d.species.url).catch(() => null) : null));
        const species = await Promise.all(speciesPromises);

        const normalized = details
          .filter(Boolean)
          .map((d, idx) => {
            const sp = species[idx] || {};
            const flavor = (sp.flavor_text_entries || []).find((f) => f.language?.name === 'fr')
              || (sp.flavor_text_entries || []).find((f) => f.language?.name === 'en')
              || null;

            return {
              id: d.id,
              name: d.name,
              types: d.types.map((t) => t.type.name),
              hp: d.stats.find((s) => s.stat.name === 'hp')?.base_stat,
              attack: d.stats.find((s) => s.stat.name === 'attack')?.base_stat,
              sprite: d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default || null,
              weight: d.weight,
              height: d.height,
              abilities: d.abilities.map((a) => a.ability.name),
              description: flavor ? flavor.flavor_text.replace(/\n|\f/g, ' ') : null,
              raw: d,
            };
          });

        if (!cancelled) {
          setAll(normalized);
        }
      } catch (err) {
        console.error('Erreur fetching pokemons', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limit]);

  // derive filter bounds from data
  const bounds = useMemo(() => {
    if (!all.length) return null;
    const hpVals = all.map((p) => p.hp || 0);
    const wVals = all.map((p) => p.weight || 0);
    const aVals = all.map((p) => p.attack || 0);
    return {
      hp: [Math.min(...hpVals), Math.max(...hpVals)],
      weight: [Math.min(...wVals), Math.max(...wVals)],
      attack: [Math.min(...aVals), Math.max(...aVals)],
    };
  }, [all]);

  useEffect(() => {
    if (!bounds) return;
    setHpRange(bounds.hp);
    setWeightRange(bounds.weight);
    setAttackRange(bounds.attack);
  }, [bounds?.hp?.[0]]); // run when bounds become available

  const types = useMemo(() => {
    const s = new Set();
    all.forEach((p) => p.types.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [all]);

  // Filtering
  const filtered = useMemo(() => {
    return all.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter.length && !p.types.some((t) => typeFilter.includes(t))) return false;
      if ((p.hp || 0) < hpRange[0] || (p.hp || 0) > hpRange[1]) return false;
      if ((p.weight || 0) < weightRange[0] || (p.weight || 0) > weightRange[1]) return false;
      if ((p.attack || 0) < attackRange[0] || (p.attack || 0) > attackRange[1]) return false;
      return true;
    });
  }, [all, query, typeFilter, hpRange, weightRange, attackRange]);

  // small debounce for search
  useEffect(() => {
    const id = setTimeout(() => {}, 250);
    return () => clearTimeout(id);
  }, [query]);

  // keyboard: close modal on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) return <div className="pl-loading">Chargement des Pokémon…</div>;

  return (
    <section className="pl-root">
      <h2 className="pl-title">Pokédex</h2>

      <div className="pl-controls">
        <div className="pl-search">
          <input
            placeholder="Rechercher un Pokémon par nom…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher un Pokémon par nom"
          />
        </div>

        <div className="pl-filters">
          <div className="pl-filter-group">
            <label>Types</label>
            <div className="pl-types">
              {types.map((t) => (
                <label key={t} className="pl-typeLabel">
                  <input
                    type="checkbox"
                    checked={typeFilter.includes(t)}
                    onChange={(e) => setTypeFilter((cur) => e.target.checked ? [...cur, t] : cur.filter(x => x !== t))}
                  />
                  <span className={`pl-type-pill type-${t}`}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pl-filter-group">
            <label>PV</label>
            <div
              className="pl-range"
              style={{
                '--min': `${Math.round(((hpRange[0] - (bounds?.hp?.[0] ?? 0)) / Math.max(1, ((bounds?.hp?.[1] ?? 255) - (bounds?.hp?.[0] ?? 0)))) * 100)}%`,
                '--max': `${Math.round(((hpRange[1] - (bounds?.hp?.[0] ?? 0)) / Math.max(1, ((bounds?.hp?.[1] ?? 255) - (bounds?.hp?.[0] ?? 0)))) * 100)}%`,
              }}
            >
              <input
                type="range"
                min={bounds?.hp?.[0] ?? 0}
                max={bounds?.hp?.[1] ?? 255}
                value={hpRange[0]}
                aria-label="PV minimum"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHpRange([Math.min(v, hpRange[1]), hpRange[1]]);
                }}
              />

              <input
                type="range"
                min={bounds?.hp?.[0] ?? 0}
                max={bounds?.hp?.[1] ?? 255}
                value={hpRange[1]}
                aria-label="PV maximum"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHpRange([hpRange[0], Math.max(v, hpRange[0])]);
                }}
              />

              <div className="pl-range-values">{hpRange[0]} — {hpRange[1]}</div>
            </div>
          </div>

          <div className="pl-filter-group">
            <label>Poids (hg)</label>
            <div
              className="pl-range"
              style={{
                '--min': `${Math.round(((weightRange[0] - (bounds?.weight?.[0] ?? 0)) / Math.max(1, ((bounds?.weight?.[1] ?? 1000) - (bounds?.weight?.[0] ?? 0)))) * 100)}%`,
                '--max': `${Math.round(((weightRange[1] - (bounds?.weight?.[0] ?? 0)) / Math.max(1, ((bounds?.weight?.[1] ?? 1000) - (bounds?.weight?.[0] ?? 0)))) * 100)}%`,
              }}
            >
              <input
                type="range"
                min={bounds?.weight?.[0] ?? 0}
                max={bounds?.weight?.[1] ?? 1000}
                value={weightRange[0]}
                aria-label="Poids minimum"
                onChange={(e) => setWeightRange(([Math.min(Number(e.target.value), weightRange[1]), weightRange[1]]))}
              />
              <input
                type="range"
                min={bounds?.weight?.[0] ?? 0}
                max={bounds?.weight?.[1] ?? 1000}
                value={weightRange[1]}
                aria-label="Poids maximum"
                onChange={(e) => setWeightRange([weightRange[0], Math.max(Number(e.target.value), weightRange[0])])}
              />
              <div className="pl-range-values">{(weightRange[0]/10).toFixed(1)}kg — {(weightRange[1]/10).toFixed(1)}kg</div>
            </div>
          </div>

          <div className="pl-filter-group">
            <label>Attaque</label>
            <div
              className="pl-range"
              style={{
                '--min': `${Math.round(((attackRange[0] - (bounds?.attack?.[0] ?? 0)) / Math.max(1, ((bounds?.attack?.[1] ?? 200) - (bounds?.attack?.[0] ?? 0)))) * 100)}%`,
                '--max': `${Math.round(((attackRange[1] - (bounds?.attack?.[0] ?? 0)) / Math.max(1, ((bounds?.attack?.[1] ?? 200) - (bounds?.attack?.[0] ?? 0)))) * 100)}%`,
              }}
            >
              <input
                type="range"
                min={bounds?.attack?.[0] ?? 0}
                max={bounds?.attack?.[1] ?? 200}
                value={attackRange[0]}
                aria-label="Attaque minimum"
                onChange={(e) => setAttackRange([Math.min(Number(e.target.value), attackRange[1]), attackRange[1]])}
              />
              <input
                type="range"
                min={bounds?.attack?.[0] ?? 0}
                max={bounds?.attack?.[1] ?? 200}
                value={attackRange[1]}
                aria-label="Attaque maximum"
                onChange={(e) => setAttackRange([attackRange[0], Math.max(Number(e.target.value), attackRange[0])])}
              />
              <div className="pl-range-values">{attackRange[0]} — {attackRange[1]}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pl-meta">
        <div>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</div>
        {all.length > limit && (
          <button onClick={() => setLimit((l) => Math.min(l + DEFAULT_LIMIT, all.length))}>Charger plus</button>
        )}
      </div>

      <div className="pl-grid" role="list">
        {filtered.map((p) => (
          <div role="listitem" key={p.id} className="pl-grid__item">
            <PokeCard pokemon={p} onClick={setSelected} />
          </div>
        ))}
      </div>

      {selected && (
        <div className="pl-modal" role="dialog" aria-modal="true" aria-label={`Fiche ${selected.name}`} onClick={() => setSelected(null)}>
          <div className="pl-modal__panel" onClick={(e) => e.stopPropagation()}>
            <button className="pl-modal__close" onClick={() => setSelected(null)} aria-label="Fermer">✕</button>
            <PokeCard pokemon={selected} onClick={null} large />

            <div className="pl-modal__details">
              <h3>Détails</h3>
              <dl>
                <dt>Nom</dt><dd>{selected.name}</dd>
                <dt>Types</dt><dd>{selected.types.join(', ')}</dd>
                <dt>PV</dt><dd>{selected.hp}</dd>
                <dt>Attaque</dt><dd>{selected.attack}</dd>
                <dt>Taille</dt><dd>{(selected.height/10).toFixed(2)} m</dd>
                <dt>Poids</dt><dd>{(selected.weight/10).toFixed(1)} kg</dd>
                <dt>Capacités</dt><dd>{selected.abilities.join(', ')}</dd>
                <dt>Description</dt><dd>{selected.description}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PokeList;
