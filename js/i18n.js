/**
 * Agrio - Internationalization (i18n) Engine
 * Supports 15 Indian Languages + English
 * Uses data-i18n attributes for DOM translation
 */

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('agrio_lang') || this.detectBrowserLang() || 'en';
    this.translations = this.loadTranslations();
    this.langMeta = this.getLangMeta();
  }

  getLangMeta() {
    return [
      { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
      { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
      { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', dir: 'ltr' },
      { code: 'mr', name: 'Marathi', native: 'मराठी', dir: 'ltr' },
      { code: 'te', name: 'Telugu', native: 'తెలుగు', dir: 'ltr' },
      { code: 'ta', name: 'Tamil', native: 'தமிழ்', dir: 'ltr' },
      { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', dir: 'ltr' },
      { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', dir: 'ltr' },
      { code: 'bn', name: 'Bengali', native: 'বাংলা', dir: 'ltr' },
      { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', dir: 'ltr' },
      { code: 'ml', name: 'Malayalam', native: 'മലയാളം', dir: 'ltr' },
      { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
      { code: 'as', name: 'Assamese', native: 'অসমীয়া', dir: 'ltr' },
      { code: 'raj', name: 'Rajasthani', native: 'राजस्थानी', dir: 'ltr' },
      { code: 'har', name: 'Haryanvi', native: 'हरियाणवी', dir: 'ltr' }
    ];
  }

  detectBrowserLang() {
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    const supported = ['en', 'hi', 'pa', 'mr', 'te', 'ta', 'kn', 'gu', 'bn', 'or', 'ml', 'ur', 'as'];
    return supported.includes(langCode) ? langCode : 'en';
  }

  setLanguage(langCode) {
    this.currentLang = langCode;
    localStorage.setItem('agrio_lang', langCode);
    this.applyTranslations();
    this.applyDirection(langCode);
  }

  applyDirection(langCode) {
    const meta = this.langMeta.find(l => l.code === langCode);
    if (meta && meta.dir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl-mode');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.classList.remove('rtl-mode');
    }
  }

  t(key) {
    const lang = this.translations[this.currentLang];
    if (lang && lang[key]) return lang[key];
    if (this.translations['en'] && this.translations['en'][key]) return this.translations['en'][key];
    return key;
  }

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = this.t(key);
      if (translated !== key) {
        if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
          el.placeholder = translated;
        } else if (el.tagName === 'OPTION') {
          el.textContent = translated;
        } else {
          const icons = el.querySelectorAll('i[data-lucide], svg');
          if (icons.length > 0 && el.childNodes.length > 1) {
            for (let node of el.childNodes) {
              if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                node.textContent = ' ' + translated;
                break;
              }
            }
          } else {
            el.textContent = translated;
          }
        }
      }
    });

    const langDisplay = document.getElementById('current-lang-display');
    if (langDisplay) {
      const meta = this.langMeta.find(l => l.code === this.currentLang);
      langDisplay.textContent = meta ? meta.native : 'English';
    }
  }

  loadTranslations() {
    return {
      'en': {
        'nav.farmer': 'Farmer Portal',
        'nav.queue': 'Live Queue & Gate',
        'nav.weighbridge': 'Assayer & Weighbridge',
        'nav.admin': 'Admin & DBT Hub',
        'nav.sms': 'SMS Gateway',
        'brand.subtitle': 'Smart Procurement & Real-Time Queue System',
        'brand.badge': 'Gov-Direct v2.4',
        'header.hub': 'Procurement Hub:',
        'header.simulate': 'Auto-Simulate Flow',
        'header.language': 'Language',
        'farmer.book.title': 'Reserve Procurement Slot',
        'farmer.book.subtitle': 'Book guaranteed unloading time. Avoid waiting in highway queues.',
        'farmer.crop.label': 'Crop Variety & Grade',
        'farmer.qty.label': 'Estimated Quantity (Quintals)',
        'farmer.vehicle.label': 'Transport Vehicle',
        'farmer.vehicle.number': 'Vehicle Registration Number',
        'farmer.date.label': 'Select Preferred Date',
        'farmer.slots.label': 'Available Capacity Windows (Real-Time Quota)',
        'farmer.est.value': 'Estimated Value @ MSP',
        'farmer.turnaround': 'Max Center Turnaround SLA',
        'farmer.sms.alerts': 'SMS Alerts',
        'farmer.sms.enabled': 'Enabled',
        'farmer.confirm.btn': 'Confirm & Generate Digital Gate Pass',
        'farmer.tab.book': 'Book Slot & E-Pass',
        'farmer.tab.pass': 'My Digital Gate Pass',
        'farmer.tab.track': 'Track Procurement & DBT',
        'farmer.verified': 'Land & Aadhaar Verified',
        'farmer.quota.remaining': 'Land quota remaining:',
        'prebook.title': 'Why Pre-Book with Agrio?',
        'prebook.zero.title': 'Zero Highway Stagnation',
        'prebook.zero.desc': 'Express gate entry through designated RFID / QR scanner lane.',
        'prebook.moisture.title': 'Live Moisture Pre-Check',
        'prebook.moisture.desc': 'Assaying results linked straight to your mobile pass.',
        'prebook.dbt.title': '48h Guaranteed DBT Payout',
        'prebook.dbt.desc': 'Instant e-J-Form generation and direct treasury bank transfer.',
        'stats.title': 'Center Live Operations',
        'stats.live': 'Live',
        'stats.weighbridges': 'Weighbridges Active',
        'stats.today': "Today's Procurement",
        'stats.speed': 'Avg Process Speed',
        'stats.vehicles': 'Vehicles in Campus',
        'pass.title': 'AGRIGOV E-GATE PASS',
        'pass.dept': 'Dept of Food, Civil Supplies & Consumer Affairs',
        'pass.token': 'Digital Token Pass',
        'pass.guaranteed': 'Guaranteed Unloading Entry',
        'pass.farmer': 'Farmer Name',
        'pass.center': 'Procurement Hub',
        'pass.crop': 'Crop & Quota Booked',
        'pass.slot': 'Slot Arrival Window',
        'pass.vehicle': 'Vehicle Number',
        'pass.bank': 'Settlement Bank',
        'pass.tamper': 'Tamper-proof Cryptographic QR Pass',
        'pass.save': 'Save PDF',
        'track.title': 'Live Procurement & Payment Journey',
        'track.subtitle': 'Real-time lifecycle tracking from mandi arrival to bank credit',
        'track.refresh': 'Refresh Status',
        'led.title': 'MANDI LIVE TOKEN CALLING BOARD',
        'led.time': 'Current Time:',
        'led.vehicles': 'Vehicles in Line:',
        'led.wait': 'Est. Wait for Next:',
        'led.now': 'NOW ENTERING GATE',
        'led.weighbridge': 'AT WEIGHBRIDGE #1',
        'led.next': 'NEXT 3 TOKENS (GET READY)',
        'gate.title': 'Gate Security & Check-In Desk',
        'gate.subtitle': 'Verify QR e-Pass, register arrival, and assign physical bay.',
        'gate.scan.placeholder': 'Scan QR or Enter Token (e.g., TOK-104)',
        'gate.checkin': 'Check In',
        'gate.ready': 'Ready for Gate Entry:',
        'gate.lanes.title': 'Lane Allocation & Campus Traffic',
        'queue.title': 'Active Campus Queue',
        'queue.subtitle': 'Live progress of all vehicles currently inside or queued',
        'table.token': 'Token',
        'table.farmer': 'Farmer',
        'table.crop.qty': 'Crop & Qty',
        'table.slot': 'Slot Window',
        'table.stage': 'Stage',
        'table.action': 'Action',
        'assay.title': 'Digital Assaying & Quality Grading',
        'assay.subtitle': 'Quality inspection parameters before weighment clearance',
        'assay.token': 'Select Inspected Token',
        'assay.moisture': 'Moisture Content (%):',
        'assay.foreign': 'Foreign Matter / Impurities (%)',
        'assay.grade': 'Quality Grade Assigned',
        'assay.officer': 'Assayer Officer ID',
        'assay.passed': 'Quality Parameters Passed (FAQ Standards Met)',
        'assay.eligible': 'Eligible for official procurement at 100% Minimum Support Price.',
        'assay.approve': 'Approve & Transmit to Weighbridge',
        'weigh.title': 'IoT Weighbridge & E-Receipt (J-Form)',
        'weigh.subtitle': 'Tamper-proof gross & tare weighment integration',
        'weigh.active': 'Active Vehicle on Weighbridge',
        'weigh.iot': 'IoT Scale Link:',
        'weigh.connected': 'Connected (Scale #02)',
        'weigh.sensor': 'Live Sensor Stream',
        'weigh.gross.btn': 'Capture Gross Weight',
        'weigh.tare.btn': 'Capture Tare (Empty)',
        'weigh.gross': 'Gross Weight (Kg)',
        'weigh.tare': 'Tare Weight (Kg)',
        'weigh.net': 'Net Weight (Kg)',
        'weigh.quintals': 'Net Quantity in Quintals:',
        'weigh.msp.rate': 'MSP Rate / Quintal:',
        'weigh.total': 'Total Payable Amount:',
        'weigh.submit': 'Lock Weights & Issue Digital J-Form',
        'admin.kpi.procured': 'Season Total Procured',
        'admin.kpi.disbursed': 'DBT Disbursed to Farmers',
        'admin.kpi.tat': 'Avg Mandi Turnaround',
        'admin.kpi.farmers': 'Registered Farmers Served',
        'admin.chart.hourly': 'Hourly Procurement vs Slot Capacity',
        'admin.chart.crop': 'Procurement by Crop Variety',
        'admin.dbt.title': 'Direct Benefit Transfer (DBT) Payment Switch',
        'admin.dbt.subtitle': 'PFMS / NPCI Aadhaar Payment Bridge reconciliation queue',
        'admin.dbt.release': 'Release Pending DBT Payouts',
        'sms.title': 'SMS Command Gateway',
        'sms.subtitle': 'For keypad & feature phones — send text commands to manage procurement',
        'sms.howto.title': 'How to Use SMS Commands',
        'sms.howto.desc': 'Send these commands via SMS to the number displayed. Works on any basic phone!',
        'sms.cmd.book': 'Book a procurement slot',
        'sms.cmd.status': 'Check token status',
        'sms.cmd.queue': 'View queue position',
        'sms.cmd.msp': "Today's MSP rates",
        'sms.cmd.cancel': 'Cancel booking',
        'sms.cmd.lang': 'Change language',
        'sms.cmd.help': 'List all commands',
        'sms.sim.title': 'SMS Simulator',
        'sms.sim.desc': 'Test SMS commands below — simulates what a keypad phone user would experience',
        'sms.input.placeholder': 'Type SMS command here...',
        'sms.send': 'Send',
        'sms.quickcmds': 'Quick Commands:',
        'phone.title': 'AgriGov SMS & WhatsApp Alerts',
        'phone.tabs.all': 'All Alerts',
        'phone.tabs.sms': 'SMS',
        'phone.tabs.whatsapp': 'WhatsApp',
        'phone.footer': 'Real-time multi-stage trigger notifications',
        'common.today': 'TODAY',
        'common.open.quota': 'Open Quota',
      },

      'hi': {
        'nav.farmer': 'किसान पोर्टल',
        'nav.queue': 'लाइव कतार और गेट',
        'nav.weighbridge': 'परख और तौल',
        'nav.admin': 'एडमिन और DBT हब',
        'nav.sms': 'SMS गेटवे',
        'brand.subtitle': 'स्मार्ट खरीद और रियल-टाइम कतार प्रणाली',
        'brand.badge': 'गवर्नमेंट-डायरेक्ट v2.4',
        'header.hub': 'खरीद केंद्र:',
        'header.simulate': 'ऑटो-सिमुलेट करें',
        'header.language': 'भाषा',
        'farmer.book.title': 'खरीद स्लॉट बुक करें',
        'farmer.book.subtitle': 'गारंटीड अनलोडिंग समय बुक करें। हाईवे की कतार से बचें।',
        'farmer.crop.label': 'फसल किस्म और ग्रेड',
        'farmer.qty.label': 'अनुमानित मात्रा (क्विंटल)',
        'farmer.vehicle.label': 'परिवहन वाहन',
        'farmer.vehicle.number': 'वाहन पंजीकरण संख्या',
        'farmer.date.label': 'पसंदीदा तारीख चुनें',
        'farmer.slots.label': 'उपलब्ध क्षमता विंडो (रियल-टाइम कोटा)',
        'farmer.est.value': 'MSP पर अनुमानित मूल्य',
        'farmer.turnaround': 'अधिकतम केंद्र टर्नअराउंड SLA',
        'farmer.sms.alerts': 'SMS अलर्ट',
        'farmer.sms.enabled': 'चालू',
        'farmer.confirm.btn': 'पुष्टि करें और डिजिटल गेट पास बनाएं',
        'farmer.tab.book': 'स्लॉट बुक करें और ई-पास',
        'farmer.tab.pass': 'मेरा डिजिटल गेट पास',
        'farmer.tab.track': 'खरीद और DBT ट्रैक करें',
        'farmer.verified': 'भूमि और आधार सत्यापित',
        'prebook.title': 'Agrio से प्री-बुक क्यों करें?',
        'prebook.zero.title': 'हाईवे पर शून्य भीड़',
        'prebook.zero.desc': 'RFID / QR स्कैनर लेन से तेज़ गेट एंट्री।',
        'prebook.moisture.title': 'लाइव नमी जांच',
        'prebook.moisture.desc': 'परख परिणाम सीधे आपके मोबाइल पास से जुड़े।',
        'prebook.dbt.title': '48 घंटे गारंटीड DBT भुगतान',
        'prebook.dbt.desc': 'तुरंत ई-जे-फॉर्म और सीधे बैंक ट्रांसफर।',
        'stats.title': 'केंद्र लाइव संचालन',
        'stats.live': 'लाइव',
        'stats.weighbridges': 'सक्रिय तौल पुल',
        'stats.today': 'आज की खरीद',
        'stats.speed': 'औसत प्रक्रिया गति',
        'stats.vehicles': 'परिसर में वाहन',
        'track.title': 'लाइव खरीद और भुगतान यात्रा',
        'track.subtitle': 'मंडी आगमन से बैंक क्रेडिट तक रियल-टाइम ट्रैकिंग',
        'track.refresh': 'स्थिति रिफ्रेश करें',
        'led.title': 'मंडी लाइव टोकन कॉलिंग बोर्ड',
        'led.time': 'वर्तमान समय:',
        'led.vehicles': 'कतार में वाहन:',
        'led.wait': 'अगले की अनु. प्रतीक्षा:',
        'led.now': 'अभी गेट पर आ रहा है',
        'led.weighbridge': 'तौल पुल #1 पर',
        'led.next': 'अगले 3 टोकन (तैयार रहें)',
        'gate.title': 'गेट सुरक्षा और चेक-इन डेस्क',
        'gate.subtitle': 'QR ई-पास सत्यापित करें, आगमन दर्ज करें।',
        'gate.scan.placeholder': 'QR स्कैन करें या टोकन दर्ज करें',
        'gate.checkin': 'चेक इन',
        'gate.ready': 'गेट एंट्री के लिए तैयार:',
        'gate.lanes.title': 'लेन आवंटन और कैंपस ट्रैफिक',
        'queue.title': 'सक्रिय कैंपस कतार',
        'queue.subtitle': 'सभी वाहनों की लाइव प्रगति',
        'table.token': 'टोकन',
        'table.farmer': 'किसान',
        'table.crop.qty': 'फसल और मात्रा',
        'table.slot': 'स्लॉट विंडो',
        'table.stage': 'चरण',
        'table.action': 'कार्रवाई',
        'assay.title': 'डिजिटल परख और गुणवत्ता ग्रेडिंग',
        'assay.subtitle': 'तौल मंजूरी से पहले गुणवत्ता निरीक्षण',
        'assay.token': 'निरीक्षित टोकन चुनें',
        'assay.moisture': 'नमी सामग्री (%):',
        'assay.foreign': 'विदेशी पदार्थ / अशुद्धियाँ (%)',
        'assay.grade': 'गुणवत्ता ग्रेड',
        'assay.officer': 'परखकर्ता अधिकारी ID',
        'assay.approve': 'मंजूर करें और तौल पुल पर भेजें',
        'weigh.title': 'IoT तौल पुल और ई-रसीद (जे-फॉर्म)',
        'weigh.subtitle': 'छेड़छाड़-रहित सकल और तार तौल',
        'weigh.active': 'तौल पुल पर सक्रिय वाहन',
        'weigh.gross': 'सकल वजन (किग्रा)',
        'weigh.tare': 'तार वजन (किग्रा)',
        'weigh.net': 'शुद्ध वजन (किग्रा)',
        'weigh.quintals': 'क्विंटल में शुद्ध मात्रा:',
        'weigh.msp.rate': 'MSP दर / क्विंटल:',
        'weigh.total': 'कुल देय राशि:',
        'weigh.submit': 'वजन लॉक करें और जे-फॉर्म जारी करें',
        'weigh.gross.btn': 'सकल वजन लें',
        'weigh.tare.btn': 'तार वजन लें (खाली)',
        'admin.kpi.procured': 'सीज़न कुल खरीद',
        'admin.kpi.disbursed': 'किसानों को DBT वितरित',
        'admin.kpi.tat': 'औसत मंडी टर्नअराउंड',
        'admin.kpi.farmers': 'पंजीकृत किसान सेवित',
        'admin.chart.hourly': 'प्रति घंटा खरीद बनाम स्लॉट क्षमता',
        'admin.chart.crop': 'फसल किस्म के अनुसार खरीद',
        'admin.dbt.title': 'प्रत्यक्ष लाभ हस्तांतरण (DBT) भुगतान',
        'admin.dbt.subtitle': 'PFMS / NPCI आधार भुगतान ब्रिज सामंजस्य कतार',
        'admin.dbt.release': 'लंबित DBT भुगतान जारी करें',
        'sms.title': 'SMS कमांड गेटवे',
        'sms.subtitle': 'कीपैड और फीचर फोन के लिए — SMS कमांड से खरीद प्रबंधित करें',
        'sms.howto.title': 'SMS कमांड कैसे उपयोग करें',
        'sms.howto.desc': 'ये कमांड SMS से भेजें। किसी भी बेसिक फोन पर काम करता है!',
        'sms.cmd.book': 'खरीद स्लॉट बुक करें',
        'sms.cmd.status': 'टोकन स्थिति जांचें',
        'sms.cmd.queue': 'कतार स्थिति देखें',
        'sms.cmd.msp': 'आज के MSP दर',
        'sms.cmd.cancel': 'बुकिंग रद्द करें',
        'sms.cmd.lang': 'भाषा बदलें',
        'sms.cmd.help': 'सभी कमांड',
        'sms.sim.title': 'SMS सिमुलेटर',
        'sms.sim.desc': 'नीचे SMS कमांड टेस्ट करें — कीपैड फोन उपयोगकर्ता का अनुभव देखें',
        'sms.input.placeholder': 'SMS कमांड यहाँ लिखें...',
        'sms.send': 'भेजें',
        'sms.quickcmds': 'त्वरित कमांड:',
        'phone.title': 'एग्रीगव SMS और WhatsApp अलर्ट',
        'phone.tabs.all': 'सभी अलर्ट',
        'phone.tabs.sms': 'SMS',
        'phone.tabs.whatsapp': 'WhatsApp',
        'common.today': 'आज',
      },

      'pa': {
        'nav.farmer': 'ਕਿਸਾਨ ਪੋਰਟਲ', 'nav.queue': 'ਲਾਈਵ ਕਤਾਰ ਅਤੇ ਗੇਟ', 'nav.weighbridge': 'ਪਰਖ ਅਤੇ ਤੋਲ', 'nav.admin': 'ਐਡਮਿਨ ਅਤੇ DBT ਹੱਬ', 'nav.sms': 'SMS ਗੇਟਵੇ',
        'brand.subtitle': 'ਸਮਾਰਟ ਖਰੀਦ ਅਤੇ ਰੀਅਲ-ਟਾਈਮ ਕਤਾਰ ਸਿਸਟਮ', 'header.hub': 'ਖਰੀਦ ਕੇਂਦਰ:',
        'farmer.book.title': 'ਖਰੀਦ ਸਲਾਟ ਬੁੱਕ ਕਰੋ', 'farmer.book.subtitle': 'ਗਾਰੰਟੀਸ਼ੁਦਾ ਅਨਲੋਡਿੰਗ ਸਮਾਂ ਬੁੱਕ ਕਰੋ।',
        'farmer.crop.label': 'ਫਸਲ ਕਿਸਮ ਅਤੇ ਗ੍ਰੇਡ', 'farmer.qty.label': 'ਅੰਦਾਜ਼ੇ ਅਨੁਸਾਰ ਮਾਤਰਾ (ਕੁਇੰਟਲ)',
        'farmer.confirm.btn': 'ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਡਿਜੀਟਲ ਗੇਟ ਪਾਸ ਬਣਾਓ', 'farmer.tab.book': 'ਸਲਾਟ ਬੁੱਕ ਅਤੇ ਈ-ਪਾਸ',
        'farmer.tab.pass': 'ਮੇਰਾ ਡਿਜੀਟਲ ਗੇਟ ਪਾਸ', 'farmer.tab.track': 'ਖਰੀਦ ਅਤੇ DBT ਟਰੈਕ ਕਰੋ',
        'farmer.verified': 'ਜ਼ਮੀਨ ਅਤੇ ਆਧਾਰ ਪ੍ਰਮਾਣਿਤ', 'sms.title': 'SMS ਕਮਾਂਡ ਗੇਟਵੇ', 'sms.send': 'ਭੇਜੋ',
        'led.title': 'ਮੰਡੀ ਲਾਈਵ ਟੋਕਨ ਕਾਲਿੰਗ ਬੋਰਡ', 'gate.checkin': 'ਚੈੱਕ ਇਨ',
        'assay.approve': 'ਮੰਜ਼ੂਰ ਕਰੋ ਅਤੇ ਤੋਲ ਪੁਲ ਤੇ ਭੇਜੋ', 'weigh.submit': 'ਵਜ਼ਨ ਲੌਕ ਕਰੋ ਅਤੇ ਜੇ-ਫਾਰਮ ਜਾਰੀ ਕਰੋ',
        'admin.dbt.release': 'ਲੰਬਿਤ DBT ਭੁਗਤਾਨ ਜਾਰੀ ਕਰੋ',
      },

      'mr': {
        'nav.farmer': 'शेतकरी पोर्टल', 'nav.queue': 'लाइव्ह रांग आणि गेट', 'nav.weighbridge': 'परीक्षक आणि काटा',
        'nav.admin': 'प्रशासक आणि DBT हब', 'nav.sms': 'SMS गेटवे',
        'brand.subtitle': 'स्मार्ट खरेदी आणि रिअल-टाइम रांग प्रणाली', 'header.hub': 'खरेदी केंद्र:',
        'farmer.book.title': 'खरेदी स्लॉट बुक करा', 'farmer.book.subtitle': 'हमखास अनलोडिंग वेळ बुक करा.',
        'farmer.crop.label': 'पीक प्रकार आणि दर्जा', 'farmer.qty.label': 'अंदाजे प्रमाण (क्विंटल)',
        'farmer.confirm.btn': 'पुष्टी करा आणि डिजिटल गेट पास तयार करा',
        'farmer.tab.book': 'स्लॉट बुक आणि ई-पास', 'farmer.tab.pass': 'माझा डिजिटल गेट पास',
        'farmer.tab.track': 'खरेदी आणि DBT ट्रॅक करा', 'farmer.verified': 'जमीन आणि आधार सत्यापित',
        'sms.title': 'SMS कमांड गेटवे', 'sms.send': 'पाठवा',
        'led.title': 'मंडी लाइव्ह टोकन कॉलिंग बोर्ड', 'gate.checkin': 'चेक इन',
        'assay.approve': 'मंजूर करा आणि काट्यावर पाठवा', 'weigh.submit': 'वजन लॉक करा आणि जे-फॉर्म जारी करा',
        'admin.dbt.release': 'प्रलंबित DBT देयके जारी करा',
      },

      'te': {
        'nav.farmer': 'రైతు పోర్టల్', 'nav.queue': 'లైవ్ క్యూ & గేట్', 'nav.weighbridge': 'అసేయర్ & వెయ్‌బ్రిడ్జ్',
        'nav.admin': 'అడ్మిన్ & DBT హబ్', 'nav.sms': 'SMS గేట్‌వే',
        'brand.subtitle': 'స్మార్ట్ ప్రొక్యూర్‌మెంట్ & రియల్-టైమ్ క్యూ సిస్టమ్', 'header.hub': 'సేకరణ కేంద్రం:',
        'farmer.book.title': 'సేకరణ స్లాట్ బుక్ చేయండి', 'farmer.crop.label': 'పంట రకం & గ్రేడ్',
        'farmer.qty.label': 'అంచనా పరిమాణం (క్వింటల్)',
        'farmer.confirm.btn': 'నిర్ధారించండి & డిజిటల్ గేట్ పాస్ రూపొందించండి',
        'sms.title': 'SMS కమాండ్ గేట్‌వే', 'sms.send': 'పంపు',
        'led.title': 'మండి లైవ్ టోకెన్ కాలింగ్ బోర్డ్', 'gate.checkin': 'చెక్ ఇన్',
        'assay.approve': 'ఆమోదించి వెయ్‌బ్రిడ్జ్‌కు పంపండి', 'weigh.submit': 'బరువు లాక్ చేయండి & J-ఫారమ్ ఇవ్వండి',
        'admin.dbt.release': 'పెండింగ్ DBT చెల్లింపులు విడుదల చేయండి',
      },

      'ta': {
        'nav.farmer': 'விவசாயி போர்டல்', 'nav.queue': 'நேரடி வரிசை & கேட்', 'nav.weighbridge': 'ஆய்வாளர் & எடைப்பாலம்',
        'nav.admin': 'நிர்வாகி & DBT மையம்', 'nav.sms': 'SMS நுழைவாயில்',
        'brand.subtitle': 'திறன் கொள்முதல் & நிகழ்நேர வரிசை அமைப்பு', 'header.hub': 'கொள்முதல் மையம்:',
        'farmer.book.title': 'கொள்முதல் இடத்தை முன்பதிவு செய்யுங்கள்', 'farmer.crop.label': 'பயிர் வகை & தரம்',
        'farmer.qty.label': 'மதிப்பிடப்பட்ட அளவு (குவிண்டால்)',
        'farmer.confirm.btn': 'உறுதி செய் & டிஜிட்டல் கேட் பாஸ் உருவாக்கு',
        'sms.title': 'SMS கட்டளை நுழைவாயில்', 'sms.send': 'அனுப்பு',
        'led.title': 'மண்டி நேரடி டோக்கன் அழைப்பு பலகை', 'gate.checkin': 'செக் இன்',
        'assay.approve': 'அங்கீகரித்து எடைப்பாலத்திற்கு அனுப்பு', 'weigh.submit': 'எடையை பூட்டி J-படிவம் வழங்கு',
        'admin.dbt.release': 'நிலுவை DBT செலுத்துதல்கள் வெளியிடு',
      },

      'kn': {
        'nav.farmer': 'ರೈತ ಪೋರ್ಟಲ್', 'nav.queue': 'ಲೈವ್ ಸರತಿ & ಗೇಟ್', 'nav.weighbridge': 'ಅಸೇಯರ್ & ತೂಕ ಸೇತುವೆ',
        'nav.admin': 'ನಿರ್ವಾಹಕ & DBT ಹಬ್', 'nav.sms': 'SMS ಗೇಟ್‌ವೇ',
        'brand.subtitle': 'ಸ್ಮಾರ್ಟ್ ಸಂಗ್ರಹಣೆ & ನೈಜ-ಸಮಯ ಸರತಿ ವ್ಯವಸ್ಥೆ',
        'farmer.book.title': 'ಸಂಗ್ರಹಣೆ ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಿ',
        'farmer.confirm.btn': 'ದೃಢೀಕರಿಸಿ & ಡಿಜಿಟಲ್ ಗೇಟ್ ಪಾಸ್ ರಚಿಸಿ',
        'sms.title': 'SMS ಕಮಾಂಡ್ ಗೇಟ್‌ವೇ', 'sms.send': 'ಕಳುಹಿಸಿ', 'gate.checkin': 'ಚೆಕ್ ಇನ್',
        'assay.approve': 'ಅನುಮೋದಿಸಿ & ತೂಕ ಸೇತುವೆಗೆ ಕಳುಹಿಸಿ', 'weigh.submit': 'ತೂಕ ಲಾಕ್ ಮಾಡಿ & J-ಫಾರ್ಮ್ ನೀಡಿ',
        'admin.dbt.release': 'ಬಾಕಿ DBT ಪಾವತಿಗಳನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿ',
      },

      'gu': {
        'nav.farmer': 'ખેડૂત પોર્ટલ', 'nav.queue': 'લાઈવ કતાર અને ગેટ', 'nav.weighbridge': 'પરખ અને વજનકાંટા',
        'nav.admin': 'એડમિન અને DBT હબ', 'nav.sms': 'SMS ગેટવે',
        'brand.subtitle': 'સ્માર્ટ ખરીદી અને રિયલ-ટાઇમ કતાર સિસ્ટમ',
        'farmer.book.title': 'ખરીદી સ્લોટ બુક કરો', 'farmer.confirm.btn': 'પુષ્ટિ કરો અને ડિજિટલ ગેટ પાસ બનાવો',
        'sms.title': 'SMS કમાન્ડ ગેટવે', 'sms.send': 'મોકલો', 'gate.checkin': 'ચેક ઇન',
        'assay.approve': 'મંજૂર કરો અને વજનકાંટે મોકલો', 'weigh.submit': 'વજન લૉક કરો અને જે-ફોર્મ જારી કરો',
        'admin.dbt.release': 'બાકી DBT ચુકવણી જારી કરો',
      },

      'bn': {
        'nav.farmer': 'কৃষক পোর্টাল', 'nav.queue': 'লাইভ সারি ও গেট', 'nav.weighbridge': 'পরীক্ষক ও ওজনসেতু',
        'nav.admin': 'অ্যাডমিন ও DBT হাব', 'nav.sms': 'SMS গেটওয়ে',
        'brand.subtitle': 'স্মার্ট ক্রয় ও রিয়েল-টাইম সারি ব্যবস্থা',
        'farmer.book.title': 'ক্রয় স্লট বুক করুন', 'farmer.confirm.btn': 'নিশ্চিত করুন ও ডিজিটাল গেট পাস তৈরি করুন',
        'sms.title': 'SMS কমান্ড গেটওয়ে', 'sms.send': 'পাঠান', 'gate.checkin': 'চেক ইন',
        'assay.approve': 'অনুমোদন করুন ও ওজনসেতুতে পাঠান', 'weigh.submit': 'ওজন লক করুন ও J-ফর্ম জারি করুন',
        'admin.dbt.release': 'মুলতুবি DBT পরিশোধ জারি করুন',
      },

      'or': {
        'nav.farmer': 'ଚାଷୀ ପୋର୍ଟାଲ', 'nav.queue': 'ଲାଇଭ୍ ସାରି ଓ ଗେଟ', 'nav.weighbridge': 'ପରୀକ୍ଷକ ଓ ଓଜନ ସେତୁ',
        'nav.admin': 'ଆଡମିନ ଓ DBT ହବ', 'nav.sms': 'SMS ଗେଟୱେ',
        'brand.subtitle': 'ସ୍ମାର୍ଟ ସଂଗ୍ରହ ଓ ରିଅଲ-ଟାଇମ ସାରି ସିଷ୍ଟମ',
        'farmer.book.title': 'ସଂଗ୍ରହ ସ୍ଲଟ ବୁକ କରନ୍ତୁ', 'farmer.confirm.btn': 'ନିଶ୍ଚିତ କରନ୍ତୁ ଓ ଡିଜିଟାଲ ଗେଟ ପାସ ତିଆରି କରନ୍ତୁ',
        'sms.title': 'SMS କମାଣ୍ଡ ଗେଟୱେ', 'sms.send': 'ପଠାନ୍ତୁ', 'gate.checkin': 'ଚେକ ଇନ',
      },

      'ml': {
        'nav.farmer': 'കർഷക പോർട്ടൽ', 'nav.queue': 'ലൈവ് ക്യൂ & ഗേറ്റ്', 'nav.weighbridge': 'അസേയർ & വെയ്‌ബ്രിഡ്ജ്',
        'nav.admin': 'അഡ്‌മിൻ & DBT ഹബ്', 'nav.sms': 'SMS ഗേറ്റ്‌വേ',
        'brand.subtitle': 'സ്മാർട്ട് സംഭരണം & റിയൽ-ടൈം ക്യൂ സിസ്റ്റം',
        'farmer.book.title': 'സംഭരണ സ്ലോട്ട് ബുക്ക് ചെയ്യുക', 'farmer.confirm.btn': 'സ്ഥിരീകരിക്കുക & ഡിജിറ്റൽ ഗേറ്റ് പാസ് സൃഷ്ടിക്കുക',
        'sms.title': 'SMS കമാൻഡ് ഗേറ്റ്‌വേ', 'sms.send': 'അയക്കുക', 'gate.checkin': 'ചെക്ക് ഇൻ',
      },

      'ur': {
        'nav.farmer': 'کسان پورٹل', 'nav.queue': 'لائیو قطار اور گیٹ', 'nav.weighbridge': 'معائنہ کار اور ترازو',
        'nav.admin': 'ایڈمن اور DBT حب', 'nav.sms': 'SMS گیٹ وے',
        'brand.subtitle': 'سمارٹ خریداری اور ریئل ٹائم قطار نظام', 'header.hub': 'خریداری مرکز:',
        'farmer.book.title': 'خریداری سلاٹ بک کریں', 'farmer.book.subtitle': 'گارنٹی شدہ ان لوڈنگ وقت بک کریں۔',
        'farmer.crop.label': 'فصل کی قسم اور درجہ', 'farmer.qty.label': 'تخمینی مقدار (کوئنٹل)',
        'farmer.confirm.btn': 'تصدیق کریں اور ڈیجیٹل گیٹ پاس بنائیں',
        'farmer.tab.book': 'سلاٹ بک اور ای-پاس', 'farmer.tab.pass': 'میرا ڈیجیٹل گیٹ پاس',
        'farmer.tab.track': 'خریداری اور DBT ٹریک کریں',
        'sms.title': 'SMS کمانڈ گیٹ وے', 'sms.send': 'بھیجیں', 'sms.quickcmds': 'فوری کمانڈز:',
        'led.title': 'منڈی لائیو ٹوکن کالنگ بورڈ', 'gate.checkin': 'چیک ان',
        'assay.approve': 'منظور کریں اور ترازو پر بھیجیں', 'weigh.submit': 'وزن لاک کریں اور جے-فارم جاری کریں',
        'admin.dbt.release': 'زیر التوا DBT ادائیگیاں جاری کریں',
      },

      'as': {
        'nav.farmer': 'কৃষক পৰ্টেল', 'nav.queue': 'লাইভ শাৰী আৰু গেট', 'nav.weighbridge': 'পৰীক্ষক আৰু ওজন সেতু',
        'nav.admin': 'প্ৰশাসক আৰু DBT হাব', 'nav.sms': 'SMS গেটৱে',
        'brand.subtitle': 'স্মাৰ্ট ক্ৰয় আৰু ৰিয়েল-টাইম শাৰী ব্যৱস্থা',
        'farmer.book.title': 'ক্ৰয় স্লট বুক কৰক', 'farmer.confirm.btn': 'নিশ্চিত কৰক আৰু ডিজিটেল গেট পাছ তৈয়াৰ কৰক',
        'sms.title': 'SMS কমাণ্ড গেটৱে', 'sms.send': 'পঠিয়াওক', 'gate.checkin': 'চেক ইন',
      },

      'raj': {
        'nav.farmer': 'किसान पोर्टल', 'nav.queue': 'लाइव कतार अर गेट', 'nav.weighbridge': 'परख अर तोल',
        'nav.admin': 'एडमिन अर DBT हब', 'nav.sms': 'SMS गेटवे',
        'brand.subtitle': 'स्मार्ट खरीद अर रियल-टाइम कतार सिस्टम',
        'farmer.book.title': 'खरीद स्लॉट बुक करो', 'farmer.book.subtitle': 'गारंटी री अनलोडिंग टाइम बुक करो। हाईवे री कतार सूं बचो।',
        'farmer.confirm.btn': 'पक्को करो अर डिजिटल गेट पास बणाओ',
        'sms.title': 'SMS कमांड गेटवे', 'sms.send': 'भेजो', 'gate.checkin': 'चेक इन',
        'assay.approve': 'मंजूर करो अर तोल पुल पै भेजो', 'weigh.submit': 'वजन लॉक करो अर जे-फॉर्म जारी करो',
        'admin.dbt.release': 'बाकी DBT भुगतान जारी करो',
      },

      'har': {
        'nav.farmer': 'किसान पोर्टल', 'nav.queue': 'लाइव कतार अर गेट', 'nav.weighbridge': 'परख अर तौल',
        'nav.admin': 'एडमिन अर DBT हब', 'nav.sms': 'SMS गेटवे',
        'brand.subtitle': 'स्मार्ट खरीद अर रियल-टाइम कतार सिस्टम',
        'farmer.book.title': 'खरीद स्लॉट बुक करो', 'farmer.book.subtitle': 'पक्की अनलोडिंग टाइम बुक करो। हाईवे पै कतार मैं मत खड़ो।',
        'farmer.crop.label': 'फसल किस्म अर ग्रेड', 'farmer.qty.label': 'अंदाज मात्रा (क्विंटल)',
        'farmer.confirm.btn': 'पक्का करो अर डिजिटल गेट पास बणाओ',
        'farmer.tab.book': 'स्लॉट बुक अर ई-पास', 'farmer.tab.pass': 'म्हारा डिजिटल गेट पास',
        'farmer.tab.track': 'खरीद अर DBT ट्रैक करो', 'farmer.verified': 'जमीन अर आधार वेरिफाइड',
        'sms.title': 'SMS कमांड गेटवे', 'sms.send': 'भेजो', 'sms.quickcmds': 'जल्दी कमांड:',
        'led.title': 'मंडी लाइव टोकन कॉलिंग बोर्ड', 'gate.checkin': 'चेक इन',
        'assay.approve': 'मंजूर करो अर तौल पुल पै भेजो', 'weigh.submit': 'वजन लॉक करो अर जे-फॉर्म जारी करो',
        'admin.dbt.release': 'बाकी DBT भुगतान जारी करो',
      }
    };
  }
}

window.I18nManager = I18nManager;
