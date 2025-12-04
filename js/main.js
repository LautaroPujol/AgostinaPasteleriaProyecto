// js/main.js

// 1. IMPORTAMOS LA FUNCIÓN DEL OTRO ARCHIVO
import { obtenerProductos } from './servicios.js';

// --- VARIABLES GLOBALES ---
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Referencias al DOM
const contenedorProductos = document.getElementById("cards-container");
const contenedorCarrito = document.getElementById("lista-carrito");
const spanTotal = document.getElementById("precio-total");
const buscador = document.getElementById("buscador");
const btnFinalizar = document.getElementById("btn-finalizar");

// --- FUNCIÓN DE INICIO ---
const iniciarApp = () => {
    renderizarCarrito();

    if (contenedorProductos) {
        // Llamamos a nuestra nueva función gestora de carga
        gestionarCargaDeProductos();
        activarEventosCatalogo();
    }
    
    if (contenedorCarrito) {
        activarEventosCarrito();
    }

    if (buscador) {
        buscador.addEventListener("input", filtrarProductos);
    }
};

// --- NUEVA FUNCIÓN PARA USAR EL SERVICIO IMPORTADO ---
const gestionarCargaDeProductos = async () => {
    try {
        // Usamos la función que importamos de servicios.js
        productos = await obtenerProductos();
        mostrarProductos(productos);
    } catch (error) {
        console.error("Error en main:", error);
        if (contenedorProductos) {
            contenedorProductos.innerHTML = `
                <div class="col-12 text-center text-danger">
                    <h3>Error al cargar productos.</h3>
                    <p>Verifica que estás usando Live Server.</p>
                </div>`;
        }
    }
};

// --- CONFIGURACIÓN DE EVENTOS (DELEGACIÓN) ---
const activarEventosCatalogo = () => {
    contenedorProductos.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-comprar");
        if (boton) {
            const id = parseInt(boton.dataset.id);
            agregarAlCarrito(id);
        }
    });
};

const activarEventosCarrito = () => {
    contenedorCarrito.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-eliminar");
        if (boton) {
            const id = parseInt(boton.dataset.id);
            eliminarDelCarrito(id);
        }
    });
};

// --- RENDERIZADO DE PRODUCTOS ---
const mostrarProductos = (lista) => {
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
                <button class="btn-base p-2 w-100 mt-2 btn-comprar" data-id="${prod.id}">
                    Comprar
                </button>
            </div>
        </section>
    `).join("");
};

// --- LÓGICA DE NEGOCIO ---
const agregarAlCarrito = (idProducto) => {
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

const eliminarDelCarrito = (idProducto) => {
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

const filtrarProductos = () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto) || 
        p.descripcion.toLowerCase().includes(texto)
    );
    mostrarProductos(filtrados);
};

// --- RENDERIZADO DEL CARRITO ---
const guardarYRenderizar = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
};

const renderizarCarrito = () => {
    if (!contenedorCarrito) return;
    contenedorCarrito.innerHTML = "";

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p class='text-center mt-3'>Tu carrito está vacío 😢</p>";
        if (spanTotal) spanTotal.innerText = "0";
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
                    <button class="btn btn-sm btn-outline-danger border-0 btn-eliminar" data-id="${prod.id}">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    const total = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
    if (spanTotal) spanTotal.innerText = total;
};

// --- FINALIZAR COMPRA ---
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
            const offcanvasElement = document.getElementById('carritoOffcanvas');
            if (offcanvasElement) {
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvasInstance) offcanvasInstance.hide();
            }
        });
    });
}

// --- NOTIFICACIONES ---
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

// --- INICIALIZACIÓN ---
iniciarApp();