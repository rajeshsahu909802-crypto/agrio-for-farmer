/**
 * Agrio - Live Queue & Gate Operator Module
 * LED Calling Board, Check-in Desk, and Queue Orchestration
 */

class QueueManager {
  constructor(state, notifMgr) {
    this.state = state;
    this.notifMgr = notifMgr;

    this.initElements();
    this.bindEvents();
    this.renderLEDDisplay();
    this.renderQueueTable();
  }

  initElements() {
    this.ledNowCalling = document.getElementById('led-now-calling');
    this.ledCallingVehicle = document.getElementById('led-calling-vehicle');
    this.ledCallingLane = document.getElementById('led-calling-lane');
    this.ledAtWeighbridge = document.getElementById('led-at-weighbridge');
    this.ledWeighbridgeFarmer = document.getElementById('led-weighbridge-farmer');
    this.ledUpcomingList = document.getElementById('led-upcoming-tokens');
    this.ledClock = document.getElementById('led-live-clock');
    this.ledQueueCount = document.getElementById('led-queue-count');
    this.ledEstWait = document.getElementById('led-est-wait');

    this.tokenInput = document.getElementById('manual-token-input');
    this.checkinBtn = document.getElementById('btn-gate-checkin');
    this.readyPillsContainer = document.getElementById('ready-tokens-pills');
    this.queueTableBody = document.getElementById('queue-table-body');
    this.activeQueueBadge = document.getElementById('active-queue-count-badge');
  }

