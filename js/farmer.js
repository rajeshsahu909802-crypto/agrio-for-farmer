/**
 * Agrio - Farmer Portal Module
 * Slot Booking, QR Gate Pass Generation, and Multi-Stage Timeline Tracker
 */

class FarmerPortal {
  constructor(state, notifMgr) {
    this.state = state;
    this.notifMgr = notifMgr;
    this.selectedDate = 'Today';
    this.selectedSlot = '09:00 AM - 11:00 AM';

    this.initElements();
    this.bindEvents();
    this.renderDates();
    this.renderSlots();
    this.renderGatePass();
    this.renderTimeline();
  }

  initElements() {
    this.farmerSelect = document.getElementById('active-farmer-select');
    this.cropSelect = document.getElementById('crop-type');
    this.qtyInput = document.getElementById('est-quantity');
    this.payoutDisplay = document.getElementById('estimated-payout-val');
    this.bookingForm = document.getElementById('slot-booking-form');
    this.datesContainer = document.getElementById('date-picker-options');
    this.slotsContainer = document.getElementById('slots-time-container');
    this.gatepassContainer = document.getElementById('gatepass-container');
    this.timelineContainer = document.getElementById('farmer-timeline-container');
    this.receiptBox = document.getElementById('procurement-receipt-box');
  }

  bindEvents() {
    // Farmer profile switcher
    if (this.farmerSelect) {
      this.farmerSelect.addEventListener('change', (e) => {
        this.state.activeFarmerId = e.target.value;
        this.state.save();
        this.renderGatePass();
        this.renderTimeline();
      });
    }

    // Sub-tab switching (Book Slot vs Active Pass vs Track)
    const subTabs = document.querySelectorAll('.sub-tab-btn');
    subTabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        subTabs.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetTab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.farmer-sub-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`tab-${targetTab}`);
        if (panel) panel.classList.add('active');

