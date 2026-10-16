/* ==========================================================================
   CHARUSAT StudentHub — Dynamic All-Months Academic Calendar Engine (calendar-engine.js)
   - Real-time month & year navigation for all 12 months (past, current, future)
   - Day calculation with real calendar math, leap years, and weekday alignment
   - Academic milestones, university event markers & exam deadlines
   - Interactive date selection with instant daily class & viva schedule agenda
   - Weekly timetable matrix view switcher
   ========================================================================== */

(function () {
  'use strict';

  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // University Academic Schedule & Milestones
  var ACADEMIC_EVENTS = {
    // August 2026
    '2026-08-04': { title: 'Hackathon Info Session', time: '04:00 PM', type: 'event', badge: 'Campus Event', desc: 'Pre-hackathon team formation in CSPIT Seminar Hall.' },
    '2026-08-07': { title: 'OS Quiz 3 Graded', time: '01:02 PM', type: 'quiz', badge: 'Exam Cell', desc: 'Prof. Meera Iyer graded quiz 3 (Score: 18/20).' },
    '2026-08-09': { title: 'Today · Study & Library Hours', time: '10:00 AM', type: 'today', badge: 'Active Date', desc: 'Central Library reading rooms open until 08:00 PM.' },
    '2026-08-10': { title: 'Normalisation Case Study Due', time: '11:59 PM', type: 'deadline', badge: 'Assignment Due', desc: 'IT501 DBMS assignment submission portal closes.' },
    '2026-08-11': { title: 'DBMS Continuous Internal Test', time: '10:00 AM', type: 'exam', badge: 'Internal Exam', desc: 'Room B-204 · Carry college ID and examination hall ticket.' },
    '2026-08-12': { title: 'Page Replacement Worksheet Due', time: '04:00 PM', type: 'deadline', badge: 'Assignment Due', desc: 'IT503 Operating Systems lab upload.' },
    '2026-08-14': { title: 'Orientation Week Opening Ceremony', time: '09:00 AM', type: 'event', badge: 'University Event', desc: 'University Central Auditorium with Vice Chancellor.' },
    '2026-08-17': { title: '36-Hour Campus Hackathon', time: '09:00 AM', type: 'event', badge: 'Competition', desc: 'Team Bitwise hackathon round commences at Dev Lab.' },
    '2026-08-18': { title: 'DSA Graph Traversal Problem Set Due', time: '11:59 PM', type: 'deadline', badge: 'Assignment Due', desc: 'IT507 Data Structures & Algorithms lab brief.' },
    '2026-08-19': { title: 'Semester 5 Fee Clearance Deadline', time: '05:00 PM', type: 'fee', badge: 'Accounts Office', desc: 'Final date for term fee reconciliation before late charge.' },
    '2026-08-21': { title: 'Campus Placement Mock Round', time: '10:30 AM', type: 'placement', badge: 'T&P Cell', desc: 'Aptitude & quantitative mock tests for third-year students.' },
    '2026-08-24': { title: 'Crest Data Systems Recruitment Drive', time: '09:30 AM', type: 'placement', badge: 'Drive Open', desc: 'Software Engineer role (₹8.5 LPA) · Room A-101.' },
    '2026-08-26': { title: 'Computer Networks Practical Viva', time: '02:30 PM', type: 'exam', badge: 'Lab Viva', desc: 'IT505 Network lab practical examination with external faculty.' },

    // September 2026
    '2026-09-02': { title: 'Sophos Cyber Security Campus Drive', time: '09:00 AM', type: 'placement', badge: 'Drive Open', desc: 'Trainee DevSecOps (₹10.2 LPA) interview rounds.' },
    '2026-09-05': { title: 'Teachers Day Celebrations', time: '11:00 AM', type: 'event', badge: 'Celebration', desc: 'Departmental felicitation ceremony.' },
    '2026-09-12': { title: 'Bacancy Technology Recruitment Drive', time: '10:00 AM', type: 'placement', badge: 'Drive Open', desc: 'Full Stack Associate (₹6.8 LPA).' },
    '2026-09-22': { title: 'Mid-Semester Theory Exams Begin', time: '09:30 AM', type: 'exam', badge: 'Mid-Sem Exam', desc: 'Official Mid-Semester 1 evaluation block across CSPIT.' },

    // October 2026
    '2026-10-02': { title: 'Gandhi Jayanti', time: 'All Day', type: 'holiday', badge: 'National Holiday', desc: 'University offices and classes suspended.' },
    '2026-10-15': { title: 'Project Interim Review', time: '02:00 PM', type: 'deadline', badge: 'Milestone', desc: 'Semester 5 Capstone Project progress demo.' },
    '2026-10-24': { title: 'Dussehra Holiday', time: 'All Day', type: 'holiday', badge: 'Holiday', desc: 'University closed.' },

    // November 2026
    '2026-11-08': { title: 'Diwali Break Commences', time: 'All Day', type: 'holiday', badge: 'Vacation', desc: 'Autumn term break until 20 November.' },
    '2026-11-25': { title: 'Lab Term-Work Final Submission', time: '05:00 PM', type: 'deadline', badge: 'Final Deadline', desc: 'Signed laboratory logbooks submission to HOD.' },

    // December 2026
    '2026-12-07': { title: 'CHARUSAT End-Semester Exams Begin', time: '10:00 AM', type: 'exam', badge: 'University Finals', desc: 'Semester 5 final university examinations.' },
    '2026-12-25': { title: 'Christmas Holiday', time: 'All Day', type: 'holiday', badge: 'Holiday', desc: 'University closed.' },

    // January 2027
    '2027-01-04': { title: 'Semester 6 Commencement', time: '09:00 AM', type: 'event', badge: 'Term Re-opening', desc: 'Spring 2027 session commences.' },
    '2027-01-15': { title: 'Term 6 Fee Payment Due Date', time: '05:00 PM', type: 'fee', badge: 'Accounts Office', desc: 'Re-enrolment fee deadline for Spring semester.' },
    '2027-01-26': { title: 'Republic Day Celebrations', time: '08:30 AM', type: 'holiday', badge: 'National Holiday', desc: 'Campus Flag Hoisting Ceremony.' }
  };

  // Regular Timetable Classes by Day of Week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  var WEEKDAY_CLASSES = {
    0: [
      { time: '09:00 AM – 06:00 PM', title: 'Central Library Open', code: 'LIB', faculty: 'Campus Library Staff', room: 'Library Annex' },
      { time: '10:00 AM – 01:00 PM', title: 'Open Coding Arena & Study Pods', code: 'SELF', faculty: 'Open Access', room: 'Tech Center' }
    ],
    1: [
      { time: '09:00 AM – 10:00 AM', title: 'Database Management Systems', code: 'IT301', faculty: 'Prof. K. Patel', room: 'Room B-204' },
      { time: '10:15 AM – 11:15 AM', title: 'Operating Systems & Linux', code: 'IT302', faculty: 'Dr. M. Sharma', room: 'Room 302' },
      { time: '11:30 AM – 12:30 PM', title: 'Data Structures & Algorithms', code: 'IT303', faculty: 'Prof. R. Joshi', room: 'Room 105' },
      { time: '01:30 PM – 03:30 PM', title: 'DBMS Practical Lab (SQL & Oracle)', code: 'IT301-P', faculty: 'Prof. K. Patel', room: 'Database Lab 4' },
      { time: '03:45 PM – 04:45 PM', title: 'Remedial / Tutorial Session', code: 'TUT', faculty: 'Faculty Mentors', room: 'Room B-204' }
    ],
    2: [
      { time: '09:00 AM – 10:00 AM', title: 'Computer Networks', code: 'IT304', faculty: 'Dr. S. Verma', room: 'Room 201' },
      { time: '10:15 AM – 11:15 AM', title: 'Discrete Mathematics', code: 'IT305', faculty: 'Prof. A. Trivedi', room: 'Room 102' },
      { time: '11:30 AM – 12:30 PM', title: 'Database Management Systems', code: 'IT301', faculty: 'Prof. K. Patel', room: 'Room B-204' },
      { time: '01:30 PM – 03:30 PM', title: 'Operating Systems Lab (Linux Shells)', code: 'IT302-P', faculty: 'Dr. M. Sharma', room: 'OS Lab 2' }
    ],
    3: [
      { time: '09:00 AM – 10:00 AM', title: 'Data Structures & Algorithms', code: 'IT303', faculty: 'Prof. R. Joshi', room: 'Room 105' },
      { time: '10:15 AM – 11:15 AM', title: 'Operating Systems & Linux', code: 'IT302', faculty: 'Dr. M. Sharma', room: 'Room 302' },
      { time: '11:30 AM – 12:30 PM', title: 'Computer Networks', code: 'IT304', faculty: 'Dr. S. Verma', room: 'Room 201' },
      { time: '01:30 PM – 03:30 PM', title: 'Computer Networks Lab (Wireshark)', code: 'IT304-P', faculty: 'Dr. S. Verma', room: 'Networking Lab' }
    ],
    4: [
      { time: '09:00 AM – 10:00 AM', title: 'Discrete Mathematics', code: 'IT305', faculty: 'Prof. A. Trivedi', room: 'Room 102' },
      { time: '10:15 AM – 11:15 AM', title: 'Database Management Systems', code: 'IT301', faculty: 'Prof. K. Patel', room: 'Room B-204' },
      { time: '11:30 AM – 12:30 PM', title: 'Data Structures & Algorithms', code: 'IT303', faculty: 'Prof. R. Joshi', room: 'Room 105' },
      { time: '01:30 PM – 03:30 PM', title: 'DSA Advanced Programming Lab', code: 'IT303-P', faculty: 'Prof. R. Joshi', room: 'Computing Lab 1' }
    ],
    5: [
      { time: '09:00 AM – 10:00 AM', title: 'Operating Systems & Linux', code: 'IT302', faculty: 'Dr. M. Sharma', room: 'Room 302' },
      { time: '10:15 AM – 11:15 AM', title: 'Computer Networks', code: 'IT304', faculty: 'Dr. S. Verma', room: 'Room 201' },
      { time: '11:30 AM – 12:30 PM', title: 'Discrete Mathematics', code: 'IT305', faculty: 'Prof. A. Trivedi', room: 'Room 102' },
      { time: '01:30 PM – 03:30 PM', title: 'Web Development & Full-Stack Capstone', code: 'IT306', faculty: 'Industry Mentor', room: 'Project Lab' }
    ],
    6: [
      { time: '09:00 AM – 10:30 AM', title: 'Placement Aptitude & Verbal Reasoning', code: 'T&P', faculty: 'Placement Cell', room: 'Auditorium B' },
      { time: '10:45 AM – 12:15 PM', title: 'Technical Problem Solving / LeetCode', code: 'CODE', faculty: 'Coding Club Leads', room: 'Lab 3' },
      { time: '01:00 PM – 03:00 PM', title: 'Campus Sports & Cultural Club Hours', code: 'EXTRA', faculty: 'Student Council', room: 'Campus Arena' }
    ]
  };

  // Current Calendar State (Anchored at August 2026 by default)
  var state = {
    year: 2026,
    month: 7, // 0 = Jan, 7 = Aug
    selectedDate: '2026-08-09'
  };

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatDateStr(y, m, d) {
    return y + '-' + pad(m + 1) + '-' + pad(d);
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }

  // Render Calendar Grid for Year & Month
  function renderCalendar() {
    var titleEls = document.querySelectorAll('[data-cal-title]');
    var monthSelects = document.querySelectorAll('[data-cal-month-select]');
    var yearSelects = document.querySelectorAll('[data-cal-year-select]');
    var gridContainers = document.querySelectorAll('[data-cal-grid]');

    var monthName = MONTH_NAMES[state.month];
    var titleText = monthName + ' ' + state.year;

    // Update Titles & Selects
    titleEls.forEach(function (el) { el.textContent = titleText; });
    monthSelects.forEach(function (sel) { sel.value = String(state.month); });
    yearSelects.forEach(function (sel) { sel.value = String(state.year); });

    var firstDay = getFirstDayOfWeek(state.year, state.month);
    var daysInCurrent = getDaysInMonth(state.year, state.month);
    var daysInPrev = getDaysInMonth(state.year, state.month - 1);

    var todayStr = '2026-08-09'; // Academic calendar anchor date

    gridContainers.forEach(function (grid) {
      grid.innerHTML = '';

      // 1. Weekday Header
      var dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      dayHeaders.forEach(function (d) {
        var span = document.createElement('span');
        span.textContent = d;
        grid.appendChild(span);
      });

      // 2. Trailing days from previous month
      var prevMonth = state.month === 0 ? 11 : state.month - 1;
      var prevYear = state.month === 0 ? state.year - 1 : state.year;
      for (var p = firstDay - 1; p >= 0; p--) {
        var prevDayNum = daysInPrev - p;
        var pDateStr = formatDateStr(prevYear, prevMonth, prevDayNum);
        var bPrev = document.createElement('b');
        bPrev.className = 'muted';
        bPrev.textContent = prevDayNum;
        bPrev.setAttribute('data-date', pDateStr);
        bPrev.addEventListener('click', (function (dStr, yr, mo) {
          return function () {
            state.year = yr;
            state.month = mo;
            state.selectedDate = dStr;
            renderCalendar();
            renderAgenda();
          };
        })(pDateStr, prevYear, prevMonth));
        grid.appendChild(bPrev);
      }

      // 3. Days of current month
      for (var d = 1; d <= daysInCurrent; d++) {
        var dateStr = formatDateStr(state.year, state.month, d);
        var b = document.createElement('b');
        b.textContent = d;
        b.setAttribute('data-date', dateStr);

        if (dateStr === todayStr) {
          b.classList.add('today');
        }

        if (ACADEMIC_EVENTS[dateStr]) {
          b.classList.add('has-event');
          b.title = ACADEMIC_EVENTS[dateStr].title;
        }

        if (dateStr === state.selectedDate) {
          b.classList.add('is-selected');
        }

        b.addEventListener('click', (function (dStr) {
          return function () {
            state.selectedDate = dStr;
            // Update selected class
            grid.querySelectorAll('b').forEach(function (cell) {
              cell.classList.toggle('is-selected', cell.getAttribute('data-date') === dStr);
            });
            renderAgenda();
          };
        })(dateStr));

        grid.appendChild(b);
      }

      // 4. Leading days from next month to fill grid
      var totalCellsSoFar = firstDay + daysInCurrent;
      var remainingCells = 35 - totalCellsSoFar;
      if (remainingCells < 0) remainingCells = 42 - totalCellsSoFar;

      var nextMonth = state.month === 11 ? 0 : state.month + 1;
      var nextYear = state.month === 11 ? state.year + 1 : state.year;
      for (var n = 1; n <= remainingCells; n++) {
        var nDateStr = formatDateStr(nextYear, nextMonth, n);
        var bNext = document.createElement('b');
        bNext.className = 'muted';
        bNext.textContent = n;
        bNext.setAttribute('data-date', nDateStr);
        bNext.addEventListener('click', (function (dStr, yr, mo) {
          return function () {
            state.year = yr;
            state.month = mo;
            state.selectedDate = dStr;
            renderCalendar();
            renderAgenda();
          };
        })(nDateStr, nextYear, nextMonth));
        grid.appendChild(bNext);
      }
    });

    renderAgenda();
  }

  // Render Daily Schedule & Agenda for Selected Date
  function renderAgenda() {
    var agendaContainers = document.querySelectorAll('[data-cal-agenda]');
    if (!agendaContainers.length) return;

    var parts = state.selectedDate.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);

    var dateObj = new Date(y, m, d);
    var dayOfWeek = dateObj.getDay();
    var dayName = DAY_NAMES[dayOfWeek];
    var formattedFullDate = dayName + ', ' + d + ' ' + MONTH_NAMES[m] + ' ' + y;

    var event = ACADEMIC_EVENTS[state.selectedDate];
    var classes = WEEKDAY_CLASSES[dayOfWeek] || [];

    agendaContainers.forEach(function (container) {
      var html =
        '<div class="cal-agenda-header">' +
          '<div>' +
            '<h4 style="margin:0; font-size:1.15rem; color:#ffffff;">' + formattedFullDate + '</h4>' +
            '<small style="color:var(--muted-color); font-weight:600;">' + (event ? event.badge : (classes.length + ' Classes Scheduled')) + '</small>' +
          '</div>' +
          (state.selectedDate === '2026-08-09' ? '<span class="pill pill--live">Today</span>' : '<span class="pill pill--ok">' + dayName + '</span>') +
        '</div>';

      // 1. Academic Event / Milestone Banner if exists
      if (event) {
        var bannerBg = event.type === 'exam' ? 'rgba(239, 68, 68, 0.15)' :
                       event.type === 'fee' ? 'rgba(245, 158, 11, 0.15)' :
                       event.type === 'deadline' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        var bannerBorder = event.type === 'exam' ? '#ef4444' :
                           event.type === 'fee' ? '#f59e0b' :
                           event.type === 'deadline' ? '#f87171' : '#10b981';

        html +=
          '<div style="background:' + bannerBg + '; border:1px solid ' + bannerBorder + '; border-radius:14px; padding:1rem; margin-top:0.75rem;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">' +
              '<strong style="color:#ffffff; font-size:0.95rem;">📌 ' + event.title + '</strong>' +
              '<span class="badge" style="background:rgba(255,255,255,0.1); color:#ffffff;">' + event.time + '</span>' +
            '</div>' +
            '<p style="margin:0; font-size:0.85rem; color:var(--muted-color);">' + event.desc + '</p>' +
          '</div>';
      }

      // 2. Class Slots List
      html += '<div style="display:flex; flex-direction:column; gap:0.65rem; margin-top:0.75rem;">';
      if (classes.length > 0) {
        classes.forEach(function (cls) {
          var isLab = cls.code.indexOf('-P') !== -1;
          html +=
            '<div class="cal-agenda-slot" style="' + (isLab ? 'border-left-color:#a855f7;' : '') + '">' +
              '<div class="cal-agenda-time">' + cls.time + '</div>' +
              '<div class="cal-agenda-details">' +
                '<strong>' + cls.title + ' (' + cls.code + ')</strong>' +
                '<small>' + cls.faculty + ' · ' + cls.room + '</small>' +
              '</div>' +
            '</div>';
        });
      } else {
        html += '<p style="color:var(--muted-color); font-size:0.9rem; margin:0.5rem 0;">No regular lectures scheduled for this date.</p>';
      }
      html += '</div>';

      container.innerHTML = html;
    });
  }

  // Initialize Calendar Navigation Controls
  function initCalendarControls() {
    // Prev Month
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cal-prev]')) {
        e.preventDefault();
        state.month--;
        if (state.month < 0) {
          state.month = 11;
          state.year--;
        }
        renderCalendar();
      }
    });

    // Next Month
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cal-next]')) {
        e.preventDefault();
        state.month++;
        if (state.month > 11) {
          state.month = 0;
          state.year++;
        }
        renderCalendar();
      }
    });

    // Today Button
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cal-today-btn]')) {
        e.preventDefault();
        state.year = 2026;
        state.month = 7;
        state.selectedDate = '2026-08-09';
        renderCalendar();
      }
    });

    // Month Select Dropdown
    document.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-cal-month-select]');
      if (sel) {
        state.month = parseInt(sel.value, 10);
        renderCalendar();
      }
    });

    // Year Select Dropdown
    document.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-cal-year-select]');
      if (sel) {
        state.year = parseInt(sel.value, 10);
        renderCalendar();
      }
    });

    // Calendar vs Timetable Matrix View Switcher
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cal-view-toggle]');
      if (btn) {
        e.preventDefault();
        var mode = btn.getAttribute('data-cal-view-toggle');
        document.querySelectorAll('[data-cal-view-toggle]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });

        var calGridArea = document.getElementById('calMonthViewArea');
        var matrixArea = document.getElementById('calMatrixViewArea');

        if (calGridArea && matrixArea) {
          if (mode === 'calendar') {
            calGridArea.style.display = 'grid';
            matrixArea.style.display = 'none';
          } else {
            calGridArea.style.display = 'none';
            matrixArea.style.display = 'block';
          }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCalendar();
    initCalendarControls();
  });

  window.StudentCalendar = {
    render: renderCalendar,
    goToDate: function (y, m, d) {
      state.year = y;
      state.month = m;
      state.selectedDate = formatDateStr(y, m, d);
      renderCalendar();
    }
  };

})();
