/* ==========================================================================
   StudentHub — script.js
   One file for every page. Each module checks for its own markup and exits
   quietly if the current page doesn't use it, so there is no per-page JS.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* --- 1. Mobile nav ---------------------------------------------------- */
  function initNav() {
    var toggle = $(".nav__toggle");
    var menu = $("#nav-menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.style.overflow = open && window.innerWidth <= 1024 ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // close when a link is tapped (same-tab links only)
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth <= 1024) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", function (e) {
      if (window.innerWidth > 1024) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) setOpen(false);
    });
  }

  /* --- 2. Navbar shadow on scroll --------------------------------------- */
  function initNavShadow() {
    var nav = $(".nav");
    if (!nav) return;
    var ticking = false;

    function update() {
      nav.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* --- 3. Scroll reveal ------------------------------------------------- */
  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* --- 4. Button ripple ------------------------------------------------- */
  function initRipple() {
    if (reduceMotion) return;
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn");
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = (e.clientX - rect.left - size / 2) + "px";
      span.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 640);
    });
  }

  /* --- 5. Animated counters --------------------------------------------- */
  function initCounters() {
    var nums = $$("[data-count]");
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = (target % 1 !== 0) ? 1 : 0;
      if (reduceMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var start = performance.now();
      var dur = 1600;
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* --- 6. Progress bars + attendance ring ------------------------------- */
  function initProgress() {
    var bars = $$("[data-fill]");
    var rings = $$("[data-ring]");
    if (!bars.length && !rings.length) return;

    function fillBar(el) {
      el.style.width = Math.min(parseFloat(el.getAttribute("data-fill")), 100) + "%";
    }
    function fillRing(el) {
      var pct = Math.min(parseFloat(el.getAttribute("data-ring")), 100);
      var circumference = 314; // r=50 → 2πr ≈ 314
      el.style.strokeDashoffset = String(circumference - (circumference * pct) / 100);
    }

    if (!("IntersectionObserver" in window)) {
      bars.forEach(fillBar); rings.forEach(fillRing);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-fill")) fillBar(el); else fillRing(el);
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    bars.concat(rings).forEach(function (el) { io.observe(el); });
  }

  /* --- 7. FAQ accordion ------------------------------------------------- */
  function initAccordion() {
    var accs = $$(".acc");
    if (!accs.length) return;

    accs.forEach(function (acc) {
      var single = acc.hasAttribute("data-single");
      var buttons = $$(".acc__btn", acc);

      buttons.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (!panel) return;

        function close(b, p) {
          p.style.height = p.scrollHeight + "px";
          requestAnimationFrame(function () { p.style.height = "0px"; });
          b.setAttribute("aria-expanded", "false");
        }
        function open(b, p) {
          p.style.height = p.scrollHeight + "px";
          b.setAttribute("aria-expanded", "true");
          p.addEventListener("transitionend", function once() {
            if (b.getAttribute("aria-expanded") === "true") p.style.height = "auto";
            p.removeEventListener("transitionend", once);
          });
        }

        btn.addEventListener("click", function () {
          var isOpen = btn.getAttribute("aria-expanded") === "true";

          if (single && !isOpen) {
            buttons.forEach(function (other) {
              if (other === btn || other.getAttribute("aria-expanded") !== "true") return;
              var op = document.getElementById(other.getAttribute("aria-controls"));
              if (op) close(other, op);
            });
          }
          if (isOpen) close(btn, panel); else open(btn, panel);
        });
      });
    });

    // keep an open panel correctly sized after a resize
    window.addEventListener("resize", function () {
      $$('.acc__btn[aria-expanded="true"]').forEach(function (btn) {
        var p = document.getElementById(btn.getAttribute("aria-controls"));
        if (p) p.style.height = "auto";
      });
    });
  }

  /* --- 8. FAQ search ---------------------------------------------------- */
  function initFaqSearch() {
    var input = $("#faq-search");
    if (!input) return;
    var items = $$(".acc__item");
    var empty = $("#faq-empty");

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var match = !q || item.textContent.toLowerCase().indexOf(q) > -1;
        item.style.display = match ? "" : "none";
        if (match) shown++;
      });
      if (empty) empty.style.display = shown ? "none" : "block";
    });
  }

  /* --- 9. Event filters ------------------------------------------------- */
  function initFilters() {
    var chips = $$("[data-filter]");
    if (!chips.length) return;
    var cards = $$("[data-category]");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var key = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
        cards.forEach(function (card) {
          var show = key === "all" || card.getAttribute("data-category") === key;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* --- 10. Star rating -------------------------------------------------- */
  function initRating() {
    var rating = $(".rating");
    if (!rating) return;
    var hint = $("#rating-hint");
    var words = {
      1: "Poor — we need to do better.",
      2: "Fair — some rough edges.",
      3: "Good — does the job.",
      4: "Great — genuinely helpful.",
      5: "Excellent — I'd recommend it."
    };
    rating.addEventListener("change", function (e) {
      if (e.target.matches("input") && hint) hint.textContent = words[e.target.value] || "";
    });
  }

  /* --- 11. Forms + success animation ------------------------------------ */
  function initForms() {
    $$("[data-success]").forEach(function (form) {
      var wrap = form.closest(".form-wrap");
      var success = document.getElementById(form.getAttribute("data-success"));
      if (!wrap || !success) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        wrap.classList.add("is-sent");
        success.classList.add("is-on");
        success.setAttribute("tabindex", "-1");
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      });

      var reset = $("[data-reset]", success);
      if (reset) {
        reset.addEventListener("click", function () {
          form.reset();
          wrap.classList.remove("is-sent");
          success.classList.remove("is-on");
          var hint = $("#rating-hint");
          if (hint) hint.textContent = "";
        });
      }
    });
  }

  /* --- 12. Password show/hide + strength -------------------------------- */
  function initPassword() {
    $$(".pw-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = document.getElementById(btn.getAttribute("aria-controls"));
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        btn.classList.toggle("is-showing", show);
      });
    });

    var pw = $("#password");
    var meter = $("#pw-meter");
    if (!pw || !meter) return;
    var label = $(".meter__label", meter);
    var names = ["", "Weak", "Fair", "Strong", "Very strong"];

    pw.addEventListener("input", function () {
      var v = pw.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) score++;
      if (!v) score = 0;

      meter.setAttribute("data-score", String(score));
      if (label) label.textContent = v ? names[score] || "Weak" : "Use 8+ characters with a mix of letters, numbers and symbols.";
    });
  }

  /* --- 13. Confirm-password match --------------------------------------- */
  function initConfirm() {
    var pw = $("#password");
    var confirm = $("#confirm-password");
    if (!pw || !confirm) return;

    function check() {
      confirm.setCustomValidity(
        confirm.value && confirm.value !== pw.value ? "Passwords do not match." : ""
      );
    }
    confirm.addEventListener("input", check);
    pw.addEventListener("input", check);
  }

  /* --- 14. Footer year -------------------------------------------------- */
  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* --- boot ------------------------------------------------------------- */
  function boot() {
    initNav();
    initNavShadow();
    initReveal();
    initRipple();
    initCounters();
    initProgress();
    initAccordion();
    initFaqSearch();
    initFilters();
    initRating();
    initForms();
    initPassword();
    initConfirm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();