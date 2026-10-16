/* ==========================================================================
   CHARUSAT StudentHub — Unified Student Data Sync Engine (portal-data.js)
   - Real-time profile persistence in localStorage ('charusat_student_data')
   - Dynamic synchronization with Dashboard and Admin Console
   - Admin live editing: Attendance, Marks, SGPA/CGPA, Fees status & Receipts
   ========================================================================== */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'charusat_student_data';

  // Default initial profile (seeded so if a student hasn't entered anything, they have default clean data)
  var DEFAULT_STUDENT = {
    // 1. Profile Essentials
    enrolment: '25IT049',
    fullName: 'Tirth Ladani',
    fatherName: 'Pravinbhai Ladani',
    motherName: 'Gitaben Ladani',
    dob: '2005-08-14',
    gender: 'Male',
    bloodGroup: 'B+',
    category: 'General',
    nationality: 'Indian',
    email: '25it049@charusat.edu.in',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 43211',
    permanentAddress: 'B-402, Shivalik Heights, Changa Campus Road',
    city: 'Anand',
    district: 'Anand',
    state: 'Gujarat',
    pin: '388421',
    institute: 'CSPIT — Chandubhai S. Patel Institute of Technology',
    instituteShort: 'CSPIT',
    department: 'Information Technology',
    programme: 'B.Tech',
    admissionYear: '2024',
    semester: '5',
    division: 'A',
    batch: 'IT-A1',
    avatar: '',
    profileCompleted: true,

    // 2. Academic Performance & CGPA (Configurable live by Admin)
    cgpa: 8.64,
    sgpa: 8.85,
    creditsEarned: 96,
    totalCredits: 180,
    semesterBacklogs: 0,
    academicStatus: 'Distinction',
    lastUpdated: '07 Oct 2026',

    // Detailed Subject-wise Marks & Attendance (Semester 5)
    subjects: [
      {
        code: 'IT301',
        name: 'Database Management Systems',
        faculty: 'Prof. K. Patel',
        credits: 4,
        attendance: 92,
        internalMarks: 28, // out of 30
        midSemMarks: 46, // out of 50
        assignmentMarks: 19, // out of 20
        totalMarks: 93,
        grade: 'AA'
      },
      {
        code: 'IT302',
        name: 'Operating Systems & Linux',
        faculty: 'Dr. M. Sharma',
        credits: 4,
        attendance: 88,
        internalMarks: 27,
        midSemMarks: 43,
        assignmentMarks: 18,
        totalMarks: 88,
        grade: 'AB'
      },
      {
        code: 'IT303',
        name: 'Data Structures & Algorithms',
        faculty: 'Prof. R. Joshi',
        credits: 5,
        attendance: 87,
        internalMarks: 29,
        midSemMarks: 48,
        assignmentMarks: 20,
        totalMarks: 97,
        grade: 'AA'
      },
      {
        code: 'IT304',
        name: 'Computer Networks',
        faculty: 'Dr. S. Verma',
        credits: 4,
        attendance: 81,
        internalMarks: 24,
        midSemMarks: 41,
        assignmentMarks: 17,
        totalMarks: 82,
        grade: 'BB'
      },
      {
        code: 'IT305',
        name: 'Discrete Mathematics',
        faculty: 'Prof. A. Trivedi',
        credits: 3,
        attendance: 76,
        internalMarks: 22,
        midSemMarks: 38,
        assignmentMarks: 16,
        totalMarks: 76,
        grade: 'BC'
      }
    ],

    // 3. Fee Structure & Accounting Record
    fees: {
      academicYear: '2026–2027',
      totalTuitionFee: 65000,
      examFee: 3500,
      libraryAndAmenitiesFee: 4000,
      totalPayable: 72500,
      amountPaid: 72500,
      dueAmount: 0,
      paymentStatus: 'Paid', // 'Paid' | 'Pending' | 'Partial'
      receiptNumber: 'CHARUSAT-FEE-2026-99412',
      paymentDate: '28 July 2026',
      paymentMethod: 'HDFC SmartHub Payment Gateway (Online)',
      nextTermDueDate: '15 Jan 2027'
    },

    // 4. Notifications & Approvals
    notifications: [
      {
        id: 1,
        type: 'success',
        title: 'Fee Payment Verified',
        text: 'Accounts Office: Semester 5 fees of ₹72,500 successfully reconciled. Receipt generated.',
        date: 'Today, 9:15 AM'
      },
      {
        id: 2,
        type: 'info',
        title: 'Mid-Sem Result Announced',
        text: 'Exam Cell: Semester 5 mid-term evaluation scores have been authenticated by the Registrar.',
        date: 'Yesterday, 4:20 PM'
      },
      {
        id: 3,
        type: 'warning',
        title: 'Discrete Math Attendance Warning',
        text: 'Attendance in IT305 stands at 76%. Attend all upcoming tutorials to stay securely above 75%.',
        date: '05 Oct 2026'
      }
    ]
  };

  var StudentHubData = {
    // Check if an authenticated student session is currently active
    isLoggedIn: function () {
      return localStorage.getItem('charusat_student_session') === 'active';
    },

    // Return actual authenticated student or null if guest/logged out
    getLoggedInUser: function () {
      if (localStorage.getItem('charusat_student_session') !== 'active') {
        return null;
      }
      try {
        var rawActive = localStorage.getItem('charusat_active_user');
        if (rawActive) return JSON.parse(rawActive);
        var rawData = localStorage.getItem(STORAGE_KEY);
        if (rawData) return JSON.parse(rawData);
      } catch (e) {}
      return null;
    },

    // Get full student object (with fallback for legacy code)
    getStudent: function () {
      try {
        var activeUserRaw = localStorage.getItem('charusat_active_user');
        var raw = localStorage.getItem(STORAGE_KEY);
        var activeObj = activeUserRaw ? JSON.parse(activeUserRaw) : null;
        var parsed = raw ? JSON.parse(raw) : null;

        if (activeObj) {
          var base = Object.assign({}, DEFAULT_STUDENT, activeObj, parsed || {});
          base.fullName = activeObj.fullName || activeObj.full_name || base.fullName;
          base.enrolment = activeObj.enrolment || activeObj.roll_no || base.enrolment;
          base.email = activeObj.email || base.email;
          base.phone = activeObj.phone || activeObj.mobile || base.phone;
          base.mobile = activeObj.mobile || activeObj.phone || base.phone;
          base.department = activeObj.department || base.department;
          base.programme = activeObj.programme || base.programme;
          base.semester = (activeObj.semester !== undefined) ? String(activeObj.semester) : base.semester;
          base.gender = activeObj.gender || base.gender;
          if (activeObj.cgpa !== undefined) base.cgpa = Number(activeObj.cgpa);
          if (activeObj.overallAttendance !== undefined) base.overallAttendance = Number(activeObj.overallAttendance);
          else if (activeObj.attendance !== undefined) base.overallAttendance = Number(activeObj.attendance);
          return base;
        }

        if (parsed) {
          return Object.assign({}, DEFAULT_STUDENT, parsed);
        }
      } catch (e) {
        console.warn('Error reading from localStorage', e);
      }
      return Object.assign({}, DEFAULT_STUDENT);
    },

    // Save updated student data (from Profile or Admin)
    saveStudent: function (updatedData) {
      try {
        var current = this.getStudent();
        var merged = Object.assign({}, current, updatedData);
        // Recalculate overall attendance average from subjects if available
        if (merged.subjects && merged.subjects.length) {
          var totalAtt = merged.subjects.reduce(function (sum, s) { return sum + Number(s.attendance || 0); }, 0);
          merged.overallAttendance = Math.round(totalAtt / merged.subjects.length);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('charusat:data-updated', { detail: merged }));
        return merged;
      } catch (e) {
        console.error('Error saving student data', e);
      }
    },

    // Admin-specific updater
    updateAcademicByAdmin: function (fields) {
      return this.saveStudent(fields);
    },

    // Reset back to factory default
    resetToDefault: function () {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENT));
      window.dispatchEvent(new CustomEvent('charusat:data-updated', { detail: DEFAULT_STUDENT }));
      return DEFAULT_STUDENT;
    }
  };

  window.StudentHubData = StudentHubData;

})(window);
