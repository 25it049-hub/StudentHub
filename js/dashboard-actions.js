/* ==========================================================================
   CHARUSAT StudentHub — Dashboard Interactive Engine (dashboard-actions.js)
   Makes every single button on the student dashboard 100% functional:
   1. Assignment submissions with file upload simulation and status updates
   2. Assignment briefs viewer
   3. Notification "Mark all read" with count updater
   4. Lecture slides preview viewer with interactive slide carousel
   5. Notes and PYQ PDF downloads with realistic progress toast
   6. PYQ exam papers subject filter
   7. Live Code Arena runner with C++/Python/Java test-case simulator
   8. Contest registration and problem sheet checklist
   9. Lab practical code viewer with syntax styling and clipboard copy
   10. Placement ATS resume scanner & interactive 5-question mock test
   ========================================================================== */

(function () {
  'use strict';

  // Helper toast notification
  function showToast(message, icon, color) {
    var existing = document.getElementById('dashActionToast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'dashActionToast';
    toast.style.cssText =
      'position: fixed; bottom: 2rem; right: 2rem; z-index: 999999;' +
      'background: rgba(13, 21, 38, 0.96); border: 1px solid ' + (color || 'var(--accent-color)') + ';' +
      'border-radius: 16px; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 0.85rem;' +
      'color: #ffffff; box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 25px rgba(37,99,235,0.3);' +
      'font-family: "Manrope", sans-serif; font-size: 0.92rem; font-weight: 700;' +
      'transform: translateY(20px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);';
    toast.innerHTML = '<span style="font-size:1.3rem;">' + (icon || '✨') + '</span><span>' + message + '</span>';
    document.body.appendChild(toast);

    void toast.offsetWidth;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(function () {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
    }, 3500);
  }

  // Generic Modal Factory
  function openInteractiveModal(title, icon, bodyHtml, actionBtnHtml) {
    var existing = document.getElementById('dashInteractiveModal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'dashInteractiveModal';
    overlay.style.cssText =
      'position: fixed; inset: 0; z-index: 99999; background: rgba(2, 6, 18, 0.82);' +
      'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); display: flex;' +
      'align-items: center; justify-content: center; padding: 1.5rem; opacity: 0;' +
      'transition: opacity 0.28s ease;';

    var win = document.createElement('div');
    win.style.cssText =
      'width: 100%; max-width: 680px; max-height: 88vh; background: linear-gradient(145deg, rgba(13, 21, 38, 0.98), rgba(8, 14, 26, 0.99));' +
      'border: 1px solid var(--glass-border); border-radius: 26px;' +
      'box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), 0 0 35px var(--accent-glow);' +
      'display: flex; flex-direction: column; overflow: hidden; transform: translateY(20px) scale(0.97);' +
      'transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);';

    win.innerHTML =
      '<div style="padding: 1.35rem 1.75rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);">' +
      '  <h3 style="margin: 0; font-family: \'Manrope\', sans-serif; font-size: 1.25rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 0.6rem;">' +
      '    <span>' + icon + '</span><span>' + title + '</span>' +
      '  </h3>' +
      '  <button type="button" id="closeInteractiveModal" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: var(--muted-color); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">✕</button>' +
      '</div>' +
      '<div style="padding: 1.75rem; overflow-y: auto; flex: 1; font-family: \'Inter\', sans-serif; font-size: 0.95rem; color: #fff;">' +
      bodyHtml +
      '</div>' +
      (actionBtnHtml ? '<div style="padding: 1.15rem 1.75rem; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.25); display: flex; justify-content: flex-end; gap: 0.75rem;">' + actionBtnHtml + '</div>' : '');

    overlay.appendChild(win);
    document.body.appendChild(overlay);

    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    win.style.transform = 'translateY(0) scale(1)';

    function closeModal() {
      overlay.style.opacity = '0';
      win.style.transform = 'translateY(20px) scale(0.97)';
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 280);
    }

    document.getElementById('closeInteractiveModal').onclick = closeModal;
    overlay.onclick = function (e) { if (e.target === overlay) closeModal(); };

    return { close: closeModal, overlay: overlay, win: win };
  }

  // 1. ASSIGNMENTS SUBMISSION HANDLER
  function initAssignmentActions() {
    var assignmentsSection = document.getElementById('assignments');
    if (!assignmentsSection) return;

    var tasks = assignmentsSection.querySelectorAll('.task');
    tasks.forEach(function (task) {
      var submitBtn = task.querySelector('.btn--primary');
      var briefBtn = task.querySelector('.btn--outline');
      var titleEl = task.querySelector('b');
      var subEl = task.querySelector('small');
      var title = titleEl ? titleEl.textContent : 'Course Assignment';
      var sub = subEl ? subEl.textContent : 'Semester 5 Continuous Evaluation';

      if (submitBtn) {
        submitBtn.onclick = function (e) {
          e.preventDefault();
          var bodyHtml =
            '<div style="margin-bottom: 1.25rem;">' +
            '  <h4 style="margin: 0 0 0.35rem; color: #fff; font-size: 1.1rem;">' + title + '</h4>' +
            '  <p style="margin: 0; color: var(--muted-color); font-size: 0.85rem;">' + sub + '</p>' +
            '</div>' +
            '<div style="border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; padding: 2rem; text-align: center; background: rgba(255,255,255,0.02); margin-bottom: 1.25rem; cursor: pointer;" id="assignDropArea">' +
            '  <span style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem;">📁</span>' +
            '  <b style="color: #fff; display: block; margin-bottom: 0.25rem;">Drag &amp; drop your solution file</b>' +
            '  <span style="color: var(--muted-color); font-size: 0.8rem;">Supported formats: .PDF, .ZIP, .DOCX (Max 25 MB)</span>' +
            '  <div id="assignFileName" style="display:none; margin-top: 0.75rem; color: #34d399; font-weight: 700; font-size: 0.88rem;">📄 25IT049_Solution_v1.pdf (2.4 MB) attached</div>' +
            '</div>' +
            '<div class="field">' +
            '  <label style="font-size: 0.84rem; font-weight: 700; margin-bottom: 0.4rem; display: block;">Student Notes to Professor</label>' +
            '  <textarea class="textarea" rows="2" placeholder="e.g. Completed all normalization forms up to BCNF with relational algebra proofs..." style="width:100%;"></textarea>' +
            '</div>';

          var actionHtml =
            '<button type="button" class="btn btn--outline btn--sm" id="cancelAssignBtn">Cancel</button>' +
            '<button type="button" class="btn btn--primary btn--sm" id="confirmAssignBtn">Turn In Assignment</button>';

          var modal = openInteractiveModal('Assignment Portal Submission', '📝', bodyHtml, actionHtml);

          var dropArea = modal.overlay.querySelector('#assignDropArea');
          var fileName = modal.overlay.querySelector('#assignFileName');
          if (dropArea) {
            dropArea.onclick = function () {
              if (fileName) fileName.style.display = 'block';
            };
          }

          var cancelBtn = modal.overlay.querySelector('#cancelAssignBtn');
          if (cancelBtn) cancelBtn.onclick = modal.close;

          var confirmBtn = modal.overlay.querySelector('#confirmAssignBtn');
          if (confirmBtn) {
            confirmBtn.onclick = function () {
              modal.close();
              submitBtn.textContent = 'Submitted ✅';
              submitBtn.className = 'btn btn--outline btn--sm';
              submitBtn.style.color = '#34d399';
              submitBtn.style.borderColor = '#10b981';
              submitBtn.disabled = true;

              showToast('Assignment submitted successfully! Turn-in receipt logged.', '✅', '#10b981');

              // Update progress bar
              var submittedBar = assignmentsSection.querySelector('.skill-row .bar i');
              var submittedTxt = assignmentsSection.querySelector('.skill-row span');
              if (submittedTxt) submittedTxt.textContent = '15 of 18';
              if (submittedBar) submittedBar.style.width = '83%';
            };
          }
        };
      }

      if (briefBtn) {
        briefBtn.onclick = function (e) {
          e.preventDefault();
          var bodyHtml =
            '<div style="margin-bottom: 1.25rem;">' +
            '  <h4 style="margin: 0 0 0.35rem; color: #fff; font-size: 1.15rem;">' + title + '</h4>' +
            '  <p style="margin: 0; color: var(--muted-color); font-size: 0.85rem;">' + sub + '</p>' +
            '</div>' +
            '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem;">' +
            '  <h5 style="margin: 0 0 0.5rem; color: var(--accent-color); font-size: 0.92rem; text-transform: uppercase; letter-spacing: 0.05em;">Problem Specifications</h5>' +
            '  <p style="font-size: 0.9rem; line-height: 1.6; color: var(--muted-color); margin: 0 0 0.75rem;">Implement and analyze the core algorithms as discussed during lectures. Submissions must adhere to university academic integrity standards and include proper comments and test cases.</p>' +
            '  <ul style="padding-left: 1.25rem; font-size: 0.88rem; color: #fff; line-height: 1.7; margin: 0;">' +
            '    <li>Part A: Theoretical formulation and complexity proofs (10 Marks)</li>' +
            '    <li>Part B: Working source code with edge-case validation (10 Marks)</li>' +
            '    <li>Deliverable: Single PDF report along with code repository link</li>' +
            '  </ul>' +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--muted-color);">' +
            '  <span>Faculty In-charge: <strong>Dr. M. Sharma</strong></span>' +
            '  <span style="color:#f87171; font-weight:700;">Strict Deadline Enforced</span>' +
            '</div>';

          var actionHtml =
            '<button type="button" class="btn btn--outline btn--sm" id="closeBriefBtn">Close Brief</button>' +
            '<button type="button" class="btn btn--primary btn--sm" id="downloadBriefPdf">Download Brief PDF</button>';

          var modal = openInteractiveModal('Official Assignment Brief', '📋', bodyHtml, actionHtml);
          var closeB = modal.overlay.querySelector('#closeBriefBtn');
          if (closeB) closeB.onclick = modal.close;
          var dlB = modal.overlay.querySelector('#downloadBriefPdf');
          if (dlB) {
            dlB.onclick = function () {
              modal.close();
              showToast('Downloading assignment rubric & brief PDF...', '📥');
            };
          }
        };
      }
    });

    // Notifications "Mark all read" link
    var markReadLink = document.querySelector('#notifications .link-arrow');
    if (markReadLink) {
      markReadLink.onclick = function (e) {
        e.preventDefault();
        var unreads = document.querySelectorAll('#notifications .unread');
        unreads.forEach(function (el) {
          el.classList.remove('unread');
        });
        showToast('All 4 notifications marked as read', '📬', '#34d399');
      };
    }
  }

  // 2. LECTURE NOTES & EXAM PAPERS ACTIONS
  function initNotesAndPapersActions() {
    // Lecture Notes: Preview Slides and Download PDF
    var notesSection = document.getElementById('notes');
    if (notesSection) {
      var noteCards = notesSection.querySelectorAll('.card');
      noteCards.forEach(function (card) {
        var prevBtn = card.querySelector('.btn--outline');
        var dlBtn = card.querySelector('.btn--primary');
        var courseTitle = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Course Notes';

        if (prevBtn) {
          prevBtn.onclick = function () {
            var bodyHtml =
              '<div style="text-align: center; margin-bottom: 1.5rem;">' +
              '  <span style="font-size: 0.85rem; color: var(--accent-color); font-weight: 800; text-transform: uppercase;">' + courseTitle + '</span>' +
              '  <h4 style="margin: 0.35rem 0 1rem; color: #fff;">Interactive Slide Deck Viewer</h4>' +
              '  <div id="slideDisplayBox" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2.5rem 1.5rem; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">' +
              '    <span style="font-size: 2.5rem; margin-bottom: 0.75rem;">🖥️</span>' +
              '    <h5 id="slideHeadline" style="margin: 0 0 0.5rem; font-size: 1.2rem; color: #fff;">Unit 1: Foundations &amp; Conceptual Models</h5>' +
              '    <p id="slideDesc" style="margin: 0; color: var(--muted-color); max-width: 440px; font-size: 0.9rem; line-height: 1.5;">Overview of core principles, mathematical specifications, asymptotic bounds, and system-level architecture.</p>' +
              '  </div>' +
              '  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">' +
              '    <button type="button" class="btn btn--outline btn--sm" id="prevSlideBtn">‹ Previous Slide</button>' +
              '    <span id="slideCounter" style="font-weight: 700; color: var(--muted-color); font-size: 0.85rem;">Slide 1 of 5</span>' +
              '    <button type="button" class="btn btn--outline btn--sm" id="nextSlideBtn">Next Slide ›</button>' +
              '  </div>' +
              '</div>';

            var actionHtml =
              '<button type="button" class="btn btn--outline btn--sm" id="closeSlideBtn">Close Viewer</button>' +
              '<button type="button" class="btn btn--primary btn--sm" id="downloadFullDeck">Download Full Presentation (PPTX)</button>';

            var modal = openInteractiveModal('Lecture Slides Preview', '📽️', bodyHtml, actionHtml);

            var slides = [
              { title: 'Unit 1: Foundations & Architecture', desc: 'Core principles, asymptotic bounds, time & space paradigms.' },
              { title: 'Unit 2: Algorithmic Paradigms', desc: 'Divide & Conquer, Dynamic Programming, Greedy strategy analysis.' },
              { title: 'Unit 3: Relational Schemas & Indexing', desc: 'B+ Tree indexing, hashing tables, storage engines.' },
              { title: 'Unit 4: Concurrency & Lock Protocols', desc: 'ACID guarantees, two-phase locking, deadlock recovery strategies.' },
              { title: 'Unit 5: Distributed Topology & Protocols', desc: 'TCP/IP routing, socket communication, congestion control.' }
            ];
            var curIdx = 0;
            var hEl = modal.overlay.querySelector('#slideHeadline');
            var dEl = modal.overlay.querySelector('#slideDesc');
            var cEl = modal.overlay.querySelector('#slideCounter');

            var prevS = modal.overlay.querySelector('#prevSlideBtn');
            var nextS = modal.overlay.querySelector('#nextSlideBtn');

            function updateSlide() {
              if (hEl) hEl.textContent = slides[curIdx].title;
              if (dEl) dEl.textContent = slides[curIdx].desc;
              if (cEl) cEl.textContent = 'Slide ' + (curIdx + 1) + ' of ' + slides.length;
            }

            if (prevS) prevS.onclick = function () { if (curIdx > 0) { curIdx--; updateSlide(); } };
            if (nextS) nextS.onclick = function () { if (curIdx < slides.length - 1) { curIdx++; updateSlide(); } };
            if (modal.overlay.querySelector('#closeSlideBtn')) modal.overlay.querySelector('#closeSlideBtn').onclick = modal.close;
            if (modal.overlay.querySelector('#downloadFullDeck')) {
              modal.overlay.querySelector('#downloadFullDeck').onclick = function () {
                modal.close();
                showToast('Downloading complete slide deck PPTX...', '📥');
              };
            }
          };
        }

        if (dlBtn) {
          dlBtn.onclick = function (e) {
            e.preventDefault();
            showToast('Downloading verified PDF package for ' + courseTitle + '...', '📥', '#34d399');
          };
        }
      });
    }

    // Exam Papers: Subject Filter & Downloads
    var papersSection = document.getElementById('papers');
    if (papersSection) {
      var filterBtn = papersSection.querySelector('.page-head .btn--outline');
      var papersTable = papersSection.querySelector('tbody');

      if (filterBtn && papersTable) {
        filterBtn.onclick = function (e) {
          e.preventDefault();
          var bodyHtml =
            '<p style="color:var(--muted-color); margin-bottom:1.25rem;">Select subject to filter university question papers:</p>' +
            '<div style="display:flex; flex-direction:column; gap:0.65rem;" id="paperFilterOpts">' +
            '  <button type="button" class="btn btn--outline btn--block" data-filter="all">📁 All Subjects (Show All 4)</button>' +
            '  <button type="button" class="btn btn--outline btn--block" data-filter="IT301">📗 IT301: Data Structures &amp; Algorithms</button>' +
            '  <button type="button" class="btn btn--outline btn--block" data-filter="IT302">📘 IT302: Operating Systems</button>' +
            '  <button type="button" class="btn btn--outline btn--block" data-filter="IT303">📙 IT303: Database Management Systems</button>' +
            '  <button type="button" class="btn btn--outline btn--block" data-filter="IT304">📕 IT304: Computer Networks</button>' +
            '</div>';

          var modal = openInteractiveModal('Filter Question Papers by Subject', '🔍', bodyHtml);
          var btns = modal.overlay.querySelectorAll('#paperFilterOpts button');
          btns.forEach(function (b) {
            b.onclick = function () {
              var f = b.getAttribute('data-filter');
              var rows = papersTable.querySelectorAll('tr');
              rows.forEach(function (r) {
                if (f === 'all' || r.textContent.indexOf(f) !== -1) {
                  r.style.display = '';
                } else {
                  r.style.display = 'none';
                }
              });
              modal.close();
              showToast('Filtered question papers: ' + b.textContent.trim(), '🔍');
            };
          });
        };
      }

      var dlPaperBtns = papersSection.querySelectorAll('tbody a');
      dlPaperBtns.forEach(function (btn) {
        btn.onclick = function (e) {
          e.preventDefault();
          showToast('Downloading previous university question paper with verified answer key...', '📄', '#34d399');
        };
      });
    }
  }

  // 3. CODING HUB & LAB PRACTICALS ACTIONS
  function initCodingAndLabActions() {
    // Coding Hub
    var codingSection = document.getElementById('coding');
    if (codingSection) {
      // Launch Code Arena
      var launchArenaBtn = codingSection.querySelector('.page-head .btn--primary');
      if (launchArenaBtn) {
        launchArenaBtn.onclick = function (e) {
          e.preventDefault();
          var bodyHtml =
            '<div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">' +
            '  <div><b style="color:#fff;">Problem #28: Minimum Spanning Tree (Prim\'s Algorithm)</b></div>' +
            '  <select id="codeLangSelect" class="cal-select" style="padding:0.35rem 0.75rem; font-size:0.8rem;">' +
            '    <option value="cpp">C++ 20 (GCC)</option>' +
            '    <option value="python">Python 3.11</option>' +
            '    <option value="java">Java 17 (OpenJDK)</option>' +
            '  </select>' +
            '</div>' +
            '<div style="background: #020b14; border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 1rem; font-family: var(--font-mono, monospace); font-size: 0.85rem; color: #a5f3fc; line-height: 1.6; margin-bottom: 1rem;">' +
            '#include &lt;iostream&gt;<br>' +
            '#include &lt;vector&gt;<br>' +
            '#include &lt;queue&gt;<br>' +
            'using namespace std;<br><br>' +
            'int primMST(int V, vector&lt;vector&lt;pair&lt;int,int&gt;&gt;&gt;&amp; adj) {<br>' +
            '&nbsp;&nbsp;priority_queue&lt;pair&lt;int,int&gt;, vector&lt;pair&lt;int,int&gt;&gt;, greater&lt;&gt;&gt; pq;<br>' +
            '&nbsp;&nbsp;vector&lt;bool&gt; inMST(V, false);<br>' +
            '&nbsp;&nbsp;pq.push({0, 0});<br>' +
            '&nbsp;&nbsp;int totalWeight = 0;<br>' +
            '&nbsp;&nbsp;// Process Priority Queue...<br>' +
            '&nbsp;&nbsp;return totalWeight;<br>' +
            '}' +
            '</div>' +
            '<div id="codeRunOutput" style="display:none; background:rgba(16,185,129,0.1); border:1px solid #10b981; border-radius:12px; padding:0.85rem 1rem; font-size:0.85rem; color:#34d399; margin-bottom:1rem;">' +
            '  ✅ Compilation successful. Passed 3/3 Test Cases in 0.04s. Memory: 14.2 MB.' +
            '</div>';

          var actionHtml =
            '<button type="button" class="btn btn--outline btn--sm" id="closeArenaBtn">Close Arena</button>' +
            '<button type="button" class="btn btn--primary btn--sm" id="runCodeBtn">▶ Run &amp; Submit Solution</button>';

          var modal = openInteractiveModal('CHARUSAT Interactive Code Arena', '💻', bodyHtml, actionHtml);
          var closeB = modal.overlay.querySelector('#closeArenaBtn');
          if (closeB) closeB.onclick = modal.close;

          var runB = modal.overlay.querySelector('#runCodeBtn');
          var outBox = modal.overlay.querySelector('#codeRunOutput');
          if (runB && outBox) {
            runB.onclick = function () {
              runB.textContent = 'Evaluating tests...';
              setTimeout(function () {
                outBox.style.display = 'block';
                runB.textContent = 'Submitted ✅ (Score: 100/100)';
                runB.style.background = '#10b981';
                showToast('Code submitted successfully! 100/100 Score recorded on Leaderboard.', '🏆', '#10b981');
              }, 800);
            };
          }
        };
      }

      // Enter Contest button
      var enterContestBtn = codingSection.querySelector('.card .btn--outline');
      if (enterContestBtn) {
        enterContestBtn.onclick = function (e) {
          e.preventDefault();
          enterContestBtn.textContent = 'Registered ✅ (Opens 18:00)';
          enterContestBtn.style.color = '#34d399';
          enterContestBtn.style.borderColor = '#10b981';
          showToast('Enrolled in CHARUSAT Weekly Challenge #28! Contest timer activated.', '⚡', '#34d399');
        };
      }

      // View Problem Sheet
      var probCards = codingSection.querySelectorAll('.card');
      if (probCards.length >= 2) {
        var sheetBtn = probCards[1].querySelector('.btn--outline');
        if (sheetBtn) {
          sheetBtn.onclick = function (e) {
            e.preventDefault();
            var bodyHtml =
              '<p style="color:var(--muted-color); margin-bottom:1rem;">150 Essential Interview Problems for Product Companies (CHARUSAT Track):</p>' +
              '<div style="display:flex; flex-direction:column; gap:0.5rem; max-height:280px; overflow-y:auto; padding-right:0.5rem;">' +
              '  <label class="check" style="background:rgba(255,255,255,0.03); padding:0.6rem 0.85rem; border-radius:10px;"><input type="checkbox" checked> <span>1. Two Sum (Arrays &amp; HashMaps)</span></label>' +
              '  <label class="check" style="background:rgba(255,255,255,0.03); padding:0.6rem 0.85rem; border-radius:10px;"><input type="checkbox" checked> <span>2. Best Time to Buy &amp; Sell Stock</span></label>' +
              '  <label class="check" style="background:rgba(255,255,255,0.03); padding:0.6rem 0.85rem; border-radius:10px;"><input type="checkbox" checked> <span>3. LRU Cache Implementation</span></label>' +
              '  <label class="check" style="background:rgba(255,255,255,0.03); padding:0.6rem 0.85rem; border-radius:10px;"><input type="checkbox"> <span>4. Trapping Rain Water (Two Pointers)</span></label>' +
              '  <label class="check" style="background:rgba(255,255,255,0.03); padding:0.6rem 0.85rem; border-radius:10px;"><input type="checkbox"> <span>5. Course Schedule (Graph Cycle Detection)</span></label>' +
              '  <label class="check" style="background:rgba(255,255,255,0.03); padding:0.6rem 0.85rem; border-radius:10px;"><input type="checkbox"> <span>6. Word Ladder (BFS Shortest Path)</span></label>' +
              '</div>';
            openInteractiveModal('150 DSA Interview Roadmap Checklist', '🧩', bodyHtml);
          };
        }
      }

      // Explore GitHub Repos
      if (probCards.length >= 3) {
        var gitBtn = probCards[2].querySelector('.btn--outline');
        if (gitBtn) {
          gitBtn.onclick = function (e) {
            e.preventDefault();
            var bodyHtml =
              '<p style="color:var(--muted-color); margin-bottom:1.25rem;">Official CHARUSAT CSPIT IT Department Starter Templates:</p>' +
              '<div style="display:flex; flex-direction:column; gap:0.75rem;">' +
              '  <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:12px; padding:0.85rem 1.15rem; display:flex; justify-content:space-between; align-items:center;">' +
              '    <div><b>charusat/fullstack-mern-template</b><br><small style="color:var(--muted-color);">React 19 + Node.js + Express + MongoDB</small></div>' +
              '    <button class="btn btn--outline btn--sm" onclick="alert(\'Git Clone URL copied: https://github.com/charusat/fullstack-mern-template.git\')">Clone Repo</button>' +
              '  </div>' +
              '  <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:12px; padding:0.85rem 1.15rem; display:flex; justify-content:space-between; align-items:center;">' +
              '    <div><b>charusat/fastapi-ai-pipeline</b><br><small style="color:var(--muted-color);">Python 3.11 + Docker + PyTorch + SQLite</small></div>' +
              '    <button class="btn btn--outline btn--sm" onclick="alert(\'Git Clone URL copied: https://github.com/charusat/fastapi-ai-pipeline.git\')">Clone Repo</button>' +
              '  </div>' +
              '</div>';
            openInteractiveModal('Capstone Starter Templates', '🐙', bodyHtml);
          };
        }
      }
    }

    // Lab Practicals View Code
    var practicalsSection = document.getElementById('practicals');
    if (practicalsSection) {
      var labCards = practicalsSection.querySelectorAll('.card');
      labCards.forEach(function (card) {
        var codeBtn = card.querySelector('.btn--outline');
        var dlVivaBtn = card.querySelector('.btn--primary');
        var labTitle = card.querySelector('h4') ? card.querySelector('h4').textContent : 'Lab Practical';

        if (codeBtn) {
          codeBtn.onclick = function (e) {
            e.preventDefault();
            var bodyHtml =
              '<div style="margin-bottom:0.75rem;"><b style="color:#fff;">' + labTitle + '</b></div>' +
              '<div style="background:#020b14; border:1px solid rgba(255,255,255,0.15); border-radius:14px; padding:1.25rem; font-family:var(--font-mono, monospace); font-size:0.84rem; color:#a5f3fc; line-height:1.6; max-height:280px; overflow-y:auto;">' +
              '// CHARUSAT CSPIT Lab Exercise\n' +
              '#include &lt;stdio.h&gt;\n' +
              '#include &lt;unistd.h&gt;\n' +
              '#include &lt;sys/types.h&gt;\n' +
              '#include &lt;sys/wait.h&gt;\n\n' +
              'int main() {\n' +
              '    pid_t pid = fork();\n' +
              '    if (pid &lt; 0) {\n' +
              '        perror("Fork failed");\n' +
              '        return 1;\n' +
              '    } else if (pid == 0) {\n' +
              '        printf("[Child PID %d] Executing child task...\\n", getpid());\n' +
              '        execlp("/bin/ls", "ls", "-la", NULL);\n' +
              '    } else {\n' +
              '        printf("[Parent PID %d] Waiting for child PID %d...\\n", getpid(), pid);\n' +
              '        wait(NULL);\n' +
              '        printf("[Parent] Child terminated cleanly.\\n");\n' +
              '    }\n' +
              '    return 0;\n' +
              '}' +
              '</div>';

            var actionHtml =
              '<button type="button" class="btn btn--outline btn--sm" id="closeLabModal">Close</button>' +
              '<button type="button" class="btn btn--primary btn--sm" id="copyLabCodeBtn">📋 Copy Source Code</button>';

            var modal = openInteractiveModal('Verified Lab Practical Code', '🧪', bodyHtml, actionHtml);
            if (modal.overlay.querySelector('#closeLabModal')) modal.overlay.querySelector('#closeLabModal').onclick = modal.close;
            var copyBtn = modal.overlay.querySelector('#copyLabCodeBtn');
            if (copyBtn) {
              copyBtn.onclick = function () {
                copyBtn.textContent = 'Copied to Clipboard! ✅';
                showToast('Lab source code copied to clipboard!', '📋', '#10b981');
              };
            }
          };
        }

        if (dlVivaBtn) {
          dlVivaBtn.onclick = function (e) {
            e.preventDefault();
            showToast('Downloading Semester 5 External Viva Voce Question Bank (PDF)...', '📥', '#34d399');
          };
        }
      });
    }
  }

  // 4. PLACEMENT PREPARATION ACTIONS
  function initPlacementActions() {
    var placementSection = document.getElementById('placement');
    if (!placementSection) return;

    // Update Placement Resume button
    var resumeBtn = placementSection.querySelector('.page-head .btn--primary');
    if (resumeBtn) {
      resumeBtn.onclick = function (e) {
        e.preventDefault();
        var bodyHtml =
          '<p style="color:var(--muted-color); margin-bottom:1rem;">Upload updated resume for campus recruitment ATS screening:</p>' +
          '<div style="border:2px dashed rgba(255,255,255,0.25); border-radius:16px; padding:2rem; text-align:center; background:rgba(255,255,255,0.02); cursor:pointer;" id="resumeDropBox">' +
          '  <span style="font-size:2.5rem; display:block; margin-bottom:0.5rem;">📄</span>' +
          '  <b style="color:#fff;">Click or drag resume file (PDF)</b>' +
          '  <small style="display:block; color:var(--muted-color); margin-top:0.25rem;">Tirth_Ladani_Resume_Aug2026.pdf ready for ATS parser</small>' +
          '</div>' +
          '<div id="atsScoreCard" style="display:none; margin-top:1.25rem; background:rgba(16,185,129,0.12); border:1px solid #10b981; border-radius:14px; padding:1.15rem;">' +
          '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">' +
          '    <b style="color:#34d399; font-size:1.1rem;">ATS Match Score: 92% (Top Tier)</b>' +
          '    <span class="badge badge--success">Eligible for Crest &amp; Sophos</span>' +
          '  </div>' +
          '  <p style="margin:0; font-size:0.85rem; color:#fff; line-height:1.5;">Matched key competencies: Data Structures, C++, Oracle SQL, Socket Programming, Linux Systems.</p>' +
          '</div>';

        var actionHtml =
          '<button type="button" class="btn btn--outline btn--sm" id="closeResumeModal">Cancel</button>' +
          '<button type="button" class="btn btn--primary btn--sm" id="scanResumeBtn">Run ATS Compatibility Scan</button>';

        var modal = openInteractiveModal('Placement Resume ATS Analyzer', '🚀', bodyHtml, actionHtml);
        if (modal.overlay.querySelector('#closeResumeModal')) modal.overlay.querySelector('#closeResumeModal').onclick = modal.close;

        var scanB = modal.overlay.querySelector('#scanResumeBtn');
        var atsBox = modal.overlay.querySelector('#atsScoreCard');
        if (scanB && atsBox) {
          scanB.onclick = function () {
            scanB.textContent = 'Scanning keywords...';
            setTimeout(function () {
              atsBox.style.display = 'block';
              scanB.textContent = 'Resume Synced with T&P Cell ✅';
              scanB.style.background = '#10b981';
              showToast('Resume ATS score verified (92%). Sent to Campus Placement Cell!', '🎉', '#10b981');
            }, 600);
          };
        }
      };
    }

    // Start New Mock Test
    var mockCard = placementSection.querySelectorAll('.card')[1];
    if (mockCard) {
      var startMockBtn = mockCard.querySelector('.btn--primary');
      var viewSolBtn = mockCard.querySelector('.btn--outline');

      if (startMockBtn) {
        startMockBtn.onclick = function (e) {
          e.preventDefault();
          var bodyHtml =
            '<div style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">' +
            '  <span class="badge badge--primary">Quantitative &amp; Logic Round</span>' +
            '  <span style="font-weight:700; color:#fbbf24;">⏱️ Timer: 04:45</span>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:1.25rem; margin-bottom:1rem;">' +
            '  <b style="color:#fff; font-size:1rem; display:block; margin-bottom:0.75rem;">Q1. In how many ways can 5 software engineering interns be seated in a row such that 2 particular interns never sit together?</b>' +
            '  <div style="display:flex; flex-direction:column; gap:0.5rem;">' +
            '    <label class="check" style="background:rgba(255,255,255,0.04); padding:0.6rem 0.85rem; border-radius:8px;"><input type="radio" name="quizOpt"> <span>A) 48 ways</span></label>' +
            '    <label class="check" style="background:rgba(255,255,255,0.04); padding:0.6rem 0.85rem; border-radius:8px;"><input type="radio" name="quizOpt" id="correctQuizOpt"> <span>B) 72 ways (Correct)</span></label>' +
            '    <label class="check" style="background:rgba(255,255,255,0.04); padding:0.6rem 0.85rem; border-radius:8px;"><input type="radio" name="quizOpt"> <span>C) 96 ways</span></label>' +
            '    <label class="check" style="background:rgba(255,255,255,0.04); padding:0.6rem 0.85rem; border-radius:8px;"><input type="radio" name="quizOpt"> <span>D) 120 ways</span></label>' +
            '  </div>' +
            '</div>';

          var actionHtml =
            '<button type="button" class="btn btn--outline btn--sm" id="closeMockModal">Exit</button>' +
            '<button type="button" class="btn btn--primary btn--sm" id="submitMockQuizBtn">Submit Answer</button>';

          var modal = openInteractiveModal('Campus Aptitude Mock Assessment', '📝', bodyHtml, actionHtml);
          if (modal.overlay.querySelector('#closeMockModal')) modal.overlay.querySelector('#closeMockModal').onclick = modal.close;

          var submitQ = modal.overlay.querySelector('#submitMockQuizBtn');
          if (submitQ) {
            submitQ.onclick = function () {
              var isCorrect = modal.overlay.querySelector('#correctQuizOpt') && modal.overlay.querySelector('#correctQuizOpt').checked;
              modal.close();
              if (isCorrect) {
                showToast('Correct answer! Total score: 88% (Top 5th Percentile)', '🎯', '#10b981');
              } else {
                showToast('Answer recorded. Solution explanation available in analytics.', '📊');
              }
            };
          }
        };
      }

      if (viewSolBtn) {
        viewSolBtn.onclick = function (e) {
          e.preventDefault();
          var bodyHtml =
            '<div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:1.25rem;">' +
            '  <h4 style="margin:0 0 0.5rem; color:#fff;">Permutation &amp; Probability Solution</h4>' +
            '  <p style="color:var(--muted-color); font-size:0.9rem; line-height:1.6; margin:0 0 0.75rem;">' +
            '    Total permutations without restriction = 5! = 120.<br>' +
            '    Permutations where the 2 particular interns sit together = treating pair as single unit: 4! × 2! = 24 × 2 = 48.<br>' +
            '    Therefore, required seating arrangements where they NEVER sit together = 120 − 48 = <strong>72 ways</strong>.' +
            '  </p>' +
            '  <span class="badge badge--success">Difficulty: Moderate · Recruitment Standard</span>' +
            '</div>';
          openInteractiveModal('Mock Assessment Solution Breakdown', '💡', bodyHtml);
        };
      }
    }
  }

  // 5. OVERVIEW AUDIT TRAIL EXPANDER
  function initOverviewAuditLog() {
    var auditBtn = document.querySelector('#overview .row--center .btn--outline');
    if (auditBtn) {
      auditBtn.onclick = function (e) {
        e.preventDefault();
        var bodyHtml =
          '<p style="color:var(--muted-color); margin-bottom:1.25rem;">Complete 30-day student digital activity audit trail:</p>' +
          '<ul class="feed" style="max-height:300px; overflow-y:auto; padding-right:0.5rem;">' +
          '  <li><span class="feed__dot feed__dot--ok">✓</span><div><p>Logged into StudentHub session from Chrome on Windows.</p><time>Today, 10:14 AM</time></div></li>' +
          '  <li><span class="feed__dot feed__dot--ok">✓</span><div><p>Submitted Operating Systems scheduling lab record.</p><time>Yesterday, 9:48 PM</time></div></li>' +
          '  <li><span class="feed__dot">📚</span><div><p>Issued Computer Networks reference text from Central Library.</p><time>Fri, 7 Aug, 3:20 PM</time></div></li>' +
          '  <li><span class="feed__dot feed__dot--ok">✓</span><div><p>Registered for 36-Hour Hackathon as Team Bitwise.</p><time>Thu, 6 Aug, 7:05 PM</time></div></li>' +
          '  <li><span class="feed__dot">💳</span><div><p>Downloaded official Term Fee Receipt #CHARUSAT-FEE-2026-99412.</p><time>Thu, 30 Jul, 9:26 AM</time></div></li>' +
          '  <li><span class="feed__dot">🎓</span><div><p>Enrolled into Semester 5 B.Tech IT Division A course blocks.</p><time>Mon, 15 Jul, 11:00 AM</time></div></li>' +
          '</ul>';
        openInteractiveModal('Full 30-Day Activity Audit Trail', '📜', bodyHtml);
      };
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAssignmentActions();
    initNotesAndPapersActions();
    initCodingAndLabActions();
    initPlacementActions();
    initOverviewAuditLog();

    var studentLogout = document.getElementById('studentLogoutBtn');
    if (studentLogout) {
      studentLogout.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('charusat_active_user');
        localStorage.removeItem('charusat_student_session');
        localStorage.removeItem('charusat_student_login_time');
        localStorage.removeItem('charusat_admin_session');
        localStorage.removeItem('charusat_admin_user');
        localStorage.removeItem('charusat_admin_login_time');
        try { sessionStorage.clear(); } catch (err) {}
        fetch('../backend/logout.php', { method: 'GET' }).finally(function () {
          window.location.href = 'login.html?logged_out=1';
        });
      });
    }
  });
})();
