"""
Flask-based University Management System with SQLite storage.
"""

from datetime import timedelta
from functools import wraps
import os
import sqlite3

from flask import Flask, g, jsonify, redirect, render_template, request, session, url_for


app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

DB_PATH = os.path.join(app.root_path, 'ums.db')


def get_db():
    """Open one SQLite connection per request."""
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(error=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def row_to_dict(row):
    return dict(row) if row else None


def query_all(sql, args=()):
    return [dict(row) for row in get_db().execute(sql, args).fetchall()]


def query_one(sql, args=()):
    return row_to_dict(get_db().execute(sql, args).fetchone())


def scalar(sql, args=(), default=0):
    row = get_db().execute(sql, args).fetchone()
    if not row or row[0] is None:
        return default
    return row[0]


def init_db():
    """Create tables and seed useful demo data if the database is empty."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
            department TEXT,
            status TEXT NOT NULL DEFAULT 'Active',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'Core',
            credits INTEGER NOT NULL,
            teacher_id INTEGER,
            seats INTEGER NOT NULL DEFAULT 40,
            schedule TEXT,
            room TEXT,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'Active',
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            enrolled_on TEXT NOT NULL DEFAULT CURRENT_DATE,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id),
            UNIQUE(student_id, course_id)
        );

        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            marks INTEGER NOT NULL CHECK(marks BETWEEN 0 AND 100),
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id),
            UNIQUE(student_id, course_id)
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id),
            UNIQUE(student_id, course_id, date)
        );

        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            audience TEXT NOT NULL DEFAULT 'all',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            event_date TEXT NOT NULL,
            location TEXT,
            category TEXT NOT NULL DEFAULT 'Academic'
        );
        """
    )

    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] > 0:
        conn.commit()
        conn.close()
        return

    users = [
        ('Admin User', 'admin@ums.com', 'password', 'admin', 'Administration', 'Active'),
        ('Dr. Meera Shah', 'teacher@ums.com', 'password', 'teacher', 'Foundation Studies', 'Active'),
        ('Prof. Arjun Rao', 'arjun.rao@ums.com', 'password', 'teacher', 'Mathematics', 'Active'),
        ('Ms. Nisha Kapoor', 'nisha.kapoor@ums.com', 'password', 'teacher', 'Computer Science', 'Active'),
        ('Dr. Farah Khan', 'farah.khan@ums.com', 'password', 'teacher', 'Environmental Studies', 'Active'),
        ('Mr. Karan Malhotra', 'karan.malhotra@ums.com', 'password', 'teacher', 'Business Studies', 'Active'),
        ('Student User', 'student@ums.com', 'password', 'student', 'Foundation Year', 'Active'),
        ('Aditi Sharma', 'aditi.sharma@ums.com', 'password', 'student', 'Foundation Year', 'Active'),
        ('Rohan Mehta', 'rohan.mehta@ums.com', 'password', 'student', 'Foundation Year', 'Active'),
        ('Priya Nair', 'priya.nair@ums.com', 'password', 'student', 'Computer Science', 'Active'),
        ('Kabir Singh', 'kabir.singh@ums.com', 'password', 'student', 'Business Studies', 'Active'),
        ('Neha Patel', 'neha.patel@ums.com', 'password', 'student', 'Environmental Studies', 'Active'),
        ('Omar Khan', 'omar.khan@ums.com', 'password', 'student', 'Foundation Year', 'Active'),
    ]
    cur.executemany(
        """
        INSERT INTO users (name, email, password, role, department, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        users,
    )

    cur.execute("SELECT id, email FROM users")
    user_ids = {email: user_id for user_id, email in cur.fetchall()}

    courses = [
        ('UFP101', 'Academic Communication', 'UFP', 3, 'teacher@ums.com', 40, 'Mon/Wed 09:00', 'A-101', 'Writing, speaking, and presentation skills for university study.'),
        ('UFP102', 'Quantitative Reasoning', 'UFP', 4, 'arjun.rao@ums.com', 36, 'Tue/Thu 10:00', 'B-204', 'Mathematics, statistics, and data reasoning for first-year learners.'),
        ('UFP103', 'Digital Foundations', 'UFP', 3, 'nisha.kapoor@ums.com', 42, 'Fri 11:00', 'Lab-2', 'Computer basics, productivity tools, and responsible digital practice.'),
        ('ELE201', 'Creative Problem Solving', 'Elective', 2, 'teacher@ums.com', 32, 'Mon 14:00', 'Studio-1', 'Design thinking methods for academic and community challenges.'),
        ('ELE202', 'Environmental Studies', 'Elective', 2, 'farah.khan@ums.com', 30, 'Wed 15:00', 'C-110', 'Sustainability, climate awareness, and campus environmental action.'),
        ('ELE203', 'Introduction to Entrepreneurship', 'Elective', 3, 'karan.malhotra@ums.com', 28, 'Thu 13:00', 'B-108', 'Opportunity discovery, business models, and early venture planning.'),
        ('CS101', 'Introduction to Computer Science', 'Core', 4, 'nisha.kapoor@ums.com', 45, 'Tue/Fri 09:00', 'Lab-1', 'Programming fundamentals, algorithms, and computational thinking.'),
    ]
    cur.executemany(
        """
        INSERT INTO courses (code, name, type, credits, teacher_id, seats, schedule, room, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (code, name, course_type, credits, user_ids[email], seats, schedule, room, description)
            for code, name, course_type, credits, email, seats, schedule, room, description in courses
        ],
    )

    cur.execute("SELECT id, code FROM courses")
    course_ids = {code: course_id for course_id, code in cur.fetchall()}

    enrollments = [
        ('student@ums.com', 'UFP101'), ('student@ums.com', 'UFP102'), ('student@ums.com', 'ELE201'),
        ('aditi.sharma@ums.com', 'UFP101'), ('aditi.sharma@ums.com', 'UFP103'), ('aditi.sharma@ums.com', 'ELE202'),
        ('rohan.mehta@ums.com', 'UFP101'), ('rohan.mehta@ums.com', 'UFP102'), ('rohan.mehta@ums.com', 'ELE201'),
        ('priya.nair@ums.com', 'UFP103'), ('priya.nair@ums.com', 'CS101'), ('priya.nair@ums.com', 'ELE203'),
        ('kabir.singh@ums.com', 'UFP102'), ('kabir.singh@ums.com', 'ELE201'), ('kabir.singh@ums.com', 'ELE203'),
        ('neha.patel@ums.com', 'UFP101'), ('neha.patel@ums.com', 'ELE202'), ('neha.patel@ums.com', 'UFP103'),
        ('omar.khan@ums.com', 'UFP101'), ('omar.khan@ums.com', 'UFP102'), ('omar.khan@ums.com', 'ELE201'),
    ]
    cur.executemany(
        "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
        [(user_ids[email], course_ids[code]) for email, code in enrollments],
    )

    marks = [
        ('student@ums.com', 'UFP101', 88), ('student@ums.com', 'UFP102', 82), ('student@ums.com', 'ELE201', 91),
        ('aditi.sharma@ums.com', 'UFP101', 93), ('aditi.sharma@ums.com', 'UFP103', 87), ('aditi.sharma@ums.com', 'ELE202', 78),
        ('rohan.mehta@ums.com', 'UFP101', 76), ('rohan.mehta@ums.com', 'UFP102', 69), ('rohan.mehta@ums.com', 'ELE201', 81),
        ('priya.nair@ums.com', 'UFP103', 90), ('priya.nair@ums.com', 'CS101', 86), ('priya.nair@ums.com', 'ELE203', 88),
        ('kabir.singh@ums.com', 'UFP102', 72), ('kabir.singh@ums.com', 'ELE201', 68),
        ('neha.patel@ums.com', 'UFP101', 84), ('neha.patel@ums.com', 'ELE202', 92), ('neha.patel@ums.com', 'UFP103', 79),
        ('omar.khan@ums.com', 'UFP101', 64), ('omar.khan@ums.com', 'UFP102', 71),
    ]
    cur.executemany(
        "INSERT INTO marks (student_id, course_id, marks) VALUES (?, ?, ?)",
        [(user_ids[email], course_ids[code], mark) for email, code, mark in marks],
    )

    attendance_seed = [
        ('2026-04-24', 'UFP101', ['present', 'present', 'present', 'absent', 'present']),
        ('2026-04-27', 'UFP101', ['present', 'present', 'absent', 'present', 'present']),
        ('2026-04-29', 'UFP101', ['absent', 'present', 'present', 'present', 'absent']),
        ('2026-05-01', 'UFP101', ['present', 'present', 'present', 'present', 'present']),
        ('2026-04-23', 'UFP102', ['present', 'present', 'present', 'present']),
        ('2026-04-28', 'UFP102', ['present', 'absent', 'present', 'present']),
        ('2026-04-30', 'UFP102', ['present', 'present', 'absent', 'present']),
        ('2026-05-02', 'UFP102', ['present', 'present', 'present', 'absent']),
        ('2026-04-22', 'ELE201', ['absent', 'present', 'present', 'present']),
        ('2026-04-29', 'ELE201', ['present', 'present', 'absent', 'present']),
        ('2026-05-03', 'ELE201', ['present', 'absent', 'present', 'present']),
        ('2026-04-30', 'ELE202', ['present', 'present', 'present']),
        ('2026-05-04', 'ELE202', ['absent', 'present', 'present']),
        ('2026-04-25', 'UFP103', ['present', 'present', 'present', 'absent']),
        ('2026-05-02', 'UFP103', ['present', 'present', 'absent', 'present']),
        ('2026-04-26', 'CS101', ['present']),
        ('2026-05-03', 'CS101', ['present']),
        ('2026-04-30', 'ELE203', ['present', 'present', 'present']),
        ('2026-05-04', 'ELE203', ['present', 'absent', 'present']),
    ]

    attendance_rows = []
    for date, code, statuses in attendance_seed:
        cur.execute(
            """
            SELECT u.email
            FROM enrollments e
            JOIN users u ON u.id = e.student_id
            WHERE e.course_id = ?
            ORDER BY u.name
            """,
            (course_ids[code],),
        )
        enrolled_emails = [row[0] for row in cur.fetchall()]
        for email, status in zip(enrolled_emails, statuses):
            attendance_rows.append((user_ids[email], course_ids[code], date, status))

    cur.executemany(
        "INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)",
        attendance_rows,
    )

    announcements = [
        ('Enrollment Window Open', 'Students can adjust UFP and elective enrollments until Friday.', 'all'),
        ('Faculty Grade Review', 'Teachers should finalize pending marks for April assessments.', 'teacher'),
        ('Admin Data Check', 'Please review course capacity and teacher assignments for the new term.', 'admin'),
    ]
    cur.executemany(
        "INSERT INTO announcements (title, message, audience) VALUES (?, ?, ?)",
        announcements,
    )

    events = [
        ('Orientation Review', '2026-05-07', 'Auditorium', 'Academic'),
        ('Career Skills Workshop', '2026-05-10', 'Seminar Hall', 'Student Life'),
        ('Faculty Council Meeting', '2026-05-12', 'Admin Block', 'Administration'),
    ]
    cur.executemany(
        "INSERT INTO events (title, event_date, location, category) VALUES (?, ?, ?, ?)",
        events,
    )

    conn.commit()
    conn.close()


