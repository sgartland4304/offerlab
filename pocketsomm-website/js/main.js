/* ==========================================================================
   PocketSomm - Main JavaScript
   Scroll animations, navigation, parallax, and interactive effects
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initParallax();
  initFeatureCardHover();
  initCounterAnimation();
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link, .nav__mobile-cta');
  let lastScroll = 0;

  // Scroll behavior - add scrolled class
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('nav__toggle--active');
      mobileMenu.classList.toggle('nav__mobile--open');
      document.body.style.overflow = mobileMenu.classList.contains('nav__mobile--open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('nav__toggle--active');
        mobileMenu.classList.remove('nav__mobile--open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* --------------------------------------------------------------------------
   Scroll Reveal (IntersectionObserver-based)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale, .reveal-stagger');

  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        // Don't unobserve - allow re-triggering is optional
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Parallax Effect
   -------------------------------------------------------------------------- */
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (!parallaxElements.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const rect = el.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distanceFromCenter = elementCenter - windowHeight / 2;
          const offset = distanceFromCenter * speed;

          el.style.transform = `translateY(${offset}px)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Feature Card Hover (mouse tracking for radial gradient)
   -------------------------------------------------------------------------- */
function initFeatureCardHover() {
  const cards = document.querySelectorAll('.feature-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

/* --------------------------------------------------------------------------
   Counter Animation
   -------------------------------------------------------------------------- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');

  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    el.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* --------------------------------------------------------------------------
   Smooth Scroll for anchor links
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
