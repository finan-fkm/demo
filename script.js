document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.style.transition = "0.3s ease";
        });

    });

    const nextBtn = document.querySelector(".next-btn");
    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            window.location.href = "page2.html";
        });
    }

});


