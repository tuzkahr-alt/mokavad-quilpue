document.addEventListener('DOMContentLoaded', () => {
  
  // ── CART STATE ──
  let cart = [];
  const WHATSAPP_NUMBER = '56977994483';

  // Load cart from localStorage
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('mokavad_cart');
      if (savedCart) {
        cart = JSON.parse(savedCart);
      }
    } catch (e) {
      console.error('Error loading cart:', e);
      cart = [];
    }
  };

  // Save cart to localStorage
  const saveCart = () => {
    try {
      localStorage.setItem('mokavad_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
    updateCartUI();
  };

  // ── DOM ELEMENTS ──
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartItemsContainer = document.getElementById('cart-drawer-items');
  const cartTotalPriceEl = document.getElementById('cart-total-price');
  const cartCountEl = document.getElementById('cart-count');
  
  const waFloatBtn = document.getElementById('wa-float-btn');
  const waFloatBadge = document.getElementById('wa-float-badge');
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  
  const orderMethodSelect = document.getElementById('order-method');
  const deliveryAddressGroup = document.getElementById('delivery-address-group');
  const orderAddressInput = document.getElementById('order-address');
  const orderNotesInput = document.getElementById('order-notes');
  const cartSubmitBtn = document.getElementById('cart-submit-btn');
  const ctaOpenCartBtn = document.getElementById('cta-open-cart-btn');

  // ── DRAWER TOGGLE ──
  const openCartDrawer = () => {
    cartDrawer.classList.add('open');
    cartDrawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent scrolling back
  };

  const closeCartDrawer = () => {
    cartDrawer.classList.remove('open');
    cartDrawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);
  if (ctaOpenCartBtn) ctaOpenCartBtn.addEventListener('click', openCartDrawer);

  // Floating button action
  if (waFloatBtn) {
    waFloatBtn.addEventListener('click', () => {
      openCartDrawer();
    });
  }

  // ESC key to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('open')) {
      closeCartDrawer();
    }
  });

  // ── FILTER MENU ──
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Filter cards with smooth fade transition
      menuCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ── ORDER METHOD TOGGLE ──
  if (orderMethodSelect) {
    orderMethodSelect.addEventListener('change', () => {
      if (orderMethodSelect.value === 'delivery') {
        deliveryAddressGroup.style.display = 'flex';
        orderAddressInput.setAttribute('required', 'true');
      } else {
        deliveryAddressGroup.style.display = 'none';
        orderAddressInput.removeAttribute('required');
      }
    });
  }

  // ── ADD TO CART ──
  document.querySelectorAll('.menu-card').forEach(card => {
    const addBtn = card.querySelector('.add-to-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const price = parseInt(card.getAttribute('data-price'), 10);

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
          existingItem.qty += 1;
        } else {
          cart.push({ id, name, price, qty: 1 });
        }

        // Button micro-animation / visual indicator
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = '¡Agregado! ✓';
        addBtn.style.background = '#25D366';
        addBtn.style.borderColor = '#25D366';
        addBtn.style.color = '#FFFFFF';
        
        setTimeout(() => {
          addBtn.innerHTML = originalText;
          addBtn.style.background = '';
          addBtn.style.borderColor = '';
          addBtn.style.color = '';
        }, 1500);

        saveCart();
      });
    }
  });

  // ── CART CONTROLS (IN DRAWER) ──
  cartItemsContainer.addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (e.target.classList.contains('cart-qty-plus')) {
      item.qty += 1;
      saveCart();
    } else if (e.target.classList.contains('cart-qty-minus')) {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      saveCart();
    } else if (e.target.classList.contains('cart-item-remove-btn')) {
      cart = cart.filter(i => i.id !== id);
      saveCart();
    }
  });

  // ── UPDATE UI ──
  const formatCLP = (number) => {
    return '$' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const updateCartUI = () => {
    // Clean list
    cartItemsContainer.innerHTML = '';
    
    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
      // Empty drawer state
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-msg" id="cart-empty-msg">
          <span class="cart-empty-icon">🛒</span>
          <p>Tu carrito está vacío. Agrega platos de la carta para armar tu pedido.</p>
        </div>
      `;
      cartTotalPriceEl.textContent = formatCLP(0);
      cartCountEl.textContent = '0';
      waFloatBadge.textContent = '0';
      waFloatBadge.classList.remove('visible');
      return;
    }

    // Render items
    cart.forEach(item => {
      totalItems += item.qty;
      totalPrice += item.price * item.qty;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">${formatCLP(item.price * item.qty)} <span style="font-size:0.75rem; color:var(--muted); font-weight:normal;">(${formatCLP(item.price)} c/u)</span></span>
        </div>
        <div class="cart-item-qty-controls">
          <button class="cart-qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn cart-qty-plus" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
        </div>
        <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="Eliminar item">🗑️</button>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalPriceEl.textContent = formatCLP(totalPrice);
    cartCountEl.textContent = totalItems.toString();
    waFloatBadge.textContent = totalItems.toString();
    waFloatBadge.classList.add('visible');
  };

  // ── WHATSAPP SUBMIT ──
  cartSubmitBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Por favor agrega productos del menú antes de enviar.');
      return;
    }

    const method = orderMethodSelect.value;
    const notes = orderNotesInput.value.trim();
    const address = orderAddressInput.value.trim();

    if (method === 'delivery' && !address) {
      alert('Por favor ingresa la dirección de despacho.');
      orderAddressInput.focus();
      return;
    }

    // Generate WhatsApp Text
    let messageText = `¡Hola Mokavad! 🌟 Quisiera realizar el siguiente pedido:\n\n`;
    
    let subtotal = 0;
    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      subtotal += itemSubtotal;
      messageText += `🔹 *${item.qty}x* ${item.name} (${formatCLP(itemSubtotal)})\n`;
    });

    messageText += `\n💵 *Total Pedido:* ${formatCLP(subtotal)}\n\n`;
    messageText += `📍 *Método de entrega:* ${method === 'delivery' ? 'Envío a domicilio (Delivery)' : 'Retiro en tienda (Freire 1389)'}\n`;
    
    if (method === 'delivery') {
      messageText += `🏠 *Dirección de despacho:* ${address}\n`;
    }
    
    if (notes) {
      messageText += `📝 *Notas adicionales:* ${notes}\n`;
    }

    messageText += `\n¡Quedo atento a la confirmación de disponibilidad y detalles de pago! Muchas gracias.`;

    // Encode text
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  });

  // ── INIT ──
  loadCart();
  updateCartUI();
});
