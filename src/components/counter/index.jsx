// Composant de démonstration : Counter
// But : montrer l'utilisation basique de `useState` et `useEffect`.
// Points sûrs pour modifier :
//  - `count` / `counttwo` : états locaux (changer la logique d'incrémentation selon besoin)
//  - Effet `useEffect` met à jour le `document.title` quand `count` change — utile pour side-effects simples.

import { useState, useEffect } from "react";
import Title from "../title";

const Counter = () => {
    // états locaux
    const [count, setCount] = useState(0);
    const [counttwo, setCounttwo] = useState(0);

    // side-effect : log + mise à jour du titre de la page
    useEffect(() =>{
        console.log("in Use Effect");
        console.log(count);
        document.title = `Count: ${count}`;
    }, [count])

    // fonction de décrément (simple) — peut être remplacée par une version qui clamp les valeurs
    const decrement = () => {
        setCount(count - 1);
    }

    return (
        <div>
            { count >= 10 &&
            <Title label="BRAVO 10 compteur"></Title>
            }
            <h2>
                Counter
            </h2>
            <p>{count}</p>
            <p>{counttwo}</p>
            <button onClick={() => setCounttwo(counttwo + 1)}>Incrémenter</button>
            <button onClick={decrement}>Décrémenter</button>
        </div>
    )
}

export default Counter;