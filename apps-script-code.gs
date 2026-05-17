// ═══════════════════════════════════════════════════════════════
//  FUSION — Google Apps Script Backend
//  By Md. Shamim Al Razi
//
//  SETUP:
//  1. script.google.com → New project → paste this file
//  2. Fill SHEET_ID, DRIVE_FOLDER_ID, CONTACT_EMAIL below
//  3. Run initSetup() once from the editor (authorize when prompted)
//  4. Deploy → New deployment → Web App
//       Execute as: Me  |  Who has access: Anyone
//  5. Copy the Web App URL → data/config.json → backend.appsScriptUrl
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ─────────────────────────────────────────────────────
const SHEET_ID        = 'YOUR_GOOGLE_SHEET_ID_HERE';        // ← replace
const DRIVE_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE'; // ← replace
const CONTACT_EMAIL   = 'your@email.com';                   // ← replace

const SHEET_NAME   = 'Apps';
const PASSWORD_KEY = 'FUSION_ADMIN_PASSWORD';


// ── ENTRY POINTS ───────────────────────────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  let result;
  try {
    switch (action) {
      case 'getApps': result = getApps();              break;
      case 'getApp':  result = getApp(e.parameter.id); break;
      case 'ping':    result = { ok: true, ts: Date.now(), author: 'Md. Shamim Al Razi' }; break;
      default:        result = { error: 'Unknown GET action: ' + action };
    }
  } catch (err) {
    result = { error: err.message };
  }
  return buildResponse(result);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_) {
    return buildResponse({ error: 'Invalid JSON body', ok: false });
  }

  const action = body.action || '';
  const protectedActions = ['addApp', 'updateApp', 'deleteApp', 'uploadFile'];

  if (protectedActions.includes(action)) {
    if (!verifyPassword_(body.password)) {
      return buildResponse({ error: 'Unauthorized — incorrect password', ok: false });
    }
  }

  let result;
  try {
    switch (action) {
      case 'verifyPassword': result = { ok: verifyPassword_(body.password) }; break;
      case 'addApp':         result = addApp(body.app);                        break;
      case 'updateApp':      result = updateApp(body.id, body.app);            break;
      case 'deleteApp':      result = deleteApp(body.id);                      break;
      case 'uploadFile':     result = uploadFile(body);                        break;
      case 'sendMessage':    result = sendMessage(body);                       break;
      default:               result = { error: 'Unknown POST action: ' + action };
    }
  } catch (err) {
    result = { error: err.message, ok: false };
  }
  return buildResponse(result);
}


// ── AUTH ───────────────────────────────────────────────────────
function verifyPassword_(pw) {
  if (!pw) return false;
  const stored = PropertiesService.getScriptProperties().getProperty(PASSWORD_KEY);
  if (!stored) {
    Logger.log('No password set. Run initSetup() first.');
    return false;
  }
  return pw === stored;
}

/** Run once from editor to set your password. Change the value first. */
function setAdminPassword() {
  const newPassword = 'your_secure_password_here'; // ← change this
  PropertiesService.getScriptProperties().setProperty(PASSWORD_KEY, newPassword);
  Logger.log('Password set successfully.');
}


// ── INIT ───────────────────────────────────────────────────────
/** Run ONCE from the editor after filling in SHEET_ID above. */
function initSetup() {
  setAdminPassword();

  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = [
    'id','name','shortDescription','fullDescription',
    'category','status','version','releaseDate',
    'platform','tech','logoUrl','screenshotUrls',
    'videoUrl','liveDemo','github','downloadUrl',
    'fileSize','featured','createdAt','updatedAt'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight('bold')
         .setBackground('#3d3a6e')
         .setFontColor('#ffffff');
    Logger.log('Sheet headers created.');
  } else {
    Logger.log('Sheet already has rows — headers not overwritten.');
  }
  Logger.log('Fusion backend ready. Now deploy as Web App.');
}


// ── GET APPS ───────────────────────────────────────────────────
function getApps() {
  const sheet = getSheet_();
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // header only
  const headers = data[0];
  return data.slice(1)
    .map(row => rowToObj_(headers, row))
    .filter(a => a.id && a.name);
}

function getApp(id) {
  if (!id) return { error: 'id parameter required' };
  return getApps().find(a => a.id === id) || { error: 'App not found: ' + id };
}


// ── ADD APP ────────────────────────────────────────────────────
function addApp(app) {
  if (!app)      return { error: 'No app data received', ok: false };
  if (!app.name) return { error: 'App name is required', ok: false };

  const sheet   = getSheet_();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const now     = new Date().toISOString();

  app.id        = 'app_' + Date.now();
  app.createdAt = now;
  app.updatedAt = now;

  if (Array.isArray(app.platform))       app.platform       = app.platform.join(',');
  if (Array.isArray(app.tech))           app.tech           = app.tech.join(',');
  if (Array.isArray(app.screenshotUrls)) app.screenshotUrls = app.screenshotUrls.join(',');
  app.featured = app.featured ? 'TRUE' : 'FALSE';

  sheet.appendRow(headers.map(h => (app[h] != null) ? app[h] : ''));
  return { ok: true, id: app.id, message: 'App "' + app.name + '" added.' };
}


