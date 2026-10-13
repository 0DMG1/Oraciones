// Base de datos completa dividida por secciones según el Método Minjares
const baseDeDatos = {
    "La Familia": [
        "El papá Pepe", 
        "La mamá Ema", 
        "La nena Lulú", 
        "La nena Ana", 
        "El oso Susú", 
        "El papá Tito"
    ],
    "Los Parientes": [
        "Lola y Lulú", 
        "Pepe y Daditos", 
        "Ema y Susú", 
        "Lola y Ana",
        "Tito y Daditos",
        "Ana y Pepe"
    ],
    "Asociación Fonológica": [
        "El perro corre",
        "La vaca come zacate",
        "El gato toma leche",
        "Hugo tiene un caballo",
        "El águila come carne",
        "Trini quiere un pato",
        "Ana toma jugo",
        "Lupe bebe agua",
        "Tomás come queso",
        "La tía Ana come mole",
        "Toña come higos",
        "Ramiro toma café",
        "Cuca tiene una guitarra",
        "Tito tiene un dado",
        "La niña ama a mamá",
        "La mamá teje ropa",
        "Mi tío tiene un carro",
        "Ese zapato es de Pepe",
        "Miguel quiere sopa",
        "El gigante bebe agua",
        "Luis juega con la pelota",
        "El güero trabaja"
    ]
};

// Vocabulario global para sacar las "tarjetas distractoras" (Extraídas del tarjetero)
const vocabularioGlobal = [
    "El", "La", "papá", "mamá", "oso", "nena", "Pepe", "Tito", "Lola", "Lulú", 
    "Ana", "Ema", "Daditos", "Susú", "y", "perro", "corre", "vaca", "come", 
    "zacate", "gato", "toma", "leche", "Hugo", "tiene", "un", "caballo", 
    "águila", "carne", "Trini", "quiere", "pato", "jugo", "Lupe", "bebe", 
    "agua", "Tomás", "queso", "tía", "mole", "Toña", "higos", "Ramiro", 
    "café", "Cuca", "una", "guitarra", "dado", "niña", "ama", "a", "teje", 
    "ropa", "Mi", "tío", "carro", "Ese", "zapato", "es", "de", "Miguel", 
    "sopa", "gigante", "Luis", "juega", "con", "pelota", "güero", "trabaja"
];

// Aplanamos la base de datos para darle un ID numérico a cada oración
const listaPlana = [];
let idContador = 0;
for (let cat in baseDeDatos) {
    baseDeDatos[cat].forEach(oracion => {
        listaPlana.push({ id: idContador++, oracion: oracion, categoria: cat });
    });
}

let oracionesActivas = [];
let nivelActual = 0;
let limiteActual = 5; // Valor por defecto

// --- 2. CREDENCIALES Y CONFIGURACIÓN NUBE ---
const CRED_USER = "WXVi"; 
const CRED_PASS = "VDR1cjBGMHIzdjNy"; 

// ¡REEMPLAZA ESTOS DOS VALORES CON LOS DE TU CUENTA EN JSONBIN!
const BIN_ID = "6ace3a7fffd5d160536770ce"; 
const API_KEY = "$2a$10$b7llG2Iozj8axqb7X8hcHO0NzsRaDuPaLqGa1u9vktSLRbcW1ii8q"; 
const URL_NUBE = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const zonaRespuesta = document.getElementById('zona-respuesta');
const zonaPalabras = document.getElementById('zona-palabras');
const btnRevisar = document.getElementById('btn-revisar');
const mensaje = document.getElementById('mensaje');
const tituloCategoria = document.getElementById('titulo-categoria');

function desordenarArreglo(arreglo) {
    return arreglo.sort(() => Math.random() - 0.5);
}

