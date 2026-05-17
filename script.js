/* ═══════════════════════════════════════════
   FUSION — script.js  (Main Site)
   By Md. Shamim Al Razi
═══════════════════════════════════════════ */
'use strict';

/* ── State ─────────────────────────────── */
let CONFIG   = {};
let ALL_APPS = [];
let currentFilter = 'all';

const CAT_ICONS = {
  'Productivity':'⚡','Design Tools':'🎨','Finance':'💳',
  'Utilities':'🔧','Education':'📚','Entertainment':'🎮',
  'Social':'💬','Health':'🏃','Games':'🎮','Other':'📦'
};
const STATUS_LABEL = { live:'Live', beta:'Beta', wip:'In Progress', planned:'Planned' };
const ICON_COLORS  = [
  'linear-gradient(135deg,#6c63ff,#00d4ff)',
  'linear-gradient(135deg,#ff6b9d,#f9a04b)',
  'linear-gradient(135deg,#00d4ff,#6c63ff)',
  'linear-gradient(135deg,#2ecc71,#00d4ff)',
  'linear-gradient(135deg,#f9a04b,#ff6b9d)',
  'linear-gradient(135deg,#6c63ff,#ff6b9d)',
];

const $ = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];

/* ═══════════════════════════════════════
   BOOT
═══════════════════════════════════════ */
async function boot() {
  initNavbar();
  initBackTop();
  initSmoothScroll();
  initModalClose();
  $('#yr').textContent = new Date().getFullYear();

  try {
    CONFIG = await fetchJSON('./data/config.json');
  } catch(_) { CONFIG = {}; }

  applyConfig();

  const { apps, source } = await loadApps();
  ALL_APPS = apps;
  showDataBadge(source);
  updateHeroStats();
  renderFeatured();
  buildFilters();
  renderGrid(ALL_APPS);
  renderCategories();
  initContactForm();
  initReveal();
}

/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */
function applyConfig() {
  const s = CONFIG.site || {};
  if (s.description) $('#heroSub').textContent = s.description;

  // Footer tagline with real author name
  const taglineEl = $('#footerTagline');
  if (taglineEl) {
    taglineEl.textContent = (s.tagline || 'Apps crafted with intention.') +
      (s.author ? ' · By ' + s.author : '');
  }

  // Footer copyright year + name
  const copyrightEl = $('#footerCopyright');
  if (copyrightEl) {
    copyrightEl.textContent = '© ' + new Date().getFullYear() +
      ' Fusion · ' + (s.author || 'Md. Shamim Al Razi');
  }

  const fl = $('#footerLinks');
  if (fl) {
    const links = [];
    if (s.github) links.push(`<li><a href="${s.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a></li>`);
    if (s.email)  links.push(`<li><a href="mailto:${s.email}"><i class="fas fa-envelope"></i> Email</a></li>`);
    fl.innerHTML = links.join('');
  }

  const ch = $('#contactChannels');
  if (ch) {
    const items = [];
    if (s.github) items.push(channelHTML('fab fa-github','GitHub', s.github.replace('https://github.com/',''), s.github));
    if (s.email)  items.push(channelHTML('fas fa-envelope','Email', s.email, 'mailto:'+s.email));
    ch.innerHTML = items.join('');
  }
}

function channelHTML(icon, label, value, href) {
  return `<a href="${href}" target="_blank" rel="noopener" class="ch-item">
    <div class="ch-ic"><i class="${icon}"></i></div>
    <div><span class="ch-lbl">${label}</span><span class="ch-val">${value}</span></div>
  </a>`;
}

/* ═══════════════════════════════════════
   DATA LOADING
   
   CORS note:
   Apps Script GET requests work fine — the browser follows a redirect to
   googleapis.com which has proper CORS headers.
   
   POST requests from a browser trigger a preflight (OPTIONS) that Apps Script
   cannot answer. The workaround: send POST data as a GET param using a
   'no-cors' redirect trick, or simply encode the action in the URL and use
   GET for all read operations (already done). For writes (admin panel),
   the POST happens from admin.js — same mechanism works because the
   response type ends up being 'opaque' for truly no-cors requests, but
   Apps Script's redirect makes it work with full access in practice.
   
   If you still see CORS errors on POST:
   → Make sure deployment is "Who has access: Anyone" (not "Google account required")
   → Re-deploy as a NEW version after every code change
═══════════════════════════════════════ */
async function loadApps() {
  const url = CONFIG?.backend?.appsScriptUrl;
  if (url) {
    try {
      // Apps Script GET requests go through a redirect; fetchJSON handles it
      const data = await fetchJSON(url + '?action=getApps&_=' + Date.now());
      if (Array.isArray(data) && data.length > 0) {
        return { apps: data, source: 'live' };
      }
      // Backend reachable but no apps yet → still "live" source, just empty
      if (Array.isArray(data)) {
        return { apps: [], source: 'live' };
      }
    } catch(err) {
      console.warn('Backend fetch failed, using fallback.', err.message);
    }
  }

  // Fallback JSON
  try {
    const data = await fetchJSON('./data/apps-fallback.json');
    const apps = Array.isArray(data) ? data.filter(a => a.id && a.name) : [];
    return { apps, source: 'fallback' };
  } catch(_) {
    return { apps: [], source: 'fallback' };
  }
}

async function fetchJSON(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

function showDataBadge(source) {
  const b = $('#dataBadge');
  if (!b) return;
  if (source === 'live') {
    b.textContent = '● Live data';
    b.classList.add('live-src');
    b.classList.remove('fallback-src');
  } else {
    b.textContent = '● Cached data';
    b.classList.add('fallback-src');
    b.classList.remove('live-src');
  }
  $('#heroBadgeText').textContent = ALL_APPS.length
    ? ALL_APPS.length + ' app' + (ALL_APPS.length !== 1 ? 's' : '') + ' available'
    : 'Apps coming soon';
}

/* ═══════════════════════════════════════
   HERO STATS
═══════════════════════════════════════ */
function updateHeroStats() {
  const cats = [...new Set(ALL_APPS.map(a => a.category))].length;
  const live = ALL_APPS.filter(a => a.status === 'live').length;
  countUp($('#statTotal'), ALL_APPS.length);
  countUp($('#statCats'),  cats);
  countUp($('#statLive'),  live);
}

function countUp(el, target, dur=1200) {
  if (!el) return;
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts-start)/dur, 1);
    el.textContent = Math.round((1-Math.pow(1-p,3))*target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════
   FEATURED
═══════════════════════════════════════ */
function renderFeatured() {
  const wrap = $('#featuredWrap');
  if (!wrap) return;

  if (!ALL_APPS.length) {
    wrap.innerHTML = '';
    return;
  }

  const app = ALL_APPS.find(a => a.featured) || ALL_APPS[0];
  if (!app) { wrap.innerHTML = ''; return; }

  const logoHTML = app.logoUrl
    ? `<img src="${app.logoUrl}" alt="${app.name} logo" class="feat-logo" onerror="this.style.display='none'">`
    : `<div class="feat-logo-placeholder" style="background:${iconColor(app.id)}">${catEmoji(app.category)}</div>`;

  const ssHTML = (app.screenshotUrls||[]).length
    ? `<div class="feat-screenshots">${app.screenshotUrls.slice(0,3).map(u=>`<img src="${u}" alt="screenshot" onclick="openLightbox('${u}')">`).join('')}</div>`
    : '';

  wrap.innerHTML = `
  <div class="featured-card reveal">
    <div class="feat-left">
      <div class="feat-badge"><i class="fas fa-star"></i> Featured App</div>
      <h2 class="feat-name">${app.name}</h2>
      <p class="feat-desc">${app.fullDescription || app.shortDescription}</p>
      <div class="chips">${(arrVal(app.tech)).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
      <div class="feat-meta">
        <div class="feat-meta-row"><i class="fas fa-tag"></i><span><strong>Category:</strong> ${app.category}</span></div>
        <div class="feat-meta-row"><i class="fas fa-circle-dot"></i><span><strong>Status:</strong> ${STATUS_LABEL[app.status]||app.status}</span></div>
        ${app.version?`<div class="feat-meta-row"><i class="fas fa-code-branch"></i><span><strong>Version:</strong> ${app.version}</span></div>`:''}
        ${arrVal(app.platform).length?`<div class="feat-meta-row"><i class="fas fa-desktop"></i><span><strong>Platform:</strong> ${arrVal(app.platform).join(', ')}</span></div>`:''}
      </div>
      <div class="feat-actions">
        ${app.liveDemo?`<a href="${app.liveDemo}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Live Demo</a>`:''}
        ${app.downloadUrl?`<a href="${app.downloadUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm"><i class="fas fa-download"></i> Download${app.fileSize?' ('+app.fileSize+')':''}</a>`:''}
        ${app.github?`<a href="${app.github}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i class="fab fa-github"></i> GitHub</a>`:''}
        <button class="btn btn-outline btn-sm" onclick="openModal('${app.id}')"><i class="fas fa-info-circle"></i> Details</button>
      </div>
    </div>
    <div class="feat-visual">
      ${logoHTML}
      ${ssHTML}
    </div>
  </div>`;
  initReveal();
}

/* ═══════════════════════════════════════
   FILTERS
═══════════════════════════════════════ */
function buildFilters() {
  const bar = $('#filterBar');
  if (!bar) return;
  const cats = ['all', ...new Set(ALL_APPS.map(a => a.category))];
  bar.innerHTML = cats.map(c =>
    `<button class="fbtn${c==='all'?' active':''}" data-filter="${c}">${c==='all'?'All':c}</button>`
  ).join('');
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.fbtn');
    if (!btn) return;
    $$('.fbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    const filtered = currentFilter === 'all' ? ALL_APPS : ALL_APPS.filter(a => a.category === currentFilter);
    renderGrid(filtered);
  });
}

/* ═══════════════════════════════════════
   APPS GRID
═══════════════════════════════════════ */
function renderGrid(apps) {
  const grid = $('#appsGrid');
  if (!grid) return;

  if (!apps.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:4rem 1rem;opacity:.6">
      <div style="font-size:3rem;margin-bottom:1rem">📦</div>
      <p style="font-size:1.1rem">No apps yet — check back soon!</p>
    </div>`;
    return;
  }

  grid.innerHTML = apps.map(app => appCardHTML(app)).join('');
  initReveal();
}

