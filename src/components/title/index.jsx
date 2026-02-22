// Composant simple : Title
// Props :
//  - label (string) : texte du titre principal (par défaut 'Met un titre')
// Utilisation : utile pour tester l'UI ou afficher des titres réutilisables.

import './index.css';

const Title = ({label = 'Met un titre'}) => {
    // console.log présent pour debug local — peut être retiré
    console.log(label)
    return (
        <div>
            <h1 className="title">{label}</h1>
            <h2>Ceci est un sous-titre</h2>
        </div>
    );
}

export default Title; 