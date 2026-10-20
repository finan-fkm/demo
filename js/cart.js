// Premium Shopping Cart Core Library
const WHATSAPP_PHONE = "9061504694";

// Global Cart State
let cart = [];

// Document load initialization
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initCart();
    });
} else {
    initCart();
}

// Load CSS dynamically
if (!document.getElementById("cart-style-link")) {
    const link = document.createElement("link");
    link.id = "cart-style-link";
    link.rel = "stylesheet";
    link.href = "css/cart.css";
    document.head.appendChild(link);
}

function initCart() {
    // Load from localStorage
    try {
        const storedCart = localStorage.getItem("pharmacy_cart");
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (e) {
        console.error("Could not load cart from localStorage", e);
    }

    // Inject DOM components: Floating Button, Drawer, Toast container
    injectCartDOM();

    // Update Badge and Drawer display
    updateCartUI();

    // If on the Cart Page (cart.html), render full list
    if (window.location.pathname.includes("cart.html")) {
        renderCartPage();
    }

    // Bind event handlers for product cards on the current page
    if (customElements.get('product-card')) {
        bindProductCardEvents();
    } else {
        customElements.whenDefined('product-card').then(() => {
            bindProductCardEvents();
        });
    }
}

// Save Cart State
function saveCart() {
    try {
        localStorage.setItem("pharmacy_cart", JSON.stringify(cart));
    } catch (e) {
        console.error("Could not save cart to localStorage", e);
    }
    updateCartUI();
    if (window.location.pathname.includes("cart.html")) {
        renderCartPage();
    }
}

// Inject Dynamic DOM Elements (Floating button, Drawer, Toast container)
function injectCartDOM() {
    // 1. Floating Cart Button (only if not already present)
    if (!document.getElementById("floating-cart-btn")) {
        const floatBtn = document.createElement("div");
        floatBtn.id = "floating-cart-btn";
        floatBtn.className = "floating-cart-btn";
        floatBtn.setAttribute("onclick", "toggleCartDrawer()");
        floatBtn.innerHTML = `
            <i class="bi bi-cart3"></i>
            <span class="cart-badge" id="cart-badge-count">0</span>
        `;
        document.body.appendChild(floatBtn);
    }

    // 2. Success Toast container
    if (!document.getElementById("cart-toast-element")) {
        const toast = document.createElement("div");
        toast.id = "cart-toast-element";
        toast.className = "cart-toast";
        toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <span class="toast-text">Product added to cart</span>
        `;
        document.body.appendChild(toast);
    }

    // 3. Cart Drawer & Overlay
    if (!document.getElementById("cart-drawer")) {
        // Overlay
        const overlay = document.createElement("div");
        overlay.id = "cart-drawer-overlay";
        overlay.className = "cart-drawer-overlay";
        overlay.setAttribute("onclick", "closeCartDrawer()");
        document.body.appendChild(overlay);

        // Drawer Panel
        const drawer = document.createElement("div");
        drawer.id = "cart-drawer";
        drawer.className = "cart-drawer";
        drawer.innerHTML = `
            <div class="cart-drawer-header">
                <h5><i class="bi bi-cart3 me-2"></i>Shopping Cart</h5>
                <button class="cart-drawer-close" onclick="closeCartDrawer()">&times;</button>
            </div>
            <div class="cart-drawer-body" id="cart-drawer-items">
                <!-- Items populated by JS -->
            </div>
            <div class="cart-drawer-footer">
                <div class="subtotal-row">
                    <span class="subtotal-label">Subtotal:</span>
                    <span class="subtotal-price" id="cart-drawer-subtotal">$0.00 USD</span>
                </div>
                <div class="cart-drawer-actions">
                    <a href="cart.html" class="btn btn-view-cart">View Cart Page</a>
                    <button class="btn btn-checkout" onclick="checkoutViaWhatsApp()">
                        <i class="bi bi-whatsapp me-2"></i>Order via WhatsApp
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(drawer);
    }

    // 4. Update or Inject Cart to Nav Link (if navbar is present)
    const existingCartLink = document.querySelector(".nav-link-cart");
    if (!existingCartLink) {
        const navList = document.querySelector(".navbar-nav");
        if (navList) {
            const li = document.createElement("li");
            li.className = "nav-item";
            li.innerHTML = `
                <a class="nav-link nav-link-cart" href="cart.html">
                    <i class="bi bi-cart3"></i> Cart 
                    <span class="badge bg-danger rounded-pill nav-cart-badge" id="nav-cart-badge" style="font-size: 11px; display: none;">0</span>
                </a>
            `;
            navList.appendChild(li);
        }
    }

    // Set active state on cart nav link if on cart page
    if (window.location.pathname.includes("cart.html")) {
        document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
            link.classList.remove("active");
        });
        const cartLink = document.querySelector(".nav-link-cart");
        if (cartLink) cartLink.classList.add("active");
    }
}

