// Agregamos las oraciones usando el vocabulario exacto del documento "MÉTODO INTEGRAL MINJARES-TARJETERO"
// Oraciones generadas estrictamente con el vocabulario del Tarjetero Minjares 1° A
var niveles = [
    // Básicas de los personajes
    "La nena Lulú",
    "El papá oso",
    "Ema y Susu",
    "Pepe y Daditos",
    
    // Acciones y animales
    "El perro corre",
    "La vaca come zacate",
    "El gato toma leche",
    "Hugo tiene un caballo",
    "El águila come carne",
    "Trini quiere un pato",
    
    // Comida y objetos
    "Ana toma jugo",
    "Lupe bebe agua",
    "Tomás come queso",
    "La tía Ana come mole",
    "Toña come higos",
    "Ramiro toma café",
    "Cuca tiene una guitarra",
    "Tito tiene un dado",
    
    // Familia y acciones
    "La niña ama a mamá",
    "La mamá teje ropa",
    "Mi tío tiene un carro",
    "Ese zapato es de Pepe",
    "Miguel quiere sopa",
    "El gigante bebe agua",
    "Luis juega con la pelota",
    "El güero trabaja"
];

let nivelActual = 0;

const zonaRespuesta = document.getElementById('zona-respuesta');
const zonaPalabras = document.getElementById('zona-palabras');
const btnRevisar = document.getElementById('btn-revisar');
const btnEscuchar = document.getElementById('btn-escuchar');
const mensaje = document.getElementById('mensaje');

// Función para desordenar un arreglo aleatoriamente
function desordenarArreglo(arreglo) {
    return arreglo.sort(() => Math.random() - 0.5);
}

function cargarNivel() {
    zonaRespuesta.innerHTML = '';
    zonaPalabras.innerHTML = '';
    mensaje.textContent = '';
    
    const oracionCompleta = niveles[nivelActual];
    // Separamos la oración en palabras y las desordenamos automáticamente
    let palabras = oracionCompleta.split(' ');
    palabras = desordenarArreglo([...palabras]);

    palabras.forEach(palabra => {
        const div = document.createElement('div');
        div.textContent = palabra;
        div.className = 'tarjeta';
        div.onclick = () => moverTarjeta(div);
        zonaPalabras.appendChild(div);
    });
}

function moverTarjeta(tarjeta) {
    if (tarjeta.parentElement.id === 'zona-palabras') {
        zonaRespuesta.appendChild(tarjeta);
    } else {
        zonaPalabras.appendChild(tarjeta);
    }
}

btnRevisar.onclick = () => {
    const tarjetas = zonaRespuesta.querySelectorAll('.tarjeta');
    const respuestaUsuario = Array.from(tarjetas).map(t => t.textContent).join(' ');
    
    // Comparamos contra la oración original
    if (respuestaUsuario === niveles[nivelActual]) {
        mensaje.textContent = "¡Excelente! 🎉";
        mensaje.style.color = "green";
        
        setTimeout(() => {
            nivelActual++;
            if (nivelActual < niveles.length) {
                cargarNivel();
            } else {
                mensaje.textContent = "¡Terminaste todos los juegos! 🏆";
                zonaRespuesta.innerHTML = '';
                btnRevisar.style.display = 'none';
                btnEscuchar.style.display = 'none';
            }
        }, 1500);
    } else {
        mensaje.textContent = "Inténtalo de nuevo 🤔";
        mensaje.style.color = "red";
    }
};

btnEscuchar.onclick = () => {
    const oracion = niveles[nivelActual];
    const utterance = new SpeechSynthesisUtterance(oracion);
    utterance.lang = 'es-MX';
    speechSynthesis.speak(utterance);
};

// Desordenamos las oraciones para que cada partida sea única
niveles = desordenarArreglo(niveles);

// Iniciar juego
cargarNivel();