// ── UPDATE APP ─────────────────────────────────────────────────
function updateApp(id, updates) {
  if (!id)      return { error: 'id is required', ok: false };
  if (!updates) return { error: 'No update data', ok: false };

  const sheet   = getSheet_();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol   = headers.indexOf('id');

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(id)) {
      updates.updatedAt = new Date().toISOString();
      if (Array.isArray(updates.platform))       updates.platform       = updates.platform.join(',');
      if (Array.isArray(updates.tech))           updates.tech           = updates.tech.join(',');
      if (Array.isArray(updates.screenshotUrls)) updates.screenshotUrls = updates.screenshotUrls.join(',');
      if (updates.featured !== undefined)        updates.featured       = updates.featured ? 'TRUE' : 'FALSE';

      headers.forEach((h, c) => {
        if (updates[h] !== undefined) sheet.getRange(r + 1, c + 1).setValue(updates[h]);
      });
      return { ok: true, id, message: 'App updated.' };
    }
  }
  return { error: 'App not found: ' + id, ok: false };
}


// ── DELETE APP ─────────────────────────────────────────────────
function deleteApp(id) {
  if (!id) return { error: 'id is required', ok: false };

  const sheet   = getSheet_();
  const data    = sheet.getDataRange().getValues();
  const idCol   = data[0].indexOf('id');

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(id)) {
      sheet.deleteRow(r + 1);
      return { ok: true, id, message: 'App deleted.' };
    }
  }
  return { error: 'App not found: ' + id, ok: false };
}


// ── UPLOAD FILE ────────────────────────────────────────────────
/**
 * Uploads a base64-encoded file to Google Drive.
 *
 * Body fields:
 *   password   {string}  Admin password
 *   fileName   {string}  e.g. 'icon.png'
 *   mimeType   {string}  e.g. 'image/png'
 *   base64Data {string}  Base64 string — NO 'data:...' prefix
 *   fileType   {string}  'logo'|'screenshot'|'video'|'download'
 *
 * ⚠ Apps Script payload limit ≈ 50 MB. For larger files use Drive directly.
 *
 * Returns: { ok, url, fileId, fileName }
 */
function uploadFile(body) {
  if (!body.base64Data) return { error: 'base64Data is required', ok: false };
  if (!body.fileName)   return { error: 'fileName is required', ok: false };

  const safeName = body.fileName.replace(/[^a-zA-Z0-9._\-]/g, '_');
  const mime     = body.mimeType || detectMime_(safeName);

  let bytes;
  try {
    bytes = Utilities.base64Decode(body.base64Data);
  } catch (err) {
    return { error: 'base64 decode failed: ' + err.message, ok: false };
  }

  let folder;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (err) {
    return { error: 'Cannot open Drive folder (check DRIVE_FOLDER_ID): ' + err.message, ok: false };
  }

  const file   = folder.createFile(Utilities.newBlob(bytes, mime, safeName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();

  // Thumbnail URL works better than uc?export=view for images in <img> tags
  const isImage = mime.startsWith('image/');
  const url = isImage
    ? 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800'
    : 'https://drive.google.com/uc?export=view&id=' + fileId;

  return { ok: true, url, fileId, fileName: safeName, message: 'Uploaded: ' + safeName };
}

function detectMime_(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return ({
    png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg',
    webp:'image/webp', gif:'image/gif', svg:'image/svg+xml',
    mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime',
    pdf:'application/pdf', apk:'application/vnd.android.package-archive',
    zip:'application/zip', rar:'application/x-rar-compressed',
  })[ext] || 'application/octet-stream';
}


// ── SEND MESSAGE ───────────────────────────────────────────────
function sendMessage(body) {
  const { name, email, subject, message } = body;
  if (!name)    return { error: 'name is required', ok: false };
  if (!email)   return { error: 'email is required', ok: false };
  if (!message) return { error: 'message is required', ok: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Invalid email', ok: false };

  const subj = (subject || 'New contact from Fusion Portfolio').substring(0, 200);
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#6c63ff;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0">📬 New Message — Fusion Portfolio</h2>
      </div>
      <div style="background:#f8f8ff;padding:24px;border-radius:0 0 12px 12px">
        <table style="font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 16px 8px 0;color:#666;font-weight:600">From</td><td>${esc_(name)}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;color:#666;font-weight:600">Email</td><td><a href="mailto:${esc_(email)}">${esc_(email)}</a></td></tr>
          <tr><td style="padding:8px 16px 8px 0;color:#666;font-weight:600">Subject</td><td>${esc_(subj)}</td></tr>
        </table>
        <hr style="margin:16px 0;border:none;border-top:1px solid #ddd"/>
        <div style="font-size:15px;line-height:1.7;white-space:pre-wrap">${esc_(message)}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #ddd"/>
        <p style="font-size:12px;color:#aaa;margin:0">Sent via fusion393.github.io · Fusion by Md. Shamim Al Razi</p>
      </div>
    </div>`;

  try {
    MailApp.sendEmail({ to: CONTACT_EMAIL, replyTo: email, name: 'Fusion Portfolio',
                        subject: '[Fusion] ' + subj, htmlBody: html });
    return { ok: true, message: 'Message sent.' };
  } catch (err) {
    return { error: 'Email send failed: ' + err.message, ok: false };
  }
}


// ── HELPERS ────────────────────────────────────────────────────
function getSheet_() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet tab "' + SHEET_NAME + '" not found — run initSetup()');
    return sheet;
  } catch (err) {
    throw new Error('Cannot open Sheet (check SHEET_ID): ' + err.message);
  }
}

function rowToObj_(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });

  // Deserialize comma-separated arrays
  ['platform', 'tech', 'screenshotUrls'].forEach(key => {
    const v = obj[key];
    obj[key] = (typeof v === 'string' && v.trim())
      ? v.split(',').map(s => s.trim()).filter(Boolean)
      : [];
  });

  // Boolean
  obj.featured = obj.featured === true || String(obj.featured).toUpperCase() === 'TRUE';

  // Date object → string
  if (obj.releaseDate instanceof Date) {
    obj.releaseDate = Utilities.formatDate(obj.releaseDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return obj;
}

function esc_(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
