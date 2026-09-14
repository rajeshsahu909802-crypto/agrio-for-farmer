/**
 * Agrio - Admin Analytics & DBT Payment Hub Module
 * Real-Time Throughput Charts, Congestion KPIs, and PFMS/NPCI DBT Switch
 */

class AdminHub {
  constructor(state, notifMgr) {
    this.state = state;
    this.notifMgr = notifMgr;
    this.procurementChart = null;
    this.cropChart = null;

    this.initElements();
    this.bindEvents();
    this.initCharts();
    this.renderDbtTable();
    this.updateKPIs();
  }

  initElements() {
    this.dbtTableBody = document.getElementById('dbt-table-body');
    this.bulkReleaseBtn = document.getElementById('btn-bulk-dbt-release');
    this.kpiTotalProcured = document.getElementById('kpi-total-procured');
    this.kpiTotalDisbursed = document.getElementById('kpi-total-disbursed');
    this.kpiAvgTat = document.getElementById('kpi-avg-tat');
    this.kpiFarmersCount = document.getElementById('kpi-farmers-count');
  }

  bindEvents() {
    if (this.bulkReleaseBtn) {
      this.bulkReleaseBtn.addEventListener('click', () => {
        const released = this.state.releaseDbtPayments();
        if (released > 0) {
          if (window.confetti) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          }
          this.notifMgr.showToast('DBT Batch Disbursed', `${released} pending payments cleared via NPCI Aadhaar Bridge.`, 'sms');
        } else {
          this.notifMgr.showToast('No Pending Payouts', 'All issued J-Forms have already been credited.', 'sms');
        }
      });
    }

    // Subscribe to state updates
    this.state.subscribe(() => {
      this.renderDbtTable();
      this.updateKPIs();
      this.updateCharts();
    });
  }

  updateKPIs() {
    let totalQuintals = 0;
    this.state.bookings.forEach(b => {
      if (b.netQuintals) totalQuintals += parseFloat(b.netQuintals);
    });

    let totalDisbursed = 0;
    this.state.dbtRecords.forEach(d => {
      if (d.status === 'CREDITED') totalDisbursed += d.amount;
    });

    if (this.kpiTotalProcured) this.kpiTotalProcured.textContent = `${totalQuintals + 4820} Qtls`;
    if (this.kpiTotalDisbursed) {
      const crVal = ((totalDisbursed + 10900000) / 10000000).toFixed(2);
      this.kpiTotalDisbursed.textContent = `₹ ${crVal} Cr`;
    }
  }

  initCharts() {
    // 1. Hourly Procurement Bar Chart
    const ctxProc = document.getElementById('procurementChart');
    if (ctxProc && window.Chart) {
      this.procurementChart = new Chart(ctxProc, {
        type: 'bar',
        data: {
          labels: ['07-09 AM', '09-11 AM', '11-01 PM', '02-04 PM', '04-06 PM'],
          datasets: [
            {
              label: 'Slot Capacity (Qtls)',
              data: [150, 200, 180, 160, 120],
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              borderColor: '#3b82f6',
              borderWidth: 1,
              borderRadius: 6
            },
            {
              label: 'Actual Unloaded (Qtls)',
              data: [142, 195, 120, 0, 0],
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: '#10b981',
              borderWidth: 1,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // 2. Crop Distribution Doughnut Chart
    const ctxCrop = document.getElementById('cropDistributionChart');
    if (ctxCrop && window.Chart) {
      this.cropChart = new Chart(ctxCrop, {
        type: 'doughnut',
        data: {
          labels: ['Wheat Sharbati', 'Basmati Paddy', 'Mustard', 'Cotton'],
          datasets: [{
            data: [55, 25, 15, 5],
            backgroundColor: ['#10b981', '#38bdf8', '#f59e0b', '#a855f7'],
            borderColor: '#131f33',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
            }
          }
        }
      });
    }
  }

  updateCharts() {
    if (this.procurementChart) {
      // Re-render chart safely
      this.procurementChart.update();
    }
  }

  renderDbtTable() {
    if (!this.dbtTableBody) return;
    const records = this.state.dbtRecords;

    if (records.length === 0) {
      this.dbtTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--color-text-dim);">No transactions</td></tr>';
      return;
    }

    this.dbtTableBody.innerHTML = records.map(r => {
      const isPending = r.status === 'PENDING';
      const badgeClass = isPending ? 'badge-checkedin' : 'badge-paid';

      return `
        <tr>
          <td><strong style="color: #38bdf8;">${r.invoiceNo}</strong></td>
          <td>${r.farmerName}</td>
          <td><span style="font-size: 0.8rem; color: #94a3b8;">${r.bankAccount}</span></td>
          <td>${r.crop} (${r.netQty})</td>
          <td><strong style="color: #34d399;">₹ ${r.amount.toLocaleString('en-IN')}</strong></td>
          <td><span class="badge ${badgeClass}">${r.status}</span></td>
          <td><code style="font-size: 0.75rem; color: #cbd5e1;">${r.utrNo}</code></td>
          <td>
            ${isPending ? `
              <button class="btn btn-sm btn-success" onclick="window.appState.releaseDbtPayments()">
                Release DBT
              </button>
            ` : `
              <span style="font-size: 0.75rem; color: #34d399;"><i data-lucide="check-check" class="inline-icon"></i> Disbursed</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }
}

window.AdminHub = AdminHub;