function appCardHTML(app) {
  const logoEl = app.logoUrl
    ? `<img src="${app.logoUrl}" alt="${app.name}" onerror="this.parentElement.style.background='${iconColor(app.id)}';this.outerHTML='<span style=\\'font-size:2rem\\'>${catEmoji(app.category)}</span>'">`
    : `<span style="font-size:2rem">${catEmoji(app.category)}</span>`;

  return `
  <div class="app-card reveal" data-id="${app.id}" onclick="openModal('${app.id}')">
    <div class="card-top">
      <div class="card-icon" style="background:${iconColor(app.id)}">${logoEl}</div>
      <div class="card-badges">
        <span class="sbadge ${app.status}">${STATUS_LABEL[app.status]||app.status}</span>
        ${app.featured?'<span class="feat-pip" title="Featured"><i class="fas fa-star"></i></span>':''}
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-name">${app.name}</h3>
      <p class="card-sub">${app.shortDescription}</p>
    </div>
    <div class="card-foot">
      <span class="cbadge">${app.category}</span>
      <div class="card-links" onclick="event.stopPropagation()">
        ${app.liveDemo?`<a href="${app.liveDemo}" target="_blank" rel="noopener" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>`:''}
        ${app.github?`<a href="${app.github}" target="_blank" rel="noopener" title="GitHub"><i class="fab fa-github"></i></a>`:''}
        ${app.downloadUrl?`<a href="${app.downloadUrl}" target="_blank" rel="noopener" title="Download"><i class="fas fa-download"></i></a>`:''}
      </div>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════ */
function renderCategories() {
  const grid = $('#catsGrid');
  if (!grid) return;

  if (!ALL_APPS.length) { grid.innerHTML = ''; return; }

  const map = {};
  ALL_APPS.forEach(a => {
    if (!map[a.category]) map[a.category] = 0;
    map[a.category]++;
  });

  grid.innerHTML = Object.entries(map).map(([cat, count]) => `
    <button class="cat-card reveal" onclick="filterByCategory('${cat}')">
      <span class="cat-icon">${CAT_ICONS[cat]||'📦'}</span>
      <span class="cat-name">${cat}</span>
      <span class="cat-count">${count} app${count!==1?'s':''}</span>
    </button>`).join('');
  initReveal();
}

function filterByCategory(cat) {
  document.querySelector('#apps').scrollIntoView({ behavior:'smooth', block:'start' });
  setTimeout(() => window.scrollBy(0, -80), 50);
  $$('.fbtn').forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
  currentFilter = cat;
  renderGrid(ALL_APPS.filter(a => a.category === cat));
}
window.filterByCategory = filterByCategory;

/* ═══════════════════════════════════════
   APP MODAL
═══════════════════════════════════════ */
function openModal(id) {
  const app = ALL_APPS.find(a => a.id === id);
  if (!app) return;

  const overlay = $('#modalOverlay');
  const body    = $('#modalBody');

  const logoEl = app.logoUrl
    ? `<img src="${app.logoUrl}" alt="${app.name}" class="mb-logo" onerror="this.style.display='none'">`
    : `<div class="mb-logo-ph" style="background:${iconColor(app.id)}">${catEmoji(app.category)}</div>`;

  const videoHTML = buildVideoHTML(app.videoUrl);

  const ssHTML = (app.screenshotUrls||[]).length ? `
    <div class="mb-section">
      <h3><i class="fas fa-images"></i> Screenshots</h3>
      <div class="mb-screenshots">
        ${app.screenshotUrls.map(u=>`<img src="${u}" alt="screenshot" onclick="openLightbox('${u}')" loading="lazy">`).join('')}
      </div>
    </div>` : '';

  body.innerHTML = `
    <div class="mb-header">
      ${logoEl}
      <div class="mb-head-info">
        <h2 id="modalTitle" class="mb-title">${app.name}</h2>
        <div class="mb-badges">
          <span class="sbadge ${app.status}">${STATUS_LABEL[app.status]||app.status}</span>
          <span class="cbadge">${app.category}</span>
        </div>
        <p class="mb-sub">${app.shortDescription}</p>
      </div>
    </div>

    <div class="mb-section">
      <h3><i class="fas fa-align-left"></i> About</h3>
      <p class="mb-desc">${app.fullDescription || app.shortDescription}</p>
    </div>

    <div class="mb-section">
      <h3><i class="fas fa-info-circle"></i> Details</h3>
      <div class="mb-info-grid">
        ${app.version    ? infoRow('Version',   app.version)                        : ''}
        ${app.releaseDate? infoRow('Released',  app.releaseDate)                    : ''}
        ${app.fileSize   ? infoRow('File Size', app.fileSize)                       : ''}
        ${arrVal(app.platform).length ? infoRow('Platform', arrVal(app.platform).join(', ')) : ''}
      </div>
    </div>

    ${arrVal(app.tech).length ? `
    <div class="mb-section">
      <h3><i class="fas fa-microchip"></i> Tech Stack</h3>
      <div class="chips">${arrVal(app.tech).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    </div>` : ''}

    ${videoHTML ? `<div class="mb-section"><h3><i class="fas fa-play-circle"></i> Preview</h3><div class="mb-video">${videoHTML}</div></div>` : ''}

    ${ssHTML}

    <div class="mb-actions">
      ${app.liveDemo    ? `<a href="${app.liveDemo}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
      ${app.downloadUrl ? `<a href="${app.downloadUrl}" target="_blank" rel="noopener" class="btn btn-ghost"><i class="fas fa-download"></i> Download${app.fileSize?' ('+app.fileSize+')':''}</a>` : ''}
      ${app.github      ? `<a href="${app.github}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fab fa-github"></i> GitHub</a>` : ''}
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initModalClose() {
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalOverlay').addEventListener('click', e => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function infoRow(label, value) {
  return `<div class="mb-info-row"><span class="mb-info-label">${label}</span><span class="mb-info-val">${value}</span></div>`;
}

function buildVideoHTML(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `<iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen loading="lazy"></iframe>`;
  if (/\.(mp4|webm|ogg)$/i.test(url)) return `<video src="${url}" controls preload="metadata"></video>`;
  return '';
}

function openLightbox(src) {
  const lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:3000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:2rem';
  lb.innerHTML = `<img src="${src}" style="max-width:100%;max-height:90vh;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.8)">`;
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);
}
window.openLightbox = openLightbox;

/* ═══════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════ */
function initContactForm() {
  const form = $('#contactForm');
  const note = $('#formNote');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = $('#cname').value.trim();
    const email   = $('#cemail').value.trim();
    const subject = $('#csubject').value.trim();
    const message = $('#cmsg').value.trim();

    if (!name || !email || !message) {
      showNote(note, 'Please fill in name, email, and message.', 'err'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNote(note, 'Please enter a valid email address.', 'err'); return;
    }

    const btn = $('#csubmit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    const url = CONFIG?.backend?.appsScriptUrl;

    if (url) {
      try {
        const res = await postJSON(url, { action:'sendMessage', name, email, subject, message });
        if (res.ok) {
          showNote(note, '✓ Message sent! I\'ll get back to you soon.', 'ok');
          form.reset();
        } else {
          showNote(note, res.error || 'Failed to send. Try emailing directly.', 'err');
        }
      } catch(_) {
        showNote(note, 'Network error. Please email directly.', 'err');
      }
    } else {
      await sleep(800);
      showNote(note, '⚠ Backend not configured yet. Please email directly.', 'err');
    }

    btn.disabled = false;
    btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
  });
}

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
function initNavbar() {
  const navbar = $('#navbar');
  const burger = $('#hamburger');
  const drawer = $('#drawer');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    $('#btt').classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    drawer.classList.toggle('open', open);
  });

  $$('.drawer .nl, .drawer a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      drawer.classList.remove('open');
    });
  });
}

function initBackTop() {
  $('#btt').addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior:'smooth', block:'start' });
    setTimeout(() => window.scrollBy(0, -80), 50);
  });
}

/* ═══════════════════════════════════════
   REVEAL OBSERVER
═══════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  $$('.reveal:not(.vis)').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function arrVal(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) return v.split(',').map(s=>s.trim()).filter(Boolean);
  return [];
}

function iconColor(id) {
  const idx = Math.abs(String(id).split('').reduce((a,c) => a+c.charCodeAt(0), 0)) % ICON_COLORS.length;
  return ICON_COLORS[idx];
}

function catEmoji(cat) { return CAT_ICONS[cat] || '📦'; }

function showNote(el, msg, cls) {
  el.textContent = msg;
  el.className = 'form-note ' + cls;
}

async function postJSON(url, data) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Expose globals ── */
window.openModal        = openModal;
window.filterByCategory = filterByCategory;

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', boot);
