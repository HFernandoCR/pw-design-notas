
document.addEventListener('DOMContentLoaded', () => {
    
    const btnAgregar = document.querySelector('.btn-agregar');
    const opcionesColor = document.querySelector('.opciones-color');
    const grillaNotas = document.getElementById('grillaNotas');
    const campoBusqueda = document.querySelector('.barra-busqueda input');

    let notas = JSON.parse(localStorage.getItem('docketNotas')) || [];
    const guardarNotas = () => localStorage.setItem('docketNotas', JSON.stringify(notas));
    const formatearFecha = (iso) => new Date(iso).toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Crea y añade una tarjeta simple al DOM
    function crearTarjetaNota(nota) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-nota';
        tarjeta.style.backgroundColor = nota.color;
        tarjeta.dataset.id = nota.id;

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
            menu.querySelector('.editar-nota').addEventListener('click', (e) => {
                e.stopPropagation();
              
                menu.classList.add('oculto');
                contenidoDiv.contentEditable = 'true';
                contenidoDiv.focus();

                const range = document.createRange();
                range.selectNodeContents(contenidoDiv);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                
                const onBlur = () => {
                    contenidoDiv.contentEditable = 'false';
                    nota.contenido = contenidoDiv.textContent.trim() || ' '; // evita vacío absoluto
                    nota.ultimaModificacion = new Date().toISOString();
                    guardarNotas();
               
                    contenidoDiv.removeEventListener('blur', onBlur);
                    renderizar();
                };

                contenidoDiv.addEventListener('blur', onBlur);
            });

        menu.querySelector('.marcar-favorito').addEventListener('click', (e) => {
            e.stopPropagation();
            nota.favorito = !nota.favorito;
            guardarNotas();
            menu.classList.add('oculto');
            renderizar();
        });

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

    function renderizar(filtro = '') {
        grillaNotas.innerHTML = '';
        const lower = filtro.toLowerCase();
        notas.filter(n => n.contenido.toLowerCase().includes(lower)).forEach(crearTarjetaNota);
    }

    btnAgregar.addEventListener('click', () => opcionesColor.classList.toggle('oculto'));

    opcionesColor.addEventListener('click', (e) => {
        if (!e.target.classList.contains('circulo-color')) return;
        const color = e.target.dataset.color || '#FFD68A';
        const nueva = { id: Date.now().toString(), contenido: 'Nueva nota', color, ultimaModificacion: new Date().toISOString(), favorito: false };
        notas.push(nueva);
        guardarNotas();
        opcionesColor.classList.add('oculto');
        renderizar();
    });

    document.addEventListener('click', (e) => {
        document.querySelectorAll('.menu-acciones').forEach(m => m.classList.add('oculto'));
        if (!btnAgregar.contains(e.target) && !opcionesColor.contains(e.target)) opcionesColor.classList.add('oculto');
    });

    // Búsqueda simple
    campoBusqueda.addEventListener('input', (e) => renderizar(e.target.value));

    renderizar();
});