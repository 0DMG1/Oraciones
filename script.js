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

let listaPlana = [];
let oracionesActivas = [];
let nivelActual = 0;
let limiteActual = 5;

// Función para unificar la base de datos con las frases que agregue la maestra
function construirListaPlana(personalizadas = []) {
    listaPlana = [];
    for (let cat in baseDeDatos) {
        baseDeDatos[cat].forEach(oracion => {
            listaPlana.push({ oracion: oracion, categoria: cat, esPersonalizada: false });
        });
    }
    personalizadas.forEach(oracion => {
        listaPlana.push({ oracion: oracion, categoria: "Personalizadas", esPersonalizada: true });
    });
}

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

function desordenarArreglo(arreglo) { return arreglo.sort(() => Math.random() - 0.5); }

// --- ARRANQUE DESDE LA NUBE ---
async function inicializarJuego() {
    if (sessionStorage.getItem('modoMaestra') === 'true') {
        document.getElementById('btn-engrane').style.display = 'block';
    } else {
        document.getElementById('btn-engrane').style.display = 'none';
    }

    const CACHE_KEY = 'minjares_nube_cache';
    const CACHE_TIME_KEY = 'minjares_nube_time';
    const TIEMPO_EXPIRACION = 10 * 60 * 1000;

    const cacheGuardada = localStorage.getItem(CACHE_KEY);
    const tiempoGuardado = localStorage.getItem(CACHE_TIME_KEY);
    const ahora = Date.now();

    if (cacheGuardada && tiempoGuardado && (ahora - tiempoGuardado < TIEMPO_EXPIRACION)) {
        const datos = JSON.parse(cacheGuardada);
        aplicarConfiguracion(datos.oracionesSeleccionadas, datos.oracionesPersonalizadas || [], datos.limite);
        return;
    }

    try {
        const respuesta = await fetch(`${URL_NUBE}/latest`, { headers: { 'X-Master-Key': API_KEY } });
        if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
        
        const datosNube = await respuesta.json();
        let idsActivos = datosNube.record.oracionesSeleccionadas || ["El papá Pepe", "La mamá Ema"];
        const personalizadas = datosNube.record.oracionesPersonalizadas || [];
        const limite = datosNube.record.limite || 5;

        // MIGRACIÓN: Si la configuración vieja usaba números, los convierte a texto automáticamente
        if (idsActivos.length > 0 && typeof idsActivos[0] === 'number') {
            let temp = [];
            for (let cat in baseDeDatos) { baseDeDatos[cat].forEach(o => temp.push(o)); }
            idsActivos = idsActivos.map(id => temp[id]).filter(t => t !== undefined);
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify({ oracionesSeleccionadas: idsActivos, oracionesPersonalizadas: personalizadas, limite: limite }));
        localStorage.setItem(CACHE_TIME_KEY, ahora.toString());

        aplicarConfiguracion(idsActivos, personalizadas, limite);
    } catch (error) {
        if (cacheGuardada) {
            const datos = JSON.parse(cacheGuardada);
            aplicarConfiguracion(datos.oracionesSeleccionadas, datos.oracionesPersonalizadas || [], datos.limite);
        } else {
            aplicarConfiguracion(["El papá Pepe", "La mamá Ema", "La nena Lulú"], [], 5);
        }
    }
}

function aplicarConfiguracion(textosActivos, personalizadas, limite) {
    limiteActual = limite;
    construirListaPlana(personalizadas);
    oracionesActivas = textosActivos.map(texto => listaPlana.find(o => o.oracion === texto)).filter(o => o !== undefined);
    oracionesActivas = desordenarArreglo(oracionesActivas);
    nivelActual = 0;
    cargarNivel();
}

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
    if (tarjeta.parentElement.id === 'zona-palabras') { zonaRespuesta.appendChild(tarjeta); } 
    else { zonaPalabras.appendChild(tarjeta); }
}

btnRevisar.onclick = () => {
    const respuestaUsuario = Array.from(zonaRespuesta.querySelectorAll('.tarjeta')).map(t => t.textContent).join(' ');
    
    if (respuestaUsuario === oracionesActivas[nivelActual].oracion) {
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
                zonaRespuesta.innerHTML = ''; zonaPalabras.innerHTML = '';
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
    const utterance = new SpeechSynthesisUtterance(oracionesActivas[nivelActual].oracion);
    utterance.lang = 'es-MX';
    speechSynthesis.speak(utterance);
};

// --- MODALES Y SEGURIDAD ---
const modalLogin = document.getElementById('modal-login');
const modalConfig = document.getElementById('modal-config');

tituloCategoria.ondblclick = () => modalLogin.style.display = 'flex';
document.getElementById('btn-engrane').onclick = () => modalLogin.style.display = 'flex';

function cerrarModales() {
    modalLogin.style.display = 'none'; modalConfig.style.display = 'none';
    document.getElementById('input-usuario').value = '';
    document.getElementById('input-password').value = '';
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
        document.getElementById('msg-login').textContent = "Credenciales incorrectas.";
    }
};

