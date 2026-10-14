const letras = ['p', 'm', 'l', 't', 's', 'n'];
let indiceLetra = 0;

const canvas = document.getElementById('pizarra');
const ctx = canvas.getContext('2d');
const letraGuia = document.getElementById('letra-guia');

let pintando = false;

// Configuración del crayón
ctx.lineWidth = 20; // Trazo grueso
ctx.lineCap = 'round';
ctx.strokeStyle = '#FF9800';

function iniciarPosicion(e) {
    pintando = true;
    dibujar(e);
}

function terminarPosicion() {
    pintando = false;
    ctx.beginPath();
}

function obtenerPosicion(e) {
    const rect = canvas.getBoundingClientRect();
    const clienteX = e.touches ? e.touches[0].clientX : e.clientX;
    const clienteY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
        x: clienteX - rect.left,
        y: clienteY - rect.top
    };
}

function dibujar(e) {
    if (!pintando) return;
    e.preventDefault(); // Evita scroll en móviles
    
    const pos = obtenerPosicion(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

// Escuchadores de eventos
canvas.addEventListener('mousedown', iniciarPosicion);
canvas.addEventListener('mouseup', terminarPosicion);
canvas.addEventListener('mousemove', dibujar);
canvas.addEventListener('mouseout', terminarPosicion);

canvas.addEventListener('touchstart', iniciarPosicion, {passive: false});
canvas.addEventListener('touchend', terminarPosicion);
canvas.addEventListener('touchmove', dibujar, {passive: false});

// Botón de limpiar
document.getElementById('btn-limpiar').onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// ==========================================
// NUEVA FUNCIÓN DE VALIDACIÓN MATEMÁTICA
// ==========================================
function validarTrazo() {
    // 1. Creamos un canvas "invisible" del mismo tamaño
    const canvasOculto = document.createElement('canvas');
    canvasOculto.width = canvas.width;
    canvasOculto.height = canvas.height;
    const ctxOculto = canvasOculto.getContext('2d');

    // 2. Dibujamos la letra perfecta en el canvas invisible
    ctxOculto.font = "250px 'Comic Sans MS', sans-serif";
    ctxOculto.textAlign = "center";
    ctxOculto.textBaseline = "middle";
    // Ajuste al centro exacto
    ctxOculto.fillText(letras[indiceLetra], canvas.width / 2, canvas.height / 2);

    // 3. Obtenemos los píxeles de ambos canvas (el perfecto y el del niño)
    const pixelesPerfectos = ctxOculto.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixelesNino = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let totalPixelesLetra = 0;
    let pixelesAcertados = 0;
    let pixelesFueraDeLetra = 0;

    // Analizamos cada píxel (van de 4 en 4 por RGBA)
    for (let i = 0; i < pixelesPerfectos.length; i += 4) {
        const opacidadPerfecta = pixelesPerfectos[i + 3]; // Canal Alpha del invisible
        const opacidadNino = pixelesNino[i + 3];          // Canal Alpha del niño

        if (opacidadPerfecta > 50) {
            // Este píxel pertenece a la letra
            totalPixelesLetra++;
            if (opacidadNino > 50) {
                // El niño pasó el dedo por aquí
                pixelesAcertados++;
            }
        } else {
            // Este píxel es el fondo en blanco
            if (opacidadNino > 50) {
                // El niño rayó fuera de la letra
                pixelesFueraDeLetra++;
            }
        }
    }

    // Si el niño no dibujó absolutamente nada
    if (pixelesAcertados === 0 && pixelesFueraDeLetra === 0) {
        return "vacio";
    }

    // Calculamos el porcentaje de la letra que el niño logró cubrir
    const porcentajeCobertura = (pixelesAcertados / totalPixelesLetra) * 100;
    
    // Calculamos si rayó demasiado afuera (para evitar trampa de rellenar todo el cuadro)
    const porcentajeTrampa = (pixelesFueraDeLetra / totalPixelesLetra) * 100;

    console.log(`Cobertura: ${porcentajeCobertura}% | Fuera: ${porcentajeTrampa}%`);

    // CONDICIÓN: Debe cubrir al menos 40% de la letra y no haberse salido exageradamente (límite 250% de error)
    if (porcentajeCobertura > 40 && porcentajeTrampa < 250) {
        return "correcto";
    } else {
        return "incorrecto";
    }
}

// Botón de Siguiente
document.getElementById('btn-siguiente').onclick = () => {
    
    const resultado = validarTrazo();

    if (resultado === "vacio") {
        alert("¡Tienes que trazar la letra primero! 🖍️");
        return;
    } else if (resultado === "incorrecto") {
        alert("¡Intenta seguir mejor la línea de la letra! 🧐");
        // Borramos el canvas para que lo intente de nuevo
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    // Si pasó la validación:
    indiceLetra++;
    
    if (indiceLetra >= letras.length) {
        alert("¡Excelente trabajo! Terminaste todas las letras 🎉");
        indiceLetra = 0;
    }
    
    // Cambiamos a la siguiente letra
    letraGuia.textContent = letras[indiceLetra];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Diccionario fonético para forzar la pronunciación correcta en español
const pronunciacionLetras = {
    'p': 'pe',
    'm': 'eme',
    'l': 'ele',
    't': 'te',
    's': 'ese',
    'n': 'ene'
};

document.getElementById('btn-escuchar-letra').onclick = () => {
    const letraActual = letras[indiceLetra];
    
    // Si la letra está en el diccionario, usa esa pronunciación. Si no, usa la letra normal.
    const textoAEscuchar = pronunciacionLetras[letraActual] || letraActual;
    
    const utterance = new SpeechSynthesisUtterance(textoAEscuchar);
    utterance.lang = 'es-MX'; // Forzamos acento de México
    speechSynthesis.speak(utterance);
};