/* assets/js/student.js */

document.addEventListener('DOMContentLoaded', () => {
    const user = AppUI.checkAuth(['student']);
    if(!user) return;

    document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Sidebar Nav
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(link.getAttribute('data-target')).classList.add('active');
            
            if(link.getAttribute('data-target') === 'performance-sect') {
                renderPerformanceChart();
            }
        });
    });

    let myEnrolledCourses = [];

    function loadStudentData() {
        const allCourses = StorageDB.getCourses();
        const enrollments = StorageDB.get('enrollments').filter(e => e.studentId === user.id);
        const marks = StorageDB.get('marks').filter(m => m.studentId === user.id);
        const attendance = StorageDB.get('attendance').filter(a => a.studentId === user.id);

        myEnrolledCourses = enrollments.map(e => allCourses.find(c => c.id === e.courseId)).filter(c => c);

        // Stats
        document.getElementById('stat-enrolled').textContent = myEnrolledCourses.length;
        
        const absences = attendance.filter(a => a.status === 'absent').length;
        document.getElementById('stat-absences').textContent = absences;

        let totalMarks = 0;
        let marksCount = 0;
        marks.forEach(m => { 
            if(m.marks) { totalMarks += parseInt(m.marks); marksCount++; }
        });
        const avg = marksCount > 0 ? (totalMarks / marksCount).toFixed(1) : '-';
        document.getElementById('stat-avg-grade').textContent = avg;

        // Courses Table
        const coursesBody = document.getElementById('my-courses-body');
        coursesBody.innerHTML = '';
        const allUsers = StorageDB.getUsers();

        if(myEnrolledCourses.length === 0) {
            coursesBody.innerHTML = '<tr><td colspan="4">Not enrolled in any courses.</td></tr>';
        }

        myEnrolledCourses.forEach(c => {
            const t = allUsers.find(u => u.id === c.teacherId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.code}</strong></td>
                <td>${c.name}</td>
                <td>${c.credits}</td>
                <td>${t ? t.name : 'N/A'}</td>
            `;
            coursesBody.appendChild(tr);
        });

        // Marks Table
        const marksBody = document.getElementById('student-marks-body');
        marksBody.innerHTML = '';
        if(myEnrolledCourses.length === 0) {
            marksBody.innerHTML = '<tr><td colspan="2">No grades recorded.</td></tr>';
        }
        myEnrolledCourses.forEach(c => {
            const gradeObj = marks.find(m => m.courseId === c.id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.code} - ${c.name}</td>
                <td><strong>${gradeObj ? gradeObj.marks : 'N/A'}</strong></td>
            `;
            marksBody.appendChild(tr);
        });

        // Attendance Table
        const attBody = document.getElementById('student-attendance-body');
        attBody.innerHTML = '';
        if(attendance.length === 0) {
            attBody.innerHTML = '<tr><td colspan="3">No attendance records found.</td></tr>';
        } else {
            attendance.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(a => {
                const c = allCourses.find(course => course.id === a.courseId);
                const tr = document.createElement('tr');
                let badgeClass = a.status === 'present' ? 'badge-teacher' : 'badge-admin';
                tr.innerHTML = `
                    <td>${a.date}</td>
                    <td>${c ? c.code : 'Unknown'}</td>
                    <td><span class="badge ${badgeClass}">${a.status.toUpperCase()}</span></td>
                `;
                attBody.appendChild(tr);
            });
        }
    }

    let perfChart = null;
    function renderPerformanceChart() {
        const marks = StorageDB.get('marks').filter(m => m.studentId === user.id);
        const labels = [];
        const data = [];

        myEnrolledCourses.forEach(c => {
            labels.push(c.code);
            const m = marks.find(mark => mark.courseId === c.id);
            data.push(m && m.marks ? parseInt(m.marks) : 0);
        });

        const ctx = document.getElementById('performanceChart');
        if(!ctx) return;

        if(perfChart) perfChart.destroy();

        perfChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Marks (%)',
                    data: data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // Enroll in Course (Prompt)
    document.getElementById('enroll-btn').addEventListener('click', () => {
        const available = StorageDB.getCourses().filter(c => !myEnrolledCourses.find(ec => ec.id === c.id));
        if(available.length === 0) {
            return AppUI.showToast('You are enrolled in all available courses.', 'warning');
        }

        let txt = "Available Courses to Enroll:\n";
        available.forEach(c => txt += `${c.id}: ${c.code} - ${c.name}\n`);
        const cId = prompt(txt + "\nEnter Course ID to enroll:");
        
        if(cId) {
            const course = available.find(c => c.id == parseInt(cId));
            if(course) {
                let enrollments = StorageDB.get('enrollments');
                enrollments.push({ id: Date.now(), studentId: user.id, courseId: course.id });
                StorageDB.save('enrollments', enrollments);
                AppUI.showToast('Successfully enrolled!', 'success');
                loadStudentData();
            } else {
                AppUI.showToast('Invalid Course ID', 'error');
            }
        }
    });

    loadStudentData();
});
