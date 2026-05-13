/* assets/js/app.js */

// Global UI helpers and utilities

class AppUI {
    static showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if(type === 'success') icon = '✅';
        if(type === 'error') icon = '❌';
        if(type === 'warning') icon = '⚠️';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        // trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    static checkAuth(allowedRoles) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to their default dashboard
            if (user.role === 'admin') window.location.href = 'admin_dashboard.html';
            else if (user.role === 'teacher') window.location.href = 'teacher_dashboard.html';
            else window.location.href = 'student_dashboard.html';
            return null;
        }

        // populate sidebar user info if exists
        this.updateSidebarUser(user);
        return user;
    }

    static updateSidebarUser(user) {
        const nameEl = document.getElementById('sidebar-user-name');
        const roleEl = document.getElementById('sidebar-user-role');
        if(nameEl) nameEl.textContent = user.name;
        if(roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
}

// Bind global logout if button exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AppUI.logout();
        });
    }
});

// Format date helper
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}
