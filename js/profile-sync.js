/* ==========================================================================
   CHARUSAT StudentHub — Profile Persistence & Interaction Engine (profile-sync.js)
   - Synchronizes enrolment profile data with localStorage (charusat_student_data)
   - Pre-fills saved details upon opening profile.html
   - Updates real-time progress meter, conic ring, tags, and verification badge
   - Supports 4-step wizard navigation, checklist jump, and address auto-sync
   - Base64 avatar upload with live preview in top header and photo frame
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.StudentHubData) return;

    var student = StudentHubData.getStudent();
    var form = document.querySelector('[data-profile-form]');
    var inputs = document.querySelectorAll('[data-key]');
    var nameHeader = document.querySelector('[data-pf-name]');
    var subHeader = document.querySelector('[data-pf-sub]');
    var tagsContainer = document.querySelector('[data-pf-tags]');
    var initialsEl = document.querySelector('[data-ava-initials]');
    var photoInitials = document.querySelector('[data-photo-initials]');
    var saveStatus = document.querySelector('[data-autosave] span');
    var meterBar = document.querySelector('[data-pf-meter]');
    var meterPct = document.querySelector('[data-ring-pct]');
    var meterHint = document.querySelector('[data-pf-hint]');
    var verifEl = document.querySelector('[data-verif]');
    var ringEl = document.querySelector('[data-ring]');
    var checklistEl = document.querySelector('[data-checklist]');
    var dotsContainer = document.querySelector('[data-dots]');
    var sameAddressCheck = document.querySelector('[data-same-address]');

    var stepButtons = document.querySelectorAll('[data-step]');
    var panes = document.querySelectorAll('[data-pane]');
    var stepTitle = document.querySelector('[data-step-title]');
    var stepCount = document.querySelector('[data-step-count]');
    var nextBtn = document.querySelector('[data-next]');
    var backBtn = document.querySelector('[data-back]');
    var veil = document.querySelector('[data-done-veil]');
    var stayBtn = document.querySelector('[data-stay]');
    var currentStep = 1;

    var titles = [
      'Personal details',
      'Contact details',
      'Academic details',
      'Review and save'
    ];

    var stepRequiredKeys = {
      1: ['enrolment', 'fullName', 'fatherName', 'motherName', 'dob', 'gender', 'category'],
      2: ['mobile', 'email', 'parentMobile', 'permanentAddress', 'city', 'district', 'state', 'pin'],
      3: ['institute', 'department', 'programme', 'admissionYear', 'semester']
    };

    var keyLabels = {
      enrolment: 'Enrolment No',
      fullName: 'Full Name',
      fatherName: "Father's Name",
      motherName: "Mother's Name",
      dob: 'Date of Birth',
      gender: 'Gender',
      category: 'Category',
      mobile: 'Mobile',
      email: 'College Email',
      parentMobile: "Parent's Mobile",
      permanentAddress: 'Permanent Address',
      city: 'City',
      district: 'District',
      state: 'State',
      pin: 'PIN Code',
      institute: 'Institute',
      department: 'Department',
      programme: 'Programme',
      admissionYear: 'Admission Year',
      semester: 'Semester'
    };

    // 1. Pre-fill form from StudentHubData
    function populateForm() {
      inputs.forEach(function (input) {
        var key = input.getAttribute('data-key');
        if (student[key] !== undefined && student[key] !== '') {
          input.value = student[key];
        }
      });

      // Populate avatar if present
      if (student.avatar) {
        applyAvatar(student.avatar);
      }

      updateVisuals();
      renderDots();
      renderChecklist();
    }

    function applyAvatar(avatarSrc) {
      var photoFrame = document.querySelector('[data-photo-frame]');
      var avaEl = document.querySelector('[data-ava]');
      if (photoFrame) {
        photoFrame.innerHTML = '<img src="' + avatarSrc + '" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;" alt="Passport Photo">';
      }
      if (avaEl) {
        avaEl.innerHTML = '<img src="' + avatarSrc + '" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;" alt="Student Avatar">';
      }
    }

    // 2. Update visual badges & progress
    function updateVisuals() {
      var fullName = (student.fullName || '').trim() || '';
      var enrolment = (student.enrolment || '').trim() || '25IT049';
      var dept = (student.department || '').trim() || 'Information Technology';
      var sem = student.semester ? 'Semester ' + student.semester : 'Semester 5';

      if (nameHeader) nameHeader.textContent = fullName;
      if (subHeader) subHeader.textContent = enrolment + ' · ' + sem + ' · ' + dept;

      // Update tags
      if (tagsContainer) {
        var tagsHtml = '';
        if (enrolment) tagsHtml += '<span class="chip">🎓 ' + enrolment + '</span>';
        if (student.programme) tagsHtml += '<span class="chip">' + student.programme + '</span>';
        if (student.department) tagsHtml += '<span class="chip">' + student.department + '</span>';
        if (student.division) tagsHtml += '<span class="chip">Div ' + student.division + '</span>';
        tagsContainer.innerHTML = tagsHtml;
      }

      var initials = fullName.split(' ').filter(Boolean).map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase() || 'TL';
      if (initialsEl && !student.avatar) initialsEl.textContent = initials;
      if (photoInitials && !student.avatar) photoInitials.textContent = initials;

      // Calculate completeness percentage
      var filled = 0;
      var total = inputs.length;
      inputs.forEach(function (inp) {
        if (inp.value.trim()) filled++;
      });
      var pct = Math.round((filled / Math.max(total, 1)) * 100);

      if (meterBar) {
        meterBar.style.width = pct + '%';
        if (pct === 100) meterBar.classList.add('is-full');
        else meterBar.classList.remove('is-full');
      }

      if (meterPct) meterPct.textContent = pct + '%';

      if (ringEl) {
        ringEl.style.setProperty('--pct', pct);
        if (pct === 100) ringEl.classList.add('is-full');
        else ringEl.classList.remove('is-full');
      }

      if (meterHint) {
        meterHint.textContent = pct === 100 ? '✨ Enrolment profile fully completed!' : (filled + ' of ' + total + ' fields filled (' + pct + '%)');
      }

      if (verifEl) {
        if (pct >= 80) {
          verifEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z"/><path d="m9 12 2 2 4-4"/></svg><span>Authenticated Enrolment</span>';
          verifEl.classList.add('is-verified');
        } else {
          verifEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Incomplete Enrolment</span>';
          verifEl.classList.remove('is-verified');
        }
      }
    }

    // 3. Render quick jump checklist for missing items
    function renderChecklist() {
      if (!checklistEl) return;
      checklistEl.innerHTML = '';

      var missingCount = 0;
      var maxItems = 6;

      Object.keys(stepRequiredKeys).forEach(function (sNum) {
        var step = parseInt(sNum, 10);
        var keys = stepRequiredKeys[step];

        keys.forEach(function (key) {
          var inp = document.querySelector('[data-key="' + key + '"]');
          if (inp && !inp.value.trim() && missingCount < maxItems) {
            missingCount++;
            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pf-check__btn';
            btn.textContent = '+ ' + (keyLabels[key] || key);
            btn.onclick = function () {
              goToStep(step);
              setTimeout(function () {
                if (inp) {
                  inp.focus();
                  inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 150);
            };
            li.appendChild(btn);
            checklistEl.appendChild(li);
          }
        });
      });

      if (missingCount === 0) {
        var liDone = document.createElement('li');
        liDone.className = 'pf-check__done';
        liDone.innerHTML = '<span>✓ All required fields completed</span>';
        checklistEl.appendChild(liDone);
      }
    }

    // 4. Render Step Dots
    function renderDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (var i = 1; i <= 4; i++) {
        var dot = document.createElement('i');
        if (i === currentStep) dot.classList.add('is-on');
        dotsContainer.appendChild(dot);
      }
    }

    // 5. Save to storage on input
    function saveAll() {
      var dataToSave = {};
      inputs.forEach(function (input) {
        var key = input.getAttribute('data-key');
        dataToSave[key] = input.value.trim();
      });
      dataToSave.profileCompleted = true;
      student = StudentHubData.saveStudent(dataToSave);

      if (saveStatus) {
        saveStatus.textContent = 'Saved to portal';
        setTimeout(function () {
          if (saveStatus) saveStatus.textContent = 'Auto-saved locally';
        }, 1500);
      }

      updateVisuals();
      renderChecklist();
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', saveAll);
      input.addEventListener('change', saveAll);
    });

    // 6. Handle same address copy
    if (sameAddressCheck) {
      sameAddressCheck.addEventListener('change', function () {
        if (this.checked) {
          var perm = document.getElementById('permanentAddress');
          var curr = document.getElementById('currentAddress');
          if (perm && curr) {
            curr.value = perm.value;
            saveAll();
          }
        }
      });
    }

    // 7. Handle photo upload preview as base64
    var photoInput = document.querySelector('[data-upload="photo"]');
    if (photoInput) {
      photoInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (evt) {
            student.avatar = evt.target.result;
            StudentHubData.saveStudent({ avatar: evt.target.result });
            applyAvatar(evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // 8. Wizard navigation
    function goToStep(s) {
      if (s < 1) s = 1;
      if (s > 4) s = 4;
      currentStep = s;

      panes.forEach(function (p) {
        var pNum = parseInt(p.getAttribute('data-pane'), 10);
        p.classList.toggle('is-active', pNum === currentStep);
        p.setAttribute('aria-hidden', String(pNum !== currentStep));
      });

      stepButtons.forEach(function (b) {
        var bNum = parseInt(b.getAttribute('data-step'), 10);
        b.classList.toggle('is-current', bNum === currentStep);
        b.classList.toggle('is-done', bNum < currentStep);
        if (bNum === currentStep) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });

      if (stepTitle) stepTitle.textContent = titles[currentStep - 1];
      if (stepCount) stepCount.textContent = 'Step ' + currentStep + ' of 4';

      if (nextBtn) {
        nextBtn.textContent = currentStep === 4 ? 'Save & Open Dashboard →' : 'Save and continue →';
      }

      renderDots();

      if (currentStep === 4) {
        renderReviewSummary();
      }

      window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    function renderReviewSummary() {
      var cur = StudentHubData.getStudent();

      var reviewFields = document.querySelectorAll('[data-review]');
      reviewFields.forEach(function (el) {
        var key = el.getAttribute('data-review');
        if (key && cur[key]) {
          el.textContent = cur[key];
        } else if (key && key === 'mobile' && cur.phone) {
          el.textContent = cur.phone;
        } else if (key && key === 'parentMobile' && cur.emergencyPhone) {
          el.textContent = cur.emergencyPhone;
        } else {
          el.textContent = '—';
        }
      });

      var reviewBox = document.querySelector('[data-review-summary]');
      if (reviewBox) {
        reviewBox.innerHTML =
          '<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">' +
            '<div style="background:rgba(255,255,255,0.04); padding:1rem 1.25rem; border-radius:14px; border:1px solid var(--glass-border);">' +
              '<small style="color:var(--muted-color); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.06em; font-weight:700;">Full Student Name</small>' +
              '<p style="margin:4px 0 0; font-weight:800; font-size:1.05rem; color:#ffffff;">' + (cur.fullName || '') + '</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04); padding:1rem 1.25rem; border-radius:14px; border:1px solid var(--glass-border);">' +
              '<small style="color:var(--muted-color); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.06em; font-weight:700;">Enrolment Number</small>' +
              '<p style="margin:4px 0 0; font-weight:800; font-size:1.05rem; color:#38bdf8;">' + (cur.enrolment || '25IT049') + '</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04); padding:1rem 1.25rem; border-radius:14px; border:1px solid var(--glass-border);">' +
              '<small style="color:var(--muted-color); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.06em; font-weight:700;">Department & Programme</small>' +
              '<p style="margin:4px 0 0; font-weight:700; font-size:0.95rem; color:#ffffff;">' + (cur.department || 'Information Technology') + ' (' + (cur.programme || 'B.Tech') + ')</p>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.04); padding:1rem 1.25rem; border-radius:14px; border:1px solid var(--glass-border);">' +
              '<small style="color:var(--muted-color); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.06em; font-weight:700;">Semester & Standing</small>' +
              '<p style="margin:4px 0 0; font-weight:700; font-size:0.95rem; color:#34d399;">Semester ' + (cur.semester || '5') + ' (Div ' + (cur.division || 'A') + ') · Active</p>' +
            '</div>' +
          '</div>';
      }
    }

    stepButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        var s = parseInt(b.getAttribute('data-step'), 10);
        goToStep(s);
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        saveAll();
        if (currentStep === 4) {
          if (veil) {
            veil.classList.add('is-shown');
            veil.classList.add('is-open');
          }
        } else {
          goToStep(currentStep + 1);
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        goToStep(currentStep - 1);
      });
    }

    if (stayBtn && veil) {
      stayBtn.addEventListener('click', function () {
        veil.classList.remove('is-shown');
        veil.classList.remove('is-open');
      });
    }

    populateForm();
  });
})();
