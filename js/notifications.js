/**
 * Agrio - Real-time Omnichannel Notification Manager (SMS/WhatsApp)
 */

class NotificationManager {
  constructor(state) {
    this.state = state;
    this.drawer = document.getElementById('phone-drawer');
    this.feed = document.getElementById('phone-messages-feed');
    this.badge = document.getElementById('unread-sms-count');
    this.toastContainer = document.getElementById('toast-container');
    this.activeFilter = 'all';

    this.initListeners();
    this.renderFeed();
  }

  initListeners() {
    const toggleBtn = document.getElementById('toggle-phone-btn');
    const closeBtn = document.getElementById('btn-close-phone');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleDrawer());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }

    // Filter tabs
    const tabs = document.querySelectorAll('.phone-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeFilter = e.currentTarget.dataset.filter;
        this.renderFeed();
      });
    });

    // Subscribe to state updates
    this.state.subscribe(() => {
      this.renderFeed();
    });
  }

  toggleDrawer() {
    this.drawer.classList.toggle('open');
    if (this.drawer.classList.contains('open')) {
      this.markAllAsRead();
    }
  }

  closeDrawer() {
    this.drawer.classList.remove('open');
  }

  markAllAsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.state.save();
    this.updateBadge();
  }

  updateBadge() {
    const unread = this.state.notifications.filter(n => !n.read).length;
    if (this.badge) {
      this.badge.textContent = unread;
      this.badge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  showToast(title, body, type = 'sms') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconName = type === 'whatsapp' ? 'message-circle' : 'message-square';
    const iconColor = type === 'whatsapp' ? '#10b981' : '#38bdf8';

    toast.innerHTML = `
      <div class="toast-icon" style="color: ${iconColor};">
        <i data-lucide="${iconName}"></i>
      </div>
      <div class="toast-content">
        <h5>${title}</h5>
        <p>${body}</p>
      </div>
    `;

    this.toastContainer.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  renderFeed() {
    if (!this.feed) return;
    this.updateBadge();

    const filtered = this.state.notifications.filter(n => {
      if (this.activeFilter === 'all') return true;
      return n.type === this.activeFilter;
    });

    if (filtered.length === 0) {
      this.feed.innerHTML = `
        <div style="text-align: center; color: var(--color-text-dim); margin-top: 3rem;">
          <i data-lucide="inbox" style="width: 36px; height: 36px; margin: 0 auto 0.5rem; display: block;"></i>
          <p>No notifications yet.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    this.feed.innerHTML = filtered.map(item => `
      <div class="phone-msg-bubble ${item.type}">
        <div class="phone-msg-meta">
          <strong style="color: ${item.type === 'whatsapp' ? '#34d399' : '#38bdf8'};">
            ${item.type === 'whatsapp' ? '🟢 WhatsApp Business' : '📱 Gov SMS Gateway'}
          </strong>
          <span>${item.time}</span>
        </div>
        <div style="font-weight: 700; color: #fff; margin-bottom: 0.2rem;">${item.title}</div>
        <p style="color: #cbd5e1; font-size: 0.78rem;">${item.body}</p>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }
}

window.NotificationManager = NotificationManager;
