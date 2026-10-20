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

  // Synchronize cart count badge across pages
  try {
    const storedCart = localStorage.getItem('pharmacy_cart');
    if (storedCart) {
      const items = JSON.parse(storedCart);
      if (Array.isArray(items)) {
        const totalCount = items.reduce(function (sum, item) {
          return sum + (item.quantity || 1);
        }, 0);
        const floatBadge = document.getElementById('cart-badge-count');
        if (floatBadge) {
          floatBadge.textContent = totalCount;
          floatBadge.style.display = totalCount > 0 ? 'flex' : 'none';
        }
        const navBadge = document.getElementById('nav-cart-badge');
        if (navBadge) {
          navBadge.textContent = totalCount;
          navBadge.style.display = totalCount > 0 ? 'inline-block' : 'none';
        }
      }
    }
  } catch (err) {
    // Storage error ignored
  }
});
