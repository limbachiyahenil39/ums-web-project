/* static/js/teacher.js */

document.addEventListener('DOMContentLoaded', () => {
    AppUI.checkAuth(['teacher']);

    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let dashboardData = { courses: [], students: [], stats: {} };
    let selectedMarksCourseId = '';
    let selectedAttendanceCourseId = '';

    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            links.forEach(item => item.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(link.dataset.target).classList.add('active');
        });
    });

    document.getElementById('attendance-date').valueAsDate = new Date();

    document.getElementById('course-select-marks').addEventListener('change', (event) => {
        selectedMarksCourseId = event.target.value;
        renderGradingTable();
    });

    document.getElementById('course-select-attendance').addEventListener('change', (event) => {
        selectedAttendanceCourseId = event.target.value;
        renderAttendanceTable();
    });

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Request failed');
        return payload;
    }

    async function loadDashboard() {
        try {
            dashboardData = await fetchJson('/api/teacher/dashboard');
            renderHero();
            renderCourses();
            renderCourseSelects();
            renderStudents();
            renderGradingTable();
            renderAttendanceTable();
            renderTeacherTimeline();
        } catch (error) {
            AppUI.showToast(error.message, 'error');
        }
    }

    function renderHero() {
        const stats = dashboardData.stats || {};
        const grid = document.getElementById('teacher-courses-grid');
        const courseCards = dashboardData.courses.map(course => `
            <article class="course-card teacher-course-card reveal-card">
                <div class="course-card-top">
                    <span class="badge ${course.type === 'Elective' ? 'badge-admin' : 'badge-student'}">${course.code}</span>
                    <span class="course-seats">${course.student_count}/${course.seats} seats</span>
                </div>
                <h4>${course.name}</h4>
                <p>${course.description || 'Course details are ready for this semester.'}</p>
                <div class="progress-track" aria-hidden="true">
                    <span style="width: ${course.capacity_used}%"></span>
                </div>
                <div class="course-meta">
                    <span>${course.credits} credits</span>
                    <span>${course.schedule || 'Schedule TBA'}</span>
                    <span>${course.room || 'Room TBA'}</span>
                    <span>${course.attendance_rate}% attendance</span>
                    <span>${course.avg_marks || 0}% avg marks</span>
                </div>
            </article>
        `).join('');

        grid.innerHTML = `
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon">CR</div>
                <div class="stat-info">
                    <h4>Active Courses</h4>
                    <p>${stats.courses || 0}</p>
                    <small class="text-muted">Assigned to you</small>
                </div>
            </article>
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon green">ST</div>
                <div class="stat-info">
                    <h4>Unique Students</h4>
                    <p>${stats.students || 0}</p>
                    <small class="text-muted">Across all sections</small>
                </div>
            </article>
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon amber">AT</div>
                <div class="stat-info">
                    <h4>Attendance</h4>
                    <p>${stats.attendance_rate || 0}%</p>
                    <small class="text-muted">Live class average</small>
                </div>
            </article>
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon rose">PM</div>
                <div class="stat-info">
                    <h4>Pending Marks</h4>
                    <p>${stats.pending_marks || 0}</p>
                    <small class="text-muted">Need grading</small>
                </div>
            </article>
            ${courseCards || '<div class="empty-state">No courses are assigned yet.</div>'}
        `;
    }

    function renderCourseSelects() {
        const options = dashboardData.courses
            .map(course => `<option value="${course.id}">${course.code} - ${course.name}</option>`)
            .join('');
        document.getElementById('course-select-marks').innerHTML = `<option value="">Select Course...</option>${options}`;
        document.getElementById('course-select-attendance').innerHTML = `<option value="">Select Course...</option>${options}`;

        if (selectedMarksCourseId) document.getElementById('course-select-marks').value = selectedMarksCourseId;
        if (selectedAttendanceCourseId) document.getElementById('course-select-attendance').value = selectedAttendanceCourseId;
    }

    function renderCourses() {
        const stats = dashboardData.stats || {};
        const departmentEl = document.getElementById('teacher-dept-name');
        const totalEl = document.getElementById('total-dept-students');
        if (departmentEl) departmentEl.textContent = dashboardData.teacher?.department || 'Faculty';
        if (totalEl) totalEl.textContent = stats.students || 0;
    }

    function studentsForCourse(courseId) {
        return dashboardData.students.filter(student => String(student.course_id) === String(courseId));
    }

    function renderGradingTable() {
        const area = document.getElementById('grading-area');
        const tbody = document.getElementById('grading-table-body');
        if (!selectedMarksCourseId) {
            area.style.display = 'none';
            return;
        }

        const students = studentsForCourse(selectedMarksCourseId);
        area.style.display = 'block';
        tbody.innerHTML = students.length ? '' : '<tr><td colspan="4">No students are enrolled in this course.</td></tr>';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${student.name}</strong><br><span class="text-muted">${student.department || 'Department not set'}</span></td>
                <td>${student.email}</td>
                <td><input type="number" min="0" max="100" class="form-control marks-input" value="${student.marks ?? ''}" placeholder="0-100" data-student-id="${student.id}"></td>
                <td><button class="btn btn-primary table-action" type="button" data-save-marks="${student.id}">Save</button></td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('[data-save-marks]').forEach(button => {
            button.addEventListener('click', () => saveMarks(button.dataset.saveMarks));
        });
    }

    async function saveMarks(studentId) {
        const input = document.querySelector(`.marks-input[data-student-id="${studentId}"]`);
        const marks = Number(input.value);
        if (Number.isNaN(marks) || marks < 0 || marks > 100) {
            AppUI.showToast('Marks must be between 0 and 100.', 'warning');
            return;
        }

        try {
            await fetchJson('/api/teacher/marks', {
                method: 'POST',
                body: JSON.stringify({
                    course_id: Number(selectedMarksCourseId),
                    student_id: Number(studentId),
                    marks
                })
            });
            AppUI.showToast('Marks saved.', 'success');
            await loadDashboard();
        } catch (error) {
            AppUI.showToast(error.message, 'error');
        }
    }

    function renderAttendanceTable() {
        const area = document.getElementById('attendance-area');
        const tbody = document.getElementById('attendance-table-body');
        if (!selectedAttendanceCourseId) {
            area.style.display = 'none';
            return;
        }

        const students = studentsForCourse(selectedAttendanceCourseId);
        area.style.display = 'block';
        tbody.innerHTML = students.length ? '' : '<tr><td colspan="4">No students are enrolled in this course.</td></tr>';

        students.forEach(student => {
            const row = document.createElement('tr');
            const badge = student.attendance_rate < 75 ? 'badge-admin' : 'badge-teacher';
            row.innerHTML = `
                <td><strong>${student.name}</strong><br><span class="badge ${badge}">${student.attendance_rate}% attendance</span></td>
                <td>${student.email}</td>
                <td>
                    <select class="form-control attendance-status" data-student-id="${student.id}">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                </td>
                <td><button class="btn btn-primary table-action" type="button" data-save-attendance="${student.id}">Mark</button></td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('[data-save-attendance]').forEach(button => {
            button.addEventListener('click', () => saveAttendance(button.dataset.saveAttendance));
        });
    }

    async function saveAttendance(studentId) {
        const status = document.querySelector(`.attendance-status[data-student-id="${studentId}"]`).value;
        const date = document.getElementById('attendance-date').value;
        try {
            await fetchJson('/api/teacher/attendance', {
                method: 'POST',
                body: JSON.stringify({
                    course_id: Number(selectedAttendanceCourseId),
                    student_id: Number(studentId),
                    date,
                    status
                })
            });
            AppUI.showToast('Attendance saved.', 'success');
            await loadDashboard();
        } catch (error) {
            AppUI.showToast(error.message, 'error');
        }
    }

    function renderStudents() {
        const tbody = document.getElementById('dept-students-body');
        tbody.innerHTML = dashboardData.students.length ? '' : '<tr><td colspan="3">No students found for your courses.</td></tr>';

        dashboardData.students.forEach(student => {
            const row = document.createElement('tr');
            const riskClass = student.attendance_rate < 75 ? 'badge-admin' : 'badge-teacher';
            row.innerHTML = `
                <td><strong>${student.name}</strong><br><span class="badge ${riskClass}">${student.attendance_rate}% attendance</span></td>
                <td>${student.email}</td>
                <td>${student.code} - ${student.course_name}<br><span class="text-muted">${student.marks ?? 'Pending'} marks</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    function renderTeacherTimeline() {
        const existing = document.getElementById('teacher-insight-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'teacher-insight-panel';
        panel.className = 'insight-grid';
        panel.innerHTML = `
            <article class="insight-panel reveal-card">
                <h3>Announcements</h3>
                ${(dashboardData.announcements || []).map(item => `
                    <div class="timeline-item">
                        <strong>${item.title}</strong>
                        <span>${item.message}</span>
                    </div>
                `).join('') || '<div class="empty-state">No announcements.</div>'}
            </article>
            <article class="insight-panel reveal-card">
                <h3>Upcoming Events</h3>
                ${(dashboardData.events || []).map(item => `
                    <div class="timeline-item">
                        <strong>${item.title}</strong>
                        <span>${item.event_date} at ${item.location || 'Campus'}</span>
                    </div>
                `).join('') || '<div class="empty-state">No events.</div>'}
            </article>
        `;
        document.getElementById('dashboard-sect').appendChild(panel);
    }

    loadDashboard();
});