  bindEvents() {
    if (this.checkinBtn) {
      this.checkinBtn.addEventListener('click', () => {
        const token = this.tokenInput.value.trim().toUpperCase();
        if (token) this.handleCheckIn(token);
      });
    }

    if (this.tokenInput) {
      this.tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.checkinBtn.click();
        }
      });
    }

    // Subscribe to state updates
    this.state.subscribe(() => {
      this.renderLEDDisplay();
      this.renderQueueTable();
    });
  }

  handleCheckIn(tokenNo) {
    const booking = this.state.bookings.find(b => b.tokenNo === tokenNo);
    if (!booking) {
      this.notifMgr.showToast('Invalid Token', `Token ${tokenNo} was not found in database.`, 'sms');
      return;
    }

    if (booking.status !== 'SCHEDULED') {
      this.notifMgr.showToast('Already Checked In', `Token ${tokenNo} is currently in stage: ${booking.status}`, 'sms');
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.state.updateBookingStatus(tokenNo, 'CHECKED_IN', { gateInTime: timeStr });

    this.tokenInput.value = '';
    this.notifMgr.showToast('Gate Check-in Verified', `${tokenNo} checked in. Assigned to Lane 1 (Assaying).`, 'sms');
  }

  renderLEDDisplay() {
    const bookings = this.state.getCenterBookings();
    
    // Now Calling at Gate (Checked In)
    const callingGate = bookings.find(b => b.status === 'CHECKED_IN') || bookings[0];
    if (callingGate && this.ledNowCalling) {
      this.ledNowCalling.textContent = callingGate.tokenNo;
      this.ledCallingVehicle.textContent = `${callingGate.vehicleType} • ${callingGate.vehicleNo}`;
      this.ledCallingLane.textContent = 'Lane 1 (Assaying Bay)';
    }

    // At Weighbridge
    const atWeigh = bookings.find(b => b.status === 'AT_WEIGHBRIDGE' || b.status === 'ASSAYED');
    if (atWeigh && this.ledAtWeighbridge) {
      const farmer = this.state.farmers.find(f => f.id === atWeigh.farmerId);
      this.ledAtWeighbridge.textContent = atWeigh.tokenNo;
      this.ledWeighbridgeFarmer.textContent = `${farmer ? farmer.name : 'Farmer'} (${atWeigh.crop})`;
    }

    // Upcoming Tokens
    const upcoming = bookings.filter(b => b.status === 'SCHEDULED').slice(0, 3);
    if (this.ledUpcomingList) {
      if (upcoming.length === 0) {
        this.ledUpcomingList.innerHTML = '<span style="color: var(--color-text-dim); font-size: 0.8rem;">No pending queue</span>';
      } else {
        this.ledUpcomingList.innerHTML = upcoming.map(u => `
          <div class="upcoming-token-row">
            <span class="upcoming-token-num">${u.tokenNo}</span>
            <span class="upcoming-token-meta">${u.vehicleNo} (${u.slotTime.split(' - ')[0]})</span>
          </div>
        `).join('');
      }
    }

    // Queue Counters
    const activeInCampus = bookings.filter(b => b.status !== 'COMPLETED').length;
    if (this.ledQueueCount) this.ledQueueCount.textContent = activeInCampus;
    if (this.ledEstWait) this.ledEstWait.textContent = `${activeInCampus * 4} mins`;

    // Clock
    if (this.ledClock) {
      this.ledClock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  renderQueueTable() {
    const bookings = this.state.getCenterBookings();

    // Render Quick Action Pills for Gate
    const scheduled = bookings.filter(b => b.status === 'SCHEDULED');
    if (this.readyPillsContainer) {
      if (scheduled.length === 0) {
        this.readyPillsContainer.innerHTML = '<span class="helper-text">All booked tokens have checked in.</span>';
      } else {
        this.readyPillsContainer.innerHTML = scheduled.map(s => `
          <button class="token-action-pill" data-token="${s.tokenNo}">
            <i data-lucide="scan"></i> Check In ${s.tokenNo} (${s.vehicleNo})
          </button>
        `).join('');

        // Attach clicks
        this.readyPillsContainer.querySelectorAll('.token-action-pill').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const tok = e.currentTarget.dataset.token;
            this.handleCheckIn(tok);
          });
        });
      }
    }

    if (this.activeQueueBadge) {
      this.activeQueueBadge.textContent = `${bookings.length} Vehicles in System`;
    }

    // Render Table Rows
    if (this.queueTableBody) {
      this.queueTableBody.innerHTML = bookings.map(b => {
        const farmer = this.state.farmers.find(f => f.id === b.farmerId);
        const farmerName = farmer ? farmer.name : 'Unknown';

        let badgeClass = 'badge-scheduled';
        let stageText = 'Scheduled';

        if (b.status === 'CHECKED_IN') {
          badgeClass = 'badge-checkedin';
          stageText = 'Gate In (Lane 1)';
        } else if (b.status === 'ASSAYED') {
          badgeClass = 'badge-assayed';
          stageText = 'Assayed (Grade A)';
        } else if (b.status === 'AT_WEIGHBRIDGE') {
          badgeClass = 'badge-weighed';
          stageText = 'At Weighbridge';
        } else if (b.status === 'COMPLETED') {
          badgeClass = 'badge-paid';
          stageText = 'Completed / DBT';
        }

        return `
          <tr>
            <td><strong style="color: #38bdf8; font-family: var(--font-heading);">${b.tokenNo}</strong></td>
            <td>
              <div style="font-weight: 600;">${farmerName}</div>
              <small style="color: var(--color-text-dim);">${b.vehicleNo}</small>
            </td>
            <td>${b.crop} • <strong>${b.estQty} Qtl</strong></td>
            <td>${b.slotTime}</td>
            <td><span class="badge ${badgeClass}">${stageText}</span></td>
            <td>
              ${b.status === 'SCHEDULED' ? `
                <button class="btn btn-sm btn-primary" onclick="window.queueMgr.handleCheckIn('${b.tokenNo}')">
                  Check In
                </button>
              ` : `
                <span style="font-size: 0.75rem; color: var(--color-text-dim);"><i data-lucide="check" class="inline-icon"></i> In Process</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }

    if (window.lucide) lucide.createIcons();
  }
}

window.QueueManager = QueueManager;
