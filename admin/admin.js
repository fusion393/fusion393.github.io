/* ═══════════════════════════════════════════
   FUSION ADMIN — admin.js
   By Md. Shamim Al Razi
═══════════════════════════════════════════ */
'use strict';

/* ── State ─────────────────────────────── */
let CONFIG     = {};
let API_URL    = '';
let AUTH_PW    = '';
let ALL_APPS   = [];
let editingId  = null;

// Upload file buffers keyed by type
const FILE_BUFS = { logo: null, screenshot: [], video: null, download: null };

const STATUS_LABEL = { live:'Live', beta:'Beta', wip:'In Progress', planned:'Planned' };
const ICON_COLORS  = [
  'linear-gradient(135deg,#6c63ff,#00d4ff)',
  'linear-gradient(135deg,#ff6b9d,#f9a04b)',
  'linear-gradient(135deg,#00d4ff,#6c63ff)',
  'linear-gradient(135deg,#2ecc71,#00d4ff)',
  'linear-gradient(135deg,#f9a04b,#ff6b9d)',
  'linear-gradient(135deg,#6c63ff,#ff6b9d)',
];
const CAT_ICONS = {
  'Productivity':'⚡','Design Tools':'🎨','Finance':'💳',
  'Utilities':'🔧','Education':'📚','Entertainment':'🎮',
  'Social':'💬','Health':'🏃','Games':'🎮','Other':'📦'
};

const $ = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];

/* ═══════════════════════════════════════
   BOOT
═══════════════════════════════════════ */
async function boot() {
  try {
    CONFIG  = await fetchJSON('../data/config.json');
    API_URL = CONFIG?.backend?.appsScriptUrl || '';
  } catch(_) { CONFIG = {}; }

  initLogin();
  initPasswordToggle();
}

/* ═══════════════════════════════════════
   LOGIN
═══════════════════════════════════════ */
function initLogin() {
  const form = $('#loginForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const pw  = $('#loginPw').value;
    const btn = $('#loginBtn');
    const note = $('#loginNote');

    if (!pw) { note.textContent = 'Please enter a password.'; return; }
    if (!API_URL) {
      // Allow entry with any pw if no backend (dev mode) — warn user
      note.textContent = '⚠ No backend URL configured. Operating in demo mode.';
      AUTH_PW = pw;
      enterAdmin();
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying…';

    try {
      const res = await postJSON(API_URL, { action:'verifyPassword', password: pw });
      if (res.ok) {
        AUTH_PW = pw;
        enterAdmin();
      } else {
        note.textContent = '✕ Incorrect password.';
        $('#loginPw').value = '';
        $('#loginPw').focus();
      }
    } catch(_) {
      note.textContent = 'Could not reach server. Check your backend URL.';
    }

    btn.disabled = false;
    btn.innerHTML = '<span>Unlock</span><i class="fas fa-arrow-right"></i>';
  });
}

function initPasswordToggle() {
  const tog = $('#pwToggle');
  if (!tog) return;
  tog.addEventListener('click', () => {
    const inp = $('#loginPw');
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    tog.innerHTML = isText ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });
}

function enterAdmin() {
  $('#lockscreen').style.display = 'none';
  $('#adminWrap').style.display  = 'flex';
  initAdminPanel();
}

function logout() {
  AUTH_PW = '';
  ALL_APPS = [];
  $('#lockscreen').style.display = 'flex';
  $('#adminWrap').style.display  = 'none';
  $('#loginPw').value = '';
  $('#loginNote').textContent = '';
}

/* ═══════════════════════════════════════
   ADMIN PANEL INIT
═══════════════════════════════════════ */
function initAdminPanel() {
  initSidebar();
  initTabNav();
  initAppForm();
  initAppSearch();
  initDropZones();
  $('#logoutBtn').addEventListener('click', logout);
  loadAdminApps();
}

