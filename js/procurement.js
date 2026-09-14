/**
 * Agrio - Quality Assaying & Weighbridge Terminal Module
 * Digital Moisture Meter, IoT Scale Simulator, and J-Form Invoicing
 */

class ProcurementTerminal {
  constructor(state, notifMgr) {
    this.state = state;
    this.notifMgr = notifMgr;

    this.initElements();
    this.bindEvents();
    this.populateDropdowns();
    this.startIotScaleSimulation();
  }

  initElements() {
    this.assayTokenSelect = document.getElementById('assayer-token-select');
    this.assayerSummary = document.getElementById('assayer-farmer-summary');
    this.moistureSlider = document.getElementById('moisture-slider');
    this.moistureValDisplay = document.getElementById('moisture-val-display');
    this.assayForm = document.getElementById('assaying-form');

    this.weighTokenSelect = document.getElementById('weigh-token-select');
    this.liveScaleWeight = document.getElementById('live-scale-weight');
    this.grossInput = document.getElementById('gross-weight');
    this.tareInput = document.getElementById('tare-weight');
    this.netInput = document.getElementById('net-weight');
    this.calcQuintals = document.getElementById('calc-net-quintals');
    this.calcMsp = document.getElementById('calc-msp-rate');
    this.calcTotal = document.getElementById('calc-total-payable');
    this.weighForm = document.getElementById('weighbridge-form');

    this.jformModal = document.getElementById('jform-modal');
    this.jformModalBody = document.getElementById('jform-modal-body');
  }

