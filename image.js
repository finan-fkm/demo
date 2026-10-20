document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slide");
    const next = document.getElementById("next");
    const prev = document.getElementById("prev");

    if (!slides.length || !next || !prev) return;

    let current = 0;

    function updateSlider() {
        slides.forEach(slide => {
            slide.className = "slide";
        });

        slides[current].classList.add("active");

        const left = (current - 1 + slides.length) % slides.length;
        const right = (current + 1) % slides.length;

        const farLeft = (current - 2 + slides.length) % slides.length;
        const farRight = (current + 2) % slides.length;

        slides[left].classList.add("left");
        slides[right].classList.add("right");

        slides[farLeft].classList.add("far-left");
        slides[farRight].classList.add("far-right");
    }

    next.addEventListener("click", () => {
        current = (current + 1) % slides.length;
        updateSlider();
    });

    prev.addEventListener("click", () => {
        current = (current - 1 + slides.length) % slides.length;
        updateSlider();
    });

    // Auto slide only if user does not prefer reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
        let slideTimer = setInterval(() => {
            current = (current + 1) % slides.length;
            updateSlider();
        }, 4500);

        // Pause on tab hidden
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                clearInterval(slideTimer);
            } else {
                slideTimer = setInterval(() => {
                    current = (current + 1) % slides.length;
                    updateSlider();
                }, 4500);
            }
        });
    }

    // Initialize
    updateSlider();
});