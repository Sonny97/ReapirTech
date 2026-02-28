AOS.init();

const formularioContacto = document.getElementById("formularioContacto");

// Array de insumos/productos
const listaInsumos = [
  {
    imagen: "img/repuesto1.jpg",
    alt: "Repuesto Lavadora",
    nombre: "Motor para Lavadora",
    precio: "$120.000"
  },
  {
    imagen: "img/repuesto2.jpg",
    alt: "Repuesto Nevera",
    nombre: "Termostato Nevera",
    precio: "$45.000"
  },
  {
    imagen: "img/repuesto1.jpg",
    alt: "Compresor Nevera",
    nombre: "Compresor Nevera",
    precio: "$250.000"
  },
  {
    imagen: "img/repuesto2.jpg",
    alt: "Bomba de Agua",
    nombre: "Bomba de Agua Lavadora",
    precio: "$85.000"
  }
];

usuario = {
  nombre: "",
  email: "",
  telefono: "",
  mensaje: "",
};

let usuarios = [
  {
    nombre: "Juan Pérez",
    email: "juanito@juanito.com",
    telefono: "3201234567",
    mensaje: "Hola, este es un mensaje de prueba.",
  },
  {
    nombre: "Pedro",
    email: "pedro@pedro.com",
    telefono: "3201234567",
    mensaje: "Hola, este es un mensaje de prueba.",
  },
];


function cargarInsumos() {
  const productGrid = document.getElementById("productGrid");
  productGrid.innerHTML = "";

  listaInsumos.forEach((insumo, index) => {
    const delay = index * 200;
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-aos", "flip-left");
    if (delay > 0) {
      card.setAttribute("data-aos-delay", delay.toString());
    }
    card.innerHTML = `
      <img src="${insumo.imagen}" alt="${insumo.alt}">
      <h3>${insumo.nombre}</h3>
      <p>${insumo.precio}</p>
      <button class="btn-secondary">Agregar al carrito</button>
    `;
    productGrid.appendChild(card);
  });
}


window.addEventListener("load", function () {
  document.getElementById("loader").style.display = "none";
});

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav ul");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});
function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModal(id) {
  document.getElementById(id).style.display = "none";
}

window.onclick = function (event) {
  const registro = document.getElementById("registroModal");
  const login = document.getElementById("loginModal");

  if (event.target == registro) {
    registro.style.display = "none";
  }

  if (event.target == login) {
    login.style.display = "none";
  }
};

formularioContacto.addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  let esValido = true;

  if (nombre.length < 3) {
    console.log("Error: El nombre debe tener al menos 3 caracteres");
    esValido = false;
  }

  if (telefono.length < 10) {
    console.log("Error: El teléfono debe tener al menos 10 caracteres");
    esValido = false;
  }

  if (mensaje.length < 10) {
    console.log("Error: El mensaje debe tener al menos 10 caracteres");
    esValido = false;
  }

  if (esValido) {
    console.log("Formulario enviado:", {
      nombre: nombre,
      email: email,
      telefono: telefono,
      mensaje: mensaje,
    });
    formularioContacto.reset();
  }

  usuario.nombre = nombre;
  usuario.email = email;
  usuario.telefono = telefono;
  usuario.mensaje = mensaje;

  usuarios.push(usuario);
});

// Funcionalidad para mostrar usuarios en Mantenimiento Preventivo
const cardMantenimiento = document.getElementById("cardMantenimiento");

cardMantenimiento.addEventListener("click", function () {
  const listaUsuarios = document.getElementById("listaUsuarios");
  listaUsuarios.innerHTML = "";

  if (usuarios.length === 0) {
    listaUsuarios.innerHTML = "<li>No hay usuarios registrados.</li>";
  } else {
    usuarios.forEach((user, index) => {
      const li = document.createElement("li");
      li.style.padding = "10px";
      li.style.borderBottom = "1px solid #eee";
      li.innerHTML = `
        <strong>${index + 1}. ${user.nombre}</strong><br>
        <small>Email: ${user.email}</small><br>
        <small>Teléfono: ${user.telefono}</small><br>
        <small>Mensaje: ${user.mensaje}</small>
      `;
      listaUsuarios.appendChild(li);
    });
  }

  abrirModal("usuariosModal");
});


cargarInsumos();