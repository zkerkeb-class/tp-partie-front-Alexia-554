// Entrée de l'application (index)
// But : monter le composant racine React dans l'élément `#root`.
// Où modifier :
//  - Pour changer le point d'entrée, modifier ce fichier.
//  - Les styles globaux sont dans `src/index.css`.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Rend uniquement `App` (Vite effectue le rechargement à chaud pendant le dev)
createRoot(document.getElementById('root')).render(
    <App />
 ,
)
