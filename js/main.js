const productos = [
  { nombre: "Torta Matilda", descripcion: "Chocolate puro, suave y esponjosa, perfecta para compartir.", imagen: "../imagenes/tortamatilda.png" },
  { nombre: "Torta Merengue", descripcion: "Capas suaves con merengue dorado que se derrite en la boca.", imagen: "../imagenes/tortamerengue.png" },
  { nombre: "Torta de Almendras", descripcion: "Tierna, aromática y con nueces crujientes irresistibles.", imagen: "../imagenes/tortaalmendra.png" },
  { nombre: "Torta Rogel", descripcion: "Capas crocantes con dulce de leche y merengue dorado.", imagen: "../imagenes/tortarogel.png" },
  { nombre: "Lemon Pie", descripcion: "Base crujiente, relleno ácido y cobertura esponjosa.", imagen: "../imagenes/lemonpie.png" },
  { nombre: "Torta Frutilla", descripcion: "Crema delicada y frutillas frescas, alegría en cada bocado.", imagen: "../imagenes/tortafrutilla.png" },
  { nombre: "Torta Chajá", descripcion: "Bizcochuelo suave, crema batida y duraznos frescos.", imagen: "../imagenes/tortachaja.png" },
  { nombre: "Torta Imperial Ruso", descripcion: "Base de pionono y crema, placer que conquista paladares.", imagen: "../imagenes/imperialruso.png" },
  { nombre: "Torta Alfajor", descripcion: "Galletas suaves, dulce de leche y cobertura de chocolate.", imagen: "../imagenes/tortaalfajor.png" }
];


const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para mostrar productos
function mostrarProductos(lista) {
  const contenedor = document.getElementById("cards-container");
  contenedor.innerHTML = "";

  lista.forEach((producto, i) => {
    const card = document.createElement("section");
    card.className = "card col-12 col-sm-6 col-lg-4 text-center";

    card.innerHTML = `
      <h2 class="mt-2">${producto.nombre}</h2>
      <img class="mt-1" src="${producto.imagen}" alt="${producto.nombre}">
      <div class="d-flex h-100 flex-column align-items-center justify-content-between">
        <p>${producto.descripcion}</p>
        <button class="btn-base p-2">Comprar</button>
      </div>
    `;

    contenedor.appendChild(card);

    // Evento para agregar al carrito
    const boton = card.querySelector(".btn-base");
    boton.addEventListener("click", () => agregarAlCarrito(producto));
  });
}

// Función para agregar el carrito
function agregarAlCarrito(producto) {
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarMensaje(`${producto.nombre} agregada al carrito 🛒`);
  mostrarCarrito();
}

// Función para mostrar el mensaje
function mostrarMensaje(texto) {
  const mensaje = document.createElement("div");
  mensaje.textContent = texto;
  mensaje.className = "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3";
  document.body.appendChild(mensaje);
  setTimeout(() => mensaje.remove(), 2000);
}

// Función para mostrar el carrito
function mostrarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = "<p>No hay productos en el carrito 😢</p>";
    return;
  }

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.className = "col-12 col-md-6 col-lg-4 card text-center";
    item.innerHTML = `
      <h3 class="mt-2">${producto.nombre}</h3>
      <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid">
      <p>${producto.descripcion}</p>
      <button class="btn btn-danger btn-sm eliminar" data-index="${index}">Eliminar</button>
    `;
    listaCarrito.appendChild(item);
  });

  // Botones de eliminar
  listaCarrito.querySelectorAll(".eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      mostrarCarrito();
      mostrarMensaje("Producto eliminado 🗑️");
    });
  });
}

// Buscador
const buscador = document.getElementById("buscador");
buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();
  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto)
  );
  mostrarProductos(filtrados);
});


document.addEventListener("DOMContentLoaded", () => {
  const btnToggleCarrito = document.getElementById("toggle-carrito");
  const seccionCarrito = document.getElementById("carrito-container");

  if (btnToggleCarrito && seccionCarrito) {
    btnToggleCarrito.addEventListener("click", () => {
      const visible = seccionCarrito.style.display === "block";
      seccionCarrito.style.display = visible ? "none" : "block";
      btnToggleCarrito.textContent = visible ? "🛒 Ver carrito" : "❌ Ocultar carrito";

      if (!visible) mostrarCarrito();
    });
  }

  mostrarProductos(productos);
});
