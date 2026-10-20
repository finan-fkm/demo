/**
 * Reusable Social Media Icons Component
 * Renders Instagram, Facebook, and YouTube buttons in a premium circular style.
 */
class SocialMediaIcons extends HTMLElement {
    connectedCallback() {
        // Dynamically load Font Awesome 6 if not already present
        if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="all.min.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            document.head.appendChild(link);
        }

        // Dynamically load product-card.js if not already loaded
        if (!document.getElementById('product-card-js-loader')) {
            const cardScript = document.createElement('script');
            cardScript.id = 'product-card-js-loader';
            cardScript.src = 'js/product-card.js';
            cardScript.defer = true;
            document.body.appendChild(cardScript);
        }

        // Dynamically load cart.js if not already loaded
        if (!document.getElementById('cart-js-loader')) {
            const cartScript = document.createElement('script');
            cartScript.id = 'cart-js-loader';
            cartScript.src = 'js/cart.js';
            cartScript.defer = true;
            document.body.appendChild(cartScript);
        }

        // Render the social icons
        this.innerHTML = `
            <div class="social-icons">
                <a href="https://www.instagram.com/keysonsgroup/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i class="fa-brands fa-instagram"></i>
                </a>
                <a href="#" aria-label="Facebook">
                    <i class="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#" aria-label="YouTube">
                    <i class="fa-brands fa-youtube"></i>
                </a>
            </div>
        `;
    }
}

// Define the custom element
if (!customElements.get('social-media-icons')) {
    customElements.define('social-media-icons', SocialMediaIcons);
}