// Drawer Toggle Methods
window.toggleCartDrawer = function() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
        drawer.classList.toggle("show");
        overlay.classList.toggle("show");
    }
};

window.closeCartDrawer = function() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
        drawer.classList.remove("show");
        overlay.classList.remove("show");
    }
};

// Show toast alert
function showToast(message) {
    const toast = document.getElementById("cart-toast-element");
    if (toast) {
        toast.querySelector(".toast-text").textContent = message;
        toast.classList.add("show");
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
}

// Bind product card quantity selectors and buttons
function bindProductCardEvents() {
    const cards = document.querySelectorAll(".product-card");
    if (cards.length === 0) return;

    cards.forEach(card => {
        // Find elements
        const minusBtn = card.querySelector(".minus-btn");
        const plusBtn = card.querySelector(".plus-btn");
        const qtyVal = card.querySelector(".quantity-value");
        const cardTitle = card.querySelector("h5");
        
        // Get pricing and metadata from the action buttons
        const addCartBtn = card.querySelector(".btn-add-cart");
        const waBuyBtn = card.querySelector(".btn-wa-buy");
        
        if (!qtyVal || !cardTitle) return;
        
        const productName = cardTitle.textContent.trim();
        
        // Check price and capsules
        const priceElement = card.querySelector(".price");
        const capsulesElement = card.querySelector(".capsules");
        
        const priceStr = priceElement ? priceElement.textContent.trim() : "$0.00 USD";
        const packSize = capsulesElement ? capsulesElement.textContent.trim() : "";
        
        // Extract raw decimal price
        const rawPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
        
        let quantity = parseInt(qtyVal.textContent) || 1;

        // Extract image source
        const imgElement = card.querySelector(".image-box img");
        const imgPath = imgElement ? imgElement.getAttribute("src") : "";

        // Function to update the WhatsApp link dynamically
        function updateCardWhatsApp() {
            qtyVal.textContent = quantity;
            if (minusBtn) minusBtn.disabled = (quantity <= 1);
            
            if (waBuyBtn) {
                // Pre-filled WhatsApp message formatting
                const totalPrice = (rawPrice * quantity).toFixed(2);
                const message = `Hello,\nI would like to order:\nProduct: ${productName}${packSize ? ' (' + packSize + ')' : ''}\nQuantity: ${quantity}\nPrice: $${totalPrice} USD\nPlease confirm availability.`;
                waBuyBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
            }
        }

        // Bind minus button
        if (minusBtn) {
            // Remove any old listeners by replacing the button clone
            const newMinusBtn = minusBtn.cloneNode(true);
            minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
            newMinusBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (quantity > 1) {
                    quantity--;
                    updateCardWhatsApp();
                }
            });
        }

        // Bind plus button
        if (plusBtn) {
            const newPlusBtn = plusBtn.cloneNode(true);
            plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);
            newPlusBtn.addEventListener("click", (e) => {
                e.preventDefault();
                quantity++;
                updateCardWhatsApp();
            });
        }

        // Bind Add to Cart
        if (addCartBtn) {
            const newAddCartBtn = addCartBtn.cloneNode(true);
            addCartBtn.parentNode.replaceChild(newAddCartBtn, addCartBtn);
            newAddCartBtn.addEventListener("click", (e) => {
                e.preventDefault();
                addToCart(productName, rawPrice, imgPath, packSize, quantity);
            });
        }

        // Initial setup for the WhatsApp URL
        updateCardWhatsApp();
    });
}

// Add to Cart workflow
function addToCart(name, price, img, pack, qty) {
    // Check if already in cart
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({
            name: name,
            price: price,
            image: img,
            pack: pack,
            quantity: qty
        });
    }

    saveCart();
    showToast("✓ Product added to cart");
}

// Remove from cart
window.removeFromCart = function(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
};

// Update cart quantity
window.updateQuantity = function(name, delta) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
    }
};

