/* ==========================================================================
   CHARUSAT StudentHub — Global 3D Theme Atmosphere Switcher & Persistence
   Supports 4 Core Atmospheres: BLUE, PURPLE, GREEN, MIDNIGHT
   One Small, Cool, Tactile 3D Gemstone Button that Cycles on Click
   ========================================================================== */

(function () {
  'use strict';

  var THEMES = {
    blue: {
      name: 'BLUE',
      desc: 'Sapphire Ocean · Deep Navy & Electric Blue',
      inner: '#0b4f8a',
      mid: '#04294e',
      outer: '#010c14',
      accent: '#2563eb',
      accentRgb: '37, 99, 235',
      glow: 'rgba(37, 99, 235, 0.45)',
      bodyColor: [0.145, 0.388, 0.92, 1]
    },
    purple: {
      name: 'PURPLE',
      desc: 'Cosmic Purple Nebula · Royal Violet & Neon Nebula',
      inner: '#4c1d95',
      mid: '#2e1065',
      outer: '#0f051d',
      accent: '#a855f7',
      accentRgb: '168, 85, 247',
      glow: 'rgba(168, 85, 247, 0.5)',
      bodyColor: [0.658, 0.333, 0.968, 1]
    },
    green: {
      name: 'GREEN',
      desc: 'Cyber Emerald Matrix · Deep Cyber Jade & Glowing Mint',
      inner: '#0b8a78',
      mid: '#044e3b',
      outer: '#011411',
      accent: '#10b981',
      accentRgb: '16, 185, 129',
      glow: 'rgba(16, 185, 129, 0.45)',
      bodyColor: [0.063, 0.725, 0.506, 1]
    },
    midnight: {
      name: 'MIDNIGHT',
      desc: 'Obsidian Space · Deep Charcoal & Electric Sky Blue',
      inner: '#1e293b',
      mid: '#0f172a',
      outer: '#030712',
      accent: '#38bdf8',
      accentRgb: '56, 189, 248',
      glow: 'rgba(56, 189, 248, 0.45)',
      bodyColor: [0.22, 0.74, 0.97, 1]
    }
  };

  // Map legacy aliases
  THEMES.aurora = THEMES.purple;
  THEMES.classic = THEMES.green;

  // Cycle sequence: Blue -> Purple -> Green -> Midnight -> Blue
  var THEME_CYCLE = ['blue', 'purple', 'green', 'midnight'];

  function normalizeKey(key) {
    if (key === 'aurora') return 'purple';
    if (key === 'classic') return 'green';
    return (key && THEMES[key]) ? key : 'blue';
  }

  function getSavedTheme() {
    try {
      var saved = localStorage.getItem('charusat-studenthub-theme');
      if (saved && THEMES[saved]) return normalizeKey(saved);
      var legacy = localStorage.getItem('selected-theme');
      if (legacy && THEMES[legacy]) return normalizeKey(legacy);
    } catch (e) {
      /* ignore storage errors */
    }
    return 'blue';
  }

  function applyTheme(key, skipStorage) {
    key = normalizeKey(key);
    var theme = THEMES[key] || THEMES.blue;

    var root = document.documentElement;
    root.style.setProperty('--bg-inner', theme.inner);
    root.style.setProperty('--bg-mid', theme.mid);
    root.style.setProperty('--bg-outer', theme.outer);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--accent-rgb', theme.accentRgb);
    root.style.setProperty('--accent-glow', theme.glow || 'rgba(' + theme.accentRgb + ', 0.4)');
    root.dataset.theme = key;

    // Body class support
    document.body.classList.toggle('blue-theme', key === 'blue');
    document.body.classList.toggle('purple-theme', key === 'purple');
    document.body.classList.toggle('aurora-theme', key === 'purple');
    document.body.classList.toggle('green-theme', key === 'green');
    document.body.classList.toggle('midnight-theme', key === 'midnight');

    if (!skipStorage) {
      try {
        localStorage.setItem('charusat-studenthub-theme', key);
        localStorage.setItem('selected-theme', key);
      } catch (e) {}
    }

    // Update active state in UI
    document.querySelectorAll('.theme-opt-card').forEach(function (card) {
      var isActive = card.dataset.themeName === key || (card.dataset.themeName === 'aurora' && key === 'purple');
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });

    // Notify any page listeners (e.g., 3D model painters, animations)
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { themeName: key, theme: theme } }));
  }

  // Generate One Small Tactile 3D Atmosphere Switch Button
  function buildSingleButtonHTML(activeKey) {
    var key = normalizeKey(activeKey);
    var theme = THEMES[key] || THEMES.blue;
    var label = theme.name || key.toUpperCase();

    return '<button type="button" class="theme-3d-gem-btn" data-theme-cycle-btn="true" aria-label="Cycle 3D Atmosphere: Current is ' + label + '" title="Click to Cycle 3D Atmosphere (Blue · Purple · Green · Midnight)">' +
      '<span class="gem-3d-orb gem-3d-orb--' + key + '"></span>' +
      '<span class="gem-3d-label">' + label + '</span>' +
      '<span class="gem-3d-icon" aria-hidden="true">' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>' +
        '</svg>' +
      '</span>' +
    '</button>';
  }

  // Update all instances of the single button & any dot palette elements
  function updateSwitchUI(activeKey) {
    var key = normalizeKey(activeKey);
    var theme = THEMES[key] || THEMES.blue;
    var label = theme.name || key.toUpperCase();

    document.querySelectorAll('.theme-3d-gem-btn').forEach(function (btn) {
      btn.setAttribute('aria-label', 'Cycle 3D Atmosphere: Current is ' + label);
      var orb = btn.querySelector('.gem-3d-orb');
      if (orb) {
        orb.className = 'gem-3d-orb gem-3d-orb--' + key;
      }
      var lbl = btn.querySelector('.gem-3d-label');
      if (lbl) {
        lbl.textContent = label;
      }
    });

    // Sync legacy/alternate dot palettes if any exist
    document.querySelectorAll('.palette-3d-dot').forEach(function (dot) {
      var pick = normalizeKey(dot.getAttribute('data-theme-pick'));
      var isActive = (pick === key);
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-pressed', String(isActive));
    });
  }

  function cycleTheme() {
    var current = getSavedTheme();
    var idx = THEME_CYCLE.indexOf(current);
    if (idx === -1) idx = 0;
    var nextIdx = (idx + 1) % THEME_CYCLE.length;
    var nextKey = THEME_CYCLE[nextIdx];
    applyTheme(nextKey);
    updateSwitchUI(nextKey);
    return nextKey;
  }

  // Pre-apply theme early to prevent flash of unstyled theme
  applyTheme(getSavedTheme(), true);

  // Initialize interactive single 3D button on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    var initialTheme = getSavedTheme();

    // 1. Upgrade any old .theme-3d-toggle-wrap to the Single 3D Gem Button (except on auth pages)
    if (!document.body.classList.contains('auth-page')) {
      document.querySelectorAll('.theme-3d-toggle-wrap').forEach(function (wrap) {
        wrap.innerHTML = buildSingleButtonHTML(initialTheme);
      });
    }

    // 2. If no button exists in header, inject into navbar actions across pages (except auth pages)
    if (!document.body.classList.contains('auth-page')) {
      var existingBtn = document.querySelector('.theme-3d-gem-btn');
      if (!existingBtn) {
        var navActions = document.querySelector('.nav__actions') ||
                         document.querySelector('.nav-right-actions') ||
                         document.querySelector('.header div[style*="display: flex"]') ||
                         document.querySelector('.header > div:last-child') ||
                         document.querySelector('.nav');
        if (navActions) {
          var wrap = document.createElement('div');
          wrap.className = 'theme-3d-toggle-wrap';
          wrap.style.margin = '0';
          wrap.innerHTML = buildSingleButtonHTML(initialTheme);
          navActions.insertBefore(wrap, navActions.firstChild);
        }
      }
    }

    // 3. Delegate click listeners for 3D single button
    document.addEventListener('click', function (e) {
      var gemBtn = e.target.closest('.theme-3d-gem-btn') || e.target.closest('[data-theme-cycle-btn]');
      if (gemBtn) {
        e.preventDefault();
        e.stopPropagation();
        cycleTheme();
        return;
      }

      var dot = e.target.closest('.palette-3d-dot');
      if (dot) {
        e.preventDefault();
        e.stopPropagation();
        var pick = normalizeKey(dot.getAttribute('data-theme-pick'));
        if (pick && THEMES[pick]) {
          applyTheme(pick);
          updateSwitchUI(pick);
        }
        return;
      }
    });

    updateSwitchUI(initialTheme);
  });

  window.addEventListener('themeChanged', function (e) {
    updateSwitchUI(e.detail.themeName);
  });

  // ==========================================================================
  // Dynamic Header Authentication State Management
  // When student or admin is logged in, replaces Login & Register with
  // a User/Admin Profile Pill and a 1-Click Logout Button
  // ==========================================================================
  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function syncNavAuthState() {
    var nav = document.querySelector('.nav') || document.querySelector('header nav');
    if (!nav) return;

    var isStudentAuth = localStorage.getItem('charusat_student_session') === 'active';
    var activeUserRaw = localStorage.getItem('charusat_active_user') || localStorage.getItem('charusat_student_data');
    var isAdminAuth = localStorage.getItem('charusat_admin_session') === 'active';

    var student = null;
    if (activeUserRaw) {
      try { student = JSON.parse(activeUserRaw); } catch (e) {}
    }

    var isAuthenticated = (isStudentAuth && !!student) || isAdminAuth;

    var allLinks = Array.from(nav.querySelectorAll('a'));
    var loginLink = allLinks.find(function (a) {
      var h = (a.getAttribute('href') || '').toLowerCase();
      return h.endsWith('login.html') || h.includes('login.html') || a.classList.contains('nav-user-pill');
    });
    var regLink = allLinks.find(function (a) {
      var h = (a.getAttribute('href') || '').toLowerCase();
      return h.endsWith('register.html') || h.includes('register.html') || a.classList.contains('nav-logout-btn');
    });

    if (!loginLink && !regLink) return;

    // Detect if current file is in /pages/ or at root
    var isSubpage = false;
    if (loginLink) {
      var hrefVal = loginLink.getAttribute('href') || '';
      isSubpage = !hrefVal.includes('pages/');
    } else {
      isSubpage = window.location.pathname.includes('/pages/');
    }

    if (isAuthenticated) {
      var role = (isStudentAuth && student) ? 'student' : 'admin';
      var displayName = 'Student';
      var fullName = 'Student';
      if (role === 'student' && student) {
        fullName = student.name || student.full_name || 'Student';
        displayName = fullName.trim().split(' ')[0];
      } else if (role === 'admin') {
        displayName = 'Admin';
        fullName = localStorage.getItem('charusat_admin_user') || 'Administrator';
      }

      var dashHref = isSubpage ? (role === 'admin' ? 'admin.html' : 'dashboard.html') : (role === 'admin' ? 'pages/admin.html' : 'pages/dashboard.html');
      var logoutHref = isSubpage ? '../backend/logout.php' : 'backend/logout.php';
      var loginRedirect = isSubpage ? 'login.html?logged_out=1' : 'pages/login.html?logged_out=1';

      var isRegisterPage = window.location.pathname.toLowerCase().includes('register.html');
      var isLoginPage = window.location.pathname.toLowerCase().includes('login.html');

      // 1. Transform Login Link -> Profile Pill
      if (loginLink && !isLoginPage) {
        loginLink.href = dashHref;
        loginLink.className = 'nav-item nav-user-pill' + (role === 'admin' ? ' nav-admin-pill' : '');
        loginLink.setAttribute('aria-label', 'Logged in as ' + fullName);
        loginLink.title = 'Logged in as ' + fullName + ' · Click to open ' + (role === 'admin' ? 'Admin Portal' : 'Dashboard');
        loginLink.innerHTML = (role === 'admin' ? '<span>🛡️</span> <span>Admin</span>' : '<span>👤</span> <span>' + escapeHTML(displayName) + '</span>');
      }

      // 2. Transform Register Link -> 1-Click Logout Button (only when not on register page)
      if (regLink && !isRegisterPage) {
        regLink.href = logoutHref;
        regLink.className = 'nav-item nav-logout-btn';
        regLink.setAttribute('aria-label', 'Sign out of StudentHub');
        regLink.title = 'Click to sign out of ' + fullName + '\'s session';
        regLink.innerHTML = '<span>🚪</span> <span>Logout</span>';

        regLink.onclick = function (e) {
          e.preventDefault();
          localStorage.removeItem('charusat_active_user');
          localStorage.removeItem('charusat_student_session');
          localStorage.removeItem('charusat_student_login_time');
          localStorage.removeItem('charusat_admin_session');
          localStorage.removeItem('charusat_admin_user');
          localStorage.removeItem('charusat_admin_login_time');
          try { sessionStorage.clear(); } catch (err) {}

          fetch(logoutHref, { method: 'GET' }).finally(function () {
            window.location.href = loginRedirect;
          });
        };
      }
    }
  }

  // ==========================================================================
  // Responsive Mobile Navigation Drawer & Hamburger Menu Engine
  // ==========================================================================
  function initMobileNav() {
    var header = document.querySelector('.header');
    var nav = document.querySelector('.nav') || (header && header.querySelector('nav'));
    if (!header || !nav) return;

    if (document.getElementById('mobileNavDrawer')) return;

    var isSubpage = window.location.pathname.includes('/pages/') ||
                    (nav.querySelector('a') && !(nav.querySelector('a').getAttribute('href') || '').includes('pages/'));

    var logoSrc = isSubpage ? '../images/studenthublogo.png' : 'images/studenthublogo.png';

    // 1. Create & Inject Hamburger Button into Header
    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'mobile-nav-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle mobile navigation menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'mobileNavDrawer');
    toggleBtn.innerHTML = '<span class="nav-toggle-icon"><span></span><span></span><span></span></span>';

    var headerActions = header.querySelector('div[style*="display: flex"]') ||
                        header.querySelector('.nav-right-actions') ||
                        header.querySelector('.nav__actions') ||
                        header;
    headerActions.appendChild(toggleBtn);

    // 2. Create Backdrop & Drawer
    var backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    var drawer = document.createElement('aside');
    drawer.className = 'mobile-nav-drawer';
    drawer.id = 'mobileNavDrawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-label', 'Mobile Navigation Drawer');

    // Drawer Header
    var drawerHeader = document.createElement('div');
    drawerHeader.className = 'drawer-header';
    drawerHeader.innerHTML =
      '<div class="drawer-brand">' +
        '<img src="' + logoSrc + '" class="drawer-logo" alt="StudentHub">' +
        '<div>' +
          '<div class="drawer-title">CHARUSAT</div>' +
          '<div class="drawer-subtitle">StudentHub 2026</div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="drawer-close-btn" aria-label="Close menu">&times;</button>';
    drawer.appendChild(drawerHeader);

    // Drawer User Card
    var userCard = document.createElement('div');
    userCard.className = 'drawer-user-card';
    userCard.id = 'drawerUserCard';
    drawer.appendChild(userCard);

    // Drawer Navigation
    var drawerNav = document.createElement('nav');
    drawerNav.className = 'drawer-nav';
    drawerNav.setAttribute('aria-label', 'Mobile Site Navigation');
    drawer.appendChild(drawerNav);

    // Drawer Footer
    var drawerFooter = document.createElement('div');
    drawerFooter.className = 'drawer-footer';
    drawerFooter.innerHTML = '<div class="drawer-version">CHARUSAT StudentHub · Campus Portal 2026</div>';
    drawer.appendChild(drawerFooter);

    document.body.appendChild(drawer);

    var closeBtn = drawerHeader.querySelector('.drawer-close-btn');

    var iconMap = {
      'home': '🏠',
      'about': '🏛️',
      'events': '📅',
      'dashboard': '📊',
      'profile': '👤',
      'faq': '❓',
      'feedback': '💬',
      'contact': '📞',
      'login': '🔐',
      'register': '📝',
      'logout': '🚪',
      'admin': '🛡️'
    };

    function updateDrawerContent() {
      var isStudentAuth = localStorage.getItem('charusat_student_session') === 'active';
      var activeUserRaw = localStorage.getItem('charusat_active_user') || localStorage.getItem('charusat_student_data');
      var isAdminAuth = localStorage.getItem('charusat_admin_session') === 'active';
      var student = null;
      if (activeUserRaw) {
        try { student = JSON.parse(activeUserRaw); } catch (e) {}
      }

      if (isStudentAuth && student) {
        var fullName = student.name || student.full_name || 'CHARUSAT Student';
        var initial = fullName.trim().charAt(0).toUpperCase() || 'S';
        var id = student.id || student.student_id || 'CSPIT IT';
        userCard.innerHTML =
          '<div class="drawer-user-avatar">' + initial + '</div>' +
          '<div class="drawer-user-info">' +
            '<div class="drawer-user-name">' + escapeHTML(fullName) + '</div>' +
            '<div class="drawer-user-status">' + escapeHTML(id) + ' · Online</div>' +
          '</div>';
      } else if (isAdminAuth) {
        var adminName = localStorage.getItem('charusat_admin_user') || 'Dean of Academics';
        userCard.innerHTML =
          '<div class="drawer-user-avatar" style="background: linear-gradient(135deg, #f59e0b, #d97706);">🛡️</div>' +
          '<div class="drawer-user-info">' +
            '<div class="drawer-user-name">' + escapeHTML(adminName) + '</div>' +
            '<div class="drawer-user-status" style="color: #fbbf24;">Administrator Session</div>' +
          '</div>';
      } else {
        userCard.innerHTML =
          '<div class="drawer-user-avatar" style="background: rgba(255,255,255,0.1);">🎓</div>' +
          '<div class="drawer-user-info">' +
            '<div class="drawer-user-name">Guest Student</div>' +
            '<div class="drawer-user-status" style="color: rgba(255,255,255,0.5);">Not Logged In</div>' +
          '</div>';
      }

      drawerNav.innerHTML = '';
      var navLinks = nav.querySelectorAll('a');
      navLinks.forEach(function (link) {
        var text = (link.textContent || '').trim().replace(/^[^\w\s]+/, '').trim();
        var key = text.toLowerCase();
        var icon = '🔹';
        for (var k in iconMap) {
          if (key.includes(k)) { icon = iconMap[k]; break; }
        }

        var drawerItem = document.createElement('a');
        drawerItem.href = link.href;
        drawerItem.className = 'drawer-nav-item' + (link.classList.contains('active') ? ' active' : '');
        if (link.classList.contains('nav-logout-btn')) {
          drawerItem.classList.add('drawer-nav-logout');
        }

        drawerItem.innerHTML = '<span>' + icon + '</span> <span>' + escapeHTML(text) + '</span>';

        drawerItem.addEventListener('click', function (e) {
          if (link.classList.contains('nav-logout-btn')) {
            e.preventDefault();
            link.click();
          }
          closeDrawer();
        });

        drawerNav.appendChild(drawerItem);
      });
    }

    function openDrawer() {
      updateDrawerContent();
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (drawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  // ==========================================================================
  // Universal Spotlight Command Palette (Ctrl + K)
  // ==========================================================================
  function initSpotlightSearch() {
    var header = document.querySelector('.header');
    if (!header || document.getElementById('spotlightModal')) return;

    var isSubpage = window.location.pathname.includes('/pages/') ||
                    (document.querySelector('.nav a') && !(document.querySelector('.nav a').getAttribute('href') || '').includes('pages/'));

    // 1. Create and inject Search Button into Header Actions
    var searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'header-search-btn';
    searchBtn.setAttribute('aria-label', 'Open search command palette');
    searchBtn.title = 'Search StudentHub (Ctrl + K)';
    searchBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="8"></circle>' +
        '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
      '</svg>' +
      '<span class="header-search-label">Search</span>' +
      '<kbd class="header-search-kbd">Ctrl K</kbd>';

    var headerActions = header.querySelector('div[style*="display: flex"]') ||
                        header.querySelector('.nav-right-actions') ||
                        header.querySelector('.nav__actions') ||
                        header;
    headerActions.insertBefore(searchBtn, headerActions.firstChild);

    // 2. Commands Catalog
    var pfx = isSubpage ? '' : 'pages/';
    var rootPfx = isSubpage ? '../' : '';

    var COMMANDS = [
      { id: 'dash', title: 'Student Dashboard', cat: 'Academics', icon: '📊', url: pfx + 'dashboard.html', keys: 'dashboard attendance sgpa results fees grades' },
      { id: 'att', title: 'Attendance Tracker (85% Target)', cat: 'Academics', icon: '📈', url: pfx + 'dashboard.html#attendance-section', keys: 'attendance absent lectures present' },
      { id: 'res', title: 'Examination & SGPA/CGPA Results', cat: 'Academics', icon: '🎓', url: pfx + 'dashboard.html#results-section', keys: 'results sgpa cgpa marks grade sheet exam' },
      { id: 'tt', title: 'Class Timetable & Schedule', cat: 'Academics', icon: '🗓️', url: pfx + 'dashboard.html#timetable-section', keys: 'timetable schedule timing lectures' },
      { id: 'fees', title: 'Tuition Fees & Online Payment', cat: 'Academics', icon: '💳', url: pfx + 'dashboard.html#fees-section', keys: 'fees payment receipt challan dues' },
      { id: 'code', title: 'Coding Sandbox & Lab Compiler', cat: 'Academics', icon: '💻', url: pfx + 'dashboard.html#coding-lab', keys: 'coding lab compiler python c++ java programming' },
      { id: 'prof', title: 'Student Enrolment Profile', cat: 'Account', icon: '👤', url: pfx + 'profile.html', keys: 'profile student details address contact personal' },
      { id: 'events', title: 'Campus Events & Workshops', cat: 'Campus', icon: '📅', url: pfx + 'events.html', keys: 'events spoural techfest seminar cultural' },
      { id: 'home', title: 'StudentHub Campus Home', cat: 'Campus', icon: '🏠', url: rootPfx + 'index.html', keys: 'home landing main page charusat' },
      { id: 'about', title: 'About CHARUSAT & Campus Map', cat: 'Campus', icon: '🏛️', url: pfx + 'about.html', keys: 'about changa campus map guide university' },
      { id: 'faq', title: 'Frequently Asked Questions (FAQ)', cat: 'Support', icon: '❓', url: pfx + 'faq.html', keys: 'faq help questions answers support' },
      { id: 'feed', title: 'Student Grievance & Feedback', cat: 'Support', icon: '💬', url: pfx + 'feedback.html', keys: 'feedback grievance report complaint suggestion' },
      { id: 'contact', title: 'Contact University / Exam Cell', cat: 'Support', icon: '📞', url: pfx + 'contact.html', keys: 'contact phone email office changa' },
      { id: 'terms', title: 'University Policies & Terms', cat: 'Support', icon: '📜', url: pfx + 'terms.html', keys: 'terms rules policy regulations attendance' },
      { id: 'th-blue', title: 'Atmosphere: Sapphire Blue', cat: 'Theme', icon: '💎', action: function() { applyTheme('blue'); updateSwitchUI('blue'); }, keys: 'theme sapphire blue color ocean' },
      { id: 'th-purp', title: 'Atmosphere: Cosmic Purple', cat: 'Theme', icon: '🔮', action: function() { applyTheme('purple'); updateSwitchUI('purple'); }, keys: 'theme cosmic purple nebula violet' },
      { id: 'th-green', title: 'Atmosphere: Cyber Emerald', cat: 'Theme', icon: '🌿', action: function() { applyTheme('green'); updateSwitchUI('green'); }, keys: 'theme cyber emerald green matrix' },
      { id: 'th-mid', title: 'Atmosphere: Midnight Obsidian', cat: 'Theme', icon: '🌌', action: function() { applyTheme('midnight'); updateSwitchUI('midnight'); }, keys: 'theme midnight dark obsidian space' }
    ];

    // 3. Create Backdrop and Modal Elements
    var backdrop = document.createElement('div');
    backdrop.className = 'spotlight-backdrop';
    backdrop.id = 'spotlightBackdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    backdrop.innerHTML =
      '<div class="spotlight-modal" id="spotlightModal" role="dialog" aria-modal="true" aria-label="Quick Search">' +
        '<div class="spotlight-search-bar">' +
          '<span class="spotlight-search-icon">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="11" cy="11" r="8"></circle>' +
              '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
            '</svg>' +
          '</span>' +
          '<input type="text" class="spotlight-input" id="spotlightInput" placeholder="Search pages, attendance, results, fees, themes..." autocomplete="off">' +
          '<button type="button" class="spotlight-esc-badge" id="spotlightCloseBadge">ESC</button>' +
        '</div>' +
        '<div class="spotlight-results" id="spotlightResults"></div>' +
        '<div class="spotlight-footer">' +
          '<div class="spotlight-keys">' +
            '<span><kbd class="header-search-kbd">↑</kbd> <kbd class="header-search-kbd">↓</kbd> Navigate</span>' +
            '<span><kbd class="header-search-kbd">↵</kbd> Select</span>' +
            '<span><kbd class="header-search-kbd">ESC</kbd> Close</span>' +
          '</div>' +
          '<div>CHARUSAT Quick Navigator</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    var input = backdrop.querySelector('#spotlightInput');
    var resultsBox = backdrop.querySelector('#spotlightResults');
    var closeBadge = backdrop.querySelector('#spotlightCloseBadge');
    var selectedIndex = 0;

    function renderResults(filterText) {
      filterText = (filterText || '').trim().toLowerCase();
      var filtered = COMMANDS.filter(function (c) {
        if (!filterText) return true;
        var full = (c.title + ' ' + c.cat + ' ' + (c.keys || '')).toLowerCase();
        return full.indexOf(filterText) !== -1;
      });

      resultsBox.innerHTML = '';
      selectedIndex = 0;

      if (filtered.length === 0) {
        resultsBox.innerHTML = '<div style="padding: 2rem; text-align: center; color: rgba(255,255,255,0.45); font-size: 0.9rem;">No matching services or resources found.</div>';
        return;
      }

      filtered.forEach(function (cmd, idx) {
        var item = document.createElement('div');
        item.className = 'spotlight-item' + (idx === 0 ? ' is-selected' : '');
        item.setAttribute('data-idx', String(idx));
        item.innerHTML =
          '<div class="spotlight-item-left">' +
            '<span class="spotlight-item-icon">' + cmd.icon + '</span>' +
            '<span class="spotlight-item-title">' + escapeHTML(cmd.title) + '</span>' +
          '</div>' +
          '<span class="spotlight-item-category">' + escapeHTML(cmd.cat) + '</span>';

        item.addEventListener('mouseenter', function () {
          resultsBox.querySelectorAll('.spotlight-item').forEach(function (el) { el.classList.remove('is-selected'); });
          item.classList.add('is-selected');
          selectedIndex = idx;
        });

        item.addEventListener('click', function () {
          executeCommand(cmd);
        });

        resultsBox.appendChild(item);
      });
    }

    function executeCommand(cmd) {
      closeSpotlight();
      if (cmd.action) {
        cmd.action();
      } else if (cmd.url) {
        window.location.href = cmd.url;
      }
    }

    function openSpotlight() {
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      input.value = '';
      renderResults('');
      setTimeout(function () { input.focus(); }, 50);
      document.body.style.overflow = 'hidden';
    }

    function closeSpotlight() {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Event Listeners
    searchBtn.addEventListener('click', openSpotlight);
    closeBadge.addEventListener('click', closeSpotlight);

    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeSpotlight();
    });

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    input.addEventListener('keydown', function (e) {
      var items = resultsBox.querySelectorAll('.spotlight-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        items.forEach(function (el, i) { el.classList.toggle('is-selected', i === selectedIndex); });
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        items.forEach(function (el, i) { el.classList.toggle('is-selected', i === selectedIndex); });
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var selectedEl = items[selectedIndex];
        if (selectedEl) selectedEl.click();
      }
    });

    // Global Keydown Handler: Ctrl+K / Cmd+K and Esc
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (backdrop.classList.contains('is-open')) {
          closeSpotlight();
        } else {
          openSpotlight();
        }
      } else if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        closeSpotlight();
      }
    });
  }

  // Run on DOM Ready and on Storage Change
  function onReady() {
    syncNavAuthState();
    initMobileNav();
    initSpotlightSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
  window.addEventListener('storage', syncNavAuthState);

  // Expose global API
  window.StudentHubTheme = {
    themes: THEMES,
    cycle: cycleTheme,
    apply: applyTheme,
    get: getSavedTheme,
    syncNavAuth: syncNavAuthState,
    initMobileNav: initMobileNav,
    initSpotlight: initSpotlightSearch
  };
})();