  bindEvents() {
    // Moisture Slider Event
    if (this.moistureSlider && this.moistureValDisplay) {
      this.moistureSlider.addEventListener('input', (e) => {
        this.moistureValDisplay.textContent = `${e.target.value}%`;
      });
    }

    // Assayer Token Select Event
    if (this.assayTokenSelect) {
      this.assayTokenSelect.addEventListener('change', () => this.updateAssayerPreview());
    }

    // Assayer Form Submit
    if (this.assayForm) {
      this.assayForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAssaySubmit();
      });
    }

    // Weigh Token Select Event
    if (this.weighTokenSelect) {
      this.weighTokenSelect.addEventListener('change', () => this.updateWeighPreview());
    }

    // Weighbridge Weight Calculations
    const updateWeights = () => {
      const gross = parseFloat(this.grossInput.value || 0);
      const tare = parseFloat(this.tareInput.value || 0);
      const net = Math.max(0, gross - tare);
      const quintals = (net / 100).toFixed(2);
      
      this.netInput.value = net;
      if (this.calcQuintals) this.calcQuintals.textContent = `${quintals} Qtls`;

      const tokenNo = this.weighTokenSelect ? this.weighTokenSelect.value : null;
      const booking = this.state.bookings.find(b => b.tokenNo === tokenNo);
      const msp = booking ? booking.mspRate : 2275;

      if (this.calcMsp) this.calcMsp.textContent = `₹ ${msp.toLocaleString('en-IN')}`;
      if (this.calcTotal) this.calcTotal.textContent = `₹ ${(quintals * msp).toLocaleString('en-IN')}`;
    };

    if (this.grossInput) this.grossInput.addEventListener('input', updateWeights);
    if (this.tareInput) this.tareInput.addEventListener('input', updateWeights);

    // IoT Button captures
    const btnLockGross = document.getElementById('btn-lock-gross');
    const btnLockTare = document.getElementById('btn-lock-tare');

    if (btnLockGross) {
      btnLockGross.addEventListener('click', () => {
        const currentLive = parseInt(this.liveScaleWeight.textContent.replace(',', '')) || 7450;
        this.grossInput.value = currentLive;
        updateWeights();
        this.notifMgr.showToast('IoT Gross Weight Locked', `${currentLive} Kg captured from Scale #02`, 'sms');
      });
    }

    if (btnLockTare) {
      btnLockTare.addEventListener('click', () => {
        this.tareInput.value = 2950;
        updateWeights();
        this.notifMgr.showToast('IoT Tare Weight Locked', `2,950 Kg empty vehicle tare captured`, 'sms');
      });
    }

    // Weighbridge Form Submit (J-Form Generation)
    if (this.weighForm) {
      this.weighForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleWeighSubmit();
      });
    }

    // Modal Close
    const closeJFormBtn = document.getElementById('btn-close-jform-modal');
    const dismissJFormBtn = document.getElementById('btn-dismiss-jform');
    const printJFormBtn = document.getElementById('btn-print-jform');

    if (closeJFormBtn) closeJFormBtn.addEventListener('click', () => this.jformModal.classList.remove('open'));
    if (dismissJFormBtn) dismissJFormBtn.addEventListener('click', () => this.jformModal.classList.remove('open'));
    if (printJFormBtn) printJFormBtn.addEventListener('click', () => window.print());

    // Subscribe to state updates
    this.state.subscribe(() => {
      this.populateDropdowns();
    });
  }

  startIotScaleSimulation() {
    if (!this.liveScaleWeight) return;
    setInterval(() => {
      const base = 7420;
      const jitter = Math.floor(Math.random() * 16) - 8;
      this.liveScaleWeight.textContent = (base + jitter).toLocaleString('en-IN');
    }, 2000);
  }

  populateDropdowns() {
    const bookings = this.state.getCenterBookings();

    // Assayer Tokens: Checked-in or Scheduled
    if (this.assayTokenSelect) {
      const eligibleAssay = bookings.filter(b => b.status === 'CHECKED_IN' || b.status === 'SCHEDULED');
      if (eligibleAssay.length === 0) {
        this.assayTokenSelect.innerHTML = '<option value="">No vehicles waiting for assaying</option>';
      } else {
        this.assayTokenSelect.innerHTML = eligibleAssay.map(b => `
          <option value="${b.tokenNo}">${b.tokenNo} - ${b.vehicleNo} (${b.crop})</option>
        `).join('');
      }
      this.updateAssayerPreview();
    }

    // Weighbridge Tokens: Assayed or Checked-in
    if (this.weighTokenSelect) {
      const eligibleWeigh = bookings.filter(b => b.status === 'ASSAYED' || b.status === 'AT_WEIGHBRIDGE' || b.status === 'CHECKED_IN');
      if (eligibleWeigh.length === 0) {
        this.weighTokenSelect.innerHTML = '<option value="">No vehicles ready for weighbridge</option>';
      } else {
        this.weighTokenSelect.innerHTML = eligibleWeigh.map(b => `
          <option value="${b.tokenNo}">${b.tokenNo} - ${b.crop} (Est: ${b.estQty} Qtls)</option>
        `).join('');
      }
      this.updateWeighPreview();
    }
  }

  updateAssayerPreview() {
    if (!this.assayerSummary || !this.assayTokenSelect) return;
    const tokenNo = this.assayTokenSelect.value;
    const booking = this.state.bookings.find(b => b.tokenNo === tokenNo);
    if (!booking) {
      this.assayerSummary.innerHTML = '<span style="color: var(--color-text-dim);">Select a token to inspect parameters</span>';
      return;
    }

    const farmer = this.state.farmers.find(f => f.id === booking.farmerId);
    this.assayerSummary.innerHTML = `
      <div style="display: flex; justify-content: space-between;">
        <span><strong>Farmer:</strong> ${farmer ? farmer.name : 'Unknown'}</span>
        <span><strong>Vehicle:</strong> ${booking.vehicleNo}</span>
      </div>
      <div style="margin-top: 0.35rem; color: var(--color-text-muted);">
        <span>Crop: <strong>${booking.crop}</strong></span> | 
        <span>Quota: <strong>${booking.estQty} Quintals</strong></span>
      </div>
    `;
  }

  updateWeighPreview() {
    if (!this.weighTokenSelect) return;
    const tokenNo = this.weighTokenSelect.value;
    const booking = this.state.bookings.find(b => b.tokenNo === tokenNo);
    if (booking && this.calcMsp) {
      this.calcMsp.textContent = `₹ ${booking.mspRate.toLocaleString('en-IN')}`;
    }
  }

  handleAssaySubmit() {
    const tokenNo = this.assayTokenSelect.value;
    if (!tokenNo) return;

    const moisture = parseFloat(this.moistureSlider.value);
    const foreignMatter = parseFloat(document.getElementById('foreign-matter').value);
    const grade = document.getElementById('grade-select').value;

    this.state.updateBookingStatus(tokenNo, 'ASSAYED', {
      moisture,
      foreignMatter,
      grade
    });

    this.notifMgr.showToast(
      'Quality Parameters Approved',
      `Token ${tokenNo} cleared for Weighbridge (Grade A / FAQ).`,
      'whatsapp'
    );
  }

  handleWeighSubmit() {
    const tokenNo = this.weighTokenSelect.value;
    if (!tokenNo) return;

    const gross = parseFloat(this.grossInput.value);
    const tare = parseFloat(this.tareInput.value);
    const net = gross - tare;
    const quintals = parseFloat((net / 100).toFixed(2));

    const booking = this.state.bookings.find(b => b.tokenNo === tokenNo);
    const msp = booking ? booking.mspRate : 2275;
    const totalPayable = Math.round(quintals * msp);

    const updated = this.state.updateBookingStatus(tokenNo, 'COMPLETED', {
      grossWeight: gross,
      tareWeight: tare,
      netWeightKg: net,
      netQuintals: quintals,
      totalAmount: totalPayable
    });

    // Show J-Form Modal
    this.renderJFormModal(updated);

    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }

  renderJFormModal(booking) {
    if (!this.jformModal || !this.jformModalBody) return;
    const farmer = this.state.farmers.find(f => f.id === booking.farmerId) || this.state.getCurrentFarmer();
    const center = this.state.getCurrentCenter();

    this.jformModalBody.innerHTML = `
      <div style="border: 2px solid #059669; padding: 1.5rem; border-radius: 12px; background: #0c1829;">
        <div style="text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1rem;">
          <h3 style="color: #34d399; font-size: 1.25rem;">FORM 'J' - DIGITAL PROCUREMENT INVOICE</h3>
          <p style="font-size: 0.75rem; color: #94a3b8;">Issued under Agricultural Produce Marketing Act</p>
          <div style="margin-top: 0.5rem; font-size: 0.8rem; font-weight: 700;">Ref: JFORM-2026-${Math.floor(1000 + Math.random() * 9000)} | Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem; margin-bottom: 1.25rem;">
          <div>
            <span style="color: #94a3b8; font-size: 0.75rem;">Farmer Name:</span><br>
            <strong>${farmer.name}</strong><br>
            <span style="font-size: 0.75rem; color: #64748b;">Gov Land ID: ${farmer.govId}</span>
          </div>
          <div>
            <span style="color: #94a3b8; font-size: 0.75rem;">Mandi Terminal:</span><br>
            <strong>${center.name}</strong><br>
            <span style="font-size: 0.75rem; color: #64748b;">Weigh Scale #02 (IoT Stamped)</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem;">
          <tr style="background: rgba(255,255,255,0.05); border-bottom: 1px solid #1e293b;">
            <th style="padding: 0.5rem; text-align: left;">Description</th>
            <th style="padding: 0.5rem; text-align: right;">Measurement</th>
          </tr>
          <tr>
            <td style="padding: 0.4rem;">Crop & Grade</td>
            <td style="padding: 0.4rem; text-align: right;"><strong>${booking.crop} (${booking.grade || 'Grade A'})</strong></td>
          </tr>
          <tr>
            <td style="padding: 0.4rem;">Moisture Content</td>
            <td style="padding: 0.4rem; text-align: right;">${booking.moisture || 11.4}% (FAQ Standard)</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem;">Gross Weight / Tare</td>
            <td style="padding: 0.4rem; text-align: right;">${booking.grossWeight} Kg / ${booking.tareWeight} Kg</td>
          </tr>
          <tr style="border-top: 1px solid #1e293b; font-weight: 700;">
            <td style="padding: 0.5rem; color: #38bdf8;">Net Payable Weight</td>
            <td style="padding: 0.5rem; text-align: right; color: #38bdf8;">${booking.netQuintals} Quintals (${booking.netWeightKg} Kg)</td>
          </tr>
          <tr>
            <td style="padding: 0.4rem;">Govt MSP Rate</td>
            <td style="padding: 0.4rem; text-align: right;">₹ ${booking.mspRate.toLocaleString('en-IN')} / Qtl</td>
          </tr>
          <tr style="background: rgba(16, 185, 129, 0.15); font-size: 1.1rem; font-weight: 800; color: #34d399;">
            <td style="padding: 0.75rem;">Total Value Payable</td>
            <td style="padding: 0.75rem; text-align: right;">₹ ${booking.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div style="background: rgba(59, 130, 246, 0.1); padding: 0.75rem; border-radius: 8px; font-size: 0.75rem; border: 1px dashed rgba(59, 130, 246, 0.3);">
          <strong>Direct Benefit Transfer (DBT) Routing:</strong><br>
          Linked Bank: ${farmer.bankName} (A/C: ${farmer.accountMask})<br>
          Payment status: Scheduled for automatic NACH/PFMS treasury disbursement.
        </div>
      </div>
    `;

    this.jformModal.classList.add('open');
  }
}

window.ProcurementTerminal = ProcurementTerminal;
