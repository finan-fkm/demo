document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".company-card");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
        cards.forEach(card => card.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
    });

    cards.forEach(card => {
        observer.observe(card);
    });
});