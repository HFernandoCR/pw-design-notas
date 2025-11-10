// Versión mínima y clara para principiantes
document.addEventListener('DOMContentLoaded', () => {
    // Elementos principales
    const btnAgregar = document.querySelector('.btn-agregar');
    const opcionesColor = document.querySelector('.opciones-color');
    const grillaNotas = document.getElementById('grillaNotas');
    const campoBusqueda = document.querySelector('.barra-busqueda input');

    // Cargar notas guardadas o empezar con array vacío
    let notas = JSON.parse(localStorage.getItem('docketNotas')) || [];

    // Guarda en localStorage
    const guardarNotas = () => localStorage.setItem('docketNotas', JSON.stringify(notas));

    // Formatea fecha para mostrar
    const formatearFecha = (iso) => new Date(iso).toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Crea y añade una tarjeta simple al DOM
    function crearTarjetaNota(nota) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-nota';
        tarjeta.style.backgroundColor = nota.color;
        tarjeta.dataset.id = nota.id;

        // Estructura simple: estrella, contenido, fecha y acciones
        tarjeta.innerHTML = `
            <i class="fas fa-star ${nota.favorito ? 'favorito' : ''}"></i>
            <div class="contenido-nota">${nota.contenido}</div>
            <div class="fecha-nota">${formatearFecha(nota.ultimaModificacion)}</div>
            <div class="acciones-nota">
                <i class="fas fa-pencil-alt"></i>
                <div class="menu-acciones oculto">
                    <button class="editar-nota">Editar</button>
                    <button class="marcar-favorito">${nota.favorito ? 'Quitar favorito' : 'Favorito'}</button>
                    <button class="eliminar-nota">Eliminar</button>
                </div>
            </div>
        `;

        // Referencias dentro de la tarjeta
        const contenidoDiv = tarjeta.querySelector('.contenido-nota');
        const btnAcciones = tarjeta.querySelector('.acciones-nota');
        const menu = tarjeta.querySelector('.menu-acciones');

        // Mostrar/ocultar menú al hacer clic en el lápiz
        btnAcciones.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cerrar otros menús
            document.querySelectorAll('.menu-acciones').forEach(m => { if (m !== menu) m.classList.add('oculto'); });
            menu.classList.toggle('oculto');
        });

            // Editar: usar edición inline con contentEditable (más visual para principiantes)
            menu.querySelector('.editar-nota').addEventListener('click', (e) => {
                e.stopPropagation();
                // Oculta el menú antes de editar
                menu.classList.add('oculto');

                // Hacemos editable el div de contenido y le damos foco
                contenidoDiv.contentEditable = 'true';
                contenidoDiv.focus();

                // Mover el cursor al final del contenido
                const range = document.createRange();
                range.selectNodeContents(contenidoDiv);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                // Guardar cuando se pierde el foco
                const onBlur = () => {
                    contenidoDiv.contentEditable = 'false';
                    // Actualiza la nota y guarda
                    nota.contenido = contenidoDiv.textContent.trim() || ' '; // evita vacío absoluto
                    nota.ultimaModificacion = new Date().toISOString();
                    guardarNotas();
                    // Limpia el listener para evitar duplicados
                    contenidoDiv.removeEventListener('blur', onBlur);
                    renderizar();
                };

                contenidoDiv.addEventListener('blur', onBlur);
            });

        // Marcar/quitar favorito
        menu.querySelector('.marcar-favorito').addEventListener('click', (e) => {
            e.stopPropagation();
            nota.favorito = !nota.favorito;
            guardarNotas();
            menu.classList.add('oculto');
            renderizar();
        });

        // Eliminar
        menu.querySelector('.eliminar-nota').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('¿Eliminar esta nota?')) {
                notas = notas.filter(n => n.id !== nota.id);
                guardarNotas();
                menu.classList.add('oculto');
                renderizar();
            }
        });

        grillaNotas.appendChild(tarjeta);
    }

    // Renderiza todas las notas (con filtro opcional)
    function renderizar(filtro = '') {
        grillaNotas.innerHTML = '';
        const lower = filtro.toLowerCase();
        notas.filter(n => n.contenido.toLowerCase().includes(lower)).forEach(crearTarjetaNota);
    }

    // Botón + muestra/oculta selector de color
    btnAgregar.addEventListener('click', () => opcionesColor.classList.toggle('oculto'));

    // Crear nota al hacer clic en un color (muy simple)
    opcionesColor.addEventListener('click', (e) => {
        if (!e.target.classList.contains('circulo-color')) return;
        const color = e.target.dataset.color || '#FFD68A';
        const nueva = { id: Date.now().toString(), contenido: 'Nueva nota', color, ultimaModificacion: new Date().toISOString(), favorito: false };
        notas.push(nueva);
        guardarNotas();
        opcionesColor.classList.add('oculto');
        renderizar();
    });

    // Cerrar menús/selector si se hace clic fuera
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.menu-acciones').forEach(m => m.classList.add('oculto'));
        if (!btnAgregar.contains(e.target) && !opcionesColor.contains(e.target)) opcionesColor.classList.add('oculto');
    });

    // Búsqueda simple
    campoBusqueda.addEventListener('input', (e) => renderizar(e.target.value));

    // Carga inicial
    renderizar();
});