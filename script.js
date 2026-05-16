/* ═══════════════════════════════════════════
   FUSION — SCRIPT.JS
   By Md. Shamim Al Razi
═══════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────
   DATA — Edit this array to add / update apps
─────────────────────────────────────────────── */
const APPS = [
  {
    id: 1,
    name: "NoteFlow",
    description: "A minimalist markdown-powered note-taking app with real-time preview, cloud sync, and tagging. Designed for focus and speed.",
    category: "Productivity",
    status: "live",
    tech: ["React", "Firebase", "Markdown"],
    icon: "📝",
    iconBg: "linear-gradient(135deg, #6c63ff, #00d4ff)",
    featured: true,
    demo: "https://fusion393.github.io/noteflow",
    github: "https://github.com/fusion393/noteflow",
  },
  {
    id: 2,
    name: "PaletteAI",
    description: "Generate stunning color palettes from a single prompt using AI. Export to CSS, Tailwind, or Figma tokens instantly.",
    category: "Design Tools",
    status: "live",
    tech: ["Next.js", "OpenAI API", "CSS"],
    icon: "🎨",
    iconBg: "linear-gradient(135deg, #ff6b9d, #f9a04b)",
    featured: false,
    demo: "https://fusion393.github.io/paletteai",
    github: "https://github.com/fusion393/paletteai",
  },
  {
    id: 3,
    name: "DevDash",
    description: "A personal developer dashboard that aggregates GitHub activity, Hacker News feeds, and to-dos into one clean interface.",
    category: "Productivity",
    status: "beta",
    tech: ["Vue.js", "GitHub API", "HN API"],
    icon: "🖥️",
    iconBg: "linear-gradient(135deg, #00d4ff, #6c63ff)",
    featured: false,
    demo: "https://fusion393.github.io/devdash",
    github: "https://github.com/fusion393/devdash",
  },
  {
    id: 4,
    name: "Spendwise",
    description: "A lightweight expense tracker with category breakdowns, monthly reports, and CSV export. No account required.",
    category: "Finance",
    status: "live",
    tech: ["Vanilla JS", "Chart.js", "LocalStorage"],
    icon: "💰",
    iconBg: "linear-gradient(135deg, #2ecc71, #00d4ff)",
    featured: false,
    demo: "https://fusion393.github.io/spendwise",
    github: "https://github.com/fusion393/spendwise",
  },
  {
    id: 5,
    name: "SnapLink",
    description: "Instantly shorten, track, and organize URLs with a clean interface. Includes click analytics and custom slugs.",
    category: "Utilities",
    status: "wip",
    tech: ["Node.js", "Express", "MongoDB"],
    icon: "🔗",
    iconBg: "linear-gradient(135deg, #f9a04b, #ff6b9d)",
    featured: false,
    demo: "",
    github: "https://github.com/fusion393/snaplink",
  },
  {
    id: 6,
    name: "StudyPulse",
    description: "A Pomodoro-based study timer with session logging, custom intervals, ambient sounds, and weekly progress tracking.",
    category: "Productivity",
    status: "live",
    tech: ["React", "Tailwind", "Web Audio API"],
    icon: "⏱️",
    iconBg: "linear-gradient(135deg, #6c63ff, #ff6b9d)",
    featured: false,
    demo: "https://fusion393.github.io/studypulse",
    github: "https://github.com/fusion393/studypulse",
  },
  {
    id: 7,
    name: "WeatherLens",
    description: "A beautifully designed weather app with animated conditions, 7-day forecast, UV index, and air quality data.",
    category: "Utilities",
    status: "live",
    tech: ["JavaScript", "OpenWeather API", "CSS Animations"],
    icon: "🌤️",
    iconBg: "linear-gradient(135deg, #00d4ff, #2ecc71)",
    featured: false,
    demo: "https://fusion393.github.io/weatherlens",
    github: "https://github.com/fusion393/weatherlens",
  },
  {
    id: 8,
    name: "TypeForge",
    description: "A typing speed test and trainer with 50+ word sets, adaptive difficulty, WPM analytics, and leaderboard support.",
    category: "Education",
    status: "beta",
    tech: ["HTML", "CSS", "Vanilla JS"],
    icon: "⌨️",
    iconBg: "linear-gradient(135deg, #f9a04b, #6c63ff)",
    featured: false,
    demo: "https://fusion393.github.io/typeforge",
    github: "https://github.com/fusion393/typeforge",
  },
  {
    id: 9,
    name: "GridGallery",
    description: "A drag-and-drop photo gallery builder. Upload, arrange, and export a responsive HTML gallery in seconds.",
    category: "Design Tools",
    status: "planned",
    tech: ["React", "DnD Kit", "Canvas API"],
    icon: "🖼️",
    iconBg: "linear-gradient(135deg, #ff6b9d, #00d4ff)",
    featured: false,
    demo: "",
    github: "https://github.com/fusion393/gridgallery",
  },
];

