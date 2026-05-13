/* assets/js/storage.js */

// Manage all LocalStorage operations

class StorageDB {
    static init() {
        if (!localStorage.getItem('ums_users')) {
            this.seedData();
        }
    }

    static seedData() {
        const users = [
            { id: 1, name: 'Admin', email: 'admin@ums.com', password: 'password', role: 'admin', department: 'Administration' },
            { id: 2, name: 'John Doe', email: 'teacher@ums.com', password: 'password', role: 'teacher', department: 'B.Tech - Computer Science & Engineering (Co-Op)' },
            { id: 3, name: 'Jane Smith', email: 'student@ums.com', password: 'password', role: 'student', department: 'B.Tech - Computer Science & Engineering (Co-Op)' }
        ];

        const courses = [
            { id: 1, name: 'Introduction to Computer Science', code: 'CS101', credits: 3, teacherId: 2 },
            { id: 2, name: 'Advanced Web Development', code: 'CS302', credits: 4, teacherId: 2 }
        ];

        const enrollments = [
            { id: 1, studentId: 3, courseId: 1 },
            { id: 2, studentId: 3, courseId: 2 }
        ];

        const attendance = []; // { id, date, courseId, studentId, status }
        const marks = []; // { id, courseId, studentId, marks, total }

        localStorage.setItem('ums_users', JSON.stringify(users));
        localStorage.setItem('ums_courses', JSON.stringify(courses));
        localStorage.setItem('ums_enrollments', JSON.stringify(enrollments));
        localStorage.setItem('ums_attendance', JSON.stringify(attendance));
        localStorage.setItem('ums_marks', JSON.stringify(marks));
    }

    // Generic get
    static get(table) {
        return JSON.parse(localStorage.getItem(`ums_${table}`) || '[]');
    }

    // Generic save
    static save(table, data) {
        localStorage.setItem(`ums_${table}`, JSON.stringify(data));
    }

    // Specific helpers
    static getCourses() { return this.get('courses'); }
    static getUsers() { return this.get('users'); }
    static getTeachers() { return this.getUsers().filter(u => u.role === 'teacher'); }
    static getStudents() { return this.getUsers().filter(u => u.role === 'student'); }
    
    static addCourse(course) {
        const courses = this.getCourses();
        course.id = Date.now();
        courses.push(course);
        this.save('courses', courses);
        return course;
    }

    static deleteCourse(id) {
        let courses = this.getCourses();
        courses = courses.filter(c => c.id != id);
        this.save('courses', courses);
    }

    static addUser(user) {
        const users = this.getUsers();
        if(users.find(u => u.email === user.email)) {
            throw new Error('Email already exists');
        }
        user.id = Date.now();
        users.push(user);
        this.save('users', users);
        return user;
    }

    static deleteUser(id) {
        let users = this.getUsers();
        users = users.filter(u => u.id != id);
        this.save('users', users);
    }
}

// Initialize on load
StorageDB.init();
