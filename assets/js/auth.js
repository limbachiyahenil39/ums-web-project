/* assets/js/auth.js */

document.addEventListener('DOMContentLoaded', () => {
    // Check if fully logged in already
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
        if(currentUser.role === 'admin') window.location.href = 'admin_dashboard.html';
        else if(currentUser.role === 'teacher') window.location.href = 'teacher_dashboard.html';
        else window.location.href = 'student_dashboard.html';
    }

    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form-el');

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        signupSection.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const pass = document.getElementById('login-password').value;

        const users = StorageDB.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email && u.password === pass);

        if(user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            AppUI.showToast('Login successful', 'success');
            setTimeout(() => {
                if(user.role === 'admin') window.location.href = 'admin_dashboard.html';
                else if(user.role === 'teacher') window.location.href = 'teacher_dashboard.html';
                else window.location.href = 'student_dashboard.html';
            }, 1000);
        } else {
            AppUI.showToast('Invalid email or password', 'error');
        }
    });

    // Handle Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const pass = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;
        const department = document.getElementById('signup-department').value;

        try {
            const newUser = StorageDB.addUser({ name, email, password: pass, role, department });
            AppUI.showToast('Account created! Please login.', 'success');
            signupForm.reset();
            signupSection.style.display = 'none';
            loginSection.style.display = 'block';
        } catch (error) {
            AppUI.showToast(error.message, 'error');
        }
    });

    // Handle Password Visibility Toggle
    const togglePasswords = document.querySelectorAll('.toggle-password');
    togglePasswords.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.textContent = '🙈'; // Eye closed icon
            } else {
                targetInput.type = 'password';
                this.textContent = '👁️';  // Eye open icon
            }
        });
    });
});
