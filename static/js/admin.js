/* static/js/admin.js */

document.addEventListener('DOMContentLoaded', () => {
    AppUI.checkAuth(['admin']);

    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let overview = {};
    let users = [];
    let courses = [];
    let overviewChart = null;
    let searchTerm = '';

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

    async function fetchJson(url) {
        const response = await fetch(url);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Request failed');
        return payload;
    }

    async function loadAdminData() {
        try {
            const [overviewPayload, userPayload, coursePayload] = await Promise.all([
                fetchJson('/api/admin/overview'),
                fetchJson('/api/admin/users'),
                fetchJson('/api/admin/courses')
            ]);

            overview = overviewPayload;
            users = userPayload.users || [];
            courses = coursePayload.courses || [];

            renderOverview();
            renderUsers();
            renderCourses();
            renderOperationsPanels();
        } catch (error) {
            AppUI.showToast(error.message, 'error');
        }
    }

    function renderOverview() {
        const stats = overview.stats || {};
        document.getElementById('stat-students').textContent = stats.students || 0;
        document.getElementById('stat-teachers').textContent = stats.teachers || 0;
        document.getElementById('stat-courses').textContent = stats.courses || 0;

        const statsGrid = document.querySelector('#dashboard-sect .stats-grid');
        statsGrid.innerHTML = `
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon">ST</div>
                <div class="stat-info">
                    <h4>Total Students</h4>
                    <p id="stat-students">${stats.students || 0}</p>
                    <small class="text-muted">${stats.enrollments || 0} enrollments</small>
                </div>
            </article>
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon green">TC</div>
                <div class="stat-info">
                    <h4>Total Teachers</h4>
                    <p id="stat-teachers">${stats.teachers || 0}</p>
                    <small class="text-muted">${stats.admins || 0} admin account</small>
                </div>
            </article>
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon amber">CR</div>
                <div class="stat-info">
                    <h4>Active Courses</h4>
                    <p id="stat-courses">${stats.courses || 0}</p>
                    <small class="text-muted">${stats.avg_marks || 0}% avg marks</small>
                </div>
            </article>
            <article class="stat-card metric-card reveal-card">
                <div class="stat-icon rose">AT</div>
                <div class="stat-info">
                    <h4>Attendance Health</h4>
                    <p>${stats.attendance_rate || 0}%</p>
                    <small class="text-muted">University-wide</small>
                </div>
            </article>
        `;

        renderChart(stats);
    }

    function renderChart(stats) {
        const ctx = document.getElementById('overviewChart');
        if (!ctx || !window.Chart) return;
        if (overviewChart) overviewChart.destroy();

        overviewChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Students', 'Teachers', 'Courses', 'Enrollments', 'Attendance %'],
                datasets: [{
                    label: 'University Snapshot',
                    data: [
                        stats.students || 0,
                        stats.teachers || 0,
                        stats.courses || 0,
                        stats.enrollments || 0,
                        stats.attendance_rate || 0
                    ],
                    backgroundColor: [
                        'rgba(56, 189, 248, 0.72)',
                        'rgba(16, 185, 129, 0.72)',
                        'rgba(245, 158, 11, 0.72)',
                        'rgba(139, 92, 246, 0.72)',
                        'rgba(244, 63, 94, 0.72)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 900, easing: 'easeOutQuart' },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.12)' },
                        ticks: { color: '#94a3b8', precision: 0 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#cbd5e1' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    function renderUsers() {
        const tbody = document.getElementById('users-table-body');
        const filtered = users.filter(user => {
            const haystack = `${user.name} ${user.email} ${user.role} ${user.department}`.toLowerCase();
            return haystack.includes(searchTerm);
        });

        tbody.innerHTML = filtered.length ? '' : '<tr><td colspan="4">No users match your search.</td></tr>';
        filtered.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${user.name}</strong><br><span class="text-muted">${user.department || 'No department'}</span></td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.role}">${user.role}</span></td>
                <td>
                    <span class="badge ${user.status === 'Active' ? 'badge-teacher' : 'badge-danger'}">${user.status}</span>
                    <span class="text-muted">${user.workload} ${user.role === 'teacher' ? 'courses' : user.role === 'student' ? 'enrollments' : 'items'}</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function renderCourses() {
        const tbody = document.getElementById('courses-table-body');
        tbody.innerHTML = courses.length ? '' : '<tr><td colspan="5">No courses available.</td></tr>';

        courses.forEach(course => {
            const fillRate = course.seats ? Math.round((course.enrolled / course.seats) * 100) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${course.code}</strong><br><span class="badge ${course.type === 'Elective' ? 'badge-admin' : 'badge-student'}">${course.type}</span></td>
                <td>${course.name}<br><span class="text-muted">${course.schedule || 'Schedule TBA'} | ${course.room || 'Room TBA'}</span></td>
                <td>${course.credits}</td>
                <td>${course.teacher}<br><span class="text-muted">${course.enrolled}/${course.seats} enrolled, ${fillRate}% full</span></td>
                <td><span class="badge ${course.status === 'Active' ? 'badge-teacher' : 'badge-muted'}">${course.status}</span> <span class="text-muted">${course.avg_marks || 0}% avg</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    function renderOperationsPanels() {
        const existing = document.getElementById('admin-operations-grid');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'admin-operations-grid';
        panel.className = 'insight-grid';
        panel.innerHTML = `
            <article class="insight-panel reveal-card">
                <h3>Course Demand</h3>
                ${(overview.top_courses || []).map(course => `
                    <div class="timeline-item">
                        <strong>${course.code} - ${course.name}</strong>
                        <span>${course.enrolled}/${course.seats} seats used with ${course.teacher || 'Unassigned'}</span>
                    </div>
                `).join('') || '<div class="empty-state">No course demand data.</div>'}
            </article>
            <article class="insight-panel reveal-card">
                <h3>Department Mix</h3>
                ${(overview.departments || []).map(dept => `
                    <div class="timeline-item">
                        <strong>${dept.department || 'Unassigned'}</strong>
                        <span>${dept.students} active students</span>
                    </div>
                `).join('') || '<div class="empty-state">No department data.</div>'}
            </article>
            <article class="insight-panel reveal-card">
                <h3>Announcements</h3>
                ${(overview.announcements || []).map(item => `
                    <div class="timeline-item">
                        <strong>${item.title}</strong>
                        <span>${item.message}</span>
                    </div>
                `).join('') || '<div class="empty-state">No announcements.</div>'}
            </article>
        `;
        document.getElementById('dashboard-sect').appendChild(panel);
    }

    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            searchTerm = event.target.value.trim().toLowerCase();
            renderUsers();
        });
    }

    document.getElementById('add-course-btn')?.addEventListener('click', () => {
        AppUI.showToast('Courses are loaded from SQLite. Add/create APIs can be added next.', 'info');
    });

    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        AppUI.showToast('Users are loaded from SQLite. Add/create APIs can be added next.', 'info');
    });

    loadAdminData();
});