// Update Floating Badges and Cart Drawer Elements
function updateCartUI() {
    const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Update floating badge
    const badge = document.getElementById("cart-badge-count");
    if (badge) {
        badge.textContent = totalCount;
        badge.style.display = totalCount > 0 ? "flex" : "none";
    }

    // Update navbar link badge
    const navBadge = document.getElementById("nav-cart-badge");
    if (navBadge) {
        navBadge.textContent = totalCount;
        navBadge.style.display = totalCount > 0 ? "inline-block" : "none";
    }

    // Render Drawer items
    const drawerItems = document.getElementById("cart-drawer-items");
    const subtotalDisplay = document.getElementById("cart-drawer-subtotal");

    if (subtotalDisplay) {
        subtotalDisplay.textContent = `$${subtotal.toFixed(2)} USD`;
    }

    if (drawerItems) {
        if (cart.length === 0) {
            drawerItems.innerHTML = `
                <div class="cart-empty-state">
                    <i class="bi bi-cart-x"></i>
                    <p>Your shopping cart is empty.</p>
                    <button class="btn" onclick="closeCartDrawer()">Continue Shopping</button>
                </div>
            `;
        } else {
            let html = "";
            cart.forEach(item => {
                const totalPrice = (item.price * item.quantity).toFixed(2);
                
                // Safe check image rendering
                let imgHTML = `<img src="${item.image}" alt="${item.name}">`;
                if (!item.image || item.image.includes("product3") || item.image.includes("product4") || item.image.includes("product5") || item.image.includes("product6") || item.image.includes("product7") || item.image.includes("product8") || item.image.includes("product9") || item.image.includes("product10") || item.image.includes("product11") || item.image.includes("product12") || item.image.includes("product13") || item.image.includes("product14") || item.image.includes("product15") || item.image.includes("product16") || item.image.includes("product1") || item.image.includes("product2")) {
                    // It's a broken placeholder route, render a stylish typography card
                    const letter = item.name.charAt(0);
                    imgHTML = `
                        <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 24px;">
                            ${letter}
                        </div>
                    `;
                }

                html += `
                    <div class="cart-drawer-item">
                        ${imgHTML}
                        <div class="cart-drawer-item-details">
                            <h6>${item.name}</h6>
                            <div class="item-meta">${item.pack}</div>
                            <div class="item-price">$${item.price.toFixed(2)} USD</div>
                        </div>
                        <div class="cart-drawer-item-actions">
                            <button class="cart-drawer-remove" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" aria-label="Remove item">
                                <i class="bi bi-trash"></i>
                            </button>
                            <div class="cart-drawer-qty-box">
                                <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            drawerItems.innerHTML = html;
        }
    }
}

// Render Dedicated Cart Page (cart.html)
function renderCartPage() {
    const tableBody = document.getElementById("cart-page-table-body");
    const emptyContainer = document.getElementById("cart-page-empty");
    const contentContainer = document.getElementById("cart-page-content");
    const summarySubtotal = document.getElementById("cart-summary-subtotal");
    const summaryTotal = document.getElementById("cart-summary-total");

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)} USD`;
    if (summaryTotal) summaryTotal.textContent = `$${subtotal.toFixed(2)} USD`;

    if (!tableBody) return;

    if (cart.length === 0) {
        if (emptyContainer) emptyContainer.style.display = "block";
        if (contentContainer) contentContainer.style.display = "none";
    } else {
        if (emptyContainer) emptyContainer.style.display = "none";
        if (contentContainer) contentContainer.style.display = "block";

        let html = "";
        cart.forEach(item => {
            const totalPrice = (item.price * item.quantity).toFixed(2);
            
            // Safe check image rendering
            let imgHTML = `<img src="${item.image}" alt="${item.name}">`;
            if (!item.image || item.image.includes("product3") || item.image.includes("product4") || item.image.includes("product5") || item.image.includes("product6") || item.image.includes("product7") || item.image.includes("product8") || item.image.includes("product9") || item.image.includes("product10") || item.image.includes("product11") || item.image.includes("product12") || item.image.includes("product13") || item.image.includes("product14") || item.image.includes("product15") || item.image.includes("product16") || item.image.includes("product1") || item.image.includes("product2")) {
                const letter = item.name.charAt(0);
                imgHTML = `
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 28px;">
                        ${letter}
                    </div>
                `;
            }

            html += `
                <tr>
                    <td data-label="Product">
                        <div class="cart-item-info">
                            ${imgHTML}
                            <div>
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-meta">${item.pack}</div>
                            </div>
                        </div>
                    </td>
                    <td data-label="Price" class="fw-semibold">$${item.price.toFixed(2)} USD</td>
                    <td data-label="Quantity">
                        <div class="cart-qty-control">
                            <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                        </div>
                    </td>
                    <td data-label="Total" class="fw-bold text-success">$${totalPrice} USD</td>
                    <td data-label="Remove">
                        <button class="cart-item-remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" aria-label="Remove item">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    }
}

// Checkout entire cart via WhatsApp
window.checkoutViaWhatsApp = function() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    let message = "Hello,\nI would like to order:\n";
    let grandTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `- ${item.name} x ${item.quantity} ($${itemTotal.toFixed(2)} USD)\n`;
        grandTotal += itemTotal;
    });

    message += `\nTotal Price: $${grandTotal.toFixed(2)} USD\nPlease confirm availability.`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
};
