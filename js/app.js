/**
 * Agrio - Main Application Orchestrator
 * Wires up i18n, SMS Gateway, mobile navigation, and all modules
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize State & i18n
  const state = window.appState;
  const i18n = new I18nManager();
  window.i18n = i18n;

  // Initialize Notifications
  const notifMgr = new NotificationManager(state);

  // Initialize Role Modules
  window.farmerPortal = new FarmerPortal(state, notifMgr);
  window.queueMgr = new QueueManager(state, notifMgr);
  window.procurementTerminal = new ProcurementTerminal(state, notifMgr);
  window.adminHub = new AdminHub(state, notifMgr);
  window.smsGateway = new SmsGateway(state, notifMgr, i18n);

  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // ===== LANGUAGE SELECTOR =====
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langDropdown = document.getElementById('lang-dropdown');
  const langOptionsGrid = document.getElementById('lang-options-grid');

  // Populate language options
  if (langOptionsGrid) {
    langOptionsGrid.innerHTML = i18n.langMeta.map(lang => `
      <button class="lang-option-btn ${lang.code === i18n.currentLang ? 'active' : ''}" data-lang="${lang.code}">
        <span class="lang-native">${lang.native}</span>
        <span class="lang-english">${lang.name}</span>
      </button>
    `).join('');

    langOptionsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-option-btn');
      if (btn) {
        const langCode = btn.dataset.lang;
        i18n.setLanguage(langCode);

        // Update active state
        langOptionsGrid.querySelectorAll('.lang-option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Close dropdown
        langDropdown.classList.remove('open');

        // Re-create icons after translation
        if (window.lucide) lucide.createIcons();

        notifMgr.showToast('Language Changed', `Interface language set to ${btn.querySelector('.lang-native').textContent}`, 'sms');
      }
    });
  }

  // Toggle language dropdown
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (langDropdown && !langDropdown.contains(e.target) && e.target !== langToggleBtn) {
      langDropdown.classList.remove('open');
    }
  });

  // Apply initial language
  i18n.applyDirection(i18n.currentLang);
  i18n.applyTranslations();

  // ===== LIVE CLOCK & CONGESTION BADGE =====
  const updateSystemClock = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const phoneClock = document.getElementById('phone-clock');
    if (phoneClock) phoneClock.textContent = timeStr;
  };
  setInterval(updateSystemClock, 1000);
  updateSystemClock();

  // ===== ROLE NAVIGATION (Desktop + Mobile) =====
  const switchRole = (role, sourceButtons) => {
    // Update all nav buttons everywhere
    document.querySelectorAll('.role-btn, .mobile-nav-item, .bottom-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`[data-role="${role}"]`).forEach(b => b.classList.add('active'));

    // Switch view panel
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`view-${role}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Close mobile nav if open
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    if (mobileOverlay) mobileOverlay.classList.remove('open');

    // Re-trigger icon parsing
    if (window.lucide) lucide.createIcons();
  };

  // Desktop nav
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchRole(e.currentTarget.dataset.role);
    });
  });

  // Mobile overlay nav
  document.querySelectorAll('.mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchRole(e.currentTarget.dataset.role);
    });
  });

  // Bottom tab bar (mobile)
  document.querySelectorAll('.bottom-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchRole(e.currentTarget.dataset.role);
    });
  });

  // ===== HAMBURGER MENU =====
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const closeMobileNav = document.getElementById('close-mobile-nav');

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      mobileNavOverlay.classList.add('open');
    });
  }
  if (closeMobileNav) {
    closeMobileNav.addEventListener('click', () => {
      mobileNavOverlay.classList.remove('open');
    });
  }
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', (e) => {
      if (e.target === mobileNavOverlay) {
        mobileNavOverlay.classList.remove('open');
      }
    });
  }

  // ===== PROCUREMENT CENTER SELECTOR =====
  const centerSelect = document.getElementById('mandi-select');
  if (centerSelect) {
    centerSelect.addEventListener('change', (e) => {
      state.activeCenterId = e.target.value;
      state.save();
      const center = state.getCurrentCenter();
      notifMgr.showToast('Mandi Terminal Switched', `Active Center: ${center.name}`, 'sms');
    });
  }

  // ===== AUTO-SIMULATE LIVE DAY FLOW =====
  let simulationRunning = false;
  const autoSimulateBtn = document.getElementById('btn-auto-simulate');
  const autoSimulateMobileBtn = document.getElementById('btn-auto-simulate-mobile');
  const simulateBtnText = document.getElementById('simulate-btn-text');

  const runSimulation = () => {
    if (simulationRunning) return;
    simulationRunning = true;
    if (simulateBtnText) simulateBtnText.textContent = 'Simulating Day...';
    if (autoSimulateBtn) {
      autoSimulateBtn.classList.add('btn-primary');
      autoSimulateBtn.classList.remove('btn-secondary');
    }

    notifMgr.showToast('Simulation Started', 'Running end-to-end multi-stage procurement lifecycle...', 'whatsapp');

    // Step 1: Create a new farmer slot
    setTimeout(() => {
      const simBooking = state.createBooking({
        crop: 'Wheat - Sharbati (Grade A)',
        mspRate: 2275,
        estQty: 52,
        vehicleType: 'Tractor Trolley (Single Axle)',
        vehicleNo: 'HR-05-ZZ-9912',
        date: 'Today',
        slotTime: '09:00 AM - 11:00 AM',
        totalAmount: 52 * 2275
      });

      // Step 2: Check-in at Gate (Lane 1)
      setTimeout(() => {
        state.updateBookingStatus(simBooking.tokenNo, 'CHECKED_IN', { gateInTime: '10:05 AM' });

        // Step 3: Quality Assaying
        setTimeout(() => {
          state.updateBookingStatus(simBooking.tokenNo, 'ASSAYED', {
            moisture: 11.1,
            foreignMatter: 0.5,
            grade: 'Grade-A (FAQ Standard)'
          });

          // Step 4: Weighbridge Net Weight & Form J
          setTimeout(() => {
            state.updateBookingStatus(simBooking.tokenNo, 'COMPLETED', {
              grossWeight: 7650,
              tareWeight: 2450,
              netWeightKg: 5200,
              netQuintals: 52.0,
              totalAmount: 52 * 2275
            });

            // Step 5: Direct Benefit Transfer (DBT) Payout
            setTimeout(() => {
              state.releaseDbtPayments();

              if (window.confetti) {
                confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
              }

              if (simulateBtnText) simulateBtnText.textContent = i18n.t('header.simulate');
              if (autoSimulateBtn) {
                autoSimulateBtn.classList.remove('btn-primary');
                autoSimulateBtn.classList.add('btn-secondary');
              }
              simulationRunning = false;

              notifMgr.showToast('Simulation Complete!', 'Token proceeded through Booking -> Gate -> Assaying -> Weighing -> Bank Credit.', 'whatsapp');
            }, 3000);

          }, 3000);

        }, 3000);

      }, 3000);

    }, 1000);
  };

  if (autoSimulateBtn) {
    autoSimulateBtn.addEventListener('click', runSimulation);
  }
  if (autoSimulateMobileBtn) {
    autoSimulateMobileBtn.addEventListener('click', runSimulation);
  }
});
