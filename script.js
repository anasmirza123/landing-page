'use strict';
require('dotenv').config();
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
const CLIENT_DIR = path.join(__dirname, '../client');

if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:'],
      'frame-src': ['https://www.google.com', 'https://maps.google.com'],
      'upgrade-insecure-requests': isProd ? [] : null // would break http://localhost
    }
  }
}));

// API: cross-origin only for listed origins; small body limit.
app.use('/api', cors({ origin: origins.length ? origins : false, methods: ['GET', 'POST'] }), express.json({ limit: '10kb' }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', uptime: Math.round(process.uptime()) }));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api', notFound);

// Client: HTML always revalidated, other assets cached.
app.use(express.static(CLIENT_DIR, {
  maxAge: isProd ? '7d' : 0,
  setHeaders: (res, file) => { if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache'); }
}));
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => console.info(`Al-Noor Auto Workshop running on http://localhost:${port}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}

(() => {
  'use strict';
  document.documentElement.classList.add('js'); // reveal animations only run when JS is available

  /* ---- Editable settings ---- */
  const WHATSAPP = { number: '920000000000', message: 'Hello Al-Noor Auto Workshop, I would like to ask about your auto service.' }; // DEMO number
  const CONTACT = { tel: '+923000000000', email: 'info@example.com', subject: 'Service enquiry', body: 'Hello Al-Noor Auto Workshop, I would like to ask about your auto service.', address: '123 Main Road, Faisalabad, Pakistan' }; // DEMO details
  // Paste real photo URLs or paths here (e.g. 'images/hero.jpg'). Empty = generated placeholder.
  const PHOTOS = { hero: '', workshop: '', g1: '', g2: '', g3: '', g4: '', g5: '', g6: '' };
  const HOURS = { zone: 'Asia/Karachi', closedDay: 'Sun', open: 9, close: 19 };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---- Images: real photo if provided, otherwise an inline placeholder ---- */
  const placeholder = (label, hue) => 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},18%,26%)"/><stop offset="1" stop-color="hsl(${hue},24%,8%)"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g fill="none" stroke="#ff5a3d" stroke-width="6" opacity=".55"><circle cx="600" cy="330" r="110"/><circle cx="600" cy="330" r="38"/><path d="M600 220v72M600 368v72M490 330h72M638 330h72"/></g><text x="600" y="560" text-anchor="middle" font-family="sans-serif" font-size="46" font-weight="700" fill="#fff">${label}</text><text x="600" y="606" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#fff" opacity=".55">Placeholder: set a photo in PHOTOS</text></svg>`);
  $$('img[data-photo]').forEach((img) => {
    img.src = PHOTOS[img.dataset.photo] || placeholder(img.dataset.label, img.dataset.hue);
  });

  /* ---- WhatsApp links ---- */
  const waUrl = `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(WHATSAPP.message)}`;
  $$('[data-wa]').forEach((a) => { a.href = waUrl; a.target = '_blank'; a.rel = 'noopener noreferrer'; });

  /* ---- Live open / closed status (workshop time zone) ---- */
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: HOURS.zone, weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
  const day = parts.find((p) => p.type === 'weekday').value;
  const hour = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const isOpen = day !== HOURS.closedDay && hour >= HOURS.open && hour < HOURS.close;
  $$('[data-status]').forEach((el) => {
    el.dataset.open = String(isOpen);
    el.textContent = isOpen ? 'Open now, until 7 PM' : 'Closed now, open Mon to Sat from 9 AM';
  });

  /* ---- Mobile menu ---- */
  const header = $('.header'), burger = $('.burger'), nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  matchMedia('(min-width: 68em)').addEventListener('change', () => setMenu(false));

  /* ---- Header shadow, active link, reveal on scroll ---- */
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const links = $$('.nav-link');
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((l) => (l.hash === '#' + en.target.id ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((l) => { const t = $(l.hash); if (t) spy.observe(t); });

  const reveal = new IntersectionObserver((entries, obs) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach((el) => reveal.observe(el));

  /* ---- Contact links: tel / mailto / directions ---- */
  $$('[data-tel]').forEach((a) => { a.href = `tel:${CONTACT.tel}`; });
  $$('[data-mail]').forEach((a) => { a.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(CONTACT.subject)}&body=${encodeURIComponent(CONTACT.body)}`; });
  $$('[data-directions]').forEach((a) => {
    a.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTACT.address)}`;
    a.target = '_blank'; a.rel = 'noopener noreferrer';
  });

  /* ---- Toasts ---- */
  const toasts = $('#toasts');
  const toast = (message, type = 'info', ms = 5500) => {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const text = document.createElement('p'); text.textContent = message;
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'toast-x'; close.setAttribute('aria-label', 'Dismiss notification'); close.textContent = '\u00d7';
    const dismiss = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    close.addEventListener('click', dismiss);
    el.append(text, close); toasts.append(el); setTimeout(dismiss, ms);
  };

  /* ---- Dialogs: scroll lock, outside click, close buttons (Esc and focus return are native) ---- */
  const openDialog = (d) => { d.showModal(); document.body.classList.add('menu-open'); };
  $$('dialog').forEach((d) => {
    d.addEventListener('close', () => document.body.classList.remove('menu-open'));
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => d.close()));
  });

  /* ---- Gallery lightbox with previous / next / keyboard ---- */
  const lb = $('#lightbox'), lbImg = $('img', lb);
  const shots = $$('.shot');
  let current = 0;
  const showShot = (i) => {
    current = (i + shots.length) % shots.length;
    const img = $('img', shots[current]);
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    $('[data-cap]', lb).textContent = $('span', shots[current]).textContent;
    $('[data-count]', lb).textContent = `${current + 1} / ${shots.length}`;
  };
  shots.forEach((b, i) => b.addEventListener('click', () => { showShot(i); openDialog(lb); }));
  $('[data-prev]', lb).addEventListener('click', () => showShot(current - 1));
  $('[data-next]', lb).addEventListener('click', () => showShot(current + 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showShot(current - 1);
    if (e.key === 'ArrowRight') showShot(current + 1);
  });

  /* ---- Booking form (declared early: service modal pre-fills it) ---- */
  const form = $('#form'), done = $('#done');
  const selectService = (name) => {
    if (form.hidden) { done.hidden = true; form.hidden = false; }
    form.elements.service.value = name;
    $('#contact').scrollIntoView();
    setTimeout(() => form.elements.vehicle.focus({ preventScroll: true }), 450);
    toast(`${name} selected. Add your details to request it.`, 'info');
  };

  /* ---- Service detail modal ---- */
  const DETAILS = {
    'Engine Diagnostics': { text: 'Warning light on, rough running or poor fuel economy? We scan for fault codes, inspect the engine and explain what we find before any repair.', points: ['Fault-code scan and live data check', 'Visual inspection of the engine bay', 'Clear findings and repair options'], time: 'Typically 45 to 90 minutes' },
    'Oil & Filter Service': { text: 'Fresh oil and a new filter keep the engine protected. We also check fluid levels and look over the basics while the car is up.', points: ['Oil and filter replacement', 'Fluid level top-up and check', 'Quick visual safety look-over'], time: 'Typically 30 to 45 minutes' },
    'Brake Service': { text: 'We inspect pads, discs, fluid and lines, then recommend only what the brakes actually need.', points: ['Pad and disc inspection', 'Brake fluid check', 'Repair or replacement when needed'], time: 'Typically 1 to 2 hours' },
    'AC & Cooling': { text: 'If the AC is weak or the engine runs hot, we check the AC system and the cooling circuit and service them as required.', points: ['AC performance check', 'Coolant level and leak inspection', 'Radiator and hose check'], time: 'Typically 1 to 2 hours' },
    'Tire & Wheel Service': { text: 'Correct tire condition and balance improve safety, comfort and tire life.', points: ['Tire condition and pressure check', 'Rotation and wheel balancing', 'Wheel care and fitting'], time: 'Typically 45 to 60 minutes' },
    'Battery & Electrical': { text: 'Slow starts and electrical faults are often a weak battery or charging issue. We test first, then advise.', points: ['Battery and charging test', 'Basic electrical fault finding', 'Battery replacement if needed'], time: 'Typically 30 to 60 minutes' }
  };
  const sm = $('#service-modal');
  $$('[data-service]').forEach((btn) => btn.addEventListener('click', () => {
    const name = btn.dataset.service, d = DETAILS[name];
    $('#sm-title').textContent = name;
    $('[data-desc]', sm).textContent = d.text;
    $('[data-points]', sm).replaceChildren(...d.points.map((p) => {
      const li = document.createElement('li');
      li.innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';
      li.append(p);
      return li;
    }));
    $('[data-typical]', sm).textContent = `${d.time}. Times are examples and vary by vehicle.`;
    sm.dataset.service = name;
    openDialog(sm);
  }));
  $('[data-book]', sm).addEventListener('click', () => { sm.close(); selectService(sm.dataset.service); });

  /* ---- Reviews carousel (native scroll-snap = swipe on touch) ---- */
  const track = $('.carousel-track'), slides = $$('.card', track), dots = $('.dots');
  const stepSize = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.className = 'dot'; dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.addEventListener('click', () => track.scrollTo({ left: i * stepSize(), behavior: 'smooth' }));
    dots.append(dot);
  });
  const syncDots = () => {
    const index = Math.round(track.scrollLeft / stepSize());
    [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
  };
  $('[data-rprev]').addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
  $('[data-rnext]').addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
  track.addEventListener('scroll', syncDots, { passive: true });
  syncDots();

  /* ---- Booking form: validation, API call, states ---- */
  const API_BASE = $('meta[name="api-base"]').content.replace(/\/$/, '');
  const GENERIC_ERROR = "We couldn't submit your request right now. Please try again or contact us directly.";
  const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  $('#date').min = localToday;

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Enter your full name.',
    phone: (v) => (/^\+?[\d\s()-]{10,20}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 10) || 'Enter a valid phone number, for example +92 300 0000000.',
    email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address, for example you@example.com.',
    vehicle: (v) => v.trim().length >= 2 || 'Tell us your vehicle, for example Honda Civic 2018.',
    service: (v) => !!v || 'Choose the service you need.',
    date: (v) => !v || (v >= localToday && new Date(`${v}T00:00`).getDay() !== 0) || 'Choose today or a later date. We are closed on Sundays.',
    time: () => true,
    message: (v) => v.trim().length <= 1000 || 'Keep the message under 1000 characters.'
  };
  const fields = [...form.elements].filter((f) => rules[f.name]);
  const setError = (f, msg) => { $(`#${f.id}-err`).textContent = msg; f.setAttribute('aria-invalid', String(!!msg)); };
  const validate = (f) => { const r = rules[f.name](f.value); setError(f, r === true ? '' : r); return r === true; };
  fields.forEach((f) => {
    f.addEventListener('blur', () => { if (f.value || f.required) validate(f); });
    f.addEventListener(f.tagName === 'SELECT' ? 'change' : 'input', () => { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
  });

  const submitBtn = $('[type="submit"]', form);
  let busy = false;
  const setBusy = (on) => {
    busy = on; submitBtn.disabled = on; submitBtn.setAttribute('aria-busy', String(on));
    $('span', submitBtn).textContent = on ? 'Sending Request...' : 'Request Service';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;                                   // block duplicate submissions
    const bad = fields.filter((f) => !validate(f));
    if (bad.length) { bad[0].focus(); toast('Please complete the required fields.', 'info'); return; }

    setBusy(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    let message = GENERIC_ERROR;
    try {
      const res = await fetch(`${API_BASE}/api/booking`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))), signal: ctrl.signal
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        form.reset(); fields.forEach((f) => setError(f, ''));   // reset only after success
        form.hidden = true; done.hidden = false; done.focus();
        toast('Request submitted successfully.', 'success');
        return;
      }
      if (res.status === 400 || res.status === 429) message = data.message || message;
      Object.entries(data.errors || {}).forEach(([key, msg]) => { if (form.elements[key]?.id) setError(form.elements[key], msg); });
    } catch (err) { /* network failure or timeout: keep the generic message */ }
    finally { clearTimeout(timer); setBusy(false); }
    toast(message, 'error', 8000);
  });

  $('#clear').addEventListener('click', () => { form.reset(); fields.forEach((f) => setError(f, '')); toast('Form cleared.', 'info', 2500); });
  $('#again').addEventListener('click', () => { done.hidden = true; form.hidden = false; fields[0].focus(); });
})();