/* ────────────────────────────────────────────
   ROADMAP DATA
─────────────────────────────────────────────── */
const ROADMAP = [
  {
    title: "Launch Fusion Platform",
    desc: "Set up GitHub Pages site, establish the portfolio structure, and publish the first 3 apps publicly.",
    quarter: "Q1 2025",
    status: "done",
  },
  {
    title: "NoteFlow v2.0 — Offline Support",
    desc: "Add service workers, offline sync, and PWA installability to NoteFlow for fully offline use.",
    quarter: "Q2 2025",
    status: "done",
  },
  {
    title: "PaletteAI — Figma Plugin",
    desc: "Build a companion Figma plugin for PaletteAI so designers can inject palettes directly into their designs.",
    quarter: "Q3 2025",
    status: "doing",
  },
  {
    title: "Fusion CLI Tool",
    desc: "A command-line scaffolding tool to bootstrap new Fusion projects with opinionated defaults and templates.",
    quarter: "Q4 2025",
    status: "doing",
  },
  {
    title: "GridGallery v1 Launch",
    desc: "Complete the drag-and-drop gallery builder with export options (HTML, ZIP) and social share.",
    quarter: "Q1 2026",
    status: "todo",
  },
  {
    title: "SnapLink Analytics Dashboard",
    desc: "Upgrade SnapLink with a rich analytics dashboard including geo data, referrer tracking, and graphs.",
    quarter: "Q2 2026",
    status: "todo",
  },
  {
    title: "Fusion Mobile App",
    desc: "Bring the top Fusion tools to mobile as a React Native app, starting with NoteFlow and StudyPulse.",
    quarter: "Q3 2026",
    status: "todo",
  },
];

/* ════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const STATUS_LABEL = {
  live:    "Live",
  beta:    "Beta",
  wip:     "In Progress",
  planned: "Planned",
};

/* ════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.matches('a, button, .app-card, .filter-btn')) {
      ring.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches('a, button, .app-card, .filter-btn')) {
      ring.classList.remove('hovered');
    }
  });
}

/* ════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const drawer    = $('#navDrawer');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    $('#backTop').classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Mobile menu
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    drawer.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on link click
  $$('.nav-drawer .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        $$(`[href="#${e.target.id}"]`).forEach(l => l.classList.add('active'));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════ */
function initBackTop() {
  $('#backTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════
   HERO STATS COUNTER
═══════════════════════════════════════════ */
function countUp(el, target, duration = 1500) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initHeroStats() {
  const totalApps = APPS.length;
  const categories = [...new Set(APPS.map(a => a.category))].length;
  const inProgress = APPS.filter(a => a.status === 'wip' || a.status === 'planned').length;

  const nums = $$('.stat-num');
  const targets = [totalApps, categories, inProgress];

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      nums.forEach((el, i) => countUp(el, targets[i]));
      obs.disconnect();
    }
  }, { threshold: 0.5 });

  const hero = $('.hero-stats');
  if (hero) obs.observe(hero);
}

/* ════════════════════════════════════════════
   FEATURED APP
═══════════════════════════════════════════ */
function renderFeatured() {
  const app = APPS.find(a => a.featured) || APPS[0];
  const el  = $('#featuredCard');
  if (!el) return;

  el.innerHTML = `
    <div class="featured-left">
      <div class="featured-badge">
        <i class="fas fa-star"></i> Featured App
      </div>
      <h2 class="featured-name">${app.name}</h2>
      <p class="featured-desc">${app.description}</p>

      <div class="tech-chips">
        ${app.tech.map(t => `<span class="tech-chip">${t}</span>`).join('')}
      </div>

      <div class="featured-meta">
        <div class="featured-meta-row">
          <i class="fas fa-tag"></i>
          <span><strong>Category:</strong> ${app.category}</span>
        </div>
        <div class="featured-meta-row">
          <i class="fas fa-circle-dot"></i>
          <span><strong>Status:</strong> ${STATUS_LABEL[app.status]}</span>
        </div>
      </div>

      <div class="featured-actions">
        ${app.demo
          ? `<a href="${app.demo}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
               <i class="fas fa-external-link-alt"></i> Live Demo
             </a>`
          : `<span class="btn btn-ghost btn-sm" style="opacity:.5;cursor:not-allowed">Demo Soon</span>`
        }
        <a href="${app.github}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
          <i class="fab fa-github"></i> GitHub
        </a>
      </div>
    </div>

    <div class="featured-visual">
      <div class="featured-icon-wrap" style="background:${app.iconBg}">
        ${app.icon}
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════
   APP CARDS
═══════════════════════════════════════════ */
function buildCard(app, delay = 0) {
  const demoBtn = app.demo
    ? `<a href="${app.demo}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
         <i class="fas fa-external-link-alt"></i> Demo
       </a>`
    : `<span class="btn btn-ghost btn-sm" style="opacity:.45;cursor:not-allowed;pointer-events:none">
         <i class="fas fa-clock"></i> Soon
       </span>`;

  return `
    <article class="app-card reveal" data-category="${app.category}" style="animation-delay:${delay}ms">
      <div class="card-top">
        <div class="card-icon" style="background:${app.iconBg}">${app.icon}</div>
        <div class="card-badges">
          <span class="status-badge ${app.status}">${STATUS_LABEL[app.status]}</span>
          <span class="cat-badge">${app.category}</span>
        </div>
      </div>
      <h3 class="card-name">${app.name}</h3>
      <p class="card-desc">${app.description}</p>
      <div class="card-tech">
        <div class="tech-chips">
          ${app.tech.map(t => `<span class="tech-chip">${t}</span>`).join('')}
        </div>
      </div>
      <div class="card-actions">
        ${demoBtn}
        <a href="${app.github}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
          <i class="fab fa-github"></i> GitHub
        </a>
      </div>
    </article>
  `;
}

function renderApps(filtered = APPS) {
  const grid = $('#appsGrid');
  if (!grid) return;
  grid.innerHTML = filtered.map((a, i) => buildCard(a, i * 60)).join('');
  initRevealObserver();
}

/* ════════════════════════════════════════════
   FILTER BAR
═══════════════════════════════════════════ */
function initFilters() {
  const bar = $('#filterBar');
  if (!bar) return;

  const cats = ['all', ...new Set(APPS.map(a => a.category))];
  bar.innerHTML = cats.map(c =>
    `<button class="filter-btn${c === 'all' ? ' active' : ''}" data-filter="${c}">
      ${c === 'all' ? 'All' : c}
     </button>`
  ).join('');

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    renderApps(f === 'all' ? APPS : APPS.filter(a => a.category === f));
  });
}

/* ════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════ */
const CAT_ICONS = {
  "Productivity":  "⚡",
  "Design Tools":  "🎨",
  "Finance":       "💳",
  "Utilities":     "🔧",
  "Education":     "📚",
  "Entertainment": "🎮",
};

function renderCategories() {
  const grid = $('#categoriesGrid');
  if (!grid) return;

  const catMap = {};
  APPS.forEach(a => {
    catMap[a.category] = (catMap[a.category] || 0) + 1;
  });

  grid.innerHTML = Object.entries(catMap).map(([name, count]) => `
    <div class="cat-card reveal">
      <span class="cat-card-icon">${CAT_ICONS[name] || '📦'}</span>
      <div class="cat-card-name">${name}</div>
      <div class="cat-card-count">${count} app${count > 1 ? 's' : ''}</div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════
   ROADMAP
═══════════════════════════════════════════ */
const STATUS_ICON = {
  done:  '<i class="fas fa-check-circle"></i> Shipped',
  doing: '<i class="fas fa-spinner fa-spin"></i> In Progress',
  todo:  '<i class="far fa-circle"></i> Planned',
};

function renderRoadmap() {
  const track = $('#roadmapTrack');
  if (!track) return;

  track.innerHTML = ROADMAP.map(item => `
    <div class="roadmap-item ${item.status} reveal">
      <div class="roadmap-top">
        <h3 class="roadmap-title">${item.title}</h3>
        <span class="roadmap-quarter">${item.quarter}</span>
      </div>
      <p class="roadmap-desc">${item.desc}</p>
      <div class="roadmap-status ${item.status}">${STATUS_ICON[item.status]}</div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════
   REVEAL OBSERVER
═══════════════════════════════════════════ */
function initRevealObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.reveal').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════ */
function initContactForm() {
  const form = $('#contactForm');
  const note = $('#formNote');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = $('#fname').value.trim();
    const email = $('#femail').value.trim();
    const msg   = $('#fmsg').value.trim();

    if (!name || !email || !msg) {
      note.textContent = 'Please fill in all fields.';
      note.className = 'form-note error';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = 'Please enter a valid email.';
      note.className = 'form-note error';
      return;
    }

    // Simulate send (replace with actual endpoint / EmailJS / formspree)
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    setTimeout(() => {
      note.textContent = '✓ Message sent! I\'ll get back to you soon.';
      note.className = 'form-note success';
      form.reset();
      btn.disabled = false;
      btn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
    }, 1400);
  });
}

/* ════════════════════════════════════════════
   FOOTER YEAR
═══════════════════════════════════════════ */
function setYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
═══════════════════════════════════════════ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════════
   PARALLAX ORBS (subtle)
═══════════════════════════════════════════ */
function initParallax() {
  const orbs = $$('.bg-orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.04 + i * 0.02;
      orb.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
}

/* ════════════════════════════════════════════
   CARD TILT (desktop only)
═══════════════════════════════════════════ */
function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('mousemove', e => {
    $$('.app-card:hover').forEach(card => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-5px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
  });
  document.addEventListener('mouseleave', () => {
    $$('.app-card').forEach(c => {
      c.style.transform = '';
    });
  }, true);
}

/* ════════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavbar();
  initBackTop();
  initSmoothScroll();
  initHeroStats();
  renderFeatured();
  initFilters();
  renderApps();
  renderCategories();
  renderRoadmap();
  initRevealObserver();
  initContactForm();
  initParallax();
  initTilt();
  setYear();

  // Add reveal class to static sections
  $$('.about-left, .about-right, .section-header').forEach(el => {
    el.classList.add('reveal');
  });
  initRevealObserver();
});
