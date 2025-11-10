// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Selectores del DOM
    const btnAgregar = document.querySelector('.btn-agregar');
    const opcionesColor = document.querySelector('.opciones-color');
    const grillaNotas = document.getElementById('grillaNotas');
    const campoBusqueda = document.querySelector('.barra-busqueda input');

    // Carga las notas desde localStorage
    let notas = JSON.parse(localStorage.getItem('docketNotas')) || [];

    // Función para guardar en localStorage
    const guardarNotas = () => {
        localStorage.setItem('docketNotas', JSON.stringify(notas));
    };

    // Función para formatear la fecha
    const formatearFecha = (date) => {
        const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', opciones); 
    };

    // Función para crear cada tarjeta de nota
    const crearTarjetaNota = (nota) => {
        const tarjetaNota = document.createElement('div');
        tarjetaNota.classList.add('tarjeta-nota');
        tarjetaNota.style.backgroundColor = nota.color;
        tarjetaNota.dataset.id = nota.id;

        // HTML interno de la tarjeta
        // - La estrella siempre se muestra; su color depende de la clase 'favorito'
        // - El menú conserva los textos pero NO muestra el icono de la estrella dentro del botón
        tarjetaNota.innerHTML = `
            <i class="fas fa-star ${nota.favorito ? 'favorito' : 'no-favorito'}"></i>
            <div class="contenido-nota">${nota.contenido}</div>
            <div class="fecha-nota">${formatearFecha(nota.ultimaModificacion)}</div>
            
            <div class="acciones-nota">
                <i class="fas fa-pencil-alt"></i>
                
                <div class="menu-acciones oculto">
                    <button class="editar-nota"><i class="fas fa-edit"></i> Editar</button>
                    <button class="marcar-favorito">${nota.favorito ? 'Quitar favorito' : 'Favorito'}</button>
                    <button class="eliminar-nota"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            </div>
        `;

        // --- Añadir Eventos a la tarjeta ---

        // Seleccionamos los elementos de la tarjeta
        const contenidoNota = tarjetaNota.querySelector('.contenido-nota');
        const btnAcciones = tarjetaNota.querySelector('.acciones-nota');
        const menuAcciones = tarjetaNota.querySelector('.menu-acciones');

        // --- CAMBIO IMPORTANTE ---
        // Se eliminó el 'listener' de 'focus' que estaba aquí.
        // Ya no se puede editar haciendo clic en el texto.
        // --- FIN DEL CAMBIO ---

        // 1. Evento para el botón de acciones (lápiz)
        btnAcciones.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cierra otros menús
            document.querySelectorAll('.menu-acciones').forEach(menu => {
                if (menu !== menuAcciones) menu.classList.add('oculto');
            });
            menuAcciones.classList.toggle('oculto');
        });

        // 2. Eventos para los botones del menú
        
        // --- CAMBIO: Lógica de edición movida aquí ---
        menuAcciones.querySelector('.editar-nota').addEventListener('click', (e) => {
            // Evita que el click burbujee y active otros handlers globales
            e.stopPropagation();

            // Cierra todos los menús de acciones para evitar que queden visibles
            document.querySelectorAll('.menu-acciones').forEach(menu => menu.classList.add('oculto'));

            // Crea el textarea manualmente
            const textarea = document.createElement('textarea');
            textarea.classList.add('textarea-nota');
            textarea.value = contenidoNota.textContent; // Usa el texto actual

            // Reemplaza el <div.contenido-nota> por el <textarea>
            contenidoNota.replaceWith(textarea);
            textarea.focus(); // Pone el cursor en el textarea

            // Añade el evento para guardar cuando se pierde el foco
            textarea.addEventListener('blur', () => {
                nota.contenido = textarea.value;
                nota.ultimaModificacion = new Date().toISOString();
                guardarNotas();
                mostrarNotas(); // Vuelve a dibujar todo
            });
        });
        // --- FIN DEL CAMBIO ---

        menuAcciones.querySelector('.marcar-favorito').addEventListener('click', (e) => {
            e.stopPropagation();
            nota.favorito = !nota.favorito; // Invierte el estado
            guardarNotas();
            // Cierra menús y vuelve a renderizar
            document.querySelectorAll('.menu-acciones').forEach(menu => menu.classList.add('oculto'));
            mostrarNotas();
        });

        menuAcciones.querySelector('.eliminar-nota').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
                notas = notas.filter(n => n.id !== nota.id);
                guardarNotas();
                // Cierra menús y vuelve a renderizar
                document.querySelectorAll('.menu-acciones').forEach(menu => menu.classList.add('oculto'));
                mostrarNotas();
            }
        });

        grillaNotas.appendChild(tarjetaNota);
    };

    // Función para dibujar todas las notas
    const mostrarNotas = (textoFiltro = '') => {
        grillaNotas.innerHTML = '';
        const notasFiltradas = notas.filter(nota =>
            nota.contenido.toLowerCase().includes(textoFiltro.toLowerCase())
        );
        notasFiltradas.forEach(crearTarjetaNota);
    };

    // --- Eventos Globales ---

    // Mostrar/ocultar opciones de color
    btnAgregar.addEventListener('click', () => {
        opcionesColor.classList.toggle('oculto');
    });

    // Crear nueva nota al elegir color
    opcionesColor.addEventListener('click', (e) => {
        if (e.target.classList.contains('circulo-color')) {
            const color = e.target.dataset.color;
            const nuevaNota = {
                id: Date.now().toString(),
                contenido: "Esta es una nueva nota.",
                color: color,
                ultimaModificacion: new Date().toISOString(),
                favorito: false // <-- Tu requisito: Nace como 'false'
            };
            notas.push(nuevaNota);
            guardarNotas();
            mostrarNotas();
            opcionesColor.classList.add('oculto');
        }
    });

    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => {
        // Cierra menús de acciones
        document.querySelectorAll('.menu-acciones').forEach(menu => {
            if (!menu.closest('.tarjeta-nota').contains(e.target)) {
                menu.classList.add('oculto');
            }
        });
        // Cierra opciones de color
        if (!btnAgregar.contains(e.target) && !opcionesColor.contains(e.target)) {
            opcionesColor.classList.add('oculto');
        }
    });

    // Evento de la barra de búsqueda
    campoBusqueda.addEventListener('input', (e) => {
        mostrarNotas(e.target.value);
    });

    // Carga inicial
    mostrarNotas();
});