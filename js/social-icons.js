/**
 * Reusable Social Media Icons Component
 * Fast, lightweight, zero-layout-shift social icon rendering.
 */
class SocialMediaIcons extends HTMLElement {
    connectedCallback() {
        // Render the social icons using Bootstrap Icons (already loaded across all pages)
        this.innerHTML = `
            <div class="social-icons">
                <a href="https://www.instagram.com/keysonsgroup/" target="_blank" rel="noopener noreferrer" aria-label="Keysons Group on Instagram" title="Instagram">
                    <i class="bi bi-instagram"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Keysons Group on Facebook" title="Facebook">
                    <i class="bi bi-facebook"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Keysons Group on YouTube" title="YouTube">
                    <i class="bi bi-youtube"></i>
                </a>
            </div>
        `;
    }
}

// Define the custom element
if (!customElements.get('social-media-icons')) {
    customElements.define('social-media-icons', SocialMediaIcons);
}
