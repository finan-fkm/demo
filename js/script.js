document.addEventListener('DOMContentLoaded', function () {
  // Prevent jumping on empty hash links
  document.querySelectorAll('a[href="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
    });
  });

  // Mobile Navbar Auto-Close on link click
  const navCollapse = document.getElementById('navbarMain') || document.getElementById('navbar');
  if (navCollapse) {
    const navLinks = navCollapse.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 992 && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }

  // Next page navigation helper if present
  const nextBtn = document.querySelector('.next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      window.location.href = 'page2.html';
    });
  }
});