// --- 3. ARRANQUE DESDE LA NUBE ---
async function inicializarJuego() {
    // Si la maestra ya se logueó en esta sesión, mostramos el engrane
    if (sessionStorage.getItem('modoMaestra') === 'true') {
        document.getElementById('btn-engrane').style.display = 'block';
    } else {
        document.getElementById('btn-engrane').style.display = 'none';
    }

    try {
        const respuesta = await fetch(`${URL_NUBE}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        if (!respuesta.ok) throw new Error("Error en la conexión con la nube");
        
        const datosNube = await respuesta.json();
        const idsActivos = datosNube.record.oracionesSeleccionadas || [0,1,2];
        limiteActual = datosNube.record.limite || 5;
        
        // Cargamos solo las oraciones que la maestra seleccionó
        oracionesActivas = idsActivos.map(id => listaPlana[id]).filter(o => o !== undefined);
        oracionesActivas = desordenarArreglo(oracionesActivas);
        
    } catch (error) {
        console.error("Error al cargar configuración:", error);
        // Si falla el internet, cargamos 3 por defecto
        oracionesActivas = desordenarArreglo(listaPlana.slice(0, 3));
    }

    nivelActual = 0;
    cargarNivel();
}

// --- 4. LÓGICA DEL JUEGO ---
function cargarNivel() {
    zonaRespuesta.innerHTML = '';
    zonaPalabras.innerHTML = '';
    mensaje.textContent = '';
    
    if(oracionesActivas.length === 0) return;

    const datosNivel = oracionesActivas[nivelActual];
    tituloCategoria.textContent = `Sección: ${datosNivel.categoria}`;
    
    const palabrasCorrectas = datosNivel.oracion.split(' ');
    let posiblesDistractores = vocabularioGlobal.filter(p => !palabrasCorrectas.includes(p));
    let distractores = desordenarArreglo(posiblesDistractores).slice(0, 5);
    
    let todasLasTarjetas = desordenarArreglo(palabrasCorrectas.concat(distractores));

    todasLasTarjetas.forEach(palabra => {
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
    const respuestaCorrecta = oracionesActivas[nivelActual].oracion;
    
    if (respuestaUsuario === respuestaCorrecta) {
        mensaje.textContent = "¡Excelente! 🎉";
        mensaje.style.color = "green";
        
        const textoOriginal = btnRevisar.textContent;
        btnRevisar.innerHTML = 'Cargando <div class="loader"></div>';
        btnRevisar.disabled = true;

        setTimeout(() => {
            nivelActual++;
            if (nivelActual < oracionesActivas.length) {
                cargarNivel();
                btnRevisar.textContent = textoOriginal;
                btnRevisar.disabled = false;
            } else {
                mensaje.textContent = "¡Terminaste todos los juegos! 🏆";
                zonaRespuesta.innerHTML = '';
                zonaPalabras.innerHTML = '';
                btnRevisar.style.display = 'none';
                document.getElementById('btn-escuchar').style.display = 'none';
            }
        }, 1500);
    } else {
        mensaje.textContent = "Inténtalo de nuevo 🤔";
        mensaje.style.color = "red";
    }
};

document.getElementById('btn-escuchar').onclick = () => {
    const oracion = oracionesActivas[nivelActual].oracion;
    const utterance = new SpeechSynthesisUtterance(oracion);
    utterance.lang = 'es-MX';
    speechSynthesis.speak(utterance);
};

// --- 5. MODALES Y SEGURIDAD ---
const modalLogin = document.getElementById('modal-login');
const modalConfig = document.getElementById('modal-config');

// Un truco por si los alumnos entran, el engrane está oculto.
// Pero la maestra puede darle "Doble clic" al título para forzar el login.
tituloCategoria.ondblclick = () => {
    modalLogin.style.display = 'flex';
};

document.getElementById('btn-engrane').onclick = () => {
    modalLogin.style.display = 'flex';
};

function cerrarModales() {
    modalLogin.style.display = 'none';
    modalConfig.style.display = 'none';
    document.getElementById('input-usuario').value = '';
    document.getElementById('input-password').value = '';
    document.getElementById('msg-login').textContent = '';
}

document.getElementById('btn-entrar').onclick = () => {
    const user = document.getElementById('input-usuario').value;
    const pass = document.getElementById('input-password').value;
    
    if (btoa(user) === CRED_USER && btoa(pass) === CRED_PASS) {
        modalLogin.style.display = 'none';
        sessionStorage.setItem('modoMaestra', 'true'); 
        document.getElementById('btn-engrane').style.display = 'block';
        abrirPanelConfiguracion();
    } else {
        document.getElementById('msg-login').textContent = "Usuario o contraseña incorrectos.";
    }
};

function abrirPanelConfiguracion() {
    modalConfig.style.display = 'flex';
    const lista = document.getElementById('lista-config-oraciones');
    lista.innerHTML = '';
    
    const limiteInput = document.getElementById('input-limite');
    limiteInput.value = limiteActual;
    
    // Obtenemos los IDs actualmente activos para pre-marcar los checkboxes
    const idsActivos = oracionesActivas.map(o => o.id);

    let categoriaActual = "";
    listaPlana.forEach(item => {
        if (item.categoria !== categoriaActual) {
            categoriaActual = item.categoria;
            const titulo = document.createElement('h4');
            titulo.textContent = categoriaActual;
            lista.appendChild(titulo);
        }
        const label = document.createElement('label');
        const estaSeleccionado = idsActivos.includes(item.id) ? 'checked' : '';
        label.innerHTML = `<input type="checkbox" value="${item.id}" ${estaSeleccionado}> ${item.oracion}`;
        lista.appendChild(label);
    });

    const todosLosCheckboxes = lista.querySelectorAll('input[type="checkbox"]');

    function validarLimites() {
        let maximo = parseInt(limiteInput.value) || 1;
        let seleccionados = lista.querySelectorAll('input[type="checkbox"]:checked');

        if (seleccionados.length > maximo) {
            let exceso = seleccionados.length - maximo;
            for (let i = seleccionados.length - 1; i >= 0 && exceso > 0; i--) {
                seleccionados[i].checked = false;
                exceso--;
            }
            seleccionados = lista.querySelectorAll('input[type="checkbox"]:checked');
        }

        todosLosCheckboxes.forEach(cb => {
            if (!cb.checked) {
                cb.disabled = (seleccionados.length >= maximo);
            }
        });
    }

    limiteInput.addEventListener('input', validarLimites);
    lista.addEventListener('change', validarLimites);
    validarLimites(); 
}

// --- 6. GUARDAR EN LA NUBE ---
document.getElementById('btn-guardar-config').onclick = async () => {
    const seleccionados = document.querySelectorAll('#lista-config-oraciones input[type="checkbox"]:checked');
    const limite = parseInt(document.getElementById('input-limite').value) || 1;

    if (seleccionados.length === 0) {
        alert("Debes seleccionar al menos una oración.");
        return;
    }
    
    const ids = Array.from(seleccionados).map(cb => Number(cb.value));
    
    const configGlobal = {
        limite: limite,
        oracionesSeleccionadas: ids
    };

    const btnGuardar = document.getElementById('btn-guardar-config');
    btnGuardar.textContent = "Guardando en la nube... ☁️";
    btnGuardar.disabled = true;

    try {
        const respuesta = await fetch(URL_NUBE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(configGlobal)
        });

        if (!respuesta.ok) throw new Error("Fallo al guardar");

        alert("✅ ¡Configuración guardada! Todos los alumnos verán estos cambios al entrar.");
        cerrarModales();
        
        // Actualizamos las variables locales y recargamos el tablero
        limiteActual = limite;
        oracionesActivas = ids.map(id => listaPlana[id]).filter(o => o !== undefined);
        oracionesActivas = desordenarArreglo(oracionesActivas);
        nivelActual = 0;
        cargarNivel();
        
    } catch (error) {
        alert("❌ Hubo un error al guardar. Revisa el BIN_ID y API_KEY.");
    } finally {
        btnGuardar.textContent = "Guardar y Actualizar a Todos";
        btnGuardar.disabled = false;
    }
};

// Iniciar
inicializarJuego();