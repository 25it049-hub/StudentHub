/* ==========================================================================
   CHARUSAT StudentHub — Global Interactive Animations & Transitions
   - Magnetic 3D Buttons & Mouse Follow
   - Card 3D Tilt Micro-interactions
   - Scroll-Triggered Reveal Animations
   - Global Page Transition System (Same-Tab Seamless Transitions)
   - Reduced Motion Accessibility Support
   ========================================================================== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Page Transition System
  function initPageTransitions() {
    // Inject overlay if not present
    var overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }

    // Intercept navigation links
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;

      var href = link.getAttribute('href');
      var target = link.getAttribute('target');

      // Only handle internal HTML page links that open in same tab
      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !href.startsWith('javascript:') &&
        target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        overlay.classList.add('is-transitioning');
        setTimeout(function () {
          window.location.href = href;
        }, 220);
      }
    });

    // Remove transition overlay on page display
    window.addEventListener('pageshow', function () {
      if (overlay) {
        overlay.classList.remove('is-transitioning');
      }
    });
  }

  // Navbar Sticky Scroll State
  function initNavbarScroll() {
    var header = document.querySelector('.header') || document.querySelector('header.nav') || document.querySelector('.nav');
    if (!header) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var isScrolled = window.scrollY > 20;
          header.classList.toggle('is-scrolled', isScrolled);
          header.classList.toggle('is-stuck', isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Scroll Reveal Animations
  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal], .card, .glass-card, .section-head, .stat-card');
    if (!targets.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Subtle Magnetic Buttons
  function initMagneticButtons() {
    if (reduced) return;

    var magneticElements = document.querySelectorAll('[data-magnetic], .btn-3d, .primary-btn, .contact-btn, .theme-switch-3d-btn');
    magneticElements.forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        var y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });

      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
      });
    });
  }

  // 3D Tilt on Cards
  function initCardTilt() {
    if (reduced) return;

    var tiltCards = document.querySelectorAll('[data-tilt], .glass-card, .card--lift');
    tiltCards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotX = y * -8;
        var rotY = x * 8;
        card.style.transform = 'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
      });

      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  // Animated Number Counters for Stats
  function initNumberCounters() {
    if (reduced) return;

    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var targetVal = parseFloat(el.getAttribute('data-count') || el.innerText);
          if (!isNaN(targetVal)) {
            var current = 0;
            var step = targetVal / 40;
            var timer = setInterval(function () {
              current += step;
              if (current >= targetVal) {
                el.innerText = targetVal % 1 === 0 ? targetVal : targetVal.toFixed(1);
                clearInterval(timer);
              } else {
                el.innerText = targetVal % 1 === 0 ? Math.floor(current) : current.toFixed(1);
              }
            }, 25);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  // Mobile Navigation Hamburger Toggle
  function initMobileMenu() {
    var toggles = document.querySelectorAll('.mobile-nav-toggle, .nav__toggle');
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var menu = document.querySelector('.nav-pill-bar') || document.querySelector('#nav-menu');
        if (menu) {
          menu.classList.toggle('is-open');
        }
      });
    });
  }

  // Rising bubbles unified background effect across all pages
  function initRisingBubbles() {
    var container = document.getElementById('bubbles-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bubbles-container';
      document.body.prepend(container);
    }
    if (!window.__studentHubBubblesActive) {
      window.__studentHubBubblesActive = true;
      function createBubble() {
        if (!container) return;
        var bubble = document.createElement('div');
        bubble.className = 'bubble';
        var size = Math.random() * 20 + 10;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = (Math.random() * 100) + '%';
        bubble.style.bottom = '-50px';
        bubble.style.opacity = Math.random() * 0.4 + 0.2;
        var duration = Math.random() * 6 + 4;
        bubble.style.animation = 'floatUpImg ' + duration + 's linear forwards';
        container.appendChild(bubble);
        setTimeout(function () {
          if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
        }, duration * 1000);
      }
      setInterval(createBubble, 400);
    }
  }

  // Back to top button listener
  function initBackToTop() {
    document.querySelectorAll('.back-to-top-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Cinematic Reveal Footer GSAP ScrollTrigger Animation
  function initCinematicFooterAnimation() {
    var footer = document.querySelector('.cinematic-footer');
    var giantText = document.getElementById('footerGiantText');
    if (!footer) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Parallax movement on giant background text
      if (giantText) {
        gsap.fromTo(giantText, 
          { y: 80, opacity: 0.02 }, 
          {
            y: -30,
            opacity: 0.06,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 1.2
            }
          }
        );
      }

      // Staggered reveal of footer action content
      var actions = footer.querySelector('.footer-hero-actions');
      if (actions) {
        gsap.fromTo(actions.children, 
          { y: 40, opacity: 0 }, 
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footer,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      }
    }
  }

  // Smooth scroll to anchor on page load if hash exists
  function handleHashScroll() {
    if (window.location.hash) {
      setTimeout(function () {
        try {
          var target = document.querySelector(window.location.hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            var prevBoxShadow = target.style.boxShadow;
            target.style.transition = 'box-shadow 0.6s ease';
            target.style.boxShadow = '0 0 35px var(--accent-glow, rgba(16, 185, 129, 0.45))';
            setTimeout(function () {
              target.style.boxShadow = prevBoxShadow;
            }, 1800);
          }
        } catch (e) {}
      }, 350);
    }
  }

  // Run everything on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    initRisingBubbles();
    initPageTransitions();
    initNavbarScroll();
    initScrollReveal();
    initMagneticButtons();
    initCardTilt();
    initNumberCounters();
    initMobileMenu();
    initBackToTop();
    initCinematicFooterAnimation();
    handleHashScroll();
  });
})();
