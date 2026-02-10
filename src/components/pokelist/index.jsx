// Composant : PokeList
// Description : affiche une liste filtrable de Pokémon (récupérés depuis l'API publique PokeAPI)
// Objectif du fichier : permettre la recherche, le filtrage par type/valeurs et ouvrir une fiche détaillée.

import React, { useEffect, useMemo, useState, useRef } from 'react';
import PokeCard from '../pokeCard';
import PokeCrud from '../pokeCrud';
import './pokelist.css';
import api from '../../services/api';

// Nombre de Pokémons par page (pagination)
const ITEMS_PER_PAGE = 20;

// Utiliser le service API centralisé

// Composant principal de la liste
const PokeList = () => {
  /* ---------------------------------------
     Etats principaux
     - all : tableau d'objets pokémon normalisés
     - loading : drapeau de chargement
     - currentPage : page actuelle (pagination)
     - totalPages : nombre total de pages
     - totalCount : nombre total de pokémons
  ---------------------------------------- */
  const [all, setAll] = useState([]); // objets détaillés normalisés
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState(null);

  /* ---------------------------------------
     Etats UI (contrôles de filtrage)
  ---------------------------------------- */
  const [query, setQuery] = useState(''); // recherche par nom
  const [typeFilter, setTypeFilter] = useState([]); // types cochés
  const [hpRange, setHpRange] = useState([0, 255]); // plage PV
  const [weightRange, setWeightRange] = useState([0, 1000]); // plage poids (hectogrammes)
  const [attackRange, setAttackRange] = useState([0, 200]); // plage attaque
  const [selected, setSelected] = useState(null); // pokémon sélectionné pour modal

  /* Ref pour l'auto-focus de la recherche */
  const searchInputRef = useRef(null);

  /* ---------------------------------------
     Effet : chargement des données depuis l'API backend avec pagination
     - Récupère une page de 20 pokémons à la fois
     - Normalise les champs utiles pour l'app
     - Permet la pagination via currentPage
  ---------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Construire les params pour la requête (support recherche globale et filtre type)
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (query && String(query).trim().length) params.search = query.trim();
        if (typeFilter && typeFilter.length) params.type = typeFilter.join(',');

        // Récupérer une page depuis notre API backend
        const res = await api.get('/pokemons', { params });

        // Récupérer les métadonnées de pagination
        const { pokemons, pagination } = res.data;

        // Normalisation : adapter la forme du backend à ce que la UI attend
        const normalized = (pokemons || []).map((p) => {
          return {
            id: p.id,
            name: (p.name && (p.name.french || p.name.english)) || p.name?.english || `#${p.id}`,
            types: p.type || p.types || [],
            hp: p.base?.HP ?? null,
            attack: p.base?.Attack ?? null,
            sprite: p.image || null,
            weight: p.weight ?? 0,
            height: p.height ?? 0,
            abilities: p.abilities || [],
            description: p.description || null,
            raw: p,
          };
        });

        if (!cancelled) {
          setAll(normalized);
          setTotalPages(pagination?.totalPages ?? 1);
          setTotalCount(pagination?.totalPokemons ?? (normalized.length || 0));
        }
      } catch (err) {
        // erreur réseau ou parsing — log pour debug mais ne crash pas l'app
        console.error('Erreur fetching pokemons', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentPage, query, typeFilter]); // re-run si la page, la recherche ou les types changent

  /* Auto-focus search input on component mount */
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  /* ---------------------------------------
     Calculer les bornes (min/max) utilisables pour les sliders
     - useMemo évite de recalculer quand `all` n'a pas changé
  ---------------------------------------- */
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

  // Quand les bornes deviennent disponibles, on initialise les sliders
  useEffect(() => {
    if (!bounds) return;
    setHpRange(bounds.hp);
    setWeightRange(bounds.weight);
    setAttackRange(bounds.attack);
  }, [bounds?.hp?.[0]]); // déclenche une seule fois quand bounds est défini

  // Extraire la liste des types présents (unique + triée)
  const [allTypes, setAllTypes] = useState([]);
  useEffect(() => {
    let cancelled = false;
    async function loadTypes() {
      try {
        const res = await api.get('/pokemons/types/all');
        if (!cancelled) setAllTypes(res.data.types || []);
      } catch (e) {
        console.error('Erreur fetching types', e);
      }
    }
    loadTypes();
    return () => { cancelled = true; };
  }, []);

  /* ---------------------------------------
     Filtrage principal
     - applique la recherche textuelle, le/les type(s) cochés et les plages numériques
     - renvoie la liste `filtered` utilisée pour l'affichage
  ---------------------------------------- */
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

  // Debounce minimal sur la recherche (placeholder pour amélioration)
  useEffect(() => {
    const id = setTimeout(() => {}, 250);
    return () => clearTimeout(id);
  }, [query]);

  // Raccourci clavier : ESC ferme la modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Affichage d'un loader tant que les données ne sont pas prêtes
  if (loading) return <div className="pl-loading">Chargement des Pokémon…</div>;

  // Helpers pour le modal détaillé : calculer les pourcentages relatifs dans le dataset
  const getStatMax = (statName) => {
    const vals = all.map(p => p.raw?.stats?.find(s => s.stat.name === statName)?.base_stat || 0);
    return Math.max(1, ...vals);
  };

  const formatStatName = (n) => (n || '').replace(/-/g, ' ').toUpperCase();

  /* ---------------------------------------
     Rendu JSX
     - structure divisée en : header, contrôles, méta, grille, modal
     - commentaires JSX explicatifs placés avant chaque bloc important
  ---------------------------------------- */
  return (
    <section className="pl-root">
      {/* Titre + bouton créer */}
      <div className="pl-header">
        <h2 className="pl-title">Pokédex</h2>
        <button 
          className="pl-create-btn"
          onClick={() => {
            setEditingPokemon(null);
            setShowCrudModal(true);
          }}
        >
          + Créer Pokémon
        </button>
      </div>

      {/* Controles : recherche + filtres */}
      <div className="pl-controls">
        {/* Recherche par nom */}
        <div className="pl-search">
          <input
            ref={searchInputRef}
            placeholder="Rechercher un Pokémon par nom…"
            value={query}
            onChange={(e) => { setCurrentPage(1); setQuery(e.target.value); }}
            aria-label="Rechercher un Pokémon par nom"
          />
        </div>

        {/* Filtres (types, PV, poids, attaque) */}
        <div className="pl-filters">
          {/* --- Types (checkboxes) --- */}
          <div className="pl-filter-group">
            <label>Types</label>
            <div className="pl-types">
              {allTypes.map((t) => (
                <label key={t} className="pl-typeLabel">
                  {/* case à cocher : ajoute/retire le type du filtre */}
                  <input
                    type="checkbox"
                    checked={typeFilter.includes(t)}
                    onChange={(e) => { setCurrentPage(1); setTypeFilter((cur) => e.target.checked ? [...cur, t] : cur.filter(x => x !== t)); }}
                  />
                  {/* pill visuelle — la classe CSS correspond au type */}
                  <span className={`pl-type-pill type-${t}`}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* --- PV (range) --- */}
          <div className="pl-filter-group">
            <label>PV</label>
            <div
              className="pl-range"
              style={{
                // style CSS custom pour afficher la portion sélectionnée sur la piste
                '--min': `${Math.round(((hpRange[0] - (bounds?.hp?.[0] ?? 0)) / Math.max(1, ((bounds?.hp?.[1] ?? 255) - (bounds?.hp?.[0] ?? 0)))) * 100)}%`,
                '--max': `${Math.round(((hpRange[1] - (bounds?.hp?.[0] ?? 0)) / Math.max(1, ((bounds?.hp?.[1] ?? 255) - (bounds?.hp?.[0] ?? 0)))) * 100)}%`,
              }}
            >
              {/* slider min */}
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

              {/* slider max */}
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

              {/* affichage des valeurs sélectionnées */}
              <div className="pl-range-values">{hpRange[0]} — {hpRange[1]}</div>
            </div>
          </div>

          {/* --- Poids (hg) --- */}
          <div className="pl-filter-group">
            <label>Poids (kg)</label>
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

              {/* conversion hg → kg à l'affichage */}
              <div className="pl-range-values">{(weightRange[0]/10).toFixed(1)}kg — {(weightRange[1]/10).toFixed(1)}kg</div>
            </div>
          </div>

          {/* --- Attaque (range) --- */}
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

      {/* Meta : information de pagination + boutons */}
      <div className="pl-meta">
        <div>
          {totalCount > 0 ? (
            <>
              Page {currentPage} / {totalPages} 
              <span className="pl-meta__count">({totalCount} Pokémons au total)</span>
            </>
          ) : (
            <span>Chargement...</span>
          )}
        </div>
        
        {/* Boutons de pagination */}
        <div className="pl-pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            aria-label="Page précédente"
          >
            ← Précédente
          </button>
          
          {/* Afficher les numéros de page proches (ex: 1 2 3* 4 5) */}
          <div className="pl-pagination__numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pl-pagination__dots">…</span>}
                  <button
                    className={`pl-pagination__btn ${p === currentPage ? 'pl-pagination__btn--active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                    disabled={loading}
                    aria-label={`Go to page ${p}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            aria-label="Page suivante"
          >
            Suivante →
          </button>
        </div>
      </div>

      {/* Grille des cartes */}
      <div className="pl-grid" role="list">
        {filtered.map((p) => (
          <div role="listitem" key={p.id} className="pl-grid__item">
            {/* PokeCard est purement présentational — reçoit `pokemon` et `onClick` */}
            <PokeCard pokemon={p} onClick={setSelected} />
          </div>
        ))}
      </div>

      {/* Modal de détail (affichée si `selected`) */}
      {selected && (
        <div className="pl-modal" role="dialog" aria-modal="true" aria-label={`Fiche ${selected.name}`} onClick={() => setSelected(null)}>
          <div className={`pl-modal__panel ${'type-' + (selected.types?.[0] || 'normal')}`} onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal__header">
              <button className="pl-modal__close" onClick={() => setSelected(null)} aria-label="Fermer">✕</button>
              <div className="pl-modal__actions">
                <button 
                  className="pl-modal__btn pl-modal__btn--edit"
                  onClick={() => {
                    setEditingPokemon(selected);
                    setShowCrudModal(true);
                  }}
                >
                  ✏️ Modifier
                </button>
                <button 
                  className="pl-modal__btn pl-modal__btn--delete"
                  onClick={() => {
                    setEditingPokemon(selected);
                    setShowCrudModal(true);
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>

            {/* Wrapper pour left et details côte à côte */}
            <div className="pl-modal__content">

            {/* --- GAUCHE : encadré coloré (type) contenant type / nom / image --- */}
            <div className="pl-modal__left">
              <div className={`pl-leftBox pc-type--${selected.types?.[0] || 'normal'}`} role="img" aria-label={`${selected.name} — ${selected.types?.[0] || ''}`}>
                <div className="pl-leftBox__header">
                  <span className={`pl-type-pill type-${selected.types?.[0] || 'normal'}`}>{selected.types?.[0]}</span>
                  <div className="pl-leftBox__id">#{String(selected.id).padStart(3, '0')}</div>
                </div>

                <h3 className="pl-leftBox__name">{selected.name}</h3>

                <div className="pl-leftBox__art">
                  <img src={selected.sprite} alt={selected.name} className="pl-leftBox__img" loading="lazy" />
                </div>
{/*
                <div className="pl-leftBox__frames">
                  <div className="pl-frame pl-frame--thin" aria-hidden="true" />
                  <div className="pl-frame pl-frame--thick" aria-hidden="true" />
                </div>
                */}
              </div>
            </div>

            {/* --- DROITE : barres de stats + description en bas --- */}
            <aside className="pl-modal__details" aria-labelledby={`details-${selected.id}`}>
              <h3 id={`details-${selected.id}`}>Statistiques</h3>

              <div className="pl-statsList" role="list">
                {(selected.raw?.stats || [
                  { stat: { name: 'hp' }, base_stat: selected.hp },
                  { stat: { name: 'attack' }, base_stat: selected.attack }
                ]).map((s) => {
                  const name = s.stat.name;
                  const value = s.base_stat || 0;
                  const max = getStatMax(name);
                  const pct = Math.round((value / Math.max(1, max)) * 100);
                  return (
                    <div className="pl-statBar" role="listitem" key={name}>
                      <div className="pl-statBar__meta">
                        <div className="pl-statBar__label">{formatStatName(name)}</div>
                        <div className="pl-statBar__value">{value}</div>
                      </div>
                      <div className="pl-statBar__track" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={`${formatStatName(name)} ${value}`}>
                        <div className="pl-statBar__fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pl-modal__desc" role="region" aria-label={`Description ${selected.name}`}>
                <h4>Description</h4>
                <p className="pl-modal__summary">{selected.description}</p>
              </div>
            </aside>
            </div>
            {/* Fin du wrapper pl-modal__content */}
          </div>
        </div>
      )}

      {/* Modal CRUD (créer/modifier/supprimer) */}
      {showCrudModal && (
        <PokeCrud 
          pokemon={editingPokemon}
          onClose={() => {
            setShowCrudModal(false);
            setEditingPokemon(null);
          }}
          onSuccess={() => {
            // Recharger la page actuelle après une modification
            setCurrentPage(1);
          }}
        />
      )}
    </section>
  );
};

export default PokeList;

