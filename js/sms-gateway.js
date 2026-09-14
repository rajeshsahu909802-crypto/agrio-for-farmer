/**
 * Agrio - SMS Command Gateway Simulator
 * Two-way SMS system for keypad/feature phones
 * Parses text commands and generates responses in selected language
 */

class SmsGateway {
  constructor(state, notifMgr, i18n) {
    this.state = state;
    this.notifMgr = notifMgr;
    this.i18n = i18n;
    this.messages = [];
    this.smsNumber = '+91-1800-AGRI-GOV (1800-2474-468)';

    this.initElements();
    this.bindEvents();
    this.addWelcomeMessage();
  }

  initElements() {
    this.chatFeed = document.getElementById('sms-chat-feed');
    this.smsInput = document.getElementById('sms-command-input');
    this.sendBtn = document.getElementById('btn-sms-send');
    this.quickCmdsContainer = document.getElementById('sms-quick-commands');
  }

  bindEvents() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.handleSend());
    }
    if (this.smsInput) {
      this.smsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSend();
        }
      });
    }

    // Quick command buttons
    if (this.quickCmdsContainer) {
      this.quickCmdsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.sms-quick-btn');
        if (btn) {
          const cmd = btn.dataset.cmd;
          if (this.smsInput) this.smsInput.value = cmd;
          this.handleSend();
        }
      });
    }
  }

  addWelcomeMessage() {
    this.addSystemMessage(
      `Welcome to AGRIO SMS Gateway\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📱 Toll-Free Number: ${this.smsNumber}\n\n` +
      `Send any of these commands:\n` +
      `▸ HELP - List all commands\n` +
      `▸ BOOK WHEAT 50 - Book slot\n` +
      `▸ STATUS TOK-102 - Check status\n` +
      `▸ MSP - Today's prices\n` +
      `▸ QUEUE - Queue position\n` +
      `▸ LANG HI - Switch to Hindi\n\n` +
      `Works on ANY phone - keypad or smartphone! 📲`
    );
  }

  handleSend() {
    const input = this.smsInput ? this.smsInput.value.trim() : '';
    if (!input) return;

    // Add user message
    this.addUserMessage(input);
    this.smsInput.value = '';

    // Process command after a brief delay to simulate network
    setTimeout(() => {
      const response = this.processCommand(input);
      this.addSystemMessage(response);

      // Also trigger a toast notification
      this.notifMgr.showToast('SMS Response Sent', response.substring(0, 80) + '...', 'sms');
    }, 600);
  }

  processCommand(rawInput) {
    const input = rawInput.toUpperCase().trim();
    const parts = input.split(/\s+/);
    const cmd = parts[0];

    // HELP command
    if (cmd === 'HELP' || cmd === 'मदद' || cmd === 'MADAD' || cmd === 'ਮਦਦ') {
      return this.getHelpResponse();
    }

    // MSP / PRICE command
    if (cmd === 'MSP' || cmd === 'PRICE' || cmd === 'RATE' || cmd === 'दर' || cmd === 'DAR' || cmd === 'ਰੇਟ') {
      return this.getMspResponse();
    }

    // QUEUE command
    if (cmd === 'QUEUE' || cmd === 'KATTAR' || cmd === 'कतार' || cmd === 'ਕਤਾਰ' || cmd === 'LINE') {
      return this.getQueueResponse();
    }

    // STATUS command
    if (cmd === 'STATUS' || cmd === 'STHITI' || cmd === 'स्थिति' || cmd === 'ਸਥਿਤੀ') {
      const tokenNo = parts[1] || '';
      return this.getStatusResponse(tokenNo);
    }

    // BOOK command
    if (cmd === 'BOOK' || cmd === 'BUK' || cmd === 'बुक' || cmd === 'ਬੁੱਕ') {
      const crop = parts[1] || 'WHEAT';
      const qty = parseInt(parts[2]) || 50;
      return this.getBookResponse(crop, qty);
    }

    // CANCEL command
    if (cmd === 'CANCEL' || cmd === 'RADD' || cmd === 'रद्द' || cmd === 'ਰੱਦ') {
      const tokenNo = parts[1] || '';
      return this.getCancelResponse(tokenNo);
    }

    // LANG command
    if (cmd === 'LANG' || cmd === 'BHASHA' || cmd === 'भाषा' || cmd === 'ਭਾਸ਼ਾ') {
      const langCode = (parts[1] || 'en').toLowerCase();
      return this.getLangResponse(langCode);
    }

    // Unknown command
    return this.getUnknownResponse(rawInput);
  }

  getHelpResponse() {
    const lang = this.i18n ? this.i18n.currentLang : 'en';

    if (lang === 'hi') {
      return (
        `AGRIO SMS कमांड सूची\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 BOOK गेहूं 50 → स्लॉट बुक करें\n` +
        `📊 STATUS TOK-102 → टोकन स्थिति\n` +
        `📍 QUEUE → कतार स्थिति\n` +
        `💰 MSP → आज के MSP दर\n` +
        `❌ CANCEL TOK-102 → बुकिंग रद्द\n` +
        `🌐 LANG PA → भाषा बदलें\n` +
        `❓ HELP → यह सूची\n\n` +
        `फसलें: WHEAT, PADDY, MUSTARD, COTTON`
      );
    }

    return (
      `AGRIO SMS COMMAND LIST\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 BOOK WHEAT 50 → Book procurement slot\n` +
      `📊 STATUS TOK-102 → Check token status\n` +
      `📍 QUEUE → View queue position\n` +
      `💰 MSP → Today's MSP rates\n` +
      `❌ CANCEL TOK-102 → Cancel booking\n` +
      `🌐 LANG HI → Switch language\n` +
      `❓ HELP → Show this list\n\n` +
      `Crops: WHEAT, PADDY, MUSTARD, COTTON`
    );
  }

  getMspResponse() {
    const lang = this.i18n ? this.i18n.currentLang : 'en';
    const date = new Date().toLocaleDateString();

    if (lang === 'hi') {
      return (
        `📢 MSP दर (${date})\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🌾 गेहूं (शरबती Grade A): ₹2,275/क्विंटल\n` +
        `🌾 धान (बासमती 1509): ₹2,300/क्विंटल\n` +
        `🌻 सरसों/रेपसीड: ₹5,650/क्विंटल\n` +
        `🌿 कपास (मध्यम): ₹6,620/क्विंटल\n\n` +
        `📌 केंद्र सरकार द्वारा निर्धारित दर\n` +
        `💰 100% DBT सीधे बैंक में`
      );
    }

    return (
      `📢 MSP RATES (${date})\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🌾 Wheat Sharbati (Gr A): ₹2,275/Qtl\n` +
      `🌾 Paddy Basmati 1509: ₹2,300/Qtl\n` +
      `🌻 Mustard/Rapeseed: ₹5,650/Qtl\n` +
      `🌿 Cotton (Med Staple): ₹6,620/Qtl\n\n` +
      `📌 Central Govt Notified Rates\n` +
      `💰 100% Direct Bank Transfer (DBT)`
    );
  }

  getQueueResponse() {
    const bookings = this.state.getCenterBookings();
    const center = this.state.getCurrentCenter();
    const activeCount = bookings.filter(b => b.status !== 'COMPLETED').length;
    const waitMins = activeCount * 4;

    const lang = this.i18n ? this.i18n.currentLang : 'en';

    if (lang === 'hi') {
      return (
        `📍 कतार स्थिति - ${center.name}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🚛 कतार में वाहन: ${activeCount}\n` +
        `⏱ अनुमानित प्रतीक्षा: ${waitMins} मिनट\n` +
        `⚖ सक्रिय तौल पुल: ${center.weighbridges}\n` +
        `📊 औसत प्रक्रिया: 14 मिनट/ट्रैक्टर\n\n` +
        `💡 BOOK WHEAT 50 भेजकर स्लॉट बुक करें`
      );
    }

    return (
      `📍 QUEUE STATUS - ${center.name}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🚛 Vehicles in Queue: ${activeCount}\n` +
      `⏱ Est. Wait Time: ${waitMins} mins\n` +
      `⚖ Active Weighbridges: ${center.weighbridges}\n` +
      `📊 Avg Processing: 14 mins/tractor\n\n` +
      `💡 Send BOOK WHEAT 50 to reserve a slot`
    );
  }

  getStatusResponse(tokenNo) {
    if (!tokenNo) {
      return `⚠ Please provide a token number.\nExample: STATUS TOK-102`;
    }

    const booking = this.state.bookings.find(b => b.tokenNo === tokenNo.toUpperCase());
    if (!booking) {
      return `❌ Token ${tokenNo} not found in system.\nPlease check your token number and try again.`;
    }

    const farmer = this.state.farmers.find(f => f.id === booking.farmerId);
    const statusMap = {
      'SCHEDULED': '📅 SCHEDULED (Awaiting Arrival)',
      'CHECKED_IN': '🚪 CHECKED IN at Gate',
      'ASSAYED': '🧪 QUALITY ASSAYED (Passed)',
      'AT_WEIGHBRIDGE': '⚖ AT WEIGHBRIDGE',
      'COMPLETED': '✅ COMPLETED (DBT Processing)'
    };

    const lang = this.i18n ? this.i18n.currentLang : 'en';

    if (lang === 'hi') {
      const statusMapHi = {
        'SCHEDULED': '📅 अनुसूचित (आगमन की प्रतीक्षा)',
        'CHECKED_IN': '🚪 गेट पर चेक इन',
        'ASSAYED': '🧪 गुणवत्ता परख (पास)',
        'AT_WEIGHBRIDGE': '⚖ तौल पुल पर',
        'COMPLETED': '✅ पूर्ण (DBT प्रक्रिया में)'
      };
      return (
        `📊 टोकन स्थिति: ${tokenNo}\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 किसान: ${farmer ? farmer.name : 'अज्ञात'}\n` +
        `🌾 फसल: ${booking.crop}\n` +
        `📦 मात्रा: ${booking.estQty} क्विंटल\n` +
        `🚛 वाहन: ${booking.vehicleNo}\n\n` +
        `📌 स्थिति: ${statusMapHi[booking.status] || booking.status}\n` +
        `💰 अनुमानित राशि: ₹${booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : 'गणना में'}`
      );
    }

    return (
      `📊 TOKEN STATUS: ${tokenNo}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Farmer: ${farmer ? farmer.name : 'Unknown'}\n` +
      `🌾 Crop: ${booking.crop}\n` +
      `📦 Quantity: ${booking.estQty} Qtls\n` +
      `🚛 Vehicle: ${booking.vehicleNo}\n\n` +
      `📌 Status: ${statusMap[booking.status] || booking.status}\n` +
      `💰 Est. Amount: ₹${booking.totalAmount ? booking.totalAmount.toLocaleString('en-IN') : 'Calculating'}`
    );
  }

  getBookResponse(crop, qty) {
    const cropMap = {
      'WHEAT': { name: 'Wheat - Sharbati (Grade A)', msp: 2275 },
      'GEHUN': { name: 'Wheat - Sharbati (Grade A)', msp: 2275 },
      'गेहूं': { name: 'Wheat - Sharbati (Grade A)', msp: 2275 },
      'PADDY': { name: 'Paddy - Basmati 1509', msp: 2300 },
      'DHAN': { name: 'Paddy - Basmati 1509', msp: 2300 },
      'धान': { name: 'Paddy - Basmati 1509', msp: 2300 },
      'MUSTARD': { name: 'Mustard / Rapeseed', msp: 5650 },
      'SARSON': { name: 'Mustard / Rapeseed', msp: 5650 },
      'सरसों': { name: 'Mustard / Rapeseed', msp: 5650 },
      'COTTON': { name: 'Cotton (Medium Staple)', msp: 6620 },
      'KAPAS': { name: 'Cotton (Medium Staple)', msp: 6620 },
      'कपास': { name: 'Cotton (Medium Staple)', msp: 6620 }
    };

    const cropInfo = cropMap[crop.toUpperCase()] || cropMap['WHEAT'];
    const totalAmount = qty * cropInfo.msp;

    // Actually create the booking
    const booking = this.state.createBooking({
      crop: cropInfo.name,
      mspRate: cropInfo.msp,
      estQty: qty,
      vehicleType: 'Tractor Trolley (Single Axle)',
      vehicleNo: 'SMS-AUTO-' + Math.floor(1000 + Math.random() * 9000),
      date: 'Today',
      slotTime: '09:00 AM - 11:00 AM',
      totalAmount: totalAmount
    });

    const lang = this.i18n ? this.i18n.currentLang : 'en';

    if (lang === 'hi') {
      return (
        `✅ स्लॉट बुक हो गया!\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎫 टोकन: ${booking.tokenNo}\n` +
        `🌾 फसल: ${cropInfo.name}\n` +
        `📦 मात्रा: ${qty} क्विंटल\n` +
        `💰 अनुमानित राशि: ₹${totalAmount.toLocaleString('en-IN')}\n` +
        `📅 स्लॉट: आज, 09:00 AM - 11:00 AM\n\n` +
        `📌 मंडी आने पर गेट पर टोकन नंबर बताएं\n` +
        `📊 STATUS ${booking.tokenNo} भेजकर स्थिति देखें`
      );
    }

    return (
      `✅ SLOT BOOKED SUCCESSFULLY!\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎫 Token: ${booking.tokenNo}\n` +
      `🌾 Crop: ${cropInfo.name}\n` +
      `📦 Quantity: ${qty} Quintals\n` +
      `💰 Est. Amount: ₹${totalAmount.toLocaleString('en-IN')}\n` +
      `📅 Slot: Today, 09:00 AM - 11:00 AM\n\n` +
      `📌 Show token number at mandi gate\n` +
      `📊 Send STATUS ${booking.tokenNo} to track`
    );
  }

  getCancelResponse(tokenNo) {
    if (!tokenNo) {
      return `⚠ Please provide token number.\nExample: CANCEL TOK-102`;
    }

    const booking = this.state.bookings.find(b => b.tokenNo === tokenNo.toUpperCase());
    if (!booking) {
      return `❌ Token ${tokenNo} not found. Cannot cancel.`;
    }
    if (booking.status !== 'SCHEDULED') {
      return `⚠ Token ${tokenNo} is already in stage: ${booking.status}.\nCannot cancel after gate check-in.`;
    }

    // Remove the booking
    this.state.bookings = this.state.bookings.filter(b => b.tokenNo !== tokenNo.toUpperCase());
    this.state.save();

    return (
      `✅ BOOKING CANCELLED\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎫 Token ${tokenNo} has been cancelled.\n` +
      `📅 Your slot is now available for others.\n\n` +
      `Send BOOK WHEAT 50 to rebook.`
    );
  }

  getLangResponse(langCode) {
    const langMap = {
      'en': 'English', 'hi': 'Hindi (हिन्दी)', 'pa': 'Punjabi (ਪੰਜਾਬੀ)', 'mr': 'Marathi (मराठी)',
      'te': 'Telugu (తెలుగు)', 'ta': 'Tamil (தமிழ்)', 'kn': 'Kannada (ಕನ್ನಡ)',
      'gu': 'Gujarati (ગુજરાતી)', 'bn': 'Bengali (বাংলা)', 'or': 'Odia (ଓଡ଼ିଆ)',
      'ml': 'Malayalam (മലയാളം)', 'ur': 'Urdu (اردو)', 'as': 'Assamese (অসমীয়া)',
      'raj': 'Rajasthani (राजस्थानी)', 'har': 'Haryanvi (हरियाणवी)'
    };

    if (!langMap[langCode]) {
      return (
        `⚠ Unknown language code: ${langCode}\n` +
        `Available: EN, HI, PA, MR, TE, TA, KN, GU, BN, OR, ML, UR, AS, RAJ, HAR\n\n` +
        `Example: LANG HI (for Hindi)`
      );
    }

    // Switch language
    if (this.i18n) {
      this.i18n.setLanguage(langCode);
    }

    return (
      `✅ LANGUAGE CHANGED\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 SMS responses will now be in: ${langMap[langCode]}\n` +
      `📱 App interface also updated.\n\n` +
      `Send HELP to see commands in new language.`
    );
  }

  getUnknownResponse(input) {
    return (
      `❓ Unknown command: "${input}"\n\n` +
      `Send HELP for list of all commands.\n\n` +
      `Quick commands:\n` +
      `▸ MSP - Price rates\n` +
      `▸ QUEUE - Queue status\n` +
      `▸ BOOK WHEAT 50 - Book slot\n` +
      `▸ STATUS TOK-102 - Track token`
    );
  }

  addUserMessage(text) {
    const msg = { type: 'sent', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.messages.push(msg);
    this.renderChat();
  }

  addSystemMessage(text) {
    const msg = { type: 'received', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.messages.push(msg);
    this.renderChat();
  }

  renderChat() {
    if (!this.chatFeed) return;

    this.chatFeed.innerHTML = this.messages.map(msg => `
      <div class="sms-bubble ${msg.type}">
        <div class="sms-bubble-text">${msg.text.replace(/\n/g, '<br>')}</div>
        <div class="sms-bubble-time">${msg.time}</div>
      </div>
    `).join('');

    // Auto-scroll to bottom
    this.chatFeed.scrollTop = this.chatFeed.scrollHeight;
  }
}

window.SmsGateway = SmsGateway;
