/**
 * Agrio - State Management & Data Store
 */

class AppState {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    const saved = localStorage.getItem('agrio_app_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.farmers = parsed.farmers || this.getDefaultFarmers();
        this.centers = parsed.centers || this.getDefaultCenters();
        this.activeCenterId = parsed.activeCenterId || 'karnal';
        this.activeFarmerId = parsed.activeFarmerId || 'FARM-001';
        this.bookings = parsed.bookings || this.getDefaultBookings();
        this.notifications = parsed.notifications || this.getDefaultNotifications();
        this.dbtRecords = parsed.dbtRecords || this.getDefaultDbtRecords();
        return;
      } catch (e) {
        console.warn('Failed to parse local state, resetting to defaults', e);
      }
    }

    // Default Seed Data
    this.farmers = this.getDefaultFarmers();
    this.centers = this.getDefaultCenters();
    this.activeCenterId = 'karnal';
    this.activeFarmerId = 'FARM-001';
    this.bookings = this.getDefaultBookings();
    this.notifications = this.getDefaultNotifications();
    this.dbtRecords = this.getDefaultDbtRecords();
    this.save();
  }

  getDefaultFarmers() {
    return [
      {
        id: 'FARM-001',
        name: 'Sardar Gurpreet Singh',
        govId: 'PB-882190',
        phone: '+91 98765-43210',
        village: 'Taraori, Karnal',
        acres: 12.0,
        bankName: 'State Bank of India',
        accountMask: '•••• 8842',
        ifsc: 'SBIN0001244',
        aadhaarLinked: true,
        quotaTotal: 250,
        quotaUsed: 70
      },
      {
        id: 'FARM-002',
        name: 'Rameshwar Patil',
        govId: 'MH-401923',
        phone: '+91 98231-11200',
        village: 'Pimpalgaon, Nashik',
        acres: 8.5,
        bankName: 'Bank of Maharashtra',
        accountMask: '•••• 4109',
        ifsc: 'MAHB0000491',
        aadhaarLinked: true,
        quotaTotal: 180,
        quotaUsed: 40
      },
      {
        id: 'FARM-003',
        name: 'Lakshmi Narayana',
        govId: 'TS-110488',
        phone: '+91 94401-89320',
        village: 'Enumamula, Warangal',
        acres: 6.0,
        bankName: 'Andhra Pragathi Grameena',
        accountMask: '•••• 6672',
        ifsc: 'APGB0002108',
        aadhaarLinked: true,
        quotaTotal: 120,
        quotaUsed: 0
      }
    ];
  }

  getDefaultCenters() {
    return {
      karnal: {
        id: 'karnal',
        name: 'Karnal Central Mandi (Haryana)',
        state: 'Haryana',
        capacityPerHour: 60, // Quintals
        weighbridges: 4,
        avgWaitMins: 12,
        lanes: [
          { id: 1, name: 'Lane 1: Wheat / Mustard', active: true, queueCount: 3 },
          { id: 2, name: 'Lane 2: Paddy / Basmati', active: true, queueCount: 1 },
          { id: 3, name: 'Lane 3: Fast-Track (<20 Qtl)', active: true, queueCount: 0 }
        ]
      },
      nashik: {
        id: 'nashik',
        name: 'Nashik Agri Terminal (Maharashtra)',
        state: 'Maharashtra',
        capacityPerHour: 45,
        weighbridges: 3,
        avgWaitMins: 18,
        lanes: [
          { id: 1, name: 'Lane 1: Coarse Grains & Corn', active: true, queueCount: 2 },
          { id: 2, name: 'Lane 2: Oilseeds', active: true, queueCount: 2 }
        ]
      },
      warangal: {
        id: 'warangal',
        name: 'Warangal Grain Depot (Telangana)',
        state: 'Telangana',
        capacityPerHour: 50,
        weighbridges: 4,
        avgWaitMins: 15,
        lanes: [
          { id: 1, name: 'Lane 1: Cotton & Paddy', active: true, queueCount: 1 }
        ]
      }
    };
  }

  getDefaultBookings() {
    return [
      {
        id: 'BKG-101',
        tokenNo: 'TOK-101',
        centerId: 'karnal',
        farmerId: 'FARM-002',
        crop: 'Wheat - Sharbati (Grade A)',
        mspRate: 2275,
        estQty: 50,
        vehicleType: 'Tractor Trolley (Double Axle)',
        vehicleNo: 'MH-15-EG-3391',
        date: 'Today',
        slotTime: '09:00 AM - 11:00 AM',
        status: 'AT_WEIGHBRIDGE', // SCHEDULED, CHECKED_IN, ASSAYED, AT_WEIGHBRIDGE, COMPLETED
        grossWeight: 7850,
        tareWeight: 2850,
        netWeightKg: 5000,
        netQuintals: 50.0,
        moisture: 11.2,
        foreignMatter: 0.6,
        grade: 'Grade-A (FAQ Standard)',
        totalAmount: 113750,
        gateInTime: '09:15 AM',
        createdAt: '2026-09-13 08:30'
      },
      {
        id: 'BKG-102',
        tokenNo: 'TOK-102',
        centerId: 'karnal',
        farmerId: 'FARM-001',
        crop: 'Wheat - Sharbati (Grade A)',
        mspRate: 2275,
        estQty: 45,
        vehicleType: 'Tractor Trolley (Single Axle)',
        vehicleNo: 'HR-05-AB-7749',
        date: 'Today',
        slotTime: '09:00 AM - 11:00 AM',
        status: 'CHECKED_IN',
        grossWeight: null,
        tareWeight: null,
        netWeightKg: null,
        netQuintals: 45.0,
        moisture: 11.4,
        foreignMatter: 0.8,
        grade: 'Grade-A (FAQ Standard)',
        totalAmount: 102375,
        gateInTime: '09:40 AM',
        createdAt: '2026-09-13 08:45'
      },
      {
        id: 'BKG-103',
        tokenNo: 'TOK-103',
        centerId: 'karnal',
        farmerId: 'FARM-003',
        crop: 'Mustard / Rapeseed',
        mspRate: 5650,
        estQty: 25,
        vehicleType: 'Mini Truck (Tata 407)',
        vehicleNo: 'TS-03-TR-9022',
        date: 'Today',
        slotTime: '11:00 AM - 01:00 PM',
        status: 'SCHEDULED',
        grossWeight: null,
        tareWeight: null,
        netWeightKg: null,
        netQuintals: 25.0,
        moisture: null,
        foreignMatter: null,
        grade: null,
        totalAmount: 141250,
        gateInTime: null,
        createdAt: '2026-09-13 09:00'
      }
    ];
  }

  getDefaultNotifications() {
    return [
      {
        id: 'NOTIF-1',
        type: 'whatsapp',
        sender: 'AgriGov Procurement',
        title: 'Gate Pass Confirmed (Token #TOK-102)',
        body: 'Dear Sardar Gurpreet Singh, your Wheat delivery slot is confirmed at Karnal Mandi for Today, 09:00-11:00 AM. Token: TOK-102. Please bring Land ID & Bank Passbook.',
        time: '08:46 AM',
        read: true
      },
      {
        id: 'NOTIF-2',
        type: 'sms',
        sender: 'VK-AGRGOV',
        title: 'Mandi Gate Check-in Successful',
        body: 'Token TOK-102: Verified at Gate 1. Assigned to Lane 1 for Grain Quality Assaying. Current est queue wait: 10 mins.',
        time: '09:40 AM',
        read: true
      },
      {
        id: 'NOTIF-3',
        type: 'sms',
        sender: 'VK-AGRGOV',
        title: 'Quality Assaying Passed (FAQ)',
        body: 'Assaying completed for TOK-102. Moisture: 11.4%, Foreign Matter: 0.8%. Grade A Approved. Proceeding to Weighbridge 2.',
        time: '09:55 AM',
        read: false
      }
    ];
  }

  getDefaultDbtRecords() {
    return [
      {
        id: 'DBT-9901',
        invoiceNo: 'JFORM-2026-098',
        farmerName: 'Balwinder Dhillon',
        bankAccount: 'SBI •••• 9921',
        crop: 'Wheat (Grade A)',
        netQty: '60.0 Qtls',
        amount: 136500,
        status: 'CREDITED', // PENDING, PROCESSING, CREDITED
        utrNo: 'SBIN26257884102',
        disbursedAt: '2026-09-13 09:30 AM'
      },
      {
        id: 'DBT-9902',
        invoiceNo: 'JFORM-2026-099',
        farmerName: 'Kishore Deshmukh',
        bankAccount: 'HDFC •••• 1104',
        crop: 'Mustard',
        netQty: '32.5 Qtls',
        amount: 183625,
        status: 'CREDITED',
        utrNo: 'HDFC26257890441',
        disbursedAt: '2026-09-13 10:00 AM'
      }
    ];
  }

  save() {
    const data = {
      farmers: this.farmers,
      centers: this.centers,
      activeCenterId: this.activeCenterId,
      activeFarmerId: this.activeFarmerId,
      bookings: this.bookings,
      notifications: this.notifications,
      dbtRecords: this.dbtRecords
    };
    localStorage.setItem('agrio_app_state_v2', JSON.stringify(data));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  // Active Getters
  getCurrentFarmer() {
    return this.farmers.find(f => f.id === this.activeFarmerId) || this.farmers[0];
  }

  getCurrentCenter() {
    return this.centers[this.activeCenterId] || this.centers['karnal'];
  }

  getFarmerActiveBooking(farmerId) {
    const fId = farmerId || this.activeFarmerId;
    return this.bookings.find(b => b.farmerId === fId) || this.bookings[0];
  }

  getCenterBookings(centerId) {
    const cId = centerId || this.activeCenterId;
    return this.bookings.filter(b => b.centerId === cId);
  }

  // State Mutators
  createBooking(bookingData) {
    const tokenNum = 'TOK-' + (100 + this.bookings.length + 1);
    const newBooking = {
      id: 'BKG-' + Date.now(),
      tokenNo: tokenNum,
      centerId: this.activeCenterId,
      farmerId: this.activeFarmerId,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      ...bookingData
    };

    this.bookings.unshift(newBooking);

    // Trigger initial notification
    const farmer = this.getCurrentFarmer();
    const center = this.getCurrentCenter();
    this.addNotification({
      type: 'whatsapp',
      sender: 'AgriGov Procurement',
      title: `Gate Pass Confirmed (${tokenNum})`,
      body: `Namaste ${farmer.name}, your slot for ${bookingData.crop} (${bookingData.estQty} Qtls) at ${center.name} is confirmed for ${bookingData.date}, ${bookingData.slotTime}. Token: ${tokenNum}.`
    });

    this.save();
    return newBooking;
  }

  updateBookingStatus(tokenNo, newStatus, extraData = {}) {
    const booking = this.bookings.find(b => b.tokenNo === tokenNo);
    if (!booking) return false;

    booking.status = newStatus;
    Object.assign(booking, extraData);

    const farmer = this.farmers.find(f => f.id === booking.farmerId) || this.getCurrentFarmer();

    // Trigger SMS/WhatsApp notifications on state transitions
    if (newStatus === 'CHECKED_IN') {
      this.addNotification({
        type: 'sms',
        sender: 'VK-AGRGOV',
        title: `Gate Check-in: ${tokenNo}`,
        body: `Token ${tokenNo}: Welcome to ${this.getCurrentCenter().name}. Please proceed to Lane 1 for Quality Assaying.`
      });
    } else if (newStatus === 'ASSAYED') {
      this.addNotification({
        type: 'sms',
        sender: 'VK-AGRGOV',
        title: `Assaying Approved: ${tokenNo}`,
        body: `Quality check passed for ${booking.crop}. Moisture: ${booking.moisture}%, Grade: ${booking.grade}. Please move to Weighbridge #1.`
      });
    } else if (newStatus === 'COMPLETED') {
      this.addNotification({
        type: 'whatsapp',
        sender: 'AgriGov Direct Benefit',
        title: `Procurement Completed & J-Form Issued`,
        body: `Procurement recorded: ${booking.netQuintals} Qtls @ MSP ₹${booking.mspRate} = ₹${booking.totalAmount.toLocaleString('en-IN')}. J-Form generated. DBT processing initiated.`
      });

      // Add to DBT payment queue
      this.dbtRecords.unshift({
        id: 'DBT-' + Date.now().toString().slice(-4),
        invoiceNo: `JFORM-2026-${Math.floor(100 + Math.random() * 900)}`,
        farmerName: farmer.name,
        bankAccount: `${farmer.bankName} ${farmer.accountMask}`,
        crop: booking.crop,
        netQty: `${booking.netQuintals} Qtls`,
        amount: booking.totalAmount,
        status: 'PENDING',
        utrNo: 'Awaiting Batch Clearance',
        disbursedAt: null
      });
    }

    this.save();
    return booking;
  }

  addNotification(notif) {
    const newNotif = {
      id: 'NOTIF-' + Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      ...notif
    };
    this.notifications.unshift(newNotif);
  }

  releaseDbtPayments() {
    let releasedCount = 0;
    this.dbtRecords.forEach(dbt => {
      if (dbt.status === 'PENDING') {
        dbt.status = 'CREDITED';
        dbt.utrNo = 'NPCI' + Math.floor(10000000000 + Math.random() * 90000000000);
        dbt.disbursedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
        releasedCount++;

        this.addNotification({
          type: 'sms',
          sender: 'VK-DBTGOV',
          title: 'DBT Payment Credited (Bank Direct)',
          body: `₹${dbt.amount.toLocaleString('en-IN')} credited to ${dbt.farmerName}'s A/C for ${dbt.crop}. UTR Ref: ${dbt.utrNo}. Central Agri Treasury.`
        });
      }
    });

    this.save();
    return releasedCount;
  }
}

// Global Store Instance
window.appState = new AppState();
