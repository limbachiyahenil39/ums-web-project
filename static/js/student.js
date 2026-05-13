/* static/js/student.js */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const courseCatalog = [
        {
            id: 'ufp-101',
            code: 'UFP101',
            name: 'Academic Communication',
            type: 'ufp',
            credits: 3,
            teacher: 'Dr. Meera Shah',
            seats: 8,
            schedule: 'Mon/Wed 09:00',
            description: 'Core writing, speaking, and presentation skills for university study.'
        },
        {
            id: 'ufp-102',
            code: 'UFP102',
            name: 'Quantitative Reasoning',
            type: 'ufp',
            credits: 4,
            teacher: 'Prof. Arjun Rao',
            seats: 5,
            schedule: 'Tue/Thu 10:00',
            description: 'Mathematics, statistics, and data reasoning for first-year learners.'
        },
        {
            id: 'ufp-103',
            code: 'UFP103',
            name: 'Digital Foundations',
            type: 'ufp',
            credits: 3,
            teacher: 'Ms. Nisha Kapoor',
            seats: 10,
            schedule: 'Fri 11:00',
            description: 'Computer basics, productivity tools, and responsible digital practice.'
        },
        {
            id: 'ele-201',
            code: 'ELE201',
            name: 'Creative Problem Solving',
            type: 'elective',
            credits: 2,
            teacher: 'Dr. Vikram Sethi',
            seats: 7,
            schedule: 'Mon 14:00',
            description: 'Design thinking methods for practical academic and community challenges.'
        },
        {
            id: 'ele-202',
            code: 'ELE202',
            name: 'Environmental Studies',
            type: 'elective',
            credits: 2,
            teacher: 'Dr. Farah Khan',
            seats: 3,
            schedule: 'Wed 15:00',
            description: 'Sustainability, climate awareness, and campus-level environmental action.'
        },
        {
            id: 'ele-203',
            code: 'ELE203',
            name: 'Introduction to Entrepreneurship',
            type: 'elective',
            credits: 3,
            teacher: 'Mr. Karan Malhotra',
            seats: 6,
            schedule: 'Thu 13:00',
            description: 'Opportunity discovery, business models, and early venture planning.'
        }
    ];

    const marksByCourse = {
        'ufp-101': 88,
        'ufp-102': 82,
        'ele-201': 91,
        'ele-202': 74
    };

    const attendanceRecords = [
        { date: '2026-04-24', courseId: 'ufp-101', status: 'present' },
        { date: '2026-04-27', courseId: 'ufp-101', status: 'present' },
        { date: '2026-04-29', courseId: 'ufp-101', status: 'absent' },
        { date: '2026-05-01', courseId: 'ufp-101', status: 'present' },
        { date: '2026-04-23', courseId: 'ufp-102', status: 'present' },
        { date: '2026-04-28', courseId: 'ufp-102', status: 'present' },
        { date: '2026-04-30', courseId: 'ufp-102', status: 'present' },
        { date: '2026-05-02', courseId: 'ufp-102', status: 'present' },
        { date: '2026-04-22', courseId: 'ele-201', status: 'absent' },
        { date: '2026-04-29', courseId: 'ele-201', status: 'present' },
        { date: '2026-05-03', courseId: 'ele-201', status: 'present' },
        { date: '2026-04-30', courseId: 'ele-202', status: 'present' },
        { date: '2026-05-04', courseId: 'ele-202', status: 'absent' }
    ];

    const storageKey = 'ums_student_enrollments';
    let enrolledCourseIds = getSavedEnrollments();
    let activeFilter = 'all';
    let searchTerm = '';

    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(link.getAttribute('data-target')).classList.add('active');
        });
    });

    document.querySelectorAll('[data-course-filter]').forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.courseFilter;
            document.querySelectorAll('[data-course-filter]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderCourseCatalog();
        });
    });

    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            searchTerm = event.target.value.trim().toLowerCase();
            renderCourseCatalog();
        });
    }

    function getSavedEnrollments() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey));
            if (Array.isArray(saved)) return saved;
        } catch (error) {
            localStorage.removeItem(storageKey);
        }

        return ['ufp-101', 'ufp-102', 'ele-201'];
    }

    function saveEnrollments() {
        localStorage.setItem(storageKey, JSON.stringify(enrolledCourseIds));
    }

    function getEnrolledCourses() {
        return courseCatalog.filter(course => enrolledCourseIds.includes(course.id));
    }

    function hasGrade(courseId) {
        return Object.prototype.hasOwnProperty.call(marksByCourse, courseId);
    }

    function getTypeLabel(type) {
        return type === 'ufp' ? 'UFP' : 'Elective';
    }

    function getTypeBadge(type) {
        return type === 'ufp' ? 'badge-student' : 'badge-teacher';
    }

    function getGradeInfo(mark) {
        if (mark === undefined || mark === null || mark === '') {
            return { letter: 'Pending', points: null, badge: 'badge-muted' };
        }

        const score = Number(mark);
        if (score >= 90) return { letter: 'A+', points: 4.0, badge: 'badge-teacher' };
        if (score >= 80) return { letter: 'A', points: 3.7, badge: 'badge-teacher' };
        if (score >= 70) return { letter: 'B+', points: 3.3, badge: 'badge-student' };
        if (score >= 60) return { letter: 'B', points: 3.0, badge: 'badge-student' };
        if (score >= 50) return { letter: 'C', points: 2.0, badge: 'badge-admin' };
        if (score >= 40) return { letter: 'D', points: 1.0, badge: 'badge-admin' };
        return { letter: 'F', points: 0.0, badge: 'badge-danger' };
    }

    function getGpaSummary(enrolledCourses) {
        const gradedCourses = enrolledCourses.filter(course => hasGrade(course.id));
        const gradedCredits = gradedCourses.reduce((sum, course) => sum + course.credits, 0);
        const totalGradePoints = gradedCourses.reduce((sum, course) => {
            const grade = getGradeInfo(marksByCourse[course.id]);
            return sum + (grade.points * course.credits);
        }, 0);
        const marksTotal = gradedCourses.reduce((sum, course) => sum + marksByCourse[course.id], 0);

        return {
            gradedCourses,
            gradedCredits,
            totalGradePoints,
            gpa: gradedCredits ? totalGradePoints / gradedCredits : 0,
            marksAverage: gradedCourses.length ? marksTotal / gradedCourses.length : null
        };
    }

    function getGpaStanding(gpa) {
        if (gpa >= 3.7) return 'Excellent standing';
        if (gpa >= 3.0) return 'Good standing';
        if (gpa >= 2.0) return 'Passing';
        if (gpa > 0) return 'Needs improvement';
        return 'No grades';
    }

    function setProgress(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.width = `${Math.max(0, Math.min(100, value))}%`;
    }

    function getAttendanceSummary(courseId) {
        const records = attendanceRecords.filter(record => record.courseId === courseId);
        const present = records.filter(record => record.status === 'present').length;
        const absent = records.filter(record => record.status === 'absent').length;
        const total = records.length;

        return {
            records,
            present,
            absent,
            total,
            percent: total ? Math.round((present / total) * 100) : 0
        };
    }

    function renderStudentData() {
        const enrolledCourses = getEnrolledCourses();
        const ufpCredits = enrolledCourses
            .filter(course => course.type === 'ufp')
            .reduce((sum, course) => sum + course.credits, 0);
        const electiveCredits = enrolledCourses
            .filter(course => course.type === 'elective')
            .reduce((sum, course) => sum + course.credits, 0);
        const gpaSummary = getGpaSummary(enrolledCourses);

        document.getElementById('stat-enrolled').textContent = enrolledCourses.length;
        document.getElementById('stat-avg-grade').textContent =
            gpaSummary.gradedCredits ? gpaSummary.gpa.toFixed(2) : '-';
        document.getElementById('ufp-credit-count').textContent = ufpCredits;
        document.getElementById('elective-credit-count').textContent = electiveCredits;
        document.getElementById('enrollment-status').textContent =
            enrolledCourses.length === 0 ? 'No courses selected' : `${enrolledCourses.length} selected`;

        const absences = attendanceRecords
            .filter(record => enrolledCourseIds.includes(record.courseId) && record.status === 'absent')
            .length;
        document.getElementById('stat-absences').textContent = absences;

        renderCourseCatalog();
        renderEnrolledTable(enrolledCourses);
        renderGradeDashboard(enrolledCourses, gpaSummary);
        renderMarksTable(enrolledCourses);
        renderAttendanceDashboard(enrolledCourses);
        renderAttendanceTable();
    }

    function renderCourseCatalog() {
        const catalogEl = document.getElementById('course-catalog');
        const filteredCourses = courseCatalog.filter(course => {
            const matchesType = activeFilter === 'all' || course.type === activeFilter;
            const searchText = `${course.code} ${course.name} ${course.teacher}`.toLowerCase();
            return matchesType && searchText.includes(searchTerm);
        });

        if (filteredCourses.length === 0) {
            catalogEl.innerHTML = '<div class="empty-state">No courses match your search.</div>';
            return;
        }

        catalogEl.innerHTML = '';
        filteredCourses.forEach(course => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const card = document.createElement('article');
            card.className = `course-card ${isEnrolled ? 'is-enrolled' : ''}`;
            card.innerHTML = `
                <div class="course-card-top">
                    <span class="badge ${getTypeBadge(course.type)}">${getTypeLabel(course.type)}</span>
                    <span class="course-seats">${course.seats} seats left</span>
                </div>
                <h4>${course.code} - ${course.name}</h4>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span>${course.credits} credits</span>
                    <span>${course.schedule}</span>
                    <span>${course.teacher}</span>
                </div>
                <button class="btn ${isEnrolled ? 'btn-outline' : 'btn-primary'} course-action" type="button" data-course-id="${course.id}">
                    ${isEnrolled ? 'Drop' : 'Enroll'}
                </button>
            `;
            catalogEl.appendChild(card);
        });

        catalogEl.querySelectorAll('[data-course-id]').forEach(button => {
            button.addEventListener('click', () => toggleEnrollment(button.dataset.courseId));
        });
    }

    function renderEnrolledTable(enrolledCourses) {
        const coursesBody = document.getElementById('my-courses-body');
        coursesBody.innerHTML = '';

        if (enrolledCourses.length === 0) {
            coursesBody.innerHTML = '<tr><td colspan="6">Choose courses from the catalog above.</td></tr>';
            return;
        }

        enrolledCourses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${course.code}</strong></td>
                <td>${course.name}</td>
                <td><span class="badge ${getTypeBadge(course.type)}">${getTypeLabel(course.type)}</span></td>
                <td>${course.credits}</td>
                <td>${course.teacher}</td>
                <td><button class="btn btn-outline table-action" type="button" data-drop-course="${course.id}">Drop</button></td>
            `;
            coursesBody.appendChild(row);
        });

        coursesBody.querySelectorAll('[data-drop-course]').forEach(button => {
            button.addEventListener('click', () => toggleEnrollment(button.dataset.dropCourse));
        });
    }

    function renderGradeDashboard(enrolledCourses, gpaSummary) {
        document.getElementById('gpa-value').textContent = gpaSummary.gradedCredits ? gpaSummary.gpa.toFixed(2) : '0.00';
        document.getElementById('gpa-letter').textContent = getGpaStanding(gpaSummary.gpa);
        document.getElementById('marks-average').textContent =
            gpaSummary.marksAverage === null ? '-' : `${gpaSummary.marksAverage.toFixed(1)}%`;
        document.getElementById('graded-credits').textContent = gpaSummary.gradedCredits;
        document.getElementById('total-grade-points').textContent = gpaSummary.totalGradePoints.toFixed(1);
        setProgress('gpa-progress', (gpaSummary.gpa / 4) * 100);

        const breakdown = document.getElementById('grade-breakdown');
        breakdown.innerHTML = '';

        if (enrolledCourses.length === 0) {
            breakdown.innerHTML = '<div class="empty-state">Enroll in courses to see GPA progress.</div>';
            return;
        }

        enrolledCourses.forEach(course => {
            const mark = hasGrade(course.id) ? marksByCourse[course.id] : null;
            const grade = getGradeInfo(mark);
            const scoreWidth = mark === null ? 0 : mark;
            const card = document.createElement('article');
            card.className = 'grade-card';
            card.innerHTML = `
                <div class="grade-card-header">
                    <div>
                        <strong>${course.code}</strong>
                        <span>${course.name}</span>
                    </div>
                    <span class="badge ${grade.badge}">${grade.letter}</span>
                </div>
                <div class="grade-card-score">${mark === null ? 'Pending' : `${mark}%`}</div>
                <div class="progress-track" aria-hidden="true">
                    <span style="width: ${scoreWidth}%"></span>
                </div>
                <div class="grade-card-meta">
                    <span>${course.credits} credits</span>
                    <span>${grade.points === null ? '-' : grade.points.toFixed(1)} GPA pts</span>
                </div>
            `;
            breakdown.appendChild(card);
        });
    }

    function renderMarksTable(enrolledCourses) {
        const marksBody = document.getElementById('student-marks-body');
        marksBody.innerHTML = '';

        if (enrolledCourses.length === 0) {
            marksBody.innerHTML = '<tr><td colspan="5">No grades recorded.</td></tr>';
            return;
        }

        enrolledCourses.forEach(course => {
            const mark = hasGrade(course.id) ? marksByCourse[course.id] : null;
            const grade = getGradeInfo(mark);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.code} - ${course.name}</td>
                <td><strong>${mark === null ? 'N/A' : mark}</strong></td>
                <td><span class="badge ${grade.badge}">${grade.letter}</span></td>
                <td>${grade.points === null ? '-' : grade.points.toFixed(1)}</td>
                <td>${course.credits}</td>
            `;
            marksBody.appendChild(row);
        });
    }

    function renderAttendanceDashboard(enrolledCourses) {
        const enrolledRecords = attendanceRecords.filter(record => enrolledCourseIds.includes(record.courseId));
        const present = enrolledRecords.filter(record => record.status === 'present').length;
        const absent = enrolledRecords.filter(record => record.status === 'absent').length;
        const total = enrolledRecords.length;
        const percent = total ? Math.round((present / total) * 100) : 0;
        let riskCount = 0;

        document.getElementById('attendance-percent').textContent = `${percent}%`;
        document.getElementById('attendance-present').textContent = present;
        document.getElementById('attendance-absent').textContent = absent;
        setProgress('attendance-progress', percent);

        const summaryEl = document.getElementById('attendance-course-summary');
        summaryEl.innerHTML = '';

        if (enrolledCourses.length === 0) {
            document.getElementById('attendance-risk').textContent = '0';
            summaryEl.innerHTML = '<div class="empty-state">Enroll in courses to see attendance health.</div>';
            return;
        }

        enrolledCourses.forEach(course => {
            const summary = getAttendanceSummary(course.id);
            const isRisk = summary.total > 0 && summary.percent < 75;
            if (isRisk) riskCount++;

            const card = document.createElement('article');
            card.className = `attendance-course-card ${isRisk ? 'is-risk' : ''}`;
            card.innerHTML = `
                <div class="attendance-card-header">
                    <div>
                        <strong>${course.code}</strong>
                        <span>${course.name}</span>
                    </div>
                    <span class="badge ${isRisk ? 'badge-admin' : 'badge-teacher'}">${isRisk ? 'Low' : 'On Track'}</span>
                </div>
                <div class="attendance-card-percent">${summary.total ? `${summary.percent}%` : 'No records'}</div>
                <div class="progress-track" aria-hidden="true">
                    <span style="width: ${summary.percent}%"></span>
                </div>
                <div class="attendance-card-meta">
                    <span>${summary.present}/${summary.total} present</span>
                    <span>${summary.absent} absent</span>
                </div>
            `;
            summaryEl.appendChild(card);
        });

        document.getElementById('attendance-risk').textContent = riskCount;
    }

    function renderAttendanceTable() {
        const attBody = document.getElementById('student-attendance-body');
        const records = attendanceRecords
            .filter(record => enrolledCourseIds.includes(record.courseId))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        attBody.innerHTML = '';

        if (records.length === 0) {
            attBody.innerHTML = '<tr><td colspan="3">No attendance records found.</td></tr>';
            return;
        }

        records.forEach(record => {
            const course = courseCatalog.find(item => item.id === record.courseId);
            const badgeClass = record.status === 'present' ? 'badge-teacher' : 'badge-admin';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${course ? course.code : 'Unknown'}</td>
                <td><span class="badge ${badgeClass}">${record.status.toUpperCase()}</span></td>
            `;
            attBody.appendChild(row);
        });
    }

    function toggleEnrollment(courseId) {
        const course = courseCatalog.find(item => item.id === courseId);
        if (!course) return;

        if (enrolledCourseIds.includes(courseId)) {
            enrolledCourseIds = enrolledCourseIds.filter(id => id !== courseId);
            AppUI.showToast(`Dropped ${course.code}`, 'warning');
        } else {
            enrolledCourseIds.push(courseId);
            AppUI.showToast(`Enrolled in ${course.code}`, 'success');
        }

        saveEnrollments();
        renderStudentData();
    }

    renderStudentData();
});
