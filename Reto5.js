// ⚠️ En un proyecto real, la API key nunca debe ir expuesta en el frontend.
// Aquí se deja así solo con fines de práctica/aprendizaje.
const API_KEY = '29ca54857a084a718b18daca655c7f61';
const URL_NOTICIAS = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;

const contenedorNoticias = document.getElementById('noticias');
const contenedorEstado = document.getElementById('estado');
const botonRefrescar = document.getElementById('refrescar');

// Muestra un mensaje de estado (error o aviso) y limpia las noticias visibles
function mostrarMensaje(texto) {
    contenedorEstado.textContent = texto;
    contenedorEstado.classList.add('visible');
    contenedorNoticias.innerHTML = '';
}

function ocultarMensaje() {
    contenedorEstado.classList.remove('visible');
    contenedorEstado.textContent = '';
}

// Pinta el arreglo de artículos en el contenedor, limpiando lo anterior primero
function renderizarNoticias(articulos) {
    contenedorNoticias.innerHTML = ''; // evita que se acumulen noticias viejas

    articulos.forEach((articulo) => {
        const div = document.createElement('article');
        div.className = 'noticia';

        const imagen = articulo.urlToImage
            ? `<img src="${articulo.urlToImage}" alt="${articulo.title ?? 'Imagen de la noticia'}">`
            : '';

        div.innerHTML = `
            ${imagen}
            <p><strong>${articulo.title ?? 'Sin título'}</strong></p>
            <p>${articulo.description ?? ''}</p>
            <p><a href="${articulo.url}" target="_blank" rel="noopener noreferrer">Leer más</a></p>
        `;

        contenedorNoticias.appendChild(div);
    });
}

// Única función responsable de pedir y mostrar noticias (evita duplicar lógica)
async function cargarNoticias() {
    botonRefrescar.disabled = true;
    ocultarMensaje();

    try {
        const respuesta = await fetch(URL_NOTICIAS);

        if (!respuesta.ok) {
            // Cubre caso "API no disponible" (errores 4xx / 5xx)
            throw new Error(`La API respondió con estado ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (datos.status !== 'ok') {
            throw new Error(datos.message || 'La API devolvió un error');
        }

        if (!datos.articles || datos.articles.length === 0) {
            // Cubre caso "no hay noticias disponibles"
            mostrarMensaje('Por el momento no hay noticias disponibles.');
            return;
        }

        renderizarNoticias(datos.articles);

    } catch (error) {
        // Cubre caso "API no disponible" por caída de red, CORS, etc.
        console.error('Error al obtener noticias:', error);
        mostrarMensaje('No se pudo conectar con el servidor de noticias. Intenta de nuevo más tarde.');
    } finally {
        botonRefrescar.disabled = false;
    }
}

// Refrescar sin recargar la página
botonRefrescar.addEventListener('click', cargarNoticias);

// Carga inicial al abrir la página
cargarNoticias();
