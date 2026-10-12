// Mini Shop: the app under test. You do NOT need to change this file.
// State lives in memory only, so every test starts with an empty cart.

const state = {
  products: [],
  cart: new Map(), // productId -> quantity
  filter: '',
};

const $ = (selector) => document.querySelector(selector);

const formatPrice = (grosze) => `${(grosze / 100).toFixed(2).replace('.', ',')} zł`;

// ---------- Views ----------
function showView(view) {
  $('#shop').hidden = view !== 'shop';
  $('#cart').hidden = view !== 'shop';
  $('#checkout').hidden = view !== 'checkout';
  $('#confirmation').hidden = view !== 'confirmation';
}

// ---------- Products ----------
async function loadProducts() {
  const status = $('#products-status');
  status.textContent = 'Loading products…';
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.products = await res.json();
    renderProducts();
  } catch {
    status.textContent = 'Could not load products. Please refresh the page.';
  }
}

function renderProducts() {
  const list = $('#product-list');
  const status = $('#products-status');
  const query = state.filter.trim().toLowerCase();
  const visible = state.products.filter((p) => p.name.toLowerCase().includes(query));

  list.innerHTML = '';
  for (const product of visible) {
    const li = document.createElement('li');
    li.className = 'product-card';
    li.innerHTML = `
      <h3>${product.name}</h3>
      <p class="price">${formatPrice(product.price)}</p>
      <button type="button" aria-label="Add ${product.name} to cart">Add to cart</button>
    `;
    li.querySelector('button').addEventListener('click', () => addToCart(product.id));
    list.append(li);
  }
  status.textContent = visible.length === 0 ? 'No products found' : '';
}

// ---------- Cart ----------
function addToCart(id) {
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  renderCart();
}

function changeQuantity(id, delta) {
  const next = (state.cart.get(id) || 0) + delta;
  if (next <= 0) state.cart.delete(id);
  else state.cart.set(id, next);
  renderCart();
}

function removeFromCart(id) {
  state.cart.delete(id);
  renderCart();
}

function cartTotal() {
  let total = 0;
  for (const [id, qty] of state.cart) {
    total += state.products.find((p) => p.id === id).price * qty;
  }
  return total;
}

function renderCart() {
  const list = $('#cart-list');
  list.innerHTML = '';
  let count = 0;

  for (const [id, qty] of state.cart) {
    const product = state.products.find((p) => p.id === id);
    count += qty;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <span class="cart-item-name">${product.name}</span>
      <span class="line-total">${formatPrice(product.price * qty)}</span>
      <div class="qty">
        <button type="button" aria-label="Decrease quantity of ${product.name}" ${qty === 1 ? 'disabled' : ''}>−</button>
        <output aria-label="Quantity of ${product.name}">${qty}</output>
        <button type="button" aria-label="Increase quantity of ${product.name}">+</button>
      </div>
      <button type="button" class="remove" aria-label="Remove ${product.name}">Remove</button>
    `;
    const [decrease, increase] = li.querySelectorAll('.qty button');
    decrease.addEventListener('click', () => changeQuantity(id, -1));
    increase.addEventListener('click', () => changeQuantity(id, 1));
    li.querySelector('.remove').addEventListener('click', () => removeFromCart(id));
    list.append(li);
  }

  $('[data-testid="cart-count"]').textContent = String(count);
  $('[data-testid="cart-total"]').textContent = formatPrice(cartTotal());
  $('#cart-empty').hidden = count > 0;
  $('#go-to-checkout').disabled = count === 0;
}

// ---------- Checkout ----------
const RULES = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address'),
  locker: (v) => (/^[A-Z]{3}\d{2,3}[A-Z]{0,2}$/i.test(v.trim()) ? '' : 'Enter a locker code, e.g. WAW01M'),
  street: (v) => (v.trim() ? '' : 'Enter your street address'),
  postal: (v) => (/^\d{2}-\d{3}$/.test(v.trim()) ? '' : 'Enter a postal code in the format 00-000'),
  city: (v) => (v.trim() ? '' : 'Enter your city'),
};

function deliveryMethod() {
  return $('input[name="delivery"]:checked').value;
}

function fieldsToValidate() {
  const base = ['name', 'email'];
  return deliveryMethod() === 'locker' ? [...base, 'locker'] : [...base, 'street', 'postal', 'city'];
}

function clearErrors() {
  for (const id of Object.keys(RULES)) {
    $(`#${id}`).removeAttribute('aria-invalid');
    $(`#${id}-error`).textContent = '';
  }
  $('#order-error').textContent = '';
}

function validate() {
  clearErrors();
  let firstInvalid = null;
  for (const id of fieldsToValidate()) {
    const input = $(`#${id}`);
    const message = RULES[id](input.value);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      $(`#${id}-error`).textContent = message;
      firstInvalid ??= input;
    }
  }
  firstInvalid?.focus();
  return !firstInvalid;
}

function toggleDeliveryFields() {
  const locker = deliveryMethod() === 'locker';
  $('#locker-fields').hidden = !locker;
  $('#courier-fields').hidden = locker;
  clearErrors();
}

async function placeOrder(event) {
  event.preventDefault();
  if (!validate()) return;

  const button = $('#place-order');
  button.disabled = true;
  button.textContent = 'Placing order…';

  const value = (id) => $(`#${id}`).value.trim();
  const order = {
    customer: { name: value('name'), email: value('email'), phone: value('phone') },
    delivery:
      deliveryMethod() === 'locker'
        ? { method: 'locker', lockerCode: value('locker').toUpperCase() }
        : { method: 'courier', street: value('street'), postal: value('postal'), city: value('city') },
    items: [...state.cart].map(([id, qty]) => ({ id, qty })),
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { orderId } = await res.json();
    $('[data-testid="order-number"]').textContent = orderId;
    state.cart.clear();
    renderCart();
    $('#checkout-form').reset();
    toggleDeliveryFields();
    showView('confirmation');
  } catch {
    $('#order-error').textContent = 'Something went wrong. Your order was not placed. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = 'Place order';
  }
}

// ---------- Wiring ----------
$('#search').addEventListener('input', (e) => {
  state.filter = e.target.value;
  renderProducts();
});
$('#go-to-checkout').addEventListener('click', () => showView('checkout'));
$('#back-to-cart').addEventListener('click', () => showView('shop'));
$('#continue-shopping').addEventListener('click', () => showView('shop'));
for (const radio of document.querySelectorAll('input[name="delivery"]')) {
  radio.addEventListener('change', toggleDeliveryFields);
}
$('#checkout-form').addEventListener('submit', placeOrder);

showView('shop');
renderCart();
loadProducts();