/* ═══════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════ */
function initSidebar() {
  const sb   = $('#sidebar');
  const main = $('#adminMain');

  function toggleSb() {
    const col = sb.classList.toggle('collapsed');
    main.classList.toggle('expanded', col);
  }

  $('#sbToggle').addEventListener('click', toggleSb);
  $('#topbarSbToggle').addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sb.classList.toggle('open');
    } else {
      toggleSb();
    }
  });

  // Close on outside click (mobile)
  document.addEventListener('click', e => {
    if (window.innerWidth <= 768 && sb.classList.contains('open') &&
        !sb.contains(e.target) && e.target !== $('#topbarSbToggle')) {
      sb.classList.remove('open');
    }
  });
}

/* ═══════════════════════════════════════
   TAB NAV
═══════════════════════════════════════ */
const TAB_TITLES = { apps:'Apps', add:'Add App', upload:'Upload Files' };

function initTabNav() {
  $$('.sb-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(name) {
  $$('.sb-item[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-'+name));
  $('#topbarTitle').textContent = TAB_TITLES[name] || name;

  if (name === 'add' && !editingId) {
    resetAppForm();
    $('#formTitle').textContent = 'Add New App';
    $('#cancelEdit').style.display = 'none';
    $('#submitLabel').textContent = 'Save App';
  }

  // Mobile: close sidebar
  if (window.innerWidth <= 768) $('#sidebar').classList.remove('open');
}

window.switchTab = switchTab;

/* ═══════════════════════════════════════
   LOAD APPS (admin)
═══════════════════════════════════════ */
async function loadAdminApps() {
  const grid = $('#adminAppsGrid');
  grid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading apps…</div>';

  if (!API_URL) {
    try {
      ALL_APPS = await fetchJSON('../data/apps-fallback.json');
    } catch(_) { ALL_APPS = []; }
    renderAdminGrid(ALL_APPS);
    toast('Showing fallback data — no backend configured.', 'info');
    return;
  }

  try {
    const data = await fetchJSON(API_URL + '?action=getApps&_=' + Date.now());
    ALL_APPS = Array.isArray(data) ? data : [];
    renderAdminGrid(ALL_APPS);
  } catch(err) {
    grid.innerHTML = `<div class="loading-state" style="color:var(--a3)"><i class="fas fa-exclamation-circle"></i> Failed to load apps. ${err.message}</div>`;
  }
}

function renderAdminGrid(apps) {
  const grid = $('#adminAppsGrid');
  if (!apps.length) {
    grid.innerHTML = '<div class="loading-state"><i class="fas fa-box-open" style="font-size:2rem"></i> No apps yet. Add your first app!</div>';
    return;
  }
  grid.innerHTML = apps.map(a => adminCardHTML(a)).join('');
}

function adminCardHTML(app) {
  const logoEl = app.logoUrl
    ? `<img src="${app.logoUrl}" alt="" onerror="this.parentElement.innerHTML='${catEmoji(app.category)}';">`
    : catEmoji(app.category);

  return `
  <div class="a-card" data-id="${app.id}">
    <div class="a-card-top">
      <div class="a-card-icon" style="background:${iconColor(app.id)}">${logoEl}</div>
      <div class="a-card-info">
        <div class="a-card-name">${app.name}</div>
        <div class="a-card-cat">${app.category} · v${app.version||'—'}</div>
      </div>
    </div>
    <div class="a-card-badges">
      <span class="sbadge ${app.status}">${STATUS_LABEL[app.status]||app.status}</span>
      ${app.featured?'<span class="feat-badge-sm"><i class="fas fa-star"></i> Featured</span>':''}
    </div>
    <div class="a-card-desc">${app.shortDescription}</div>
    <div class="a-card-actions">
      <button class="btn btn-ghost btn-sm" onclick="startEdit('${app.id}')"><i class="fas fa-pen"></i> Edit</button>
      <button class="btn btn-danger btn-sm" onclick="promptDelete('${app.id}','${escHtml(app.name)}')"><i class="fas fa-trash"></i></button>
    </div>
  </div>`;
}