def login_required(allowed_roles=None):
    """Decorator to check if user is logged in and has required role."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                return redirect(url_for('login'))

            if allowed_roles and session['user']['role'] not in allowed_roles:
                role = session['user']['role']
                if role == 'admin':
                    return redirect(url_for('admin_dashboard'))
                if role == 'teacher':
                    return redirect(url_for('teacher_dashboard'))
                return redirect(url_for('student_dashboard'))

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def api_login_required(allowed_roles=None):
    """JSON-friendly auth decorator for dashboard APIs."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                return jsonify({'success': False, 'message': 'Please log in again.'}), 401

            if allowed_roles and session['user']['role'] not in allowed_roles:
                return jsonify({'success': False, 'message': 'Permission denied.'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def user_session_payload(user):
    return {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'department': user['department'],
        'status': user['status'],
    }


def course_belongs_to_teacher(course_id, teacher_id):
    return bool(query_one("SELECT id FROM courses WHERE id = ? AND teacher_id = ?", (course_id, teacher_id)))


def attendance_percent(where_sql='', args=()):
    total = scalar(f"SELECT COUNT(*) FROM attendance a {where_sql}", args)
    present = scalar(f"SELECT COUNT(*) FROM attendance a {where_sql} AND a.status = 'present'", args) if where_sql else scalar("SELECT COUNT(*) FROM attendance WHERE status = 'present'")
    if total == 0:
        return 0
    return round((present / total) * 100)


@app.route('/')
def index():
    """Home page."""
    if 'user' in session:
        role = session['user']['role']
        if role == 'admin':
            return redirect(url_for('admin_dashboard'))
        if role == 'teacher':
            return redirect(url_for('teacher_dashboard'))
        return redirect(url_for('student_dashboard'))
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page and authentication."""
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        user = query_one(
            """
            SELECT id, name, email, role, department, status
            FROM users
            WHERE email = ? AND password = ? AND status = 'Active'
            """,
            (email, password),
        )

        if user:
            session.permanent = True
            session['user'] = user_session_payload(user)
            return jsonify({'success': True, 'role': user['role']})

        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    return render_template('login.html')


@app.route('/logout')
def logout():
    """Logout user."""
    session.pop('user', None)
    return redirect(url_for('login'))


@app.route('/admin')
@login_required(allowed_roles=['admin'])
def admin_dashboard():
    return render_template('admin_dashboard.html', user=session['user'])


@app.route('/teacher')
@login_required(allowed_roles=['teacher'])
def teacher_dashboard():
    return render_template('teacher_dashboard.html', user=session['user'])


@app.route('/student')
@login_required(allowed_roles=['student'])
def student_dashboard():
    return render_template('student_dashboard.html', user=session['user'])


@app.route('/api/user')
@api_login_required()
def get_user():
    return jsonify(session['user'])


@app.route('/api/admin/overview')
@api_login_required(allowed_roles=['admin'])
def api_admin_overview():
    stats = {
        'students': scalar("SELECT COUNT(*) FROM users WHERE role = 'student'"),
        'teachers': scalar("SELECT COUNT(*) FROM users WHERE role = 'teacher'"),
        'admins': scalar("SELECT COUNT(*) FROM users WHERE role = 'admin'"),
        'courses': scalar("SELECT COUNT(*) FROM courses WHERE status = 'Active'"),
        'enrollments': scalar("SELECT COUNT(*) FROM enrollments"),
        'attendance_rate': attendance_percent(),
        'avg_marks': round(float(scalar("SELECT AVG(marks) FROM marks", default=0)), 1),
    }

    course_mix = query_all(
        """
        SELECT type, COUNT(*) AS count
        FROM courses
        GROUP BY type
        ORDER BY count DESC
        """
    )
    departments = query_all(
        """
        SELECT department, COUNT(*) AS students
        FROM users
        WHERE role = 'student'
        GROUP BY department
        ORDER BY students DESC
        """
    )
    top_courses = query_all(
        """
        SELECT c.id, c.code, c.name, c.type, c.seats, u.name AS teacher,
               COUNT(e.id) AS enrolled
        FROM courses c
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id
        ORDER BY enrolled DESC, c.code
        LIMIT 5
        """
    )
    announcements = query_all(
        """
        SELECT title, message, created_at
        FROM announcements
        WHERE audience IN ('all', 'admin')
        ORDER BY id DESC
        LIMIT 4
        """
    )
    events = query_all(
        """
        SELECT title, event_date, location, category
        FROM events
        ORDER BY event_date
        LIMIT 4
        """
    )

    return jsonify({
        'stats': stats,
        'course_mix': course_mix,
        'departments': departments,
        'top_courses': top_courses,
        'announcements': announcements,
        'events': events,
    })


@app.route('/api/admin/users')
@api_login_required(allowed_roles=['admin'])
def api_admin_users():
    users = query_all(
        """
        SELECT u.id, u.name, u.email, u.role, u.department, u.status,
               CASE
                   WHEN u.role = 'student' THEN (
                       SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id
                   )
                   WHEN u.role = 'teacher' THEN (
                       SELECT COUNT(*) FROM courses c WHERE c.teacher_id = u.id
                   )
                   ELSE 0
               END AS workload
        FROM users u
        ORDER BY
            CASE u.role WHEN 'admin' THEN 1 WHEN 'teacher' THEN 2 ELSE 3 END,
            u.name
        """
    )
    return jsonify({'users': users})


@app.route('/api/admin/courses')
@api_login_required(allowed_roles=['admin'])
def api_admin_courses():
    courses = query_all(
        """
        SELECT c.id, c.code, c.name, c.type, c.credits, c.seats, c.schedule, c.room, c.status,
               COALESCE(u.name, 'Unassigned') AS teacher,
               COUNT(DISTINCT e.student_id) AS enrolled,
               ROUND(AVG(m.marks), 1) AS avg_marks
        FROM courses c
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN marks m ON m.course_id = c.id
        GROUP BY c.id
        ORDER BY c.type DESC, c.code
        """
    )
    return jsonify({'courses': courses})


@app.route('/api/teacher/dashboard')
@api_login_required(allowed_roles=['teacher'])
def api_teacher_dashboard():
    teacher_id = session['user']['id']
    courses = query_all(
        """
        SELECT c.id, c.code, c.name, c.type, c.credits, c.seats, c.schedule, c.room, c.description,
               (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count,
               (SELECT ROUND(AVG(m.marks), 1) FROM marks m WHERE m.course_id = c.id) AS avg_marks,
               (SELECT COUNT(*) FROM marks m WHERE m.course_id = c.id) AS graded_count,
               (SELECT COUNT(*) FROM attendance a WHERE a.course_id = c.id) AS attendance_total,
               (SELECT COUNT(*) FROM attendance a WHERE a.course_id = c.id AND a.status = 'present') AS attendance_present
        FROM courses c
        WHERE c.teacher_id = ?
        ORDER BY c.code
        """,
        (teacher_id,),
    )
    for course in courses:
        total = course['attendance_total']
        course['attendance_rate'] = round((course['attendance_present'] / total) * 100) if total else 0
        course['capacity_used'] = round((course['student_count'] / course['seats']) * 100) if course['seats'] else 0

    students = query_all(
        """
        SELECT u.id, u.name, u.email, u.department, c.id AS course_id, c.code, c.name AS course_name,
               m.marks,
               (SELECT COUNT(*) FROM attendance a WHERE a.course_id = c.id AND a.student_id = u.id) AS attendance_total,
               (SELECT COUNT(*) FROM attendance a WHERE a.course_id = c.id AND a.student_id = u.id AND a.status = 'present') AS attendance_present
        FROM courses c
        JOIN enrollments e ON e.course_id = c.id
        JOIN users u ON u.id = e.student_id
        LEFT JOIN marks m ON m.course_id = c.id AND m.student_id = u.id
        WHERE c.teacher_id = ?
        ORDER BY c.code, u.name
        """,
        (teacher_id,),
    )
    for student in students:
        total = student['attendance_total']
        student['attendance_rate'] = round((student['attendance_present'] / total) * 100) if total else 0

    course_ids = [course['id'] for course in courses]
    pending_marks = 0
    if course_ids:
        placeholders = ','.join('?' for _ in course_ids)
        pending_marks = scalar(
            f"""
            SELECT COUNT(*)
            FROM enrollments e
            LEFT JOIN marks m ON m.course_id = e.course_id AND m.student_id = e.student_id
            WHERE e.course_id IN ({placeholders}) AND m.id IS NULL
            """,
            course_ids,
        )

    total_attendance = sum(course['attendance_total'] for course in courses)
    present_attendance = sum(course['attendance_present'] for course in courses)
    stats = {
        'courses': len(courses),
        'students': len({student['id'] for student in students}),
        'avg_marks': round(sum((course['avg_marks'] or 0) for course in courses) / len(courses), 1) if courses else 0,
        'attendance_rate': round((present_attendance / total_attendance) * 100) if total_attendance else 0,
        'pending_marks': pending_marks,
    }

    announcements = query_all(
        """
        SELECT title, message, created_at
        FROM announcements
        WHERE audience IN ('all', 'teacher')
        ORDER BY id DESC
        LIMIT 3
        """
    )
    events = query_all(
        """
        SELECT title, event_date, location, category
        FROM events
        ORDER BY event_date
        LIMIT 3
        """
    )

    return jsonify({
        'teacher': session['user'],
        'stats': stats,
        'courses': courses,
        'students': students,
        'announcements': announcements,
        'events': events,
    })


@app.route('/api/teacher/course/<int:course_id>/students')
@api_login_required(allowed_roles=['teacher'])
def api_teacher_course_students(course_id):
    teacher_id = session['user']['id']
    if not course_belongs_to_teacher(course_id, teacher_id):
        return jsonify({'success': False, 'message': 'Course not assigned to this teacher.'}), 403

    course = query_one("SELECT id, code, name FROM courses WHERE id = ?", (course_id,))
    students = query_all(
        """
        SELECT u.id, u.name, u.email, u.department, m.marks,
               (SELECT COUNT(*) FROM attendance a WHERE a.course_id = ? AND a.student_id = u.id) AS attendance_total,
               (SELECT COUNT(*) FROM attendance a WHERE a.course_id = ? AND a.student_id = u.id AND a.status = 'present') AS attendance_present
        FROM enrollments e
        JOIN users u ON u.id = e.student_id
        LEFT JOIN marks m ON m.course_id = e.course_id AND m.student_id = e.student_id
        WHERE e.course_id = ?
        ORDER BY u.name
        """,
        (course_id, course_id, course_id),
    )
    for student in students:
        total = student['attendance_total']
        student['attendance_rate'] = round((student['attendance_present'] / total) * 100) if total else 0

    return jsonify({'course': course, 'students': students})


@app.route('/api/teacher/marks', methods=['POST'])
@api_login_required(allowed_roles=['teacher'])
def api_teacher_update_marks():
    data = request.get_json(silent=True) or {}
    course_id = int(data.get('course_id', 0))
    student_id = int(data.get('student_id', 0))
    marks = int(data.get('marks', 0))

    if marks < 0 or marks > 100:
        return jsonify({'success': False, 'message': 'Marks must be between 0 and 100.'}), 400
    if not course_belongs_to_teacher(course_id, session['user']['id']):
        return jsonify({'success': False, 'message': 'Course not assigned to this teacher.'}), 403

    db = get_db()
    db.execute(
        """
        INSERT INTO marks (student_id, course_id, marks)
        VALUES (?, ?, ?)
        ON CONFLICT(student_id, course_id)
        DO UPDATE SET marks = excluded.marks, updated_at = CURRENT_TIMESTAMP
        """,
        (student_id, course_id, marks),
    )
    db.commit()
    return jsonify({'success': True, 'message': 'Marks saved.'})


@app.route('/api/teacher/attendance', methods=['POST'])
@api_login_required(allowed_roles=['teacher'])
def api_teacher_update_attendance():
    data = request.get_json(silent=True) or {}
    course_id = int(data.get('course_id', 0))
    student_id = int(data.get('student_id', 0))
    date = data.get('date', '')
    status = data.get('status', '')

    if status not in ('present', 'absent'):
        return jsonify({'success': False, 'message': 'Invalid attendance status.'}), 400
    if not date:
        return jsonify({'success': False, 'message': 'Attendance date is required.'}), 400
    if not course_belongs_to_teacher(course_id, session['user']['id']):
        return jsonify({'success': False, 'message': 'Course not assigned to this teacher.'}), 403

    db = get_db()
    db.execute(
        """
        INSERT INTO attendance (student_id, course_id, date, status)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(student_id, course_id, date)
        DO UPDATE SET status = excluded.status
        """,
        (student_id, course_id, date, status),
    )
    db.commit()
    return jsonify({'success': True, 'message': 'Attendance saved.'})


@app.route('/api/chatbot', methods=['POST'])
@api_login_required()
def api_chatbot():
    data = request.get_json(silent=True) or {}
    message = data.get('message', '').strip().lower()
    user = session['user']

    if not message:
        return jsonify({'reply': 'Ask me about courses, grades, attendance, students, events, or announcements.'})

    if user['role'] == 'student':
        reply = chatbot_student_reply(user['id'], message)
    elif user['role'] == 'teacher':
        reply = chatbot_teacher_reply(user['id'], message)
    else:
        reply = chatbot_admin_reply(message)

    return jsonify({'reply': reply})


def chatbot_student_reply(student_id, message):
    if any(word in message for word in ['attendance', 'present', 'absent']):
        total = scalar("SELECT COUNT(*) FROM attendance WHERE student_id = ?", (student_id,))
        present = scalar("SELECT COUNT(*) FROM attendance WHERE student_id = ? AND status = 'present'", (student_id,))
        percent = round((present / total) * 100) if total else 0
        return f"Your current attendance is {percent}% with {present}/{total} sessions marked present."

    if any(word in message for word in ['gpa', 'grade', 'marks', 'score']):
        rows = query_all(
            """
            SELECT c.code, c.credits, m.marks
            FROM marks m
            JOIN courses c ON c.id = m.course_id
            WHERE m.student_id = ?
            """,
            (student_id,),
        )
        if not rows:
            return 'No marks are recorded for you yet.'
        average = round(sum(row['marks'] for row in rows) / len(rows), 1)
        best = max(rows, key=lambda row: row['marks'])
        return f"Your average marks are {average}%. Best current course: {best['code']} with {best['marks']}%."

    if any(word in message for word in ['course', 'ufp', 'elective', 'enrolled']):
        rows = query_all(
            """
            SELECT c.code, c.name, c.type, c.schedule
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = ?
            ORDER BY c.code
            """,
            (student_id,),
        )
        if not rows:
            return 'You are not enrolled in any courses yet.'
        return 'You are enrolled in: ' + '; '.join(f"{row['code']} ({row['type']}, {row['schedule']})" for row in rows) + '.'

    if 'event' in message or 'calendar' in message:
        events = query_all("SELECT title, event_date, location FROM events ORDER BY event_date LIMIT 3")
        return 'Upcoming events: ' + '; '.join(f"{event['title']} on {event['event_date']} at {event['location']}" for event in events) + '.'

    announcement = query_one("SELECT title, message FROM announcements WHERE audience IN ('all', 'student') ORDER BY id DESC LIMIT 1")
    return f"{announcement['title']}: {announcement['message']}" if announcement else 'I can help with your courses, attendance, grades, and upcoming events.'


def chatbot_teacher_reply(teacher_id, message):
    if any(word in message for word in ['student', 'class', 'enrollment']):
        count = scalar(
            """
            SELECT COUNT(DISTINCT e.student_id)
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE c.teacher_id = ?
            """,
            (teacher_id,),
        )
        courses = query_all("SELECT code FROM courses WHERE teacher_id = ? ORDER BY code", (teacher_id,))
        return f"You currently teach {count} unique students across {', '.join(row['code'] for row in courses)}."

    if any(word in message for word in ['mark', 'grade', 'pending']):
        pending = scalar(
            """
            SELECT COUNT(*)
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            LEFT JOIN marks m ON m.course_id = e.course_id AND m.student_id = e.student_id
            WHERE c.teacher_id = ? AND m.id IS NULL
            """,
            (teacher_id,),
        )
        avg_marks = scalar(
            """
            SELECT ROUND(AVG(m.marks), 1)
            FROM marks m
            JOIN courses c ON c.id = m.course_id
            WHERE c.teacher_id = ?
            """,
            (teacher_id,),
            default=0,
        )
        return f"Your classes have an average score of {avg_marks}%. Pending grade entries: {pending}."

    if any(word in message for word in ['attendance', 'present', 'absent']):
        total = scalar(
            "SELECT COUNT(*) FROM attendance a JOIN courses c ON c.id = a.course_id WHERE c.teacher_id = ?",
            (teacher_id,),
        )
        present = scalar(
            "SELECT COUNT(*) FROM attendance a JOIN courses c ON c.id = a.course_id WHERE c.teacher_id = ? AND a.status = 'present'",
            (teacher_id,),
        )
        percent = round((present / total) * 100) if total else 0
        return f"Overall attendance across your courses is {percent}% with {present}/{total} present records."

    events = query_all("SELECT title, event_date FROM events ORDER BY event_date LIMIT 2")
    return 'Today focus: review pending marks, update attendance, and check students below 75% attendance. Next events: ' + '; '.join(f"{event['title']} on {event['event_date']}" for event in events) + '.'


def chatbot_admin_reply(message):
    if any(word in message for word in ['student', 'teacher', 'user']):
        students = scalar("SELECT COUNT(*) FROM users WHERE role = 'student'")
        teachers = scalar("SELECT COUNT(*) FROM users WHERE role = 'teacher'")
        return f"The system has {students} active students and {teachers} teachers."

    if any(word in message for word in ['course', 'ufp', 'elective']):
        courses = query_all(
            """
            SELECT type, COUNT(*) AS count
            FROM courses
            GROUP BY type
            ORDER BY type
            """
        )
        return 'Course mix: ' + ', '.join(f"{row['count']} {row['type']}" for row in courses) + '.'

    if any(word in message for word in ['attendance', 'health']):
        return f"Overall attendance health is {attendance_percent()}%."

    if any(word in message for word in ['mark', 'grade', 'average']):
        avg_marks = scalar("SELECT ROUND(AVG(marks), 1) FROM marks", default=0)
        return f"University-wide average marks are currently {avg_marks}%."

    enrollments = scalar("SELECT COUNT(*) FROM enrollments")
    courses = scalar("SELECT COUNT(*) FROM courses")
    return f"Admin snapshot: {courses} active courses, {enrollments} enrollments, and {attendance_percent()}% attendance health."


@app.errorhandler(404)
def page_not_found(e):
    return render_template('index.html'), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


init_db()


if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)

    app.run(debug=True, host='127.0.0.1', port=5000)
