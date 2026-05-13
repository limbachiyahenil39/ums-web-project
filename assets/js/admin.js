/* assets/js/admin.js */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth
    const user = AppUI.checkAuth(['admin']);
    if(!user) return;

    // Set Date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 2. Sidebar Navigation
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Load Stats & Chart
    function loadDashboardData() {
        const users = StorageDB.getUsers();
        const courses = StorageDB.getCourses();

        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');

        document.getElementById('stat-students').textContent = students.length;
        document.getElementById('stat-teachers').textContent = teachers.length;
        document.getElementById('stat-courses').textContent = courses.length;

        renderChart(students.length, teachers.length, courses.length);
    }

    let overviewChart = null;
    function renderChart(sc, tc, cc) {
        const ctx = document.getElementById('overviewChart');
        if(!ctx) return;
        
        if(overviewChart) overviewChart.destroy();

        overviewChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Students', 'Teachers', 'Courses'],
                datasets: [{
                    label: 'Total Count',
                    data: [sc, tc, cc],
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)'
                    ],
                    borderColor: [
                        'rgba(79, 70, 229, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8', stepSize: 1 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 4. Load Users
    function renderUsers(filter = '') {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        const users = StorageDB.getUsers().filter(u => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()));

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="badge badge-${u.role}">${u.role.toUpperCase()}</span></td>
                <td>
                    ${u.role !== 'admin' ? `<button class="btn btn-outline btn-delete-user" data-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>` : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach delete handlers
        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('Are you sure you want to delete this user?')) {
                    StorageDB.deleteUser(e.target.getAttribute('data-id'));
                    AppUI.showToast('User deleted', 'success');
                    renderUsers(document.getElementById('user-search').value);
                    loadDashboardData();
                }
            });
        });
    }

    // 5. Load Courses
    function renderCourses() {
        const tbody = document.getElementById('courses-table-body');
        tbody.innerHTML = '';
        const courses = StorageDB.getCourses();
        const users = StorageDB.getUsers();

        courses.forEach(c => {
            const teacher = users.find(u => u.id == c.teacherId);
            const teacherName = teacher ? teacher.name : 'Unassigned';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.code}</strong></td>
                <td>${c.name}</td>
                <td>${c.credits}</td>
                <td>${teacherName}</td>
                <td>
                    <button class="btn btn-outline btn-delete-course" data-id="${c.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; color: var(--danger); border-color: var(--danger);">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-delete-course').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('Delete course? Enrollments will be orphaned.')) {
                    StorageDB.deleteCourse(e.target.getAttribute('data-id'));
                    AppUI.showToast('Course deleted', 'success');
                    renderCourses();
                    loadDashboardData();
                }
            });
        });
    }

    // Search
    document.getElementById('user-search').addEventListener('input', (e) => {
        renderUsers(e.target.value);
    });

    // Add Course Logic (Simple Prompt for MVP, modal would be nicer but this is faster)
    document.getElementById('add-course-btn').addEventListener('click', () => {
        const code = prompt("Enter Course Code (e.g. CS101):");
        if(!code) return;
        const name = prompt("Enter Course Name:");
        if(!name) return;
        const credits = prompt("Enter Credits (Number):", "3");
        
        let teacherText = "Available Teachers:\n";
        const teachers = StorageDB.getTeachers();
        teachers.forEach(t => teacherText += `${t.id}: ${t.name}\n`);
        const teacherId = prompt(teacherText + "\nEnter Teacher ID to assign:");

        StorageDB.addCourse({ name, code, credits: parseInt(credits) || 3, teacherId: parseInt(teacherId) });
        AppUI.showToast('Course added successfully!', 'success');
        renderCourses();
        loadDashboardData();
    });

    // Add User Logic
    document.getElementById('add-user-btn').addEventListener('click', () => {
        const name = prompt("Enter User's Name:");
        if(!name) return;
        const email = prompt("Enter User's Email:");
        if(!email) return;
        const role = prompt("Enter Role (student, teacher, admin):","student");
        if(!['student','teacher','admin'].includes(role)) return alert('Invalid role');
        
        try {
            StorageDB.addUser({ name, email, password: 'password', role });
            AppUI.showToast('User created (default pass: password)', 'success');
            renderUsers();
            loadDashboardData();
        } catch(e) {
            AppUI.showToast(e.message, 'error');
        }
    });

    // Init
    loadDashboardData();
    renderUsers();
    renderCourses();
});
