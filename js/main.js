// --- VARIABLES GLOBALES ---
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Referencias al DOM (Buscamos los elementos UNA sola vez)
const contenedorProductos = document.getElementById("cards-container");
const contenedorCarrito = document.getElementById("lista-carrito");
const spanTotal = document.getElementById("precio-total");
const buscador = document.getElementById("buscador");
const btnFinalizar = document.getElementById("btn-finalizar");

// --- 1. FUNCIÓN PRINCIPAL DE INICIO ---
// Esta función decide qué hacer según la página en la que estemos
const iniciarApp = () => {
    // A. Siempre renderizamos el carrito (porque el botón del header está en todas las páginas)
    renderizarCarrito();

    // B. Solo si existe el contenedor de productos (estamos en Catálogo), cargamos la data
    if (contenedorProductos) {
        cargarProductos();
    }
    
    // C. Solo si existe el buscador, activamos su evento
    if (buscador) {
        buscador.addEventListener("input", filtrarProductos);
    }
};

// --- 2. CARGA DE DATOS (FETCH) ---
const cargarProductos = async () => {
    try {
        // Ajustamos la ruta para que funcione tanto en local como en GitHub Pages
        // Intentamos subir un nivel, si falla, probamos ruta absoluta o local
        const response = await fetch("../json/data.json");
        
        if (!response.ok) throw new Error("Error al cargar JSON");
        
        const data = await response.json();
        productos = data;
        mostrarProductos(productos);
        
    } catch (error) {
        console.error("Error:", error);
        // Solo mostramos error si existe el contenedor donde ponerlo
        if(contenedorProductos) {
            contenedorProductos.innerHTML = `
                <div class="col-12 text-center text-danger">
                    <h3>Error al cargar productos.</h3>
                    <p>Intenta ejecutar con Live Server.</p>
                </div>`;
        }
    }
};

// --- 3. RENDERIZADO DE PRODUCTOS ---
const mostrarProductos = (lista) => {
    // Validación de seguridad
    if (!contenedorProductos) return;

    if (lista.length === 0) {
        contenedorProductos.innerHTML = `<p class="text-center w-100">No se encontraron productos.</p>`;
        return;
    }

    contenedorProductos.innerHTML = lista.map(prod => `
        <section class="card col-12 col-sm-6 col-lg-4 text-center p-0 overflow-hidden shadow-sm">
            <h2 class="mt-3 fs-4">${prod.nombre}</h2>
            <img class="mt-1 img-fluid" style="height: 200px; object-fit: cover;" src="${prod.imagen}" alt="${prod.nombre}">
            <div class="card-body d-flex flex-column justify-content-between">
                <p class="small">${prod.descripcion}</p>
                <h4 class="fw-bold text-secondary">$${prod.precio}</h4>
                <button class="btn-base p-2 w-100 mt-2" onclick="agregarAlCarrito(${prod.id})">
                    Comprar
                </button>
            </div>
        </section>
    `).join("");
};

// --- 4. FILTRADO (Separado para poder llamarlo condicionalmente) ---
const filtrarProductos = () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto) || 
        p.descripcion.toLowerCase().includes(texto)
    );
    mostrarProductos(filtrados);
};

// --- 5. LÓGICA DEL CARRITO (Global) ---
window.agregarAlCarrito = (idProducto) => {
    const productoEnCarrito = carrito.find(prod => prod.id === idProducto);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        const producto = productos.find(prod => prod.id === idProducto);
        carrito.push({ ...producto, cantidad: 1 });
    }

    guardarYRenderizar();
    notificacionAgregado();
};

window.eliminarDelCarrito = (idProducto) => {
    carrito = carrito.filter(prod => prod.id !== idProducto);
    guardarYRenderizar();
    
    Toastify({
        text: "Producto eliminado",
        style: { background: "#dc3545" },
        duration: 2000,
        gravity: "bottom",
        position: "right"
    }).showToast();
};

const guardarYRenderizar = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
};

const renderizarCarrito = () => {
    // Si no existe el contenedor del carrito en esta página, no hacemos nada
    if (!contenedorCarrito) return;

    contenedorCarrito.innerHTML = "";

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p class='text-center mt-3'>Tu carrito está vacío 😢</p>";
        if(spanTotal) spanTotal.innerText = "0";
        return;
    }

    contenedorCarrito.innerHTML = carrito.map(prod => `
        <div class="card mb-3 p-2 border-0 shadow-sm bg-light">
            <div class="d-flex align-items-center">
                <img src="${prod.imagen}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;" class="me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-0">${prod.nombre}</h6>
                    <small class="text-muted">Cant: ${prod.cantidad}</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold d-block">$${prod.cantidad * prod.precio}</span>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="eliminarDelCarrito(${prod.id})">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    const total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
    if(spanTotal) spanTotal.innerText = total;
};

// --- 6. EVENTO FINALIZAR COMPRA ---
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire('¡Ups!', 'El carrito está vacío', 'warning');
            return;
        }
        
        Swal.fire({
            title: '¡Gracias por tu compra!',
            text: 'Tu pedido está en camino.',
            icon: 'success',
            confirmButtonColor: '#ecb4b4',
            confirmButtonText: 'Cerrar'
        }).then(() => {
            carrito = [];
            guardarYRenderizar();
            // Cierra el Offcanvas
            const offcanvasElement = document.getElementById('carritoOffcanvas');
            if(offcanvasElement) {
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if(offcanvasInstance) offcanvasInstance.hide();
            }
        });
    });
}

// --- 7. NOTIFICACIONES ---
const notificacionAgregado = () => {
    Toastify({
        text: "¡Agregado al carrito! 🍰",
        duration: 3000,
        gravity: "bottom", 
        position: "right", 
        style: {
            background: "linear-gradient(to right, #ecb4b4, #e89595)",
            color: "#fff",
            fontWeight: "bold"
        },
    }).showToast();
};

// --- EJECUCIÓN INICIAL ---
iniciarApp();