/* ==========================================================================
   CHARUSAT StudentHub — Admin Academic & Fee Management Sync (admin-sync.js)
   - Real-time synchronization between Admin Console and Student Dashboard
   - Interactive modal editor: CGPA, SGPA, attendance, subject marks, fees
   - Real-time persistence via portal-data.js (localStorage)
   ========================================================================== */

(function () {
  'use strict';

  function getStudent() {
    return window.StudentHubData ? window.StudentHubData.getStudent() : null;
  }

  // Update table row in admin.html with current live student profile
  function syncAdminTableRow() {
    var student = getStudent();
    if (!student) return;

    var row = document.querySelector('[data-admin-active-student-row]');
    if (!row) {
      // Find the first student row in table
      var tbody = document.querySelector('.table tbody');
      if (tbody && tbody.children.length > 0) {
        row = tbody.children[0];
        row.setAttribute('data-admin-active-student-row', 'true');
      }
    }

    if (row) {
      var nameEl = row.querySelector('.table__user b');
      var emailEl = row.querySelector('.table__user small');
      var rollEl = row.children[1];
      var deptEl = row.children[2];
      var attEl = row.children[3];
      var statusEl = row.children[4];

      if (nameEl) nameEl.textContent = student.fullName || '';
      if (emailEl) emailEl.textContent = student.email || (student.enrolment ? student.enrolment.toLowerCase() + '@charusat.edu.in' : '25it049@charusat.edu.in');
      if (rollEl) rollEl.textContent = student.enrolment || '25IT049';
      if (deptEl) deptEl.textContent = student.department || 'Information Technology';

      var avgAtt = student.overallAttendance || 86;
      if (attEl) {
        attEl.textContent = avgAtt + '%';
        attEl.style.color = avgAtt >= 75 ? '#34d399' : '#f87171';
        attEl.style.fontWeight = '700';
      }

      if (statusEl) {
        var pill = statusEl.querySelector('.pill');
        if (pill) {
          if (avgAtt < 75) {
            pill.className = 'pill pill--warn';
            pill.textContent = 'Low attendance';
          } else {
            pill.className = 'pill pill--ok';
            pill.textContent = 'Active';
          }
        }
      }

      var editBtn = row.querySelector('button');
      if (editBtn) {
        editBtn.setAttribute('data-admin-edit-btn', 'true');
        editBtn.onclick = function (e) {
          e.preventDefault();
          openAdminModal('profile');
        };
      }
    }

    // Sync CGPA / SGPA display in Marks Suite (Pane 3)
    var dispCgpa = document.querySelector('[data-admin-disp-cgpa]');
    var dispSgpa = document.querySelector('[data-admin-disp-sgpa]');
    if (dispCgpa && student.cgpa !== undefined) dispCgpa.textContent = Number(student.cgpa).toFixed(2);
    if (dispSgpa && student.sgpa !== undefined) dispSgpa.textContent = Number(student.sgpa).toFixed(2);

    // Sync Fee Invoice Card in Fees Pane (Pane 5)
    var feeCard = document.querySelector('.fee-invoice-card');
    if (feeCard && student.fees) {
      var fees = student.fees;
      var totalPay = Number(fees.totalPayable || 72500);
      var paid = Number(fees.amountPaid || 72500);
      var due = Number(fees.dueAmount !== undefined ? fees.dueAmount : Math.max(0, totalPay - paid));

      var statusBadge = feeCard.querySelector('.badge');
      if (statusBadge) {
        if (fees.paymentStatus === 'Paid' || due === 0) {
          statusBadge.className = 'badge badge--success';
          statusBadge.textContent = 'Reconciled / Paid ✅';
        } else if (fees.paymentStatus === 'Partial' || (paid > 0 && due > 0)) {
          statusBadge.className = 'badge badge--primary';
          statusBadge.textContent = 'Partial Balance Due ⚠️';
        } else {
          statusBadge.className = 'badge badge--danger';
          statusBadge.textContent = 'Payment Pending ❗';
        }
      }

      var totalEl = feeCard.querySelector('.fee-breakdown-row.total span:last-child');
      if (totalEl) totalEl.textContent = '₹' + totalPay.toLocaleString('en-IN');

      var breakdownRows = feeCard.querySelectorAll('.fee-breakdown-row');
      if (breakdownRows.length >= 6) {
        if (breakdownRows[4].children[1]) breakdownRows[4].children[1].textContent = '₹' + paid.toLocaleString('en-IN');
        if (breakdownRows[5].children[1]) breakdownRows[5].children[1].textContent = '₹' + due.toLocaleString('en-IN');
      }
    }
  }

  // Create or render the modal HTML
  function ensureAdminModal() {
    if (document.getElementById('adminStudentModal')) return;

    var modalHtml =
      '<div id="adminStudentModal" class="admin-modal-overlay" aria-hidden="true">' +
      '  <div class="admin-modal-window" role="dialog" aria-labelledby="adminModalTitle">' +
      '    <div class="admin-modal-header">' +
      '      <h2>' +
      '        <span style="font-size:1.5rem;">🎓</span>' +
      '        <span id="adminModalTitle">Manage Student Academic &amp; Fee Records</span>' +
      '      </h2>' +
      '      <button type="button" class="admin-modal-close-btn" id="closeAdminModal" aria-label="Close modal">' +
      '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
      '      </button>' +
      '    </div>' +
      '    <div class="admin-modal-tabs">' +
      '      <button class="admin-tab-btn is-active" type="button" data-admin-tab="profile">👤 Student Standing</button>' +
      '      <button class="admin-tab-btn" type="button" data-admin-tab="marks">📊 Subject Marks &amp; CGPA</button>' +
      '      <button class="admin-tab-btn" type="button" data-admin-tab="fees">💳 Fee Structure &amp; Status</button>' +
      '    </div>' +
      '    <div class="admin-modal-body">' +
      '      <!-- TAB 1: Profile & Standing -->' +
      '      <div class="admin-tab-panel is-active" id="panel-profile">' +
      '        <div class="admin-input-grid">' +
      '          <div class="admin-field">' +
      '            <label for="adm_fullName">Full Student Name</label>' +
      '            <input type="text" id="adm_fullName" placeholder="e.g. Tirth Ladani">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_enrolment">Roll / Enrolment Number</label>' +
      '            <input type="text" id="adm_enrolment" placeholder="e.g. 25IT049">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_department">Department / Branch</label>' +
      '            <input type="text" id="adm_department" placeholder="e.g. Information Technology">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_semester">Semester</label>' +
      '            <input type="number" id="adm_semester" min="1" max="8" placeholder="5">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_cgpa">Cumulative CGPA</label>' +
      '            <input type="number" step="0.01" min="0" max="10" id="adm_cgpa" placeholder="8.64">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_sgpa">Current Semester SGPA</label>' +
      '            <input type="number" step="0.01" min="0" max="10" id="adm_sgpa" placeholder="8.85">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_attendance">Overall Attendance (%)</label>' +
      '            <input type="number" min="0" max="100" id="adm_attendance" placeholder="86">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_academicStatus">Academic Standing</label>' +
      '            <select id="adm_academicStatus">' +
      '              <option value="Distinction">First Class with Distinction</option>' +
      '              <option value="First Class">First Class</option>' +
      '              <option value="Second Class">Second Class</option>' +
      '              <option value="Pass Class">Pass Class</option>' +
      '            </select>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '      <!-- TAB 2: Subject Marks -->' +
      '      <div class="admin-tab-panel" id="panel-marks">' +
      '        <p style="color:var(--muted-color); font-size:0.9rem; margin-top:0;">' +
      '          Modify continuous evaluation, mid-sem and assignment scores. Changes immediately compute totals and grades on student dashboard.' +
      '        </p>' +
      '        <div style="overflow-x:auto;">' +
      '          <table class="admin-marks-editor-table">' +
      '            <thead>' +
      '              <tr>' +
      '                <th>Code</th>' +
      '                <th>Subject</th>' +
      '                <th>Att %</th>' +
      '                <th>Internal (30)</th>' +
      '                <th>MidSem (50)</th>' +
      '                <th>Assign (20)</th>' +
      '                <th>Total</th>' +
      '                <th>Grade</th>' +
      '              </tr>' +
      '            </thead>' +
      '            <tbody id="adm_subjects_body">' +
      '            </tbody>' +
      '          </table>' +
      '        </div>' +
      '      </div>' +
      '      <!-- TAB 3: Fee Structure -->' +
      '      <div class="admin-tab-panel" id="panel-fees">' +
      '        <div class="admin-input-grid">' +
      '          <div class="admin-field">' +
      '            <label for="adm_totalPayable">Total Semester Payable (₹)</label>' +
      '            <input type="number" id="adm_totalPayable" placeholder="72500">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_amountPaid">Amount Paid / Reconciled (₹)</label>' +
      '            <input type="number" id="adm_amountPaid" placeholder="72500">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_dueAmount">Outstanding Dues (₹)</label>' +
      '            <input type="number" id="adm_dueAmount" placeholder="0">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_paymentStatus">Accounts Clearance Status</label>' +
      '            <select id="adm_paymentStatus">' +
      '              <option value="Paid">Paid (Full Cleared)</option>' +
      '              <option value="Pending">Pending (Unpaid)</option>' +
      '              <option value="Partial">Partial (Balance Due)</option>' +
      '            </select>' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_receiptNumber">Official Receipt Number</label>' +
      '            <input type="text" id="adm_receiptNumber" placeholder="CHARUSAT-FEE-2026-99412">' +
      '          </div>' +
      '          <div class="admin-field">' +
      '            <label for="adm_paymentDate">Payment Reconciled Date</label>' +
      '            <input type="text" id="adm_paymentDate" placeholder="28 July 2026">' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="admin-modal-footer">' +
      '      <button type="button" class="btn btn--ghost btn--sm" id="admResetDefaultBtn">↺ Reset Baseline</button>' +
      '      <div style="display:flex; gap:0.75rem;">' +
      '        <button type="button" class="btn btn--light btn--sm" id="admCancelBtn">Cancel</button>' +
      '        <button type="button" class="btn btn--primary btn--sm" id="admSaveBtn" style="background:#10b981; border-color:#10b981; font-weight:700;">' +
      '          💾 Save &amp; Sync to Student Dashboard' +
      '        </button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<div id="adminSaveToast" class="admin-toast">' +
      '  <span style="font-size:1.4rem;">✅</span>' +
      '  <div><strong>Records Updated Live!</strong><br><small style="color:var(--muted-color);">Student dashboard now displays these verified marks &amp; fee structure.</small></div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind Tabs inside modal
    var tabBtns = document.querySelectorAll('[data-admin-tab]');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-admin-tab');
        tabBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        document.getElementById('panel-profile').classList.toggle('is-active', target === 'profile');
        document.getElementById('panel-marks').classList.toggle('is-active', target === 'marks');
        document.getElementById('panel-fees').classList.toggle('is-active', target === 'fees');
      });
    });

    // Close handlers
    document.getElementById('closeAdminModal').onclick = closeAdminModal;
    document.getElementById('admCancelBtn').onclick = closeAdminModal;
    document.getElementById('admSaveBtn').onclick = saveAdminChanges;
    document.getElementById('admResetDefaultBtn').onclick = function () {
      if (confirm('Reset student records to university factory default baseline?')) {
        StudentHubData.resetToDefault();
        populateModalForm();
        syncAdminTableRow();
        showToast();
      }
    };
  }

  function openAdminModal(targetTab) {
    ensureAdminModal();
    populateModalForm();
    if (targetTab) {
      var tabBtn = document.querySelector('[data-admin-tab="' + targetTab + '"]');
      if (tabBtn) tabBtn.click();
    }
    var modal = document.getElementById('adminStudentModal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeAdminModal() {
    var modal = document.getElementById('adminStudentModal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  window.openAdminModal = openAdminModal;
  window.closeAdminModal = closeAdminModal;

  function populateModalForm() {
    var student = getStudent();
    if (!student) return;

    // Tab 1
    var fName = document.getElementById('adm_fullName');
    var enrol = document.getElementById('adm_enrolment');
    var dept = document.getElementById('adm_department');
    var sem = document.getElementById('adm_semester');
    var cgpa = document.getElementById('adm_cgpa');
    var sgpa = document.getElementById('adm_sgpa');
    var att = document.getElementById('adm_attendance');
    var aStatus = document.getElementById('adm_academicStatus');

    if (fName) fName.value = student.fullName || '';
    if (enrol) enrol.value = student.enrolment || '25IT049';
    if (dept) dept.value = student.department || 'Information Technology';
    if (sem) sem.value = student.semester || '5';
    if (cgpa) cgpa.value = student.cgpa || '8.64';
    if (sgpa) sgpa.value = student.sgpa || '8.85';
    if (att) att.value = student.overallAttendance || '86';
    if (aStatus) aStatus.value = student.academicStatus || 'Distinction';

    // Tab 2: Subjects
    var tbody = document.getElementById('adm_subjects_body');
    if (tbody && student.subjects) {
      tbody.innerHTML = '';
      student.subjects.forEach(function (sub, i) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><strong>' + sub.code + '</strong></td>' +
          '<td><small style="color:#ffffff;">' + sub.name + '</small></td>' +
          '<td><input type="number" min="0" max="100" id="adm_sub_att_' + i + '" value="' + sub.attendance + '"></td>' +
          '<td><input type="number" min="0" max="30" id="adm_sub_int_' + i + '" value="' + sub.internalMarks + '"></td>' +
          '<td><input type="number" min="0" max="50" id="adm_sub_mid_' + i + '" value="' + sub.midSemMarks + '"></td>' +
          '<td><input type="number" min="0" max="20" id="adm_sub_ass_' + i + '" value="' + sub.assignmentMarks + '"></td>' +
          '<td><strong id="adm_sub_tot_' + i + '">' + sub.totalMarks + '</strong></td>' +
          '<td><select id="adm_sub_grd_' + i + '">' +
            '<option value="AA"' + (sub.grade === 'AA' ? ' selected' : '') + '>AA</option>' +
            '<option value="AB"' + (sub.grade === 'AB' ? ' selected' : '') + '>AB</option>' +
            '<option value="BB"' + (sub.grade === 'BB' ? ' selected' : '') + '>BB</option>' +
            '<option value="BC"' + (sub.grade === 'BC' ? ' selected' : '') + '>BC</option>' +
            '<option value="CC"' + (sub.grade === 'CC' ? ' selected' : '') + '>CC</option>' +
            '<option value="CD"' + (sub.grade === 'CD' ? ' selected' : '') + '>CD</option>' +
            '<option value="DD"' + (sub.grade === 'DD' ? ' selected' : '') + '>DD</option>' +
            '<option value="FF"' + (sub.grade === 'FF' ? ' selected' : '') + '>FF</option>' +
          '</select></td>';

        // Auto sum listener
        var intInp = tr.querySelector('#adm_sub_int_' + i);
        var midInp = tr.querySelector('#adm_sub_mid_' + i);
        var assInp = tr.querySelector('#adm_sub_ass_' + i);
        var totSpan = tr.querySelector('#adm_sub_tot_' + i);

        function calc() {
          var tot = (Number(intInp.value) || 0) + (Number(midInp.value) || 0) + (Number(assInp.value) || 0);
          totSpan.textContent = tot;
        }

        intInp.addEventListener('input', calc);
        midInp.addEventListener('input', calc);
        assInp.addEventListener('input', calc);

        tbody.appendChild(tr);
      });
    }

    // Tab 3: Fees
    var fees = student.fees || {};
    var totalPayable = document.getElementById('adm_totalPayable');
    var amountPaid = document.getElementById('adm_amountPaid');
    var dueAmount = document.getElementById('adm_dueAmount');
    var feeStatus = document.getElementById('adm_paymentStatus');
    var receipt = document.getElementById('adm_receiptNumber');
    var payDate = document.getElementById('adm_paymentDate');

    if (totalPayable) totalPayable.value = fees.totalPayable || 72500;
    if (amountPaid) amountPaid.value = fees.amountPaid || 72500;
    if (dueAmount) dueAmount.value = fees.dueAmount !== undefined ? fees.dueAmount : 0;
    if (feeStatus) feeStatus.value = fees.paymentStatus || 'Paid';
    if (receipt) receipt.value = fees.receiptNumber || 'CHARUSAT-FEE-2026-99412';
    if (payDate) payDate.value = fees.paymentDate || '28 July 2026';

    // Auto calculate due amount when total or paid changes
    if (totalPayable && amountPaid && dueAmount) {
      function calcFee() {
        var tot = Number(totalPayable.value) || 0;
        var paid = Number(amountPaid.value) || 0;
        var due = Math.max(0, tot - paid);
        dueAmount.value = due;
        if (feeStatus) {
          if (due === 0 && paid > 0) feeStatus.value = 'Paid';
          else if (paid > 0 && due > 0) feeStatus.value = 'Partial';
          else if (paid === 0) feeStatus.value = 'Pending';
        }
      }
      totalPayable.addEventListener('input', calcFee);
      amountPaid.addEventListener('input', calcFee);
    }
  }

  function saveAdminChanges() {
    var student = getStudent();
    if (!student) return;

    var fName = document.getElementById('adm_fullName');
    var enrol = document.getElementById('adm_enrolment');
    var dept = document.getElementById('adm_department');
    var sem = document.getElementById('adm_semester');
    var cgpa = document.getElementById('adm_cgpa');
    var sgpa = document.getElementById('adm_sgpa');
    var att = document.getElementById('adm_attendance');
    var aStatus = document.getElementById('adm_academicStatus');

    var updated = {
      fullName: fName ? fName.value.trim() : student.fullName,
      enrolment: enrol ? enrol.value.trim() : student.enrolment,
      department: dept ? dept.value.trim() : student.department,
      semester: sem ? sem.value.trim() : student.semester,
      cgpa: cgpa ? Number(cgpa.value) : student.cgpa,
      sgpa: sgpa ? Number(sgpa.value) : student.sgpa,
      overallAttendance: att ? Number(att.value) : student.overallAttendance,
      academicStatus: aStatus ? aStatus.value : student.academicStatus
    };

    // Gather subjects
    if (student.subjects) {
      var updatedSubjects = student.subjects.map(function (sub, i) {
        var subAtt = document.getElementById('adm_sub_att_' + i);
        var subInt = document.getElementById('adm_sub_int_' + i);
        var subMid = document.getElementById('adm_sub_mid_' + i);
        var subAss = document.getElementById('adm_sub_ass_' + i);
        var subGrd = document.getElementById('adm_sub_grd_' + i);

        var internal = subInt ? Number(subInt.value) : sub.internalMarks;
        var midsem = subMid ? Number(subMid.value) : sub.midSemMarks;
        var assignment = subAss ? Number(subAss.value) : sub.assignmentMarks;
        var total = internal + midsem + assignment;

        return Object.assign({}, sub, {
          attendance: subAtt ? Number(subAtt.value) : sub.attendance,
          internalMarks: internal,
          midSemMarks: midsem,
          assignmentMarks: assignment,
          totalMarks: total,
          grade: subGrd ? subGrd.value : sub.grade
        });
      });
      updated.subjects = updatedSubjects;
    }

    // Gather fees
    var totalPayable = document.getElementById('adm_totalPayable');
    var amountPaid = document.getElementById('adm_amountPaid');
    var dueAmount = document.getElementById('adm_dueAmount');
    var feeStatus = document.getElementById('adm_paymentStatus');
    var receipt = document.getElementById('adm_receiptNumber');
    var payDate = document.getElementById('adm_paymentDate');

    updated.fees = Object.assign({}, student.fees, {
      totalPayable: totalPayable ? Number(totalPayable.value) : 72500,
      amountPaid: amountPaid ? Number(amountPaid.value) : 72500,
      dueAmount: dueAmount ? Number(dueAmount.value) : 0,
      paymentStatus: feeStatus ? feeStatus.value : 'Paid',
      receiptNumber: receipt ? receipt.value.trim() : 'CHARUSAT-FEE-2026-99412',
      paymentDate: payDate ? payDate.value.trim() : '28 July 2026'
    });

    // Save to localStorage and dispatch event
    StudentHubData.saveStudent(updated);

    // Update table in admin console
    syncAdminTableRow();

    // Close modal & show toast
    closeAdminModal();
    showToast();
  }

  function showToast() {
    var toast = document.getElementById('adminSaveToast');
    if (toast) {
      toast.classList.add('is-shown');
      setTimeout(function () {
        toast.classList.remove('is-shown');
      }, 4000);
    }
  }

  // Practical 13 Intermediate Extension: Debounce Utility
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay || 300);
    };
  }

  // 1. Live Student Directory Search & Department Filter with Debounce (Practical 13)
  // and Interactive Active/Inactive Status Toggle (Practical 14)
  function setupStudentSearchAndFilter() {
    var searchInput = document.getElementById('adminStudentSearchInput');
    var deptFilter = document.getElementById('adminStudentDeptFilter');
    var tbody = document.getElementById('adminStudentTableBody');
    if (!tbody) return;

    function applyFilter() {
      var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      var dept = deptFilter ? deptFilter.value : 'all';
      var rows = tbody.querySelectorAll('tr:not(.no-results-row)');
      var visibleCount = 0;

      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        var rowDept = row.children[2] ? row.children[2].textContent.trim() : '';

        var matchesQuery = !q || text.indexOf(q) !== -1;
        var matchesDept = (dept === 'all') || (rowDept === dept);

        if (matchesQuery && matchesDept) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      var existingNoResults = tbody.querySelector('.no-results-row');
      if (visibleCount === 0) {
        if (!existingNoResults) {
          var tr = document.createElement('tr');
          tr.className = 'no-results-row';
          tr.innerHTML = '<td colspan="6" style="text-align:center; padding:2.5rem; color:var(--muted-color); font-size:0.95rem;">🔍 No student records found matching your search criteria.</td>';
          tbody.appendChild(tr);
        }
      } else if (existingNoResults) {
        existingNoResults.remove();
      }
    }

    // Debounced search handler (waits 300ms after user stops typing)
    if (searchInput) {
      searchInput.addEventListener('input', debounce(applyFilter, 300));
    }
    if (deptFilter) {
      deptFilter.addEventListener('change', applyFilter);
    }

    // Practical 14 Intermediate Extension: Active/Inactive Status Toggle
    tbody.addEventListener('click', function (e) {
      var toggleBtn = e.target.closest('.admin-status-toggle');
      if (!toggleBtn) return;
      var currentStatus = toggleBtn.getAttribute('data-status') || 'Active';
      var newStatus = (currentStatus === 'Active') ? 'Inactive' : 'Active';
      var studentId = toggleBtn.getAttribute('data-id') || '1';

      toggleBtn.setAttribute('data-status', newStatus);
      if (newStatus === 'Active') {
        toggleBtn.className = 'badge badge--success admin-status-toggle';
        toggleBtn.textContent = 'Active ✓';
        toggleBtn.style.cursor = 'pointer';
      } else {
        toggleBtn.className = 'badge badge--danger admin-status-toggle';
        toggleBtn.textContent = 'Inactive ✕';
        toggleBtn.style.cursor = 'pointer';
      }

      // Sync status asynchronously via AJAX PUT to backend API (Practical 13)
      fetch('../api/students.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(studentId, 10), status: newStatus })
      }).catch(function (err) {
        console.warn('Student status toggle sync note:', err);
      });
    });
  }

  // 2. Registrar Approvals Queue interactive actions
  function setupApprovalsQueue() {
    var tbody = document.getElementById('adminApprovalsTableBody');
    var counter = document.getElementById('adminPendingCount');
    if (!tbody) return;

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var tr = btn.closest('tr');
      if (!tr) return;

      var isApprove = btn.classList.contains('admin-approve-btn') || btn.textContent.indexOf('Approve') !== -1;
      var isReject = btn.classList.contains('admin-reject-btn') || btn.textContent.indexOf('Reject') !== -1;
      if (!isApprove && !isReject) return;

      var statusBadge = tr.querySelector('.badge');
      var actionCell = tr.querySelector('td:last-child');

      if (isApprove) {
        if (statusBadge) {
          statusBadge.className = 'badge badge--success';
          statusBadge.textContent = 'Approved ✅';
        }
        if (actionCell) {
          actionCell.innerHTML = '<span style="color:#34d399; font-size:0.85rem; font-weight:700;">Authorized</span>';
        }
      } else {
        if (statusBadge) {
          statusBadge.className = 'badge badge--danger';
          statusBadge.textContent = 'Declined ❌';
        }
        if (actionCell) {
          actionCell.innerHTML = '<span style="color:#f87171; font-size:0.85rem; font-weight:700;">Rejected</span>';
        }
      }

      if (counter) {
        var current = parseInt(counter.textContent, 10) || 5;
        if (current > 0) counter.textContent = current - 1;
      }
    });
  }

  // 3. Broadcast Notice persistence & live feed
  function setupBroadcastNotices() {
    var form = document.getElementById('adminNoticeForm');
    var container = document.getElementById('adminNoticeListContainer');
    if (!form) return;

    var DEFAULT_NOTICES = [
      { id: 'n1', title: 'Mid-Semester Theory Examination Timetable Released', category: 'Examination Cell', priority: 'High', date: '12 Aug 2026', body: 'Schedule published for all B.Tech branches. Students are requested to check room allocations.' },
      { id: 'n2', title: 'TCS & Infosys Campus Placement Drive Registration Open', category: 'Training & Placement', priority: 'Urgent', date: '10 Aug 2026', body: 'Final and pre-final year engineering students eligible. Submit verified CGPA records before 20 Aug.' },
      { id: 'n3', title: 'Semester 5 Biometric Attendance Deficiency Warning', category: 'Academic Affairs', priority: 'Normal', date: '08 Aug 2026', body: 'Students having attendance below 75% must contact department counselors immediately.' }
    ];

    function getNotices() {
      try {
        var raw = localStorage.getItem('charusat_campus_notices');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_NOTICES;
    }

    function saveNotices(notices) {
      try {
        localStorage.setItem('charusat_campus_notices', JSON.stringify(notices));
      } catch (e) {}
    }

    function renderNotices() {
      if (!container) return;
      var notices = getNotices();
      if (!notices.length) {
        container.innerHTML = '<p style="color:var(--muted-color); text-align:center; padding:1.5rem;">No active broadcasts at this moment.</p>';
        return;
      }
      var html = '<div style="display:flex; flex-direction:column; gap:0.9rem; margin-top:1.5rem;">';
      notices.forEach(function (n, idx) {
        var pClass = n.priority === 'Urgent' ? 'badge--danger' : (n.priority === 'High' ? 'badge--primary' : 'badge--success');
        html += '<div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:1.1rem 1.4rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">' +
          '<div>' +
            '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem; flex-wrap:wrap;">' +
              '<span class="badge ' + pClass + '">' + n.priority + '</span>' +
              '<span style="color:var(--accent-color); font-size:0.8rem; font-weight:700;">' + n.category + '</span>' +
              '<small style="color:var(--muted-color);">' + n.date + '</small>' +
            '</div>' +
            '<b style="color:#fff; font-size:1.02rem; display:block; margin-bottom:0.25rem;">' + n.title + '</b>' +
            '<p style="color:var(--muted-color); font-size:0.88rem; margin:0; line-height:1.5;">' + n.body + '</p>' +
          '</div>' +
          '<button type="button" class="btn btn--outline btn--sm" data-notice-remove="' + idx + '" style="color:#f87171; border-color:rgba(239,68,68,0.4); padding:0.3rem 0.65rem; font-size:0.75rem; white-space:nowrap;">Retract ✕</button>' +
        '</div>';
      });
      html += '</div>';
      container.innerHTML = html;

      // Bind remove buttons
      container.querySelectorAll('[data-notice-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var index = parseInt(btn.getAttribute('data-notice-remove'), 10);
          var list = getNotices();
          list.splice(index, 1);
          saveNotices(list);
          renderNotices();
        });
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var title = document.getElementById('noticeTitle').value.trim();
      var category = document.getElementById('noticeCategory').value;
      var priority = document.getElementById('noticePriority').value.split(' ')[0];
      var body = document.getElementById('noticeBody').value.trim();

      if (!title || !body) return;

      var newNotice = {
        id: 'n_' + Date.now(),
        title: title,
        category: category,
        priority: priority,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        body: body
      };

      var list = getNotices();
      list.unshift(newNotice);
      saveNotices(list);
      form.reset();
      renderNotices();

      var toast = document.getElementById('adminSaveToast');
      if (toast) {
        toast.querySelector('strong').textContent = 'Campus Notice Broadcasted!';
        toast.querySelector('small').textContent = 'Announcement is now live on all student dashboards.';
        toast.classList.add('is-shown');
        setTimeout(function () { toast.classList.remove('is-shown'); }, 3500);
      }
    });

    renderNotices();
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncAdminTableRow();
    ensureAdminModal();
    setupStudentSearchAndFilter();
    setupApprovalsQueue();
    setupBroadcastNotices();

    // In quick actions, bind "Manage Student Academic & Fee Records"
    var quickActionBtns = document.querySelectorAll('.stack button');
    quickActionBtns.forEach(function (btn) {
      if (btn.textContent.indexOf('Add a student record') !== -1 || btn.textContent.indexOf('Manage Student Academic') !== -1) {
        btn.onclick = function () {
          openAdminModal('profile');
        };
      }
    });

    // Support data-admin-open-tab
    document.querySelectorAll('[data-admin-open-editor]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var tab = btn.getAttribute('data-admin-open-tab') || 'profile';
        openAdminModal(tab);
      };
    });

    window.addEventListener('charusat:data-updated', function () {
      syncAdminTableRow();
    });
  });

})();
