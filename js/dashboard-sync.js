/* ==========================================================================
   CHARUSAT StudentHub — Dynamic Dashboard Renderer (dashboard-sync.js)
   - Reads real student profile, attendance, marks, CGPA, and fees
   - Real-time tab switcher: Overview, Academic Marks, Fee Structure, Timetable, Practicals, Notes
   - Dynamically updates when admin or student updates their profile
   ========================================================================== */

(function () {
  'use strict';

  function renderDashboard() {
    if (!window.StudentHubData) return;
    var student = StudentHubData.getStudent();

    // 1. Sidebar User Profile
    var sideName = document.querySelector('[data-dash-side-name]');
    var sideMeta = document.querySelector('[data-dash-side-meta]');
    var sideAvatar = document.querySelector('[data-dash-side-avatar]');

    var fullName = student.fullName || '';
    var enrolment = student.enrolment || '25IT049';
    var sem = student.semester || '5';
    var dept = student.department || 'Information Technology';
    var inst = student.instituteShort || 'CSPIT';

    if (sideName) sideName.textContent = fullName;
    if (sideMeta) sideMeta.textContent = enrolment + ' · Semester ' + sem + ' (' + inst + ')';
    if (sideAvatar) {
      if (student.avatar) {
        sideAvatar.innerHTML = '<img src="' + student.avatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="' + fullName + '">';
      } else {
        var initials = fullName.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase() || 'TL';
        sideAvatar.textContent = initials;
      }
    }

    // 2. Greeting Header
    var greetName = document.querySelector('[data-dash-greet-name]');
    var greetSub = document.querySelector('[data-dash-greet-sub]');
    var avatarHead = document.querySelector('[data-dash-head-avatar]');

    if (greetName) greetName.textContent = 'Welcome back, ' + fullName.split(' ')[0] + ' 👋';
    if (greetSub) {
      greetSub.textContent = enrolment + ' · Semester ' + sem + ' · ' + dept + ' (' + (student.programme || 'B.Tech') + ')';
    }
    if (avatarHead) {
      if (student.avatar) {
        avatarHead.innerHTML = '<img src="' + student.avatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="' + fullName + '">';
      } else {
        var inits = fullName.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase() || 'TL';
        avatarHead.textContent = inits;
      }
    }

    // 3. Top Metrics: Attendance, CGPA, SGPA, Fees Status
    var avgAttendance = student.overallAttendance;
    if (!avgAttendance && student.subjects && student.subjects.length) {
      var totalAtt = student.subjects.reduce(function (sum, s) { return sum + Number(s.attendance || 0); }, 0);
      avgAttendance = Math.round(totalAtt / student.subjects.length);
    }
    avgAttendance = avgAttendance || 86;

    var valAtt = document.querySelector('[data-dash-val-attendance]');
    var valCgpa = document.querySelector('[data-dash-val-cgpa]');
    var valSgpa = document.querySelector('[data-dash-val-sgpa]');
    var valFees = document.querySelector('[data-dash-val-fees]');

    if (valAtt) valAtt.textContent = avgAttendance + '%';
    if (valCgpa) valCgpa.textContent = Number(student.cgpa || 8.64).toFixed(2);
    if (valSgpa) valSgpa.textContent = Number(student.sgpa || 8.85).toFixed(2);
    if (valFees) {
      var feeStatus = (student.fees && student.fees.paymentStatus) || 'Paid';
      valFees.textContent = feeStatus;
      valFees.style.color = feeStatus === 'Paid' ? '#34d399' : (feeStatus === 'Pending' ? '#f87171' : '#fbbf24');
    }

    // 4. Detailed Marks & Exam Results Table
    var marksTableBody = document.querySelector('[data-dash-marks-body]');
    if (marksTableBody && student.subjects) {
      marksTableBody.innerHTML = '';
      student.subjects.forEach(function (sub) {
        var tr = document.createElement('tr');
        var gradeClass = 'grade-badge--' + (sub.grade || 'AA');
        tr.innerHTML =
          '<td><b>' + sub.code + '</b></td>' +
          '<td><div><b>' + sub.name + '</b><br><small style="color:var(--muted-color);">' + sub.faculty + ' · ' + sub.credits + ' Credits</small></div></td>' +
          '<td><span style="font-weight:700; color:' + (sub.attendance >= 75 ? '#34d399' : '#f87171') + ';">' + sub.attendance + '%</span></td>' +
          '<td>' + sub.internalMarks + ' / 30</td>' +
          '<td>' + sub.midSemMarks + ' / 50</td>' +
          '<td>' + sub.assignmentMarks + ' / 20</td>' +
          '<td><strong style="font-size:1.05rem;">' + sub.totalMarks + '</strong></td>' +
          '<td><span class="grade-badge ' + gradeClass + '">' + sub.grade + '</span></td>';
        marksTableBody.appendChild(tr);
      });
    }

    // 5. Subject Attendance Breakdown in Attendance Card
    var attList = document.querySelector('[data-dash-attendance-list]');
    var attRing = document.querySelector('[data-dash-ring-circle]');
    var attRingText = document.querySelector('[data-dash-ring-val]');

    if (attRingText) attRingText.textContent = avgAttendance + '%';
    if (attRing) {
      var circumference = 314; // 2 * pi * 50
      attRing.style.strokeDashoffset = String(circumference - (circumference * avgAttendance) / 100);
    }

    if (attList && student.subjects) {
      attList.innerHTML = '';
      student.subjects.forEach(function (s) {
        var li = document.createElement('li');
        var color = s.attendance >= 75 ? '#34d399' : '#f87171';
        li.innerHTML = '<span>' + s.name + '</span><b style="color:' + color + ';">' + s.attendance + '%</b>';
        attList.appendChild(li);
      });
    }

    // 6. Fee Structure Details
    var f = student.fees || {};
    var feeStatusBadge = document.querySelector('[data-dash-fee-status-badge]');
    var feeReceiptNo = document.querySelector('[data-dash-fee-receipt]');
    var feeAmountPaid = document.querySelector('[data-dash-fee-paid]');
    var feeDue = document.querySelector('[data-dash-fee-due]');
    var feeTotal = document.querySelector('[data-dash-fee-total]');
    var feeDate = document.querySelector('[data-dash-fee-date]');
    var feeMethod = document.querySelector('[data-dash-fee-method]');

    if (feeStatusBadge) {
      var isPaid = f.paymentStatus === 'Paid';
      feeStatusBadge.textContent = f.paymentStatus || 'Paid';
      feeStatusBadge.className = isPaid ? 'badge badge--success' : 'badge badge--danger';
    }
    if (feeReceiptNo) feeReceiptNo.textContent = f.receiptNumber || 'CHARUSAT-FEE-2026-99412';
    if (feeAmountPaid) feeAmountPaid.textContent = '₹' + Number(f.amountPaid || 72500).toLocaleString();
    if (feeDue) feeDue.textContent = '₹' + Number(f.dueAmount || 0).toLocaleString();
    if (feeTotal) feeTotal.textContent = '₹' + Number(f.totalPayable || 72500).toLocaleString();
    if (feeDate) feeDate.textContent = f.paymentDate || '28 July 2026';
    if (feeMethod) feeMethod.textContent = f.paymentMethod || 'Online Bank Gateway';
  }

  // Professional Single-Pane Dashboard View Switcher
  function switchDashboardView(targetPane, scrollUp) {
    if (!targetPane) targetPane = 'overview';
    if (targetPane === 'all') targetPane = 'overview';

    // 1. Synchronize active state across top filter pills, sidebar links, and triggers
    var allNavTriggers = document.querySelectorAll('[data-dash-tab]');
    allNavTriggers.forEach(function (trigger) {
      var tabVal = trigger.getAttribute('data-dash-tab');
      var isActive = (tabVal === targetPane);
      
      trigger.classList.toggle('is-active', isActive);
      if (trigger.tagName === 'A') {
        if (isActive) trigger.setAttribute('aria-current', 'page');
        else trigger.removeAttribute('aria-current');
      }
    });

    // 2. Hide all panes except the active pane
    var sections = document.querySelectorAll('[data-dash-pane]');
    sections.forEach(function (sec) {
      var paneName = sec.getAttribute('data-dash-pane');
      if (paneName === targetPane) {
        sec.style.display = 'block';
        sec.classList.remove('dash-pane-active');
        void sec.offsetWidth; // force reflow for smooth animation
        sec.classList.add('dash-pane-active');
      } else {
        sec.style.display = 'none';
        sec.classList.remove('dash-pane-active');
      }
    });

    // 3. Update URL hash cleanly
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, '#' + targetPane);
    }

    // 4. Smooth scroll to top of main area
    if (scrollUp) {
      var mainEl = document.querySelector('.dash-main-head');
      if (mainEl) {
        var topPos = mainEl.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
      }
    }
  }

  function initDashboardTabs() {
    // Delegated click handler handles sidebar links, top pills, metric cards, back buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-dash-tab]');
      if (btn) {
        e.preventDefault();
        var targetPane = btn.getAttribute('data-dash-tab');
        switchDashboardView(targetPane, true);
      }
    });

    // Initial load: read hash or default to 'overview'
    var initialPane = 'overview';
    if (window.location.hash) {
      var hashVal = window.location.hash.replace('#', '').trim();
      if (hashVal) initialPane = hashVal;
    }
    switchDashboardView(initialPane, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderDashboard();
    initDashboardTabs();

    // Listen to real-time custom updates from Profile or Admin
    window.addEventListener('charusat:data-updated', function () {
      renderDashboard();
    });
  });
})();

