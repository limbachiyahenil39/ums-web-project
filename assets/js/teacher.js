/* assets/js/teacher.js */

document.addEventListener('DOMContentLoaded', () => {
    const user = AppUI.checkAuth(['teacher']);
    if(!user) return;

    document.getElementById('current-date').textContent = new Date().toLocaleDateString();

    let myCourses = [];

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
        });
    });

    function loadCourses() {
        const courses = StorageDB.getCourses();
        myCourses = courses.filter(c => c.teacherId === user.id);
        
        const grid = document.getElementById('teacher-courses-grid');
        grid.innerHTML = '';
        
        const selectMarks = document.getElementById('course-select-marks');
        const selectAtt = document.getElementById('course-select-attendance');
        
        selectMarks.innerHTML = '<option value="">Select Course...</option>';
        selectAtt.innerHTML = '<option value="">Select Course...</option>';

        if(myCourses.length === 0) {
            grid.innerHTML = '<p class="text-muted">No courses assigned to you yet.</p>';
            return;
        }

        const enrollments = StorageDB.get('enrollments');

        myCourses.forEach(c => {
            const studentCount = enrollments.filter(e => e.courseId === c.id).length;

            // Overview card
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-icon" style="background: rgba(79, 70, 229, 0.1);">📚</div>
                <div class="stat-info">
                    <h4>${c.code}</h4>
                    <p style="font-size: 1.2rem;">${c.name}</p>
                    <small style="color: var(--text-muted);">${studentCount} Students Enrolled</small>
                </div>
            `;
            grid.appendChild(card);

            // Populate selects
            const opt = `<option value="${c.id}">${c.code} - ${c.name}</option>`;
            selectMarks.insertAdjacentHTML('beforeend', opt);
            selectAtt.insertAdjacentHTML('beforeend', opt);
        });
    }

    function getEnrolledStudents(courseId) {
        const courseIdInt = parseInt(courseId);
        const enrollments = StorageDB.get('enrollments').filter(e => e.courseId === courseIdInt);
        const allUsers = StorageDB.getUsers();
        
        // Map to student objects
        return enrollments.map(e => allUsers.find(u => u.id === e.studentId)).filter(u => u);
    }

    // --- GRADING ---
    document.getElementById('course-select-marks').addEventListener('change', (e) => {
        const courseId = e.target.value;
        const area = document.getElementById('grading-area');
        if(!courseId) { area.style.display = 'none'; return; }
        
        area.style.display = 'block';
        loadGradingTable(courseId);
    });

    function loadGradingTable(courseId) {
        const tbody = document.getElementById('grading-table-body');
        tbody.innerHTML = '';
        const students = getEnrolledStudents(courseId);
        const allMarks = StorageDB.get('marks');

        if(students.length===0) {
            tbody.innerHTML = '<tr><td colspan="4">No students enrolled.</td></tr>';
            return;
        }

        students.forEach(s => {
            const gradeObj = allMarks.find(m => m.studentId === s.id && m.courseId === parseInt(courseId));
            const marks = gradeObj ? gradeObj.marks : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.name}</td>
                <td>${s.email}</td>
                <td>
                    <input type="number" id="mark-${s.id}" class="form-control" value="${marks}" style="width:80px; padding:0.25rem 0.5rem;" min="0" max="100">
                </td>
                <td>
                    <button class="btn btn-primary btn-save-mark" data-student="${s.id}" data-course="${courseId}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Save</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-save-mark').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = parseInt(e.target.getAttribute('data-student'));
                const cId = parseInt(e.target.getAttribute('data-course'));
                const val = document.getElementById(`mark-${sId}`).value;

                let marksData = StorageDB.get('marks');
                let existing = marksData.find(m => m.studentId === sId && m.courseId === cId);
                
                if(existing) {
                    existing.marks = val;
                } else {
                    marksData.push({ id: Date.now(), studentId: sId, courseId: cId, marks: val });
                }
                
                StorageDB.save('marks', marksData);
                AppUI.showToast('Marks saved!', 'success');
            });
        });
    }

    // --- ATTENDANCE ---
    document.getElementById('attendance-date').valueAsDate = new Date();

    document.getElementById('course-select-attendance').addEventListener('change', (e) => {
        const courseId = e.target.value;
        const area = document.getElementById('attendance-area');
        if(!courseId) { area.style.display = 'none'; return; }
        
        area.style.display = 'block';
        loadAttendanceTable(courseId);
    });

    document.getElementById('attendance-date').addEventListener('change', () => {
        const courseId = document.getElementById('course-select-attendance').value;
        if(courseId) loadAttendanceTable(courseId);
    });

    function loadAttendanceTable(courseId) {
        const dateStr = document.getElementById('attendance-date').value;
        const tbody = document.getElementById('attendance-table-body');
        tbody.innerHTML = '';
        
        const students = getEnrolledStudents(courseId);
        const allAtt = StorageDB.get('attendance');

        if(students.length===0) {
            tbody.innerHTML = '<tr><td colspan="4">No students enrolled.</td></tr>';
            return;
        }

        students.forEach(s => {
            const attObj = allAtt.find(a => a.studentId === s.id && a.courseId === parseInt(courseId) && a.date === dateStr);
            const status = attObj ? attObj.status : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.name}</td>
                <td>${s.email}</td>
                <td>
                    <select id="att-${s.id}" class="form-control" style="width: auto; padding: 0.25rem 0.5rem;">
                        <option value="">--</option>
                        <option value="present" ${status==='present'?'selected':''}>Present</option>
                        <option value="absent" ${status==='absent'?'selected':''}>Absent</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-primary btn-save-att" data-student="${s.id}" data-course="${courseId}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Save</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-save-att').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = parseInt(e.target.getAttribute('data-student'));
                const cId = parseInt(e.target.getAttribute('data-course'));
                const date = document.getElementById('attendance-date').value;
                const val = document.getElementById(`att-${sId}`).value;

                if(!val) return AppUI.showToast('Please select a status', 'warning');

                let attData = StorageDB.get('attendance');
                let existing = attData.find(a => a.studentId === sId && a.courseId === cId && a.date === date);
                
                if(existing) {
                    existing.status = val;
                } else {
                    attData.push({ id: Date.now(), studentId: sId, courseId: cId, date, status: val });
                }
                
                StorageDB.save('attendance', attData);
                AppUI.showToast('Attendance saved!', 'success');
            });
        });
    }

    // --- MY STUDENTS (Department Filtering) ---
    function loadMyStudents() {
        const deptNameEl = document.getElementById('teacher-dept-name');
        const countEl = document.getElementById('total-dept-students');
        const tbody = document.getElementById('dept-students-body');
        
        if (!deptNameEl || !tbody) return;

        const teacherDept = user.department || 'Not Assigned';
        deptNameEl.textContent = teacherDept;

        const allUsers = StorageDB.getUsers();
        // Filter students exactly matching the teacher's department
        const myStudents = allUsers.filter(u => u.role === 'student' && u.department === teacherDept);

        countEl.textContent = myStudents.length;
        tbody.innerHTML = '';

        if (myStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No students registered in your department yet.</td></tr>';
            return;
        }

        myStudents.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${s.name}</td>
                <td class="text-muted">${s.email}</td>
                <td><span style="background: rgba(79, 70, 229, 0.1); color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.8rem;">${s.department}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    loadCourses();
    loadMyStudents();
});