/* ── Search ─────────────────────────────── */
function initAppSearch() {
  $('#appSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = q ? ALL_APPS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.shortDescription||'').toLowerCase().includes(q) ||
      (a.category||'').toLowerCase().includes(q)
    ) : ALL_APPS;
    renderAdminGrid(filtered);
  });
}

/* ═══════════════════════════════════════
   ADD / EDIT FORM
═══════════════════════════════════════ */
function initAppForm() {
  $('#appForm').addEventListener('submit', handleAppSubmit);
}

function resetAppForm() {
  editingId = null;
  $('#editingId').value = '';
  $('#appForm').reset();
  $('#formMsg').textContent = '';
  $('#formMsg').className = 'form-msg';
}

function startEdit(id) {
  const app = ALL_APPS.find(a => String(a.id) === String(id));
  if (!app) { toast('App not found.', 'err'); return; }

  editingId = id;
  $('#editingId').value = id;

  // Populate form
  setVal('f_name',        app.name);
  setVal('f_short',       app.shortDescription);
  setVal('f_full',        app.fullDescription);
  setVal('f_cat',         app.category);
  setVal('f_status',      app.status);
  setVal('f_version',     app.version);
  setVal('f_date',        app.releaseDate);
  setVal('f_platform',    arrVal(app.platform).join(', '));
  setVal('f_tech',        arrVal(app.tech).join(', '));
  setVal('f_logo',        app.logoUrl);
  setVal('f_demo',        app.liveDemo);
  setVal('f_github',      app.github);
  setVal('f_download',    app.downloadUrl);
  setVal('f_size',        app.fileSize);
  setVal('f_video',       app.videoUrl);
  setVal('f_screenshots', arrVal(app.screenshotUrls).join('\n'));
  $('#f_featured').checked = !!app.featured;

  $('#formTitle').textContent    = 'Edit App — ' + app.name;
  $('#cancelEdit').style.display = '';
  $('#submitLabel').textContent  = 'Update App';
  switchTab('add');
}

function cancelEdit() {
  resetAppForm();
  $('#formTitle').textContent    = 'Add New App';
  $('#cancelEdit').style.display = 'none';
  $('#submitLabel').textContent  = 'Save App';
}
window.cancelEdit = cancelEdit;

async function handleAppSubmit(e) {
  e.preventDefault();
  const msg = $('#formMsg');

  const appData = {
    name:             getVal('f_name'),
    shortDescription: getVal('f_short'),
    fullDescription:  getVal('f_full'),
    category:         getVal('f_cat'),
    status:           getVal('f_status'),
    version:          getVal('f_version'),
    releaseDate:      getVal('f_date'),
    platform:         getVal('f_platform').split(',').map(s=>s.trim()).filter(Boolean),
    tech:             getVal('f_tech').split(',').map(s=>s.trim()).filter(Boolean),
    logoUrl:          getVal('f_logo'),
    liveDemo:         getVal('f_demo'),
    github:           getVal('f_github'),
    downloadUrl:      getVal('f_download'),
    fileSize:         getVal('f_size'),
    videoUrl:         getVal('f_video'),
    screenshotUrls:   getVal('f_screenshots').split('\n').map(s=>s.trim()).filter(Boolean),
    featured:         $('#f_featured').checked,
  };

  if (!appData.name || !appData.shortDescription || !appData.category) {
    setMsg(msg, 'Name, short description, and category are required.', 'err'); return;
  }

  const btn = $('#submitAppBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  if (!API_URL) {
    await sleep(800);
    setMsg(msg, '⚠ No backend configured. Data not saved.', 'err');
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-save"></i> <span id="submitLabel">${editingId?'Update App':'Save App'}</span>`;
    return;
  }

  try {
    const action  = editingId ? 'updateApp' : 'addApp';
    const payload = { action, password: AUTH_PW, app: appData };
    if (editingId) payload.id = editingId;

    const res = await postJSON(API_URL, payload);
    if (res.ok) {
      toast(editingId ? 'App updated!' : 'App added!', 'ok');
      resetAppForm();
      cancelEdit();
      switchTab('apps');
      await loadAdminApps();
    } else {
      setMsg(msg, res.error || 'Failed to save.', 'err');
    }
  } catch(err) {
    setMsg(msg, 'Network error: ' + err.message, 'err');
  }

  btn.disabled = false;
  btn.innerHTML = `<i class="fas fa-save"></i> <span id="submitLabel">${editingId?'Update App':'Save App'}</span>`;
}

