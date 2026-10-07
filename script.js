const products = [
  {
    id: "regata",
    name: "Regata Performance",
    category: "Treino",
    description: "Leveza e respirabilidade para cada repetição.",
    price: 89.9,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "camiseta",
    name: "Camiseta Dry Fit",
    category: "Treino",
    description: "Tecido leve que acompanha seu ritmo.",
    price: 109.9,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85"
  },
  {
    id: "shorts",
    name: "Shorts Movimento",
    category: "Corrida",
    description: "Liberdade de movimento do início ao fim.",
    price: 119.9,
    image: "https://images.unsplash.com/photo-1628609653268-76a7080b98e0?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Homem usando camiseta branca e bermuda esportiva preta"
  },
  {
    id: "calca",
    name: "Calça Jogger",
    category: "Casual",
    description: "Conforto para o treino e para depois dele.",
    price: 159.9,
    image: "https://images.unsplash.com/photo-1506638794690-bbea5c6f0ab7?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Homem correndo com calça esportiva preta"
  },
  {
    id: "moletom",
    name: "Moletom Essencial",
    category: "Casual",
    description: "Uma camada extra para os dias mais frescos.",
    price: 189.9,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85"
  }
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const cartStorageKey = "vertice-cart";

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(cartStorageKey) || "{}");
    return cart && typeof cart === "object" ? cart : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = Object.values(readCart()).reduce((total, quantity) => total + quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
  });
}

function addToCart(productId) {
  const cart = readCart();
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart(cart);
}

function renderProducts(searchTerm = "") {
  const grid = document.querySelector("#product-grid");
  if (!grid) return;

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
  );

  grid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card">
      <div class="product-photo">
        <img src="${product.image}" alt="${product.imageAlt || product.name}" loading="lazy">
        <span class="product-category">${product.category}</span>
      </div>
      <div class="product-info">
        <div><h2>${product.name}</h2><p>${product.description}</p></div>
        <strong>${money.format(product.price)}</strong>
      </div>
      <button class="product-add" type="button" data-add-to-cart="${product.id}">Adicionar ao carrinho <span aria-hidden="true">+</span></button>
    </article>
  `).join("");

  document.querySelector("#result-count").textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? "produto" : "produtos"}`;
  document.querySelector("#empty-state").hidden = filteredProducts.length > 0;
}

function renderCart() {
  const container = document.querySelector("#cart-items");
  if (!container) return;

  const cart = readCart();
  const entries = products.filter((product) => cart[product.id] > 0);
  const total = entries.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  if (entries.length === 0) {
    container.innerHTML = '<div class="cart-empty">Seu carrinho ainda está vazio.<br><a href="produtos.html">Explorar produtos</a></div>';
  } else {
    container.innerHTML = entries.map((product) => `
      <article class="cart-row">
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-info">
          <h2>${product.name}</h2>
          <p>${money.format(product.price)} cada</p>
          <div class="cart-quantity" aria-label="Quantidade de ${product.name}">
            <button type="button" data-quantity-change="-1" data-product-id="${product.id}" aria-label="Remover uma unidade">−</button>
            <span>${cart[product.id]}</span>
            <button type="button" data-quantity-change="1" data-product-id="${product.id}" aria-label="Adicionar uma unidade">+</button>
          </div>
        </div>
        <div class="cart-item-end"><strong>${money.format(product.price * cart[product.id])}</strong><button class="remove-item" type="button" data-remove-item="${product.id}">Remover</button></div>
      </article>
    `).join("");
  }

  document.querySelector("#cart-subtotal").textContent = money.format(total);
  document.querySelector("#cart-total").textContent = money.format(total);
  document.querySelector("#checkout-button").disabled = entries.length === 0;
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addToCart);
    const originalText = addButton.innerHTML;
    addButton.innerHTML = "Adicionado <span aria-hidden=\"true\">✓</span>";
    window.setTimeout(() => { addButton.innerHTML = originalText; }, 1200);
  }

  const quantityButton = event.target.closest("[data-quantity-change]");
  if (quantityButton) {
    const cart = readCart();
    const productId = quantityButton.dataset.productId;
    cart[productId] += Number(quantityButton.dataset.quantityChange);
    if (cart[productId] <= 0) delete cart[productId];
    saveCart(cart);
    renderCart();
  }

  const removeButton = event.target.closest("[data-remove-item]");
  if (removeButton) {
    const cart = readCart();
    delete cart[removeButton.dataset.removeItem];
    saveCart(cart);
    renderCart();
  }
});

document.querySelector("#product-search")?.addEventListener("input", (event) => renderProducts(event.target.value));
document.querySelector("#checkout-button")?.addEventListener("click", () => {
  if (Object.keys(readCart()).length > 0) window.alert("Compra de demonstração: seu pedido foi registrado!");
});

renderProducts();
renderCart();
updateCartCount();