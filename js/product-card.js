/**
 * Reusable Product Card Component
 * Renders uniform product cards with image, details, pill quantity selector, and buy buttons.
 */
class ProductCard extends HTMLElement {
    connectedCallback() {
        // Load CSS dynamically if not already loaded
        if (!document.getElementById("product-card-style-link")) {
            const link = document.createElement("link");
            link.id = "product-card-style-link";
            link.rel = "stylesheet";
            link.href = "css/product-card.css";
            document.head.appendChild(link);
        }

        // Ensure the element itself has the product-card class
        this.classList.add('product-card');

        // Read attributes
        const name = this.getAttribute('name') || '';
        const price = this.getAttribute('price') || '';
        const oldPrice = this.getAttribute('old-price') || '';
        const saleBadge = this.getAttribute('sale-badge') || '';
        const capsules = this.getAttribute('capsules') || '';
        const image = this.getAttribute('image') || '';

        // Build HTML layout dynamically
        let saleBadgeHTML = '';
        if (saleBadge) {
            saleBadgeHTML = `<span class="badge-sale">${saleBadge}</span>`;
        }

        let oldPriceHTML = '';
        if (oldPrice) {
            oldPriceHTML = `<span class="old-price">${oldPrice}</span>`;
        }

        this.innerHTML = `
            ${saleBadgeHTML}
            <div class="image-box">
                <img src="${image}" class="img-fluid" alt="${name}">
            </div>
            <h5>${name}</h5>
            <div class="price-row">
                <div class="price-container">
                    <span class="price">${price}</span>
                    ${oldPriceHTML}
                </div>
                <span class="capsules">${capsules}</span>
            </div>
            <div class="quantity-wrapper">
                <div class="quantity-selector-container">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus-btn" type="button" aria-label="Decrease quantity">
                            <span class="btn-inner"><i class="bi bi-dash-lg"></i></span>
                        </button>
                        <span class="quantity-value">1</span>
                        <button class="quantity-btn plus-btn" type="button" aria-label="Increase quantity">
                            <span class="btn-inner"><i class="bi bi-plus-lg"></i></span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="product-card-buttons">
                <button class="btn btn-add-cart" type="button">
                    <i class="bi bi-cart3"></i> Add to Cart
                </button>
                <a class="btn btn-wa-buy" href="#" target="_blank">
                    <i class="bi bi-whatsapp"></i> Buy on WhatsApp
                </a>
            </div>
        `;
    }
}

// Define the custom element if it hasn't been registered yet
if (!customElements.get('product-card')) {
    customElements.define('product-card', ProductCard);
}