/* ═══════════════════════════════════════
   DELETE
═══════════════════════════════════════ */
let _pendingDeleteId = null;

function promptDelete(id, name) {
  _pendingDeleteId = id;
  $('#deleteMsg').textContent = `Are you sure you want to delete "${name}"? This cannot be undone.`;
  $('#deleteOverlay').classList.add('open');
}

function closeDeleteModal() {
  _pendingDeleteId = null;
  $('#deleteOverlay').classList.remove('open');
}

$('#confirmDeleteBtn').addEventListener('click', async () => {
  if (!_pendingDeleteId) return;
  const id  = _pendingDeleteId;
  const btn = $('#confirmDeleteBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  if (!API_URL) {
    toast('No backend — delete skipped.', 'info');
    closeDeleteModal();
    btn.disabled = false;
    btn.innerHTML = 'Delete';
    return;
  }

  try {
    const res = await postJSON(API_URL, { action:'deleteApp', password: AUTH_PW, id });
    if (res.ok) {
      toast('App deleted.', 'ok');
      closeDeleteModal();
      await loadAdminApps();
    } else {
      toast(res.error || 'Delete failed.', 'err');
    }
  } catch(err) {
    toast('Network error: ' + err.message, 'err');
  }

  btn.disabled = false;
  btn.innerHTML = 'Delete';
});

window.promptDelete    = promptDelete;
window.closeDeleteModal = closeDeleteModal;
window.startEdit       = startEdit;

/* ═══════════════════════════════════════
   UPLOAD FILES
═══════════════════════════════════════ */
function initDropZones() {
  const zones = {
    'dz-logo':  { type:'logo',       multi:false, prev:'prev-logo' },
    'dz-ss':    { type:'screenshot', multi:true,  prev:'prev-ss'   },
    'dz-video': { type:'video',      multi:false, prev:'prev-video'},
    'dz-dl':    { type:'download',   multi:false, prev:'prev-dl'   },
  };

  Object.entries(zones).forEach(([id, cfg]) => {
    const zone  = $('#'+id);
    const input = zone.querySelector('.dz-input');

    // Click opens file picker
    zone.addEventListener('click', e => { if (e.target !== input) input.click(); });

    // Drag & drop
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files, cfg);
    });

    input.addEventListener('change', () => handleFiles(input.files, cfg));
  });
}

function handleFiles(files, cfg) {
  if (!files || !files.length) return;
  const arr = [...files];

  if (cfg.multi) {
    FILE_BUFS[cfg.type] = arr;
  } else {
    FILE_BUFS[cfg.type] = arr[0];
  }

  const prev = $('#'+cfg.prev);
  prev.innerHTML = '';

  arr.forEach(f => {
    if (f.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(f);
      prev.appendChild(img);
    } else if (f.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.src = URL.createObjectURL(f);
      v.controls = true;
      prev.appendChild(v);
    } else {
      const chip = document.createElement('div');
      chip.className = 'file-chip';
      chip.innerHTML = `<i class="fas fa-file"></i> ${f.name} (${fmtSize(f.size)})`;
      prev.appendChild(chip);
    }
  });
}

