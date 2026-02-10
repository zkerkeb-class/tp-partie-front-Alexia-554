import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './pokeCrud.css';

/**
 * Composant PokeCrud - Formulaire pour créer/modifier/supprimer un Pokémon
 * @param {Object} pokemon - Pokémon à éditer (null pour créer)
 * @param {Function} onClose - Callback pour fermer le modal
 * @param {Function} onSuccess - Callback quand l'opération réussit
 */
const PokeCrud = ({ pokemon, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: { french: '', english: '', japanese: '', chinese: '' },
    type: [],
    base: {
      HP: '',
      Attack: '',
      Defense: '',
      SpecialAttack: '',
      SpecialDefense: '',
      Speed: '',
    },
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [availableTypes] = useState([
    'Normal', 'Fire', 'Water', 'Grass', 'Flying',
    'Fight', 'Poison', 'Ground', 'Rock', 'Bug',
    'Ghost', 'Steel', 'Psychic', 'Ice', 'Dragon',
    'Dark', 'Fairy'
  ]);

  // Pré-remplir le formulaire si on édite un Pokémon existant
  useEffect(() => {
    if (pokemon && pokemon.raw) {
      const p = pokemon.raw;
      setFormData({
        id: p.id || '',
        name: p.name || { french: '', english: '', japanese: '', chinese: '' },
        type: p.type || [],
        base: p.base || {
          HP: '',
          Attack: '',
          Defense: '',
          SpecialAttack: '',
          SpecialDefense: '',
          Speed: '',
        },
        image: p.image || '',
      });
    }
  }, [pokemon]);

  const handleNameChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      name: { ...prev.name, [lang]: value }
    }));
  };

  const handleStatChange = (stat, value) => {
    setFormData(prev => ({
      ...prev,
      base: { ...prev.base, [stat]: value ? parseInt(value) : '' }
    }));
  };

  const toggleType = (type) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.id || !formData.name.french || formData.type.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez remplir les champs obligatoires (ID, Nom FR, Types)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (pokemon) {
        // Mise à jour d'un Pokémon existant
        await api.put(`/pokemons/${pokemon.id}`, formData);
        setMessage({ type: 'success', text: '✅ Pokémon mis à jour avec succès!' });
      } else {
        // Création d'un nouveau Pokémon
        await api.post('/pokemons', formData);
        setMessage({ type: 'success', text: '✅ Pokémon créé avec succès!' });
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `❌ Erreur: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pokemon) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${pokemon.name}?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.delete(`/pokemons/${pokemon.id}`);
      setMessage({ type: 'success', text: '✅ Pokémon supprimé avec succès!' });
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `❌ Erreur: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pc-crud" onClick={onClose}>
      <div className="pc-crud__modal" onClick={e => e.stopPropagation()}>
        <button className="pc-crud__close" onClick={onClose}>✕</button>

        <h2 className="pc-crud__title">
          {pokemon ? `Modifier ${pokemon.name}` : 'Créer un nouveau Pokémon'}
        </h2>

        {message && (
          <div className={`pc-crud__message pc-crud__message--${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="pc-crud__form" onSubmit={handleSubmit}>
          {/* ID */}
          <div className="pc-crud__group">
            <label className="pc-crud__label">ID *</label>
            <input
              type="number"
              className="pc-crud__input"
              value={formData.id}
              onChange={e => setFormData(prev => ({ ...prev, id: parseInt(e.target.value) || '' }))}
              disabled={pokemon !== null} // Pas modifiable si édition
              required
            />
          </div>

          {/* Noms */}
          <div className="pc-crud__group">
            <label className="pc-crud__label">Noms *</label>
            <div className="pc-crud__group-row">
              <input
                type="text"
                className="pc-crud__input"
                placeholder="Français"
                value={formData.name.french}
                onChange={e => handleNameChange('french', e.target.value)}
                required
              />
              <input
                type="text"
                className="pc-crud__input"
                placeholder="English"
                value={formData.name.english}
                onChange={e => handleNameChange('english', e.target.value)}
              />
              <input
                type="text"
                className="pc-crud__input"
                placeholder="日本語"
                value={formData.name.japanese}
                onChange={e => handleNameChange('japanese', e.target.value)}
              />
              <input
                type="text"
                className="pc-crud__input"
                placeholder="中文"
                value={formData.name.chinese}
                onChange={e => handleNameChange('chinese', e.target.value)}
              />
            </div>
          </div>

          {/* Types */}
          <div className="pc-crud__group">
            <label className="pc-crud__label">Types *</label>
            <div className="pc-crud__type-select">
              {availableTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`pc-crud__type-btn ${formData.type.includes(type) ? 'pc-crud__type-btn--selected' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="pc-crud__group">
            <label className="pc-crud__label">Statistiques</label>
            <div className="pc-crud__stat-row">
              {['HP', 'Attack', 'Defense', 'SpecialAttack', 'SpecialDefense', 'Speed'].map(stat => (
                <input
                  key={stat}
                  type="number"
                  className="pc-crud__input"
                  placeholder={stat}
                  min="0"
                  max="999"
                  value={formData.base[stat]}
                  onChange={e => handleStatChange(stat, e.target.value)}
                />
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="pc-crud__group">
            <label className="pc-crud__label">URL Image</label>
            <input
              type="text"
              className="pc-crud__input"
              placeholder="/pokemons/25.png"
              value={formData.image}
              onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
            />
          </div>

          {/* Boutons */}
          <div className="pc-crud__buttons">
            <button
              type="button"
              className="pc-crud__btn pc-crud__btn--cancel"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="pc-crud__btn pc-crud__btn--primary"
              disabled={loading}
            >
              {loading ? 'En cours...' : (pokemon ? 'Modifier' : 'Créer')}
            </button>
            {pokemon && (
              <button
                type="button"
                className="pc-crud__btn pc-crud__btn--danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PokeCrud;