        if (targetTab === 'farmer-active-pass') this.renderGatePass();
        if (targetTab === 'farmer-track') this.renderTimeline();
      });
    });

    // Payout calculator on crop or quantity change
    if (this.cropSelect && this.qtyInput) {
      const updatePayout = () => {
        const selectedOpt = this.cropSelect.options[this.cropSelect.selectedIndex];
        const msp = parseFloat(selectedOpt.dataset.msp || 2275);
        const qty = parseFloat(this.qtyInput.value || 0);
        const total = msp * qty;
        if (this.payoutDisplay) {
          this.payoutDisplay.textContent = `₹ ${total.toLocaleString('en-IN')}`;
        }
      };
      this.cropSelect.addEventListener('change', updatePayout);
      this.qtyInput.addEventListener('input', updatePayout);
    }

    // Booking Submission
    if (this.bookingForm) {
      this.bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookingSubmit();
      });
    }

    // Refresh status button
    const refreshBtn = document.getElementById('btn-refresh-status');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.renderTimeline();
        this.notifMgr.showToast('Status Refreshed', 'Latest mandi lifecycle progress synced.', 'sms');
      });
    }

    // Subscribe to state changes
    this.state.subscribe(() => {
      this.renderGatePass();
      this.renderTimeline();
    });
  }

  renderDates() {
    if (!this.datesContainer) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    let datesHtml = '';

    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = i === 0 ? 'TODAY' : days[d.getDay()];
      const dayNum = d.getDate();
      const monthName = d.toLocaleString('default', { month: 'short' });
      const isSelected = i === 0;

      datesHtml += `
        <div class="date-pill-card ${isSelected ? 'selected' : ''}" data-date="${dayName === 'TODAY' ? 'Today' : `${dayNum} ${monthName}`}">
          <span class="day-name">${dayName}</span>
          <span class="day-num">${dayNum}</span>
          <span class="quota-tag">Open Quota</span>
        </div>
      `;
    }

    this.datesContainer.innerHTML = datesHtml;

    // Attach click events
    this.datesContainer.querySelectorAll('.date-pill-card').forEach(card => {
      card.addEventListener('click', (e) => {
        this.datesContainer.querySelectorAll('.date-pill-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedDate = card.dataset.date;
        this.renderSlots();
      });
    });
  }

  renderSlots() {
    if (!this.slotsContainer) return;

    const slots = [
      { time: '07:00 AM - 09:00 AM', occupancy: 95, remaining: '3 slots left', high: true },
      { time: '09:00 AM - 11:00 AM', occupancy: 60, remaining: '18 slots left', high: false },
      { time: '11:00 AM - 01:00 PM', occupancy: 40, remaining: '25 slots left', high: false },
      { time: '02:00 PM - 04:00 PM', occupancy: 25, remaining: '32 slots left', high: false },
      { time: '04:00 PM - 06:00 PM', occupancy: 15, remaining: '38 slots left', high: false },
      { time: '06:00 PM - 08:00 PM (Night Weigh)', occupancy: 10, remaining: '40 slots left', high: false }
    ];

    this.slotsContainer.innerHTML = slots.map((s, idx) => `
      <div class="slot-card ${idx === 1 ? 'selected' : ''}" data-slot="${s.time}">
        <div class="slot-time">
          <span>${s.time}</span>
          <i data-lucide="clock" class="inline-icon"></i>
        </div>
        <div class="slot-occupancy-bar">
          <div class="slot-occupancy-fill ${s.high ? 'high' : ''}" style="width: ${s.occupancy}%"></div>
        </div>
        <div class="slot-meta">
          <span>${s.occupancy}% Booked</span>
          <span style="color: ${s.high ? '#f59e0b' : '#34d399'};">${s.remaining}</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();

    // Click handler for slots
    this.slotsContainer.querySelectorAll('.slot-card').forEach(card => {
      card.addEventListener('click', () => {
        this.slotsContainer.querySelectorAll('.slot-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedSlot = card.dataset.slot;
      });
    });
  }

  handleBookingSubmit() {
    const cropOpt = this.cropSelect.options[this.cropSelect.selectedIndex];
    const crop = cropOpt.value;
    const mspRate = parseFloat(cropOpt.dataset.msp || 2275);
    const estQty = parseFloat(this.qtyInput.value);
    const vehicleType = document.getElementById('vehicle-type').value;
    const vehicleNo = document.getElementById('vehicle-number').value.trim().toUpperCase();

    const booking = this.state.createBooking({
      crop,
      mspRate,
      estQty,
      vehicleType,
      vehicleNo,
      date: this.selectedDate,
      slotTime: this.selectedSlot,
      totalAmount: estQty * mspRate
    });

    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    this.notifMgr.showToast(
      'Slot Booked Successfully!',
      `Token ${booking.tokenNo} generated. Check your E-Pass tab.`,
      'whatsapp'
    );

    // Switch to active gate pass tab
    const passTabBtn = document.querySelector('.sub-tab-btn[data-tab="farmer-active-pass"]');
    if (passTabBtn) passTabBtn.click();
  }

  renderGatePass() {
    if (!this.gatepassContainer) return;
    const booking = this.state.getFarmerActiveBooking();
    const farmer = this.state.getCurrentFarmer();
    const center = this.state.getCurrentCenter();

    if (!booking) {
      this.gatepassContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <p style="color: var(--color-text-muted);">No active booking found. Reserve a slot first.</p>
        </div>
      `;
      return;
    }

    this.gatepassContainer.innerHTML = `
      <div class="digital-pass-card">
        <div class="pass-notch-left"></div>
        <div class="pass-notch-right"></div>

        <div class="pass-header">
          <div class="pass-brand">
            <i data-lucide="sprout" style="width: 28px; height: 28px;"></i>
            <div>
              <h4>AGRIGOV E-GATE PASS</h4>
              <span style="font-size: 0.75rem; opacity: 0.85;">Dept of Food, Civil Supplies & Consumer Affairs</span>
            </div>
          </div>
          <span class="pass-badge-valid">STATUS: ${booking.status.replace('_', ' ')}</span>
        </div>

        <div class="pass-body">
          <div class="pass-token-hero">
            <div>
              <span class="token-big-label">Digital Token Pass</span>
              <div class="token-big-number">${booking.tokenNo}</div>
              <span style="font-size: 0.8rem; color: #34d399; font-weight: 600;">
                <i data-lucide="check-circle" class="inline-icon"></i> Guaranteed Unloading Entry
              </span>
            </div>
            <div class="pass-qr-box" id="pass-qrcode-target">
              <!-- QR Code will render here -->
            </div>
          </div>

          <div class="pass-grid-details">
            <div class="pass-item">
              <span class="lbl">Farmer Name</span>
              <span class="val">${farmer.name} (${farmer.govId})</span>
            </div>
            <div class="pass-item">
              <span class="lbl">Procurement Hub</span>
              <span class="val">${center.name}</span>
            </div>
            <div class="pass-item">
              <span class="lbl">Crop & Quota Booked</span>
              <span class="val">${booking.crop} • ${booking.estQty} Qtls</span>
            </div>
            <div class="pass-item">
              <span class="lbl">Slot Arrival Window</span>
              <span class="val text-accent">${booking.date}, ${booking.slotTime}</span>
            </div>
            <div class="pass-item">
              <span class="lbl">Vehicle Number</span>
              <span class="val uppercase">${booking.vehicleNo} (${booking.vehicleType})</span>
            </div>
            <div class="pass-item">
              <span class="lbl">Settlement Bank</span>
              <span class="val">${farmer.bankName} (${farmer.accountMask})</span>
            </div>
          </div>
        </div>

        <div class="pass-footer-bar">
          <span style="font-size: 0.75rem; color: var(--color-text-dim);">
            <i data-lucide="shield-check" class="inline-icon"></i> Tamper-proof Cryptographic QR Pass
          </span>
          <button class="btn btn-secondary btn-sm" onclick="window.print()">
            <i data-lucide="download"></i> Save PDF
          </button>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Render QR Code
    const qrTarget = document.getElementById('pass-qrcode-target');
    if (qrTarget && window.QRCode) {
      qrTarget.innerHTML = '';
      new QRCode(qrTarget, {
        text: `AGRIO-TOKEN:${booking.tokenNo}|FARMER:${farmer.name}|QTY:${booking.estQty}|CENTER:${center.name}`,
        width: 88,
        height: 88,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  renderTimeline() {
    if (!this.timelineContainer) return;
    const booking = this.state.getFarmerActiveBooking();
    if (!booking) return;

    const stages = [
      { key: 'SCHEDULED', label: 'Slot Booked', icon: 'calendar-check', desc: booking.slotTime },
      { key: 'CHECKED_IN', label: 'Gate In (Lane 1)', icon: 'log-in', desc: booking.gateInTime || 'Awaiting Arrival' },
      { key: 'ASSAYED', label: 'Quality Assayed', icon: 'test-tube-2', desc: booking.moisture ? `Moisture ${booking.moisture}%` : 'Standard FAQ Test' },
      { key: 'AT_WEIGHBRIDGE', label: 'Weighbridge', icon: 'scale', desc: booking.grossWeight ? `${booking.netQuintals} Qtls` : 'Gross & Tare' },
      { key: 'COMPLETED', label: 'DBT Payment', icon: 'banknote', desc: 'Direct to Bank' }
    ];

    const stageOrder = ['SCHEDULED', 'CHECKED_IN', 'ASSAYED', 'AT_WEIGHBRIDGE', 'COMPLETED'];
    const currentIdx = stageOrder.indexOf(booking.status);

    this.timelineContainer.innerHTML = stages.map((stg, idx) => {
      let stateClass = '';
      if (idx < currentIdx) stateClass = 'completed';
      else if (idx === currentIdx) stateClass = 'active';

      return `
        <div class="timeline-step ${stateClass}">
          <div class="timeline-icon">
            <i data-lucide="${stg.icon}"></i>
          </div>
          <div class="timeline-label">${stg.label}</div>
          <div class="timeline-time">${stg.desc}</div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Render Receipt Summary if completed or at weighbridge
    if (this.receiptBox) {
      if (booking.status === 'COMPLETED' || booking.netQuintals) {
        this.receiptBox.style.display = 'block';
        this.receiptBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="font-size: 0.95rem;"><i data-lucide="file-check" class="inline-icon text-success"></i> Official Mandi Receipt (Form-J)</h4>
            <span class="badge ${booking.status === 'COMPLETED' ? 'badge-paid' : 'badge-weighed'}">
              ${booking.status === 'COMPLETED' ? 'Payment Credited' : 'Awaiting DBT Batch'}
            </span>
          </div>
          <div class="calc-row">
            <span>Net Procurement Weight:</span>
            <strong>${booking.netQuintals || booking.estQty} Quintals</strong>
          </div>
          <div class="calc-row">
            <span>Minimum Support Price (MSP):</span>
            <strong>₹ ${booking.mspRate.toLocaleString('en-IN')} / Qtl</strong>
          </div>
          <div class="calc-row" style="font-weight: 700; color: #34d399; font-size: 1.1rem; margin-top: 0.5rem; border-top: 1px solid var(--color-border); padding-top: 0.5rem;">
            <span>Total Payable:</span>
            <strong>₹ ${booking.totalAmount.toLocaleString('en-IN')}</strong>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      } else {
        this.receiptBox.style.display = 'none';
      }
    }
  }
}

window.FarmerPortal = FarmerPortal;