async function uploadFile(type) {
  const resEl = $({logo:'#res-logo',screenshot:'#res-ss',video:'#res-video',download:'#res-dl'}[type]);
  const files = FILE_BUFS[type];
  if (!files || (Array.isArray(files) && !files.length)) {
    resEl.textContent = 'Please select a file first.';
    resEl.className = 'upload-result err';
    return;
  }
  if (!API_URL) {
    resEl.innerHTML = '<span class="err">No backend URL configured in data/config.json.</span>';
    return;
  }

  const fileArr = Array.isArray(files) ? files : [files];
  const urls    = [];

  for (let i = 0; i < fileArr.length; i++) {
    const f = fileArr[i];
    resEl.innerHTML = renderProgress(Math.round((i/fileArr.length)*40), `Reading ${f.name}…`);

    let b64;
    try {
      b64 = await fileToBase64(f);
      resEl.innerHTML = renderProgress(Math.round((i/fileArr.length)*80 + 20), `Uploading ${f.name}…`);
    } catch(_) {
      resEl.innerHTML = '<span class="err">Failed to read file.</span>';
      return;
    }

    try {
      const res = await postJSON(API_URL, {
        action:   'uploadFile',
        password: AUTH_PW,
        fileType: type,
        fileName: f.name,
        mimeType: f.type,
        base64Data: b64,
      });
      if (res.ok) {
        urls.push(res.url);
      } else {
        resEl.innerHTML = `<span class="err">Upload failed: ${res.error}</span>`;
        return;
      }
    } catch(err) {
      resEl.innerHTML = `<span class="err">Network error: ${err.message}</span>`;
      return;
    }
  }

  // Show results
  resEl.className = 'upload-result ok';
  resEl.innerHTML = `<div style="margin-bottom:.5rem;color:#2ecc71"><i class="fas fa-check-circle"></i> Uploaded ${urls.length} file${urls.length>1?'s':''}!</div>` +
    urls.map(u => `
      <div class="url-copy">
        <code>${u}</code>
        <span class="copy-btn" onclick="copyUrl('${u}',this)" title="Copy URL"><i class="fas fa-copy"></i></span>
      </div>`).join('');

  toast('File uploaded successfully!', 'ok');
}

function renderProgress(pct, label) {
  return `<div style="display:flex;flex-direction:column;gap:.4rem">
    <span style="font-size:.8rem;color:var(--t2)">${label}</span>
    <div class="prog-wrap"><div class="prog-bar" style="width:${pct}%"></div></div>
  </div>`;
}

function copyUrl(url, btn) {
  navigator.clipboard.writeText(url).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
    toast('URL copied to clipboard!', 'ok');
  });
}

window.uploadFile = uploadFile;
window.copyUrl    = copyUrl;

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
function toast(msg, type='info') {
  const container = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  const icons = { ok:'fa-check-circle', err:'fa-exclamation-circle', info:'fa-info-circle' };
  el.innerHTML = `<i class="fas ${icons[type]||'fa-info-circle'}"></i><span>${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  container.appendChild(el);
  setTimeout(() => { if (el.parentElement) el.remove(); }, 4000);
}

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function getVal(id)       { return ($('#'+id)?.value || '').trim(); }
function setVal(id, val)  { const el = $('#'+id); if (el) el.value = val || ''; }
function setMsg(el, msg, cls) { el.textContent = msg; el.className = 'form-msg '+cls; }
function escHtml(s)       { return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function arrVal(v)        { if (Array.isArray(v)) return v; if (typeof v==='string'&&v) return v.split(',').map(s=>s.trim()).filter(Boolean); return []; }
function iconColor(id)    { const idx=Math.abs(String(id).split('').reduce((a,c)=>a+c.charCodeAt(0),0))%ICON_COLORS.length; return ICON_COLORS[idx]; }
function catEmoji(cat)    { return CAT_ICONS[cat]||'📦'; }
function sleep(ms)        { return new Promise(r=>setTimeout(r,ms)); }
function fmtSize(bytes)   { if (bytes < 1024) return bytes+'B'; if (bytes < 1048576) return (bytes/1024).toFixed(1)+'KB'; return (bytes/1048576).toFixed(1)+'MB'; }

async function fetchJSON(url) {
  const r = await fetch(url, { cache:'no-cache' });
  if (!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

async function postJSON(url, data) {
  const r = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  });
  return r.json();
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result.split(',')[1]);
    reader.onerror = () => rej(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/* ── Boot ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', boot);
