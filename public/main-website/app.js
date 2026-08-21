/**
 * VoltSentry — Motion Edition (app.js)
 * Full Interactive Website Controller:
 * • Real-time Vehicle Switcher & Telemetry Data Engine
 * • SOH Radial Dial Easing & Simulator Slider
 * • Degradation Curve Morphing & Point Tooltips
 * • Sliding Glass Navbar Spring Indicator & Scroll Spy
 * • Card Mouse Spotlight Lighting Effect
 * • Interactive Upload & Passport Generator Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. FLOATING NAVBAR WITH SLIDING SPRING PILL -----------
  const navbar = document.getElementById('navbar');
  const navItems = document.querySelectorAll('.nav-links .nav-item');
  const navIndicator = document.getElementById('navIndicator');
  const hamburger = document.getElementById('hamburger');
  const navLinksWrapper = document.querySelector('.nav-links-wrapper');

  function updateIndicator(activeItem) {
    if (!activeItem || !navIndicator || window.innerWidth <= 768) return;
    const itemRect = activeItem.getBoundingClientRect();
    const parentRect = activeItem.parentElement.parentElement.getBoundingClientRect();
    navIndicator.style.left = ${itemRect.left - parentRect.left}px;
    navIndicator.style.width = ${itemRect.width}px;
    navIndicator.style.top = ${itemRect.top - parentRect.top}px;
    navIndicator.style.height = ${itemRect.height}px;
  }

  const initialActive = document.querySelector('.nav-links .nav-item.active');
  if (initialActive) updateIndicator(initialActive);
  window.addEventListener('resize', () => {
    const current = document.querySelector('.nav-links .nav-item.active');
    if (current) updateIndicator(current);
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (hamburger && navLinksWrapper) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinksWrapper.classList.toggle('open');
    });
  }

  // Scroll Spy for Navbar
  const sectionIds = ['hero', 'word-vs-proof', 'inside-report', 'durable-design', 'cta-footer'];
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 160;
    sectionIds.forEach(id => {
      const sec = document.getElementById(id);
      if (sec) {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          navItems.forEach(item => {
            if (item.getAttribute('data-nav') === id) {
              if (!item.classList.contains('active')) {
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                updateIndicator(item);
              }
            }
          });
        }
      }
    });
  });

  // --- 2. SOH RADIAL DIAL ANIMATION ENGINE -------------------
  function setRadialGauge(arcId, numId, targetSoh, duration = 1200) {
    const arc = document.getElementById(arcId);
    const numEl = document.getElementById(numId);
    if (!arc || !numEl) return;

    const maxDash = 201; // for Hero
    // Map SOH (0-100) to dasharray: 100% = 201 100, 0% = 0 301
    const dashLength = (targetSoh / 100) * maxDash;
    arc.style.strokeDasharray = ${dashLength} ;

    // Counter ticker
    let start = 0;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(targetSoh * ease);
      numEl.innerHTML = ${val}<span class="pct">%</span>;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Initial Hero Dial animation
  setTimeout(() => {
    setRadialGauge('heroSohArc', 'heroSohDisplay', 92, 1400);
    setRadialGauge('rptSohGaugeArc', 'rptSohNum', 92, 1400);
  }, 350);

  // --- 3. INTERACTIVE VEHICLE SELECTOR ENGINE -----------------
  const vehicleBtn = document.getElementById('vehicleSelectorBtn');
  const vehicleDropdown = document.getElementById('vehicleDropdown');
  const vOptions = document.querySelectorAll('.v-option');
  const scanStatusText = document.getElementById('scanStatusText');

  const vName = document.getElementById('currentVehicleName');
  const vVin = document.getElementById('currentVehicleVin');
  const vSohDisp = document.getElementById('heroSohDisplay');
  const vHealthTag = document.getElementById('heroHealthTag');
  const vSafety = document.getElementById('heroSafetyRisk');
  const vDeg = document.getElementById('heroDegRate');
  const vCycles = document.getElementById('heroCycleCount');
  const vSoc = document.getElementById('heroCurrentSoc');
  const vRange = document.getElementById('heroEstRange');
  const vTemp = document.getElementById('heroBatteryTemp');

  if (vehicleBtn && vehicleDropdown) {
    vehicleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      vehicleBtn.classList.toggle('open');
      vehicleDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      vehicleBtn.classList.remove('open');
      vehicleDropdown.classList.remove('open');
    });

    vOptions.forEach(opt => {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        vOptions.forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        vehicleBtn.classList.remove('open');
        vehicleDropdown.classList.remove('open');

        const model = this.dataset.model;
        const vin = this.dataset.vin;
        const soh = parseInt(this.dataset.soh);
        const soc = this.dataset.soc;
        const range = this.dataset.range;
        const temp = this.dataset.temp;
        const cycles = this.dataset.cycles;
        const deg = this.dataset.deg;

        // Simulated scanning feedback
        scanStatusText.textContent = 'CONNECTING...';
        setTimeout(() => {
          scanStatusText.textContent = 'SCANNING...';
        }, 800);

        vName.textContent = model;
        vVin.textContent = vin;
        vSoc.textContent = ${soc}%;
        vRange.textContent = ${range} km;
        vTemp.textContent = ${temp}°C;
        vCycles.textContent = cycles;
        vDeg.textContent = ${deg}% / year;

        vHealthTag.textContent = soh >= 94 ? 'Pristine' : (soh >= 90 ? 'Excellent' : 'Good');
        setRadialGauge('heroSohArc', 'heroSohDisplay', soh, 900);

        // Update Degradation Chart final point
        const badge = document.getElementById('chartCurrentBadge');
        if (badge) badge.textContent = ${soh}%;
      });
    });
  }

  // --- 4. INTERACTIVE DEGRADATION CHART CONTROLS --------------
  const timeTabs = document.querySelectorAll('.time-tab');
  const trendPolyline = document.getElementById('trendPolyline');
  const chartTooltip = document.getElementById('chartTooltip');
  const pointCircles = document.querySelectorAll('.point-circle');

  const chartPresets = {
    '12': "15,15 55,20 95,23 135,26 175,28 215,32 255,36 295,40 335,44 375,48 415,51 445,53",
    '6':  "15,25 95,30 175,34 255,40 335,46 445,53",
    'all': "15,10 75,18 155,25 235,32 315,42 395,48 445,53"
  };

  timeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      timeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const key = this.dataset.months;
      if (chartPresets[key] && trendPolyline) {
        trendPolyline.setAttribute('points', chartPresets[key]);
      }
    });
  });

  pointCircles.forEach(circle => {
    circle.addEventListener('mouseenter', function() {
      const month = this.dataset.month;
      const val = this.dataset.val;
      if (chartTooltip) {
        chartTooltip.textContent = ${month}: ;
        chartTooltip.style.left = ${this.getAttribute('cx')}px;
        chartTooltip.style.top = ${parseInt(this.getAttribute('cy')) - 26}px;
        chartTooltip.classList.add('visible');
      }
    });
    circle.addEventListener('mouseleave', () => {
      if (chartTooltip) chartTooltip.classList.remove('visible');
    });
  });

  // --- 5. INTERACTIVE SOH SIMULATOR (REPORT SECTION) ----------
  const sohSlider = document.getElementById('sohInteractiveSlider');
  const sliderValDisplay = document.getElementById('sliderCurrentVal');
  const confRangeText = document.getElementById('confRangeText');
  const confFillBar = document.getElementById('confFillBar');
  const confMarkerStart = document.getElementById('confMarkerStart');
  const confMarkerEnd = document.getElementById('confMarkerEnd');
  const rptGradeTag = document.getElementById('rptGradeTag');
  const rptGradePill = document.getElementById('rptGradePill');
  const warrantyLimitDesc = document.getElementById('warrantyLimitDesc');

  if (sohSlider) {
    sohSlider.addEventListener('input', function() {
      const val = parseInt(this.value);
      sliderValDisplay.textContent = ${val}%;
      setRadialGauge('rptSohGaugeArc', 'rptSohNum', val, 300);

      // Calculate confidence band (+/- 4%)
      const low = Math.max(val - 4, 60);
      const high = Math.min(val + 4, 100);
      confRangeText.textContent = ${low}% – %;

      // Visual slider bar position
      const leftPct = ((low - 60) / 40) * 100;
      const widthPct = ((high - low) / 40) * 100;
      confFillBar.style.left = ${leftPct}%;
      confFillBar.style.width = ${widthPct}%;
      confMarkerStart.style.left = ${leftPct}%;
      confMarkerEnd.style.left = ${leftPct + widthPct}%;

      // Update grade
      let grade = 'A+ • Excellent';
      let tag = 'Excellent';
      let kmLeft = '145,000 km';
      if (val >= 95) { grade = 'A++ • Pristine'; tag = 'Pristine'; kmLeft = '180,000 km'; }
      else if (val >= 90) { grade = 'A+ • Excellent'; tag = 'Excellent'; kmLeft = '130,000 km'; }
      else if (val >= 80) { grade = 'B+ • Good'; tag = 'Good'; kmLeft = '85,000 km'; }
      else { grade = 'C • Fair'; tag = 'Fair'; kmLeft = '35,000 km'; }

      rptGradeTag.textContent = tag;
      rptGradePill.textContent = grade;
      warrantyLimitDesc.textContent = Shows approx.  (estimated  months) left until warranty threshold (70-75% SOH).;
    });
  }

  // --- 6. INTERACTIVE WORD VS PROOF DIFF TOGGLE --------------
  const vsSideBtn = document.getElementById('vsSideViewBtn');
  const vsDiffBtn = document.getElementById('vsDiffViewBtn');
  const vsMatrix = document.getElementById('vsMatrix');

  if (vsSideBtn && vsDiffBtn && vsMatrix) {
    vsDiffBtn.addEventListener('click', () => {
      vsSideBtn.classList.remove('active');
      vsDiffBtn.classList.add('active');
      vsMatrix.querySelectorAll('.vs-row-item').forEach((item, idx) => {
        item.style.transition = 'all 0.3s ease';
        item.style.transform = scale(1.03);
        item.style.backgroundColor = 'rgba(74, 222, 128, 0.08)';
      });
    });
    vsSideBtn.addEventListener('click', () => {
      vsDiffBtn.classList.remove('active');
      vsSideBtn.classList.add('active');
      vsMatrix.querySelectorAll('.vs-row-item').forEach(item => {
        item.style.transform = 'scale(1)';
        item.style.backgroundColor = '';
      });
    });
  }

  // --- 7. INTERACTIVE UPLOAD & PASSPORT MODAL -----------------
  const uploadModal = document.getElementById('uploadModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const dropzoneBox = document.getElementById('dropzoneBox');
  const modalPassportPreview = document.getElementById('modalPassportPreview');
  const simulateGenBtn = document.getElementById('simulateGenBtn');

  const methodCards = document.querySelectorAll('.method-interactive-card');
  const methodHeaders = {
    'photos': { title: 'Upload Dashboard & BMS Photos', sub: 'Take clear photos of meter reading or cluster' },
    'report': { title: 'Upload Authorized Service Center Report', sub: 'PDF, scanned document, or workshop diagnostic sheet' },
    'invoice': { title: 'Upload Battery Service Bill / Invoice', sub: 'Official invoices detailing vehicle identification & service' },
    'whatsapp': { title: 'Forward via WhatsApp / Email', sub: 'Send files to passport@voltsentry.com or +91 98765 43210' },
    'manual': { title: 'Manual BMS Value Input', sub: 'Enter pack voltage, cycle count, and known cell parameters' }
  };

  methodCards.forEach(card => {
    card.addEventListener('click', function() {
      const key = this.dataset.method;
      if (methodHeaders[key]) {
        modalTitle.textContent = methodHeaders[key].title;
        modalSub.textContent = methodHeaders[key].sub;
      }
      modalPassportPreview.style.display = 'none';
      dropzoneBox.style.display = 'block';
      simulateGenBtn.textContent = 'Generate Instant Demo Passport ?';
      uploadModal.classList.add('active');
    });
  });

  if (modalCloseBtn && uploadModal) {
    modalCloseBtn.addEventListener('click', () => uploadModal.classList.remove('active'));
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) uploadModal.classList.remove('active');
    });
  }

  if (simulateGenBtn) {
    simulateGenBtn.addEventListener('click', () => {
      simulateGenBtn.textContent = 'Verifying BMS Signatures...';
      setTimeout(() => {
        dropzoneBox.style.display = 'none';
        modalPassportPreview.style.display = 'block';
        simulateGenBtn.textContent = '? Passport Generated & Verified!';
      }, 700);
    });
  }

  // --- 8. MOUSE SPOTLIGHT GLOW EFFECT ON CARDS ---------------
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = adial-gradient(circle at px px, rgba(74, 222, 128, 0.12) 0%, rgba(14, 25, 16, 0.8) 60%);
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  console.log('%cVoltSentry Motion Edition ? Ready', 'color: #4ade80; font-size: 15px; font-weight: bold;');
});