/* ============ CONFIG ============ */
// TODO: replace with the real WhatsApp number (country code + number, no + or spaces, e.g. 27821234567)
const WHATSAPP_NUMBER = "27747981654";
const WHATSAPP_DISPLAY = "+27 74 798 1654"; 

const SERVICE_LABELS = {
  "website": "Business Website",
  "custom-system": "Custom Business System",
  "automation": "Business Automation",
  "ai-automation": "AI / WhatsApp Solution",
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
