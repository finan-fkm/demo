document.addEventListener('DOMContentLoaded', () => {
    // Next page navigation helper if present
    const nextBtn = document.querySelector('.next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            window.location.href = 'page2.html';
        });
    }
});
