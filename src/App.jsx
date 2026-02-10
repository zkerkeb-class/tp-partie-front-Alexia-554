// Composant racine App
// Description : assemble les composants visibles (Counter, PokeList, etc.)
// Où modifier :
//  - Ajouter/supprimer des composants ici pour changer la page principale.
//  - Le layout/global styles sont dans `src/App.css`.

import './App.css'

import Title from './components/title'
import Counter from './components/counter'
import PokeList from './components/pokelist'
function App() {

  return (
    <div>
      {/* Exemples d'utilisation de <Title /> (décommenter pour tester) 
      <Counter/>*/
      }
      <PokeList/>
    </div>
  )
}

export default App
