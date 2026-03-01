AOS.init();

const formularioContacto = document.getElementById("formularioContacto");

// carrito
let carrito = [];

// usuarios registrados / autenticación
let accounts = [];
let currentUser = null;

function loadAccounts() {
  const stored = localStorage.getItem('accounts');
  if (stored) {
    try {
      accounts = JSON.parse(stored);
    } catch (e) {
      accounts = [];
    }
  }
}

function saveAccounts() {
  localStorage.setItem('accounts', JSON.stringify(accounts));
}

function updateAuthUI() {
  const authDiv = document.querySelector('.auth-buttons');
  if (currentUser) {
    authDiv.innerHTML = `
      <span class="welcome-msg">Hola, ${currentUser.fullName}</span>
      <button class="btn-secondary" id="logoutBtn">Cerrar sesión</button>
      <!-- Carrito de compras -->
      <button id="cartButton" class="btn-secondary" onclick="abrirModal('cartModal')">
          🛒 <span id="cartCount" class="cart-count">0</span>
      </button>
    `;
    const logout = document.getElementById('logoutBtn');
    logout.addEventListener('click', () => {
      currentUser = null;
      updateAuthUI();
    });
  } else {
    authDiv.innerHTML = `
      <button class="btn-secondary" onclick="abrirModal('registroModal')">Registrarse</button>
      <button class="btn-primary" onclick="abrirModal('loginModal')">Iniciar Sesión</button>
      <!-- Carrito de compras -->
      <button id="cartButton" class="btn-secondary" onclick="abrirModal('cartModal')">
          🛒 <span id="cartCount" class="cart-count">0</span>
      </button>
    `;
  }
}

// setup account handlers after DOM loaded
window.addEventListener('load', () => {
  loadAccounts();
  updateAuthUI();

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const newAccount = {
        docType: document.getElementById('regDocType').value,
        docNumber: document.getElementById('regDocNumber').value.trim(),
        fullName: document.getElementById('regFullName').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        email: document.getElementById('regEmail').value.trim().toLowerCase(),
        address: document.getElementById('regAddress').value.trim(),
        password: document.getElementById('regPassword').value
      };
      // simple validation: unique email
      if (accounts.find(acc => acc.email === newAccount.email)) {
        alert('Ya existe una cuenta con ese correo.');
        return;
      }
      accounts.push(newAccount);
      saveAccounts();
      alert('Registro exitoso. Ya puedes iniciar sesión.');
      registerForm.reset();
      cerrarModal('registroModal');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pwd = document.getElementById('loginPassword').value;
      const account = accounts.find(acc => acc.email === email && acc.password === pwd);
      if (account) {
        currentUser = account;
        updateAuthUI();
        alert('Inicio de sesión exitoso.');
        loginForm.reset();
        cerrarModal('loginModal');
      } else {
        alert('Credenciales inválidas.');
      }
    });
  }

  // initialize accordion toggles
  const headers = document.querySelectorAll('.accordion-header');
  headers.forEach(h => {
    h.addEventListener('click', () => {
      const content = h.nextElementSibling;
      const isOpen = content.classList.contains('open');
      if (isOpen) {
        content.style.maxHeight = null;
        content.classList.remove('open');
      } else {
        // close others
        document.querySelectorAll('.accordion-content.open').forEach(o => {
          o.style.maxHeight = null;
          o.classList.remove('open');
        });
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

});

// opciones de compra
let currentShipping = 0;
let currentCoupon = { code: null, discountPercent: 0 };
let currentPayment = 'card';

function agregarAlCarrito(insumo) {
  // buscar si ya está en el carrito
  const existente = carrito.find(item => item.nombre === insumo.nombre);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...insumo, cantidad: 1 });
  }
  updateCartDisplay();
}

function cambiarCantidad(index, delta) {
  if (carrito[index]) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    updateCartDisplay();
  }
}

