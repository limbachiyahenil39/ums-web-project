/* static/js/app.js */

class AppUI {
    static showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'i';
        if (type === 'success') icon = 'OK';
        if (type === 'error') icon = '!';
        if (type === 'warning') icon = '?';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

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
        window.location.href = '/logout';
    }

    static checkAuth(allowedRoles) {
        const userEl = document.querySelector('[data-user]');
        if (!userEl) {
            window.location.href = '/login';
            return null;
        }

        try {
            const user = JSON.parse(userEl.getAttribute('data-user'));
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                if (user.role === 'admin') window.location.href = '/admin';
                else if (user.role === 'teacher') window.location.href = '/teacher';
                else window.location.href = '/student';
                return null;
            }

            this.updateSidebarUser(user);
            return user;
        } catch (error) {
            return null;
        }
    }

    static updateSidebarUser(user) {
        const nameEl = document.getElementById('sidebar-user-name');
        const roleEl = document.getElementById('sidebar-user-role');
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
}

class ChatbotWidget {
    static mount() {
        if (!document.querySelector('[data-user]') || document.getElementById('ums-chatbot')) return;

        const widget = document.createElement('aside');
        widget.id = 'ums-chatbot';
        widget.className = 'chatbot-widget';
        widget.innerHTML = `
            <button class="chatbot-launcher" type="button" aria-label="Open university assistant">
                <img src="/static/img/student-chatbot.svg" alt="Student assistant">
                <span class="chatbot-pulse"></span>
            </button>
            <section class="chatbot-panel" aria-live="polite">
                <header>
                    <div>
                        <strong>UMS Assistant</strong>
                        <span>Connected to university database</span>
                    </div>
                    <button type="button" class="chatbot-close" aria-label="Close assistant">x</button>
                </header>
                <div class="chatbot-messages">
                    <div class="chatbot-message bot">Ask about courses, attendance, marks, users, events, or announcements.</div>
                </div>
                <form class="chatbot-form">
                    <input type="text" placeholder="Ask UMS..." autocomplete="off" aria-label="Ask UMS assistant">
                    <button type="submit">Send</button>
                </form>
            </section>
        `;

        document.body.appendChild(widget);

        const panel = widget.querySelector('.chatbot-panel');
        const launcher = widget.querySelector('.chatbot-launcher');
        const close = widget.querySelector('.chatbot-close');
        const form = widget.querySelector('.chatbot-form');
        const input = form.querySelector('input');
        const messages = widget.querySelector('.chatbot-messages');

        launcher.addEventListener('click', () => {
            widget.classList.add('is-open');
            panel.classList.add('is-open');
            input.focus();
        });

        close.addEventListener('click', () => {
            widget.classList.remove('is-open');
            panel.classList.remove('is-open');
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const message = input.value.trim();
            if (!message) return;

            this.addMessage(messages, message, 'user');
            input.value = '';
            const thinking = this.addMessage(messages, 'Checking database...', 'bot is-thinking');

            try {
                const response = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const payload = await response.json();
                thinking.remove();
                this.addMessage(messages, payload.reply || 'I could not find that yet.', 'bot');
            } catch (error) {
                thinking.remove();
                this.addMessage(messages, 'I could not reach the assistant endpoint. Please try again.', 'bot');
            }
        });
    }

    static addMessage(container, text, type) {
        const bubble = document.createElement('div');
        bubble.className = `chatbot-message ${type}`;
        bubble.textContent = text;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
        return bubble;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            AppUI.logout();
        });
    }

    ChatbotWidget.mount();
});

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}