// --- AGREGAR FRASE PERSONALIZADA DESDE EL PANEL ---
document.getElementById('btn-agregar-oracion').onclick = () => {
    const input = document.getElementById('input-nueva-oracion');
    const nuevaFrase = input.value.trim();
    if(!nuevaFrase) return;

    if(listaPlana.some(o => o.oracion.toLowerCase() === nuevaFrase.toLowerCase())) {
        alert("Esta oración ya existe en la lista.");
        return;
    }

    // La agregamos a la memoria temporal
    listaPlana.push({ oracion: nuevaFrase, categoria: "Personalizadas", esPersonalizada: true });
    input.value = '';

    // Obtenemos qué casillas estaban marcadas para no borrárselas al redibujar
    const marcadas = Array.from(document.querySelectorAll('#lista-config-oraciones input[type="checkbox"]:checked')).map(cb => cb.value);
    marcadas.push(nuevaFrase); // Autoseleccionamos la que acaba de crear

    abrirPanelConfiguracion(marcadas);
};

function abrirPanelConfiguracion(seleccionesTemporales = null) {
    modalConfig.style.display = 'flex';
    const lista = document.getElementById('lista-config-oraciones');
    lista.innerHTML = '';
    
    const limiteInput = document.getElementById('input-limite');
    if(!seleccionesTemporales) limiteInput.value = limiteActual;
    
    const textosActivos = seleccionesTemporales || oracionesActivas.map(o => o.oracion);

    let categoriaActual = "";
    listaPlana.forEach(item => {
        if (item.categoria !== categoriaActual) {
            categoriaActual = item.categoria;
            const titulo = document.createElement('h4');
            titulo.textContent = categoriaActual;
            lista.appendChild(titulo);
        }
        const label = document.createElement('label');
        const estaSeleccionado = textosActivos.includes(item.oracion) ? 'checked' : '';
        label.innerHTML = `<input type="checkbox" value="${item.oracion}" ${estaSeleccionado}> ${item.oracion}`;
        lista.appendChild(label);
    });

    const todosLosCheckboxes = lista.querySelectorAll('input[type="checkbox"]');

    function validarLimites() {
        let maximo = parseInt(limiteInput.value) || 1;
        let seleccionados = lista.querySelectorAll('input[type="checkbox"]:checked');

        if (seleccionados.length > maximo) {
            let exceso = seleccionados.length - maximo;
            for (let i = seleccionados.length - 1; i >= 0 && exceso > 0; i--) {
                seleccionados[i].checked = false; exceso--;
            }
            seleccionados = lista.querySelectorAll('input[type="checkbox"]:checked');
        }

        todosLosCheckboxes.forEach(cb => cb.disabled = (!cb.checked && seleccionados.length >= maximo));
    }

    limiteInput.addEventListener('input', validarLimites);
    lista.addEventListener('change', validarLimites);
    validarLimites(); 
}

document.getElementById('btn-guardar-config').onclick = async () => {
    const seleccionados = document.querySelectorAll('#lista-config-oraciones input[type="checkbox"]:checked');
    const limite = parseInt(document.getElementById('input-limite').value) || 1;

    if (seleccionados.length === 0) {
        alert("Debes seleccionar al menos una oración."); return;
    }
    
    const textosSeleccionados = Array.from(seleccionados).map(cb => cb.value);
    const personalizadas = listaPlana.filter(item => item.esPersonalizada).map(item => item.oracion);

    const configGlobal = {
        limite: limite,
        oracionesSeleccionadas: textosSeleccionados,
        oracionesPersonalizadas: personalizadas
    };

    const btnGuardar = document.getElementById('btn-guardar-config');
    btnGuardar.textContent = "Guardando... ☁️";
    btnGuardar.disabled = true;

    try {
        const respuesta = await fetch(URL_NUBE, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY, 'X-Bin-Versioning': 'false' },
            body: JSON.stringify(configGlobal)
        });

        if (!respuesta.ok) throw new Error("Fallo al guardar");

        alert("✅ ¡Configuración guardada!");
        localStorage.setItem('minjares_nube_cache', JSON.stringify(configGlobal));
        localStorage.setItem('minjares_nube_time', Date.now().toString());
        cerrarModales();

        aplicarConfiguracion(textosSeleccionados, personalizadas, limite);
    } catch (error) {
        alert("❌ Hubo un error al guardar.");
    } finally {
        btnGuardar.textContent = "Guardar y Actualizar a Todos";
        btnGuardar.disabled = false;
    }
};

inicializarJuego();