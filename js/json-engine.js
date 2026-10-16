/* ==========================================================================
   CHARUSAT StudentHub — External JSON Data Engine (json-engine.js)
   Fulfills Practical 6: Rendering External JSON Data using Fetch API, Search,
   Filter, Sorting, and Pagination with localStorage Caching & Error Handling.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var JsonEngine = {
    cachePrefix: 'studenthub_json_cache_',

    /**
     * Fetch external JSON with loading indicators, error handling, and localStorage cache
     */
    fetchData: function (url, cacheKey) {
      var self = this;
      var fullCacheKey = self.cachePrefix + (cacheKey || url);

      return new Promise(function (resolve, reject) {
        fetch(url)
          .then(function (response) {
            if (!response.ok) {
              throw new Error('HTTP error ' + response.status + ' while fetching ' + url);
            }
            return response.json();
          })
          .then(function (data) {
            try {
              localStorage.setItem(fullCacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
              }));
            } catch (storageErr) {
              /* ignore storage quota warnings */
            }
            resolve(data);
          })
          .catch(function (error) {
            console.warn('[JsonEngine] Network fetch failed, checking local cache for ' + url, error);
            try {
              var cached = localStorage.getItem(fullCacheKey);
              if (cached) {
                var parsed = JSON.parse(cached);
                if (parsed && parsed.data) {
                  return resolve(parsed.data);
                }
              }
            } catch (e) {}
            reject(error);
          });
      });
    },

    /**
     * Client-side search, filter, sort, and pagination array pipeline
     */
    processDataset: function (items, options) {
      var opts = options || {};
      var query = (opts.query || '').trim().toLowerCase();
      var category = (opts.category || 'all').toLowerCase();
      var sortBy = opts.sortBy || 'default';
      var sortOrder = opts.sortOrder || 'asc';
      var page = parseInt(opts.page, 10) || 1;
      var pageSize = parseInt(opts.pageSize, 10) || 6;

      // 1. Filter by category
      var filtered = items.filter(function (item) {
        if (category === 'all') return true;
        var itemCat = (item.category || item.department || '').toLowerCase();
        return itemCat === category || itemCat.indexOf(category) > -1;
      });

      // 2. Search query matching across multiple attributes
      if (query) {
        filtered = filtered.filter(function (item) {
          var textPool = [
            item.title || '',
            item.description || '',
            item.question || '',
            item.answer || '',
            item.fullName || '',
            item.enrolment || '',
            item.email || '',
            item.location || '',
            item.organizer || '',
            item.categoryLabel || ''
          ].join(' ').toLowerCase();

          return textPool.indexOf(query) > -1;
        });
      }

      // 3. Sort array
      if (sortBy !== 'default') {
        filtered.sort(function (a, b) {
          var valA = a[sortBy] !== undefined ? a[sortBy] : '';
          var valB = b[sortBy] !== undefined ? b[sortBy] : '';

          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // 4. Pagination slicing
      var totalItems = filtered.length;
      var totalPages = Math.ceil(totalItems / pageSize) || 1;
      if (page > totalPages) page = totalPages;
      if (page < 1) page = 1;

      var startIndex = (page - 1) * pageSize;
      var paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      return {
        items: paginatedItems,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        pageSize: pageSize,
        startIndex: startIndex,
        endIndex: Math.min(startIndex + pageSize, totalItems)
      };
    },

    /**
     * Render accessible interactive pagination controls
     */
    renderPagination: function (container, paginationState, onPageChange) {
      if (!container) return;
      var totalPages = paginationState.totalPages;
      var current = paginationState.currentPage;

      if (totalPages <= 1) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
      }

      container.style.display = 'flex';
      var html = '<div class="pagination-wrapper" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; margin:2.5rem 0 1rem; flex-wrap:wrap;">';

      // Prev Button
      var prevDisabled = current === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';
      html += '<button type="button" class="btn pagination-btn pagination-prev" data-page="' + (current - 1) + '" ' + prevDisabled + ' style="padding:0.45rem 1rem; border-radius:100px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.06); color:#fff; cursor:pointer;">&larr; Prev</button>';

      // Page Number Pills
      for (var i = 1; i <= totalPages; i++) {
        var isActive = i === current;
        var activeStyles = isActive
          ? 'background: var(--accent-color, #2563eb); border-color: var(--accent-color, #2563eb); color:#fff; font-weight:800; box-shadow: 0 0 12px var(--accent-glow);'
          : 'background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.2); color:#fff;';

        html += '<button type="button" class="btn pagination-btn pagination-page' + (isActive ? ' is-active' : '') + '" data-page="' + i + '" style="padding:0.45rem 0.85rem; min-width:38px; border-radius:100px; font-size:0.85rem; cursor:pointer; ' + activeStyles + '">' + i + '</button>';
      }

      // Next Button
      var nextDisabled = current === totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';
      html += '<button type="button" class="btn pagination-btn pagination-next" data-page="' + (current + 1) + '" ' + nextDisabled + ' style="padding:0.45rem 1rem; border-radius:100px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.06); color:#fff; cursor:pointer;">Next &rarr;</button>';

      html += '</div>';

      // Counter Label
      html += '<div style="text-align:center; color:var(--muted-color); font-size:0.82rem; margin-top:-0.5rem;">' +
        'Showing ' + (paginationState.totalItems > 0 ? (paginationState.startIndex + 1) : 0) + '–' + paginationState.endIndex + ' of ' + paginationState.totalItems + ' records' +
        '</div>';

      container.innerHTML = html;

      // Event Listeners
      container.querySelectorAll('.pagination-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = parseInt(btn.getAttribute('data-page'), 10);
          if (p && p >= 1 && p <= totalPages && p !== current) {
            onPageChange(p);
          }
        });
      });
    }
  };

  window.StudentHubJsonEngine = JsonEngine;

  // =========================================================================
  // Integration 1: Dynamic Events Catalog on pages/events.html
  // =========================================================================
  function initDynamicEventsPage() {
    var eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;

    var paginationContainer = document.getElementById('events-pagination');
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.id = 'events-pagination';
      eventsGrid.parentNode.insertBefore(paginationContainer, eventsGrid.nextSibling);
    }

    // Controls container
    var filterSection = document.querySelector('.filters');
    var activeCategory = 'all';
    var searchQuery = '';
    var sortBy = 'date';
    var currentPage = 1;
    var rawEvents = [];

    // Inject Search and Sort Controls right above Category Filters if missing
    if (filterSection && !document.getElementById('events-search-input')) {
      var controlsBar = document.createElement('div');
      controlsBar.className = 'events-controls-bar';
      controlsBar.style.cssText = 'max-width: 880px; margin: 0 auto 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;';
      controlsBar.innerHTML =
        '<div style="flex: 1; min-width: 240px; position: relative;">' +
          '<input type="search" id="events-search-input" class="input" placeholder="Search hackathons, workshops, placement drives..." style="width: 100%; border-radius: 100px; padding: 0.75rem 1.25rem 0.75rem 2.85rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #fff;">' +
          '<span style="position: absolute; left: 1.15rem; top: 50%; transform: translateY(-50%); color: var(--accent-color); pointer-events: none;">🔍</span>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 0.65rem;">' +
          '<label for="events-sort-select" style="font-size: 0.85rem; color: var(--muted-color); font-weight: 700;">Sort By:</label>' +
          '<select id="events-sort-select" class="select" style="border-radius: 100px; padding: 0.6rem 1.25rem; background: rgba(10,24,48,0.9); border: 1px solid rgba(255,255,255,0.2); color: #fff;">' +
            '<option value="date-asc">Date (Earliest First)</option>' +
            '<option value="date-desc">Date (Latest First)</option>' +
            '<option value="title-asc">Title (A - Z)</option>' +
            '<option value="seatsLeft-asc">Seats Left (Urgent)</option>' +
          '</select>' +
        '</div>';

      filterSection.parentNode.insertBefore(controlsBar, filterSection);

      var sInput = document.getElementById('events-search-input');
      if (sInput) {
        sInput.addEventListener('input', function () {
          searchQuery = sInput.value;
          currentPage = 1;
          render();
        });
      }

      var sSelect = document.getElementById('events-sort-select');
      if (sSelect) {
        sSelect.addEventListener('change', function () {
          var val = sSelect.value;
          if (val === 'date-asc') { sortBy = 'date'; }
          else if (val === 'date-desc') { sortBy = 'date_desc'; }
          else if (val === 'title-asc') { sortBy = 'title'; }
          else if (val === 'seatsLeft-asc') { sortBy = 'seatsLeft'; }
          currentPage = 1;
          render();
        });
      }
    }

    // Wire up category filter chips
    document.querySelectorAll('.filters .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.filters .chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeCategory = chip.getAttribute('data-filter') || 'all';
        currentPage = 1;
        render();
      });
    });

    function getCategoryEmoji(cat) {
      switch (cat) {
        case 'tech': return '💻';
        case 'career': return '💼';
        case 'workshop': return '🔬';
        case 'sports': return '🏏';
        case 'cultural': return '🎭';
        default: return '✨';
      }
    }

    function render() {
      if (!rawEvents.length) return;

      var sortParam = sortBy;
      var sortOrder = 'asc';
      if (sortBy === 'date_desc') {
        sortParam = 'date';
        sortOrder = 'desc';
      }

      var result = JsonEngine.processDataset(rawEvents, {
        query: searchQuery,
        category: activeCategory,
        sortBy: sortParam,
        sortOrder: sortOrder,
        page: currentPage,
        pageSize: 6
      });

      if (!result.items.length) {
        eventsGrid.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1rem; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.18); border-radius: 20px;">' +
            '<div style="font-size: 2.5rem; margin-bottom: 0.85rem;">🔍</div>' +
            '<h3 style="color: #fff; margin-bottom: 0.4rem;">No Campus Events Found</h3>' +
            '<p style="color: var(--muted-color); font-size: 0.92rem;">Try adjusting your search keywords or switching category filters.</p>' +
          '</div>';
        paginationContainer.innerHTML = '';
        return;
      }

      var cardsHtml = result.items.map(function (evt) {
        var dateParts = (evt.displayDate || '').split(' ');
        var day = dateParts[0] || '15';
        var month = dateParts[1] || 'AUG';

        return (
          '<article class="card card--flush card--lift event" data-category="' + evt.category + '" style="display:flex; flex-direction:column; height:100%;">' +
            '<div class="event__media-custom">' +
              '<div class="event__icon-badge">' + getCategoryEmoji(evt.category) + '</div>' +
              '<div class="event__date-badge">' +
                '<b>' + day + '</b>' +
                '<span>' + month + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="event__body" style="display:flex; flex-direction:column; flex:1;">' +
              '<div class="event__tag-row">' +
                '<span class="event-category-pill event-category-pill--' + evt.category + '">' + (evt.categoryLabel || evt.category) + '</span>' +
                '<span style="font-size: 0.78rem; color: var(--accent-color); font-weight: 700;">' + evt.fee + '</span>' +
              '</div>' +
              '<h3 style="margin: 0.5rem 0 0.4rem; font-size: 1.18rem; color:#fff;">' + evt.title + '</h3>' +
              '<p style="flex: 1; font-size: 0.88rem; line-height: 1.55; color: var(--muted-color);">' + evt.description + '</p>' +
              '<div class="event__meta-list" style="margin: 1rem 0;">' +
                '<div class="event__meta-item">' +
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
                  '<span>' + evt.time + '</span>' +
                '</div>' +
                '<div class="event__meta-item">' +
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
                  '<span>' + evt.location + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="event__foot-row" style="margin-top:auto; padding-top:0.85rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">' +
                '<span class="event__seats-status" style="font-size:0.8rem; color:rgba(255,255,255,0.7);">' + evt.seatsLeft + ' of ' + evt.seatsTotal + ' seats left</span>' +
                '<a class="btn-3d btn-3d--primary" style="padding: 0.5rem 1.15rem; font-size: 0.82rem; text-decoration:none;" href="register.html">Register</a>' +
              '</div>' +
            '</div>' +
          '</article>'
        );
      }).join('');

      eventsGrid.innerHTML = cardsHtml;

      // Render pagination buttons
      JsonEngine.renderPagination(paginationContainer, result, function (newPage) {
        currentPage = newPage;
        render();
        eventsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Show initial skeleton / loading status
    eventsGrid.innerHTML =
      '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">' +
        '<div style="font-size: 2rem; animation: spin 1s linear infinite; display: inline-block;">⏳</div>' +
        '<p style="color: #fff; margin-top: 0.85rem; font-weight: 700;">Loading verified university events via Fetch API...</p>' +
      '</div>';

    // Fetch external data/events.json
    var jsonUrl = window.location.pathname.indexOf('/pages/') > -1 ? '../data/events.json' : 'data/events.json';
    JsonEngine.fetchData(jsonUrl, 'events')
      .then(function (data) {
        rawEvents = data;
        render();
      })
      .catch(function (err) {
        console.error('Events JSON load error:', err);
        eventsGrid.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #f87171;">' +
            '<p>⚠ Unable to load external events dataset. Please verify network connectivity.</p>' +
          '</div>';
      });
  }

  // =========================================================================
  // Integration 2: Dynamic FAQs Knowledgebase on pages/faq.html
  // =========================================================================
  function initDynamicFaqPage() {
    var accordionWrap = document.querySelector('.acc');
    if (!accordionWrap) return;

    var paginationContainer = document.getElementById('faq-pagination');
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.id = 'faq-pagination';
      accordionWrap.parentNode.insertBefore(paginationContainer, accordionWrap.nextSibling);
    }

    var searchInput = document.getElementById('faq-search');
    var rawFaqs = [];
    var activeCategory = 'all';
    var searchQuery = '';
    var currentPage = 1;

    // Filter Chips
    document.querySelectorAll('.faq-filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.faq-filter-chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeCategory = chip.getAttribute('data-faq-cat') || 'all';
        currentPage = 1;
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value;
        currentPage = 1;
        render();
      });
    }

    function render() {
      if (!rawFaqs.length) return;

      var result = JsonEngine.processDataset(rawFaqs, {
        query: searchQuery,
        category: activeCategory,
        sortBy: 'id',
        sortOrder: 'asc',
        page: currentPage,
        pageSize: 6
      });

      if (!result.items.length) {
        accordionWrap.innerHTML =
          '<div style="text-align: center; padding: 3rem 1rem; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.18); border-radius: 18px;">' +
            '<div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔎</div>' +
            '<h3 style="color: #fff; margin-bottom: 0.35rem;">No Solutions Found</h3>' +
            '<p style="color: var(--muted-color); font-size: 0.9rem;">Try different keywords like "attendance", "fees", or "password".</p>' +
          '</div>';
        paginationContainer.innerHTML = '';
        return;
      }

      var itemsHtml = result.items.map(function (faq, index) {
        var panelId = 'faq-panel-' + faq.id;
        var btnId = 'faq-btn-' + faq.id;
        return (
          '<div class="acc__item" data-category="' + faq.category + '" style="margin-bottom: 0.85rem;">' +
            '<h3>' +
              '<button type="button" class="acc__btn" id="' + btnId + '" aria-expanded="false" aria-controls="' + panelId + '">' +
                '<span style="font-family: \'Manrope\', sans-serif; font-size: 1.05rem; font-weight: 700; color: #fff;">' + faq.question + '</span>' +
                '<span class="acc__icon" aria-hidden="true">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
                '</span>' +
              '</button>' +
            '</h3>' +
            '<div class="acc__panel" id="' + panelId + '" role="region" aria-labelledby="' + btnId + '" style="height:0; overflow:hidden; transition:height 0.3s cubic-bezier(0.2,0.8,0.2,1);">' +
              '<div class="acc__body" style="padding: 1.15rem 1.4rem; color: rgba(255,255,255,0.85); font-size: 0.95rem; line-height: 1.65; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.2);">' +
                '<p>' + faq.answer + '</p>' +
                '<div style="margin-top: 0.65rem;"><span class="badge" style="font-size: 0.72rem; padding: 0.2rem 0.65rem; background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); border-radius: 100px;">' + (faq.categoryLabel || faq.category) + '</span></div>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      accordionWrap.innerHTML = itemsHtml;

      // Attach Accordion Toggle Listeners
      accordionWrap.querySelectorAll('.acc__btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var isExpanded = btn.getAttribute('aria-expanded') === 'true';
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          if (!panel) return;

          // Close other panels if single mode
          accordionWrap.querySelectorAll('.acc__btn').forEach(function (otherBtn) {
            if (otherBtn !== btn) {
              otherBtn.setAttribute('aria-expanded', 'false');
              var otherPanel = document.getElementById(otherBtn.getAttribute('aria-controls'));
              if (otherPanel) otherPanel.style.height = '0px';
            }
          });

          if (isExpanded) {
            btn.setAttribute('aria-expanded', 'false');
            panel.style.height = '0px';
          } else {
            btn.setAttribute('aria-expanded', 'true');
            panel.style.height = panel.scrollHeight + 'px';
          }
        });
      });

      // Pagination
      JsonEngine.renderPagination(paginationContainer, result, function (newPage) {
        currentPage = newPage;
        render();
        accordionWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Fetch external data/faqs.json
    var jsonUrl = window.location.pathname.indexOf('/pages/') > -1 ? '../data/faqs.json' : 'data/faqs.json';
    JsonEngine.fetchData(jsonUrl, 'faqs')
      .then(function (data) {
        rawFaqs = data;
        render();
      })
      .catch(function (err) {
        console.error('FAQs JSON load error:', err);
      });
  }

  // =========================================================================
  // Integration 3: Dynamic Student Directory on pages/admin.html
  // =========================================================================
  function initDynamicAdminStudents() {
    var studentTableBody = document.getElementById('adminStudentTableBody');
    if (!studentTableBody) return;

    var searchInput = document.getElementById('adminStudentSearchInput');
    var deptFilter = document.getElementById('adminStudentDeptFilter');
    var rawStudents = [];
    var searchQuery = '';
    var activeDept = 'all';

    function render() {
      if (!rawStudents.length) return;

      var result = JsonEngine.processDataset(rawStudents, {
        query: searchQuery,
        category: activeDept,
        sortBy: 'enrolment',
        sortOrder: 'asc',
        page: 1,
        pageSize: 50 // Show all matching in admin table
      });

      if (!result.items.length) {
        studentTableBody.innerHTML =
          '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--muted-color);">' +
            'No student records match the active search criteria.' +
          '</td></tr>';
        return;
      }

      var rowsHtml = result.items.map(function (st) {
        var statusBadge = st.status === 'Active'
          ? '<span class="badge badge--success">Active</span>'
          : '<span class="badge badge--warning">' + st.status + '</span>';

        return (
          '<tr data-admin-active-student-row="true">' +
            '<td>' +
              '<div style="display:flex; align-items:center; gap:0.75rem;">' +
                '<div class="dash-avatar-ring" style="width:38px;height:38px;font-size:0.95rem;border-radius:10px;">' + (st.avatar || 'ST') + '</div>' +
                '<div><b style="color:#fff;">' + st.fullName + '</b><br><small style="color:var(--muted-color);">' + st.email + '</small></div>' +
              '</div>' +
            '</td>' +
            '<td><b>' + st.enrolment + '</b></td>' +
            '<td>' + st.department + '</td>' +
            '<td><b style="color:#38bdf8;">' + st.attendance + '%</b></td>' +
            '<td>' + statusBadge + '</td>' +
            '<td style="text-align:right;">' +
              '<div style="display:inline-flex; gap:0.4rem;">' +
                '<button class="dash-btn-icon" title="View Profile" type="button" onclick="window.openAdminModal(\'profile\')">👁️</button>' +
                '<button class="dash-btn-icon" title="Edit Grades" type="button" onclick="window.openAdminModal(\'marks\')">✏️</button>' +
              '</div>' +
            '</td>' +
          '</tr>'
        );
      }).join('');

      studentTableBody.innerHTML = rowsHtml;
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value;
        render();
      });
    }

    if (deptFilter) {
      deptFilter.addEventListener('change', function () {
        activeDept = deptFilter.value;
        render();
      });
    }

    // Fetch external data/students.json
    var jsonUrl = window.location.pathname.indexOf('/pages/') > -1 ? '../data/students.json' : 'data/students.json';
    JsonEngine.fetchData(jsonUrl, 'students')
      .then(function (data) {
        rawStudents = data;
        render();
      })
      .catch(function (err) {
        console.error('Students JSON load error:', err);
      });
  }

  // Boot on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    initDynamicEventsPage();
    initDynamicFaqPage();
    initDynamicAdminStudents();
  });

})(window, document);