function eliminarDelCarrito(index) {
  if (carrito[index]) {
    carrito.splice(index, 1);
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  const cartCount = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartDiscountEl = document.getElementById("cartDiscount");
  const cartShippingEl = document.getElementById("cartShippingDisplay");

  // calcular cantidad total de unidades
  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  cartCount.textContent = totalUnidades;

  // construir lista de elementos
  cartItemsList.innerHTML = "";
  let sumaTotal = 0;
  carrito.forEach((item, idx) => {
    const precioNum = parseInt(item.precio.replace(/[^0-9]/g, "")) || 0;
    sumaTotal += precioNum * item.cantidad;
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="cart-item-name">${item.nombre}</span>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="minus" data-index="${idx}">-</button>
        <span class="cart-item-qty">${item.cantidad}</span>
        <button class="qty-btn" data-action="plus" data-index="${idx}">+</button>
        <button class="remove-btn" data-index="${idx}">×</button>
      </div>
      <span class="cart-item-price"><strong>${item.precio}</strong></span>
    `;
    cartItemsList.appendChild(li);
  });

  // aplicar cupón y envío
  const descuento = Math.round(sumaTotal * (currentCoupon.discountPercent / 100));
  const envio = parseInt(currentShipping, 10) || 0;
  const totalFinal = sumaTotal - descuento + envio;

  // actualizar vistas
  if (cartSubtotalEl) cartSubtotalEl.textContent = `Subtotal: $${sumaTotal.toLocaleString()}`;
  if (cartDiscountEl) cartDiscountEl.textContent = `Descuento: $${descuento.toLocaleString()}`;
  if (cartShippingEl) cartShippingEl.textContent = `Envío: $${envio.toLocaleString()}`;
  if (cartTotal) cartTotal.textContent = `Total: $${totalFinal.toLocaleString()}`;

  // attach event listeners for new buttons
  const qtyButtons = cartItemsList.querySelectorAll(".qty-btn");
  qtyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"), 10);
      const action = btn.getAttribute("data-action");
      cambiarCantidad(index, action === "plus" ? 1 : -1);
    });
  });

  const removeButtons = cartItemsList.querySelectorAll(".remove-btn");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"), 10);
      eliminarDelCarrito(index);
    });
  });
}

// manejar opciones del carrito
const shippingSelect = document.getElementById("cartShipping");
const applyCouponBtn = document.getElementById("applyCoupon");
const couponInput = document.getElementById("cartCoupon");
const couponMsg = document.getElementById("couponMsg");
const checkoutBtn = document.getElementById("checkoutBtn");
const payNowBtn = document.getElementById("payNowBtn");

if (shippingSelect) {
  shippingSelect.addEventListener("change", () => {
    currentShipping = shippingSelect.value;
    updateCartDisplay();
  });
}

if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) {
      couponMsg.textContent = "Ingrese un código.";
      return;
    }
    // ejemplos de cupones
    if (code === "REPAIR10") {
      currentCoupon = { code: code, discountPercent: 10 };
      couponMsg.textContent = "Cupón aplicado: 10%";
    } else if (code === "ENVIOGRATIS") {
      currentCoupon = { code: code, discountPercent: 0 };
      currentShipping = 0;
      if (shippingSelect) shippingSelect.value = "0";
      couponMsg.textContent = "Cupón aplicado: envío gratis";
    } else {
      currentCoupon = { code: null, discountPercent: 0 };
      couponMsg.textContent = "Cupón inválido.";
    }
    updateCartDisplay();
  });
}

// payment selection
const paymentRadios = document.getElementsByName("cartPayment");
paymentRadios.forEach(r => {
  r.addEventListener("change", () => {
    currentPayment = r.value;
  });
});

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    finalizarCompra();
  });
}

if (payNowBtn) {
  payNowBtn.addEventListener("click", () => {
    //pago inmediato
    alert("Redirigiendo a pasarela de pago...");
    finalizarCompra();
  });
}

function finalizarCompra() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  // construir orden
  const orden = {
    items: carrito.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
    shipping: parseInt(currentShipping, 10) || 0,
    coupon: currentCoupon.code || null,
    payment: currentPayment
  };
  console.log("Orden enviada:", orden);
  alert("Compra realizada. Revisa la consola para detalles.");
  // resetear carrito
  carrito = [];
  currentCoupon = { code: null, discountPercent: 0 };
  currentShipping = 0;
  if (shippingSelect) shippingSelect.value = "0";
  if (couponInput) couponInput.value = "";
  if (couponMsg) couponMsg.textContent = "";
  updateCartDisplay();
  cerrarModal('cartModal');
}


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
    imagen: "img/compresor-nevera.jpg",
    alt: "Compresor Nevera",
    nombre: "Compresor Nevera",
    precio: "$250.000"
  },
  {
    imagen: "img/Bomba lavadora.jpg",
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
      <button class="btn-secondary agregar-btn">Agregar al carrito</button>
    `;
    productGrid.appendChild(card);
  });

  // después de agregar todas las tarjetas, añadir manejadores de evento
  const botones = document.querySelectorAll(".agregar-btn");
  botones.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      agregarAlCarrito(listaInsumos[idx]);
    });
  });
}



// remove loader and other initial actions moved above
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
updateCartDisplay();