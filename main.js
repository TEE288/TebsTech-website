/* ============ CONFIG ============ */
// TODO: replace with the real WhatsApp number (country code + number, no + or spaces, e.g. 27821234567)
const WHATSAPP_NUMBER = "27747981654";
const WHATSAPP_DISPLAY = "+27 74 798 1654"; 

const SERVICE_LABELS = {
  "website": "Business Website",
  "custom-system": "Custom Business System",
  "automation": "Business Automation",
  "ai-automation": "AI / WhatsApp Solution",
  "corporate-identity": "Corporate Identity Design",
  "not-sure": "Not sure yet — need advice"
};

/* ============ Reveal on scroll ============ */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
  });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ============ Automation flow sequential activation ============ */
const flowNodes = document.querySelectorAll('#flowChain .flow-node');
let flowStarted = false;
const flowIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting && !flowStarted){
      flowStarted = true;
      flowNodes.forEach((node, i)=>{
        setTimeout(()=>node.classList.add('active'), i*420);
      });
    }
  });
},{threshold:0.3});
if(flowNodes.length){ flowIO.observe(document.getElementById('flowChain')); }

/* ============ Mobile menu toggle ============ */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
function closeMobileMenu(){
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded','false');
  mobileMenu.classList.remove('open');
}
navToggle.addEventListener('click', ()=>{
  const isOpen = mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMobileMenu));

/* ============ Active nav link on scroll ============ */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = Array.from(navLinks).map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const id = '#' + entry.target.id;
    const link = document.querySelector('.nav-links a[href="'+id+'"]');
    if(!link) return;
    if(entry.isIntersecting){
      navLinks.forEach(l=>l.classList.remove('active'));
      link.classList.add('active');
    }
  });
},{rootMargin:'-40% 0px -55% 0px'});
sections.forEach(s=>navIO.observe(s));

/* ============ WhatsApp helpers ============ */
function buildWaLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function openWa(message){
  window.open(buildWaLink(message), '_blank', 'noopener');
}

// Floating button + direct chat link: generic opener message
const genericMsg = "Hi TebsTech, I'd like to find out more about your services.";
document.getElementById('waFloat').setAttribute('href', buildWaLink(genericMsg));
document.getElementById('quoteDirectLink').setAttribute('href', buildWaLink(genericMsg));
document.getElementById('quotePhoneDisplay').textContent = WHATSAPP_DISPLAY;
document.getElementById('quotePhoneDisplay').setAttribute('href', buildWaLink(genericMsg));

// Pricing card "Request this quote" buttons
document.querySelectorAll('.quote-trigger').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const service = btn.getAttribute('data-service');
    const select = document.getElementById('qService');
    if(select) select.value = service;
    document.getElementById('quote').scrollIntoView({behavior:'smooth', block:'start'});
    setTimeout(()=>document.getElementById('qName').focus(), 500);
  });
});

// Quote form submission -> builds WhatsApp message
document.getElementById('quoteForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('qName').value.trim();
  const business = document.getElementById('qBusiness').value.trim();
  const service = document.getElementById('qService').value;
  const details = document.getElementById('qMessage').value.trim();

  if(!name){
    document.getElementById('qName').focus();
    return;
  }

  let msg = `Hi TebsTech, I'd like a quote.\n\nName: ${name}`;
  if(business) msg += `\nBusiness: ${business}`;
  msg += `\nInterested in: ${SERVICE_LABELS[service] || service}`;
  if(details) msg += `\nDetails: ${details}`;

  openWa(msg);
});

/* ============ Service "how it works" tutorial modal ============ */
/* ---- small line-icon library used by the tutorial visuals ---- */
const ICONS = {
  phoneCall: `<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/>`,
  layout: `<rect x="3" y="3" width="18" height="18" rx="1.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>`,
  monitor: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
  smartphone: `<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  tool: `<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.75z"/>`,
  nodes: `<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><line x1="8.6" y1="7.6" x2="10.6" y2="15.8"/><line x1="15.4" y1="7.6" x2="13.4" y2="15.8"/><line x1="9" y1="6" x2="15" y2="6"/>`,
  database: `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0018 0V5"/><path d="M3 12a9 3 0 0018 0"/>`,
  users: `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>`,
  search: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  repeat: `<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>`,
  link: `<path d="M15 7h3a5 5 0 010 10h-3m-6 0H6a5 5 0 010-10h3"/><line x1="8" y1="12" x2="16" y2="12"/>`,
  zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  chart: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  sliders: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
  chat: `<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>`,
  bell: `<path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>`,
  arrowCircle: `<circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  userPlus: `<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  dollar: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>`,
  cursor: `<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>`,
  checkCircle: `<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  box: `<path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><polyline points="3 8 12 13 21 8"/><line x1="12" y1="13" x2="12" y2="21"/>`,
  alertTriangle: `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  truck: `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
  idCard: `<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.5"/><line x1="14" y1="9" x2="19" y2="9"/><line x1="14" y1="13" x2="19" y2="13"/><line x1="5" y1="17" x2="11" y2="17"/>`,
  funnel: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  mapPin: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>`,
  creditCard: `<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>`,
  flag: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>`,
  fileText: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>`,
  hexagon: `<path d="M12 2l8.66 5v10L12 22l-8.66-5V7z"/><path d="M12 8v8"/><path d="M8.7 6l3.3 2 3.3-2"/>`,
  palette: `<path d="M12 22a10 10 0 110-20 8 8 0 018 8c0 2-1.5 3-3 3h-2a2 2 0 00-1 3.7A2 2 0 0112 22z"/><circle cx="7" cy="12" r="1"/><circle cx="9" cy="8" r="1"/><circle cx="14" cy="7" r="1"/><circle cx="17" cy="11" r="1"/>`,
  book: `<path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 16.5v-12z"/><path d="M4 16.5A2.5 2.5 0 016.5 19H20"/>`
};
function iconSvg(name){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.fileText}</svg>`;
}
document.querySelectorAll('.circ[data-icon]').forEach(el=>{
  el.innerHTML = iconSvg(el.getAttribute('data-icon'));
});

const SERVICE_TUTORIALS = {
  "website": {
    idx: "01",
    title: "Business Websites",
    intro: "How a professional, mobile-friendly website comes together — from first call to a live site.",
    steps: [
      { title: "Discovery call", icon: "phoneCall" },
      { title: "Content & structure", icon: "layout" },
      { title: "Design & build", icon: "monitor" },
      { title: "Review & test", icon: "smartphone" },
      { title: "Launch", icon: "send" },
      { title: "Ongoing support", icon: "tool" }
    ]
  },
  "custom-system": {
    idx: "02",
    title: "Custom Business Systems",
    intro: "How software gets shaped around the way a specific business actually runs.",
    steps: [
      { title: "Map the workflow", icon: "nodes" },
      { title: "Design the system", icon: "layout" },
      { title: "Build & connect", icon: "database" },
      { title: "Test with real staff", icon: "users" },
      { title: "Launch & train", icon: "send" },
      { title: "Ongoing refinement", icon: "settings" }
    ]
  },
  "automation": {
    idx: "03",
    title: "Business Automation",
    intro: "How we connect the tools already in use, so information moves on its own.",
    steps: [
      { title: "Audit current tools", icon: "search" },
      { title: "Spot repetitive tasks", icon: "repeat" },
      { title: "Connect the systems", icon: "link" },
      { title: "Build the automation", icon: "zap" },
      { title: "Monitor & refine", icon: "chart" }
    ]
  },
  "ai-automation": {
    idx: "04",
    title: "AI & WhatsApp Solutions",
    intro: "How AI-powered lead handling gets built on channels customers already use, like WhatsApp.",
    steps: [
      { title: "Connect WhatsApp", icon: "smartphone" },
      { title: "Train the AI", icon: "sliders" },
      { title: "Automate responses", icon: "chat" },
      { title: "Human handoff", icon: "users" },
      { title: "Track & improve", icon: "chart" }
    ]
  },
  "corporate-identity": {
    idx: "05",
    title: "Corporate Identity Design",
    intro: "How a complete brand identity comes together — logo, colours, documents and digital presence.",
    steps: [
      { title: "Logo Design", icon: "hexagon" },
      { title: "Branding", icon: "palette" },
      { title: "Documents", icon: "fileText" },
      { title: "Digital", icon: "monitor" },
      { title: "Guidelines", icon: "book" }
    ]
  }
};

const SYSTEM_TUTORIALS = {
  "employee-management": {
    idx: "S1",
    title: "Employee Management",
    intro: "How staff, shifts and attendance get tracked automatically instead of on paper.",
    quoteValue: "custom-system",
    steps: [
      { title: "Add employees & roles", icon: "userPlus" },
      { title: "Build the schedule", icon: "calendar" },
      { title: "Staff check schedules", icon: "smartphone" },
      { title: "Attendance is tracked", icon: "clock" },
      { title: "Export for payroll", icon: "dollar" }
    ]
  },
  "booking": {
    idx: "S2",
    title: "Booking & Appointments",
    intro: "How customers book a slot online and the business always knows who's coming in.",
    quoteValue: "custom-system",
    steps: [
      { title: "Customer picks a service", icon: "cursor" },
      { title: "Availability is checked", icon: "calendar" },
      { title: "Booking is confirmed", icon: "checkCircle" },
      { title: "Reminders go out", icon: "bell" },
      { title: "Calendar updates live", icon: "repeat" }
    ]
  },
  "inventory": {
    idx: "S3",
    title: "Inventory Management",
    intro: "How stock levels stay accurate automatically, and low stock gets flagged early.",
    quoteValue: "custom-system",
    steps: [
      { title: "Stock is logged", icon: "box" },
      { title: "Levels update automatically", icon: "arrowCircle" },
      { title: "Low-stock alerts fire", icon: "alertTriangle" },
      { title: "Supplier orders tracked", icon: "truck" },
      { title: "Reports show trends", icon: "chart" }
    ]
  },
  "customer-management": {
    idx: "S4",
    title: "Customer Management",
    intro: "How every customer's details, history and follow-ups live in one place.",
    quoteValue: "custom-system",
    steps: [
      { title: "Capture details once", icon: "idCard" },
      { title: "Log every interaction", icon: "chat" },
      { title: "Track leads", icon: "funnel" },
      { title: "Automatic follow-ups", icon: "bell" },
      { title: "Instant history", icon: "clock" }
    ]
  },
  "driver-management": {
    idx: "S5",
    title: "Driver Management",
    intro: "How drivers, vehicles and routes are tracked so earnings are never a guessing game.",
    quoteValue: "custom-system",
    steps: [
      { title: "Register drivers & vehicles", icon: "truck" },
      { title: "Assign routes", icon: "mapPin" },
      { title: "Log trips & mileage", icon: "fileText" },
      { title: "Calculate earnings", icon: "dollar" },
      { title: "Track performance", icon: "chart" }
    ]
  },
  "quotation-invoicing": {
    idx: "S6",
    title: "Quotation & Invoicing",
    intro: "How a quote turns into a paid invoice, with balances tracked automatically.",
    quoteValue: "custom-system",
    steps: [
      { title: "Build a quote", icon: "fileText" },
      { title: "Client approves", icon: "checkCircle" },
      { title: "Converts to invoice", icon: "arrowCircle" },
      { title: "Payments tracked", icon: "creditCard" },
      { title: "Balances flagged", icon: "flag" }
    ]
  }
};

const ALL_TUTORIALS = Object.assign({}, SERVICE_TUTORIALS, SYSTEM_TUTORIALS);

const tutOverlay = document.getElementById('tutOverlay');
const tutClose = document.getElementById('tutClose');
const tutFlow = document.getElementById('tutFlow');
const tutTitle = document.getElementById('tutTitle');
const tutIntro = document.getElementById('tutIntro');
const tutIdx = document.getElementById('tutIdx');
const tutQuoteBtn = document.getElementById('tutQuoteBtn');
let tutCurrentService = null;
let tutLastFocused = null;

function openTutorial(serviceKey){
  const data = ALL_TUTORIALS[serviceKey];
  if(!data || !tutOverlay) return;

  tutCurrentService = serviceKey;
  tutIdx.textContent = data.idx;
  tutTitle.textContent = data.title;
  tutIntro.textContent = data.intro;

  tutFlow.innerHTML = '';
  data.steps.forEach((step, i)=>{
    const el = document.createElement('div');
    el.className = 'tut-step';
    el.innerHTML = `
      <div class="tut-step-num">${i+1}</div>
      <div class="tut-step-icon">${iconSvg(step.icon)}</div>
      <div class="tut-step-label">${step.title}</div>
    `;
    tutFlow.appendChild(el);
  });

  tutLastFocused = document.activeElement;
  tutOverlay.classList.add('open');
  tutOverlay.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  tutClose.focus();

  // animate tiles in one after another
  const stepEls = tutFlow.querySelectorAll('.tut-step');
  stepEls.forEach((el, i)=>{
    setTimeout(()=>el.classList.add('visible'), 100 + i*110);
  });
}

function closeTutorial(){
  if(!tutOverlay) return;
  tutOverlay.classList.remove('open');
  tutOverlay.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  if(tutLastFocused) tutLastFocused.focus();
}

document.querySelectorAll('.service-card[data-service], .sys-card[data-system]').forEach(card=>{
  const key = card.getAttribute('data-service') || card.getAttribute('data-system');
  card.addEventListener('click', ()=> openTutorial(key));
  card.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      openTutorial(key);
    }
  });
});

if(tutClose) tutClose.addEventListener('click', closeTutorial);
if(tutOverlay){
  tutOverlay.addEventListener('click', (e)=>{
    if(e.target === tutOverlay) closeTutorial();
  });
}
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && tutOverlay && tutOverlay.classList.contains('open')) closeTutorial();
});
if(tutQuoteBtn){
  tutQuoteBtn.addEventListener('click', ()=>{
    const select = document.getElementById('qService');
    if(select && tutCurrentService){
      const data = ALL_TUTORIALS[tutCurrentService];
      select.value = (data && data.quoteValue) || tutCurrentService;
    }
    closeTutorial();
    setTimeout(()=>{
      document.getElementById('quote').scrollIntoView({behavior:'smooth', block:'start'});
      setTimeout(()=>document.getElementById('qName').focus(), 450);
    }, 200);
  });
}

/* ============ FAQ accordion ============ */
document.querySelectorAll('.faq-item').forEach(item=>{
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', ()=>{
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other=>{
      if(other !== item){
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      }
    });
    if(isOpen){
      item.classList.remove('open');
      a.style.maxHeight = null;
    } else {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});
