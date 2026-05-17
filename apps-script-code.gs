// ═══════════════════════════════════════════════════════════════
//  FUSION — Google Apps Script Backend
//  apps-script-code.gs
//  By Md. Shamim Al Razi
//
//  SETUP:
//  1. Open https://script.google.com and create a new project.
//  2. Paste this entire file.
//  3. Set SHEET_ID and DRIVE_FOLDER_ID below (or use PropertiesService).
//  4. Run initSetup() once to create the sheet headers and set password.
//  5. Deploy → New deployment → Web App → Execute as: Me, Who has access: Anyone
//  6. Copy the web app URL into data/config.json → backend.appsScriptUrl
// ═══════════════════════════════════════════════════════════════

// ── CONFIG ─────────────────────────────────────────────────────
// Replace with your Google Sheet ID (from the Sheet URL)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

// Replace with your Google Drive folder ID (create a folder, share publicly, copy ID from URL)
const DRIVE_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';

// Sheet tab name
const SHEET_NAME = 'Apps';

// Admin password key in PropertiesService (set via initSetup or setAdminPassword)
const PASSWORD_KEY = 'FUSION_ADMIN_PASSWORD';

// Contact email — where messages are sent
const CONTACT_EMAIL = 'your@email.com';

// CORS origin — set to your GitHub Pages URL for production
const ALLOWED_ORIGIN = '*';


// ── ENTRY POINT ────────────────────────────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  let result;

  try {
    switch (action) {
      case 'getApps':     result = getApps();              break;
      case 'getApp':      result = getApp(e.parameter.id); break;
      case 'ping':        result = { ok: true, ts: Date.now() }; break;
      default:            result = { error: 'Unknown action' };
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
    return buildResponse({ error: 'Invalid JSON body' });
  }

  const action = body.action || '';
  let result;

  // All mutating actions require admin password
  const adminActions = ['addApp', 'updateApp', 'deleteApp', 'uploadFile', 'sendMessage', 'verifyPassword'];

  if (adminActions.includes(action) && action !== 'sendMessage' && action !== 'verifyPassword') {
    if (!verifyPassword_(body.password)) {
      return buildResponse({ error: 'Unauthorized', ok: false });
    }
  }

  try {
    switch (action) {
      case 'verifyPassword': result = { ok: verifyPassword_(body.password) };         break;
      case 'addApp':         result = addApp(body.app);                                break;
      case 'updateApp':      result = updateApp(body.id, body.app);                    break;
      case 'deleteApp':      result = deleteApp(body.id);                              break;
      case 'uploadFile':     result = uploadFile(body);                                break;
      case 'sendMessage':    result = sendMessage(body);                               break;
      default:               result = { error: 'Unknown action' };
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
  if (!stored) return false;
  return pw === stored;
}

/** Run this once from the Script Editor to set your admin password */
function setAdminPassword() {
  // Change 'your_secure_password_here' to whatever you want
  PropertiesService.getScriptProperties().setProperty(PASSWORD_KEY, 'your_secure_password_here');
  Logger.log('Password set.');
}


// ── INIT ───────────────────────────────────────────────────────
/** Run this once to set up the spreadsheet headers */
function initSetup() {
  setAdminPassword();

  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'id', 'name', 'shortDescription', 'fullDescription',
    'category', 'status', 'version', 'releaseDate',
    'platform', 'tech', 'logoUrl', 'screenshotUrls',
    'videoUrl', 'liveDemo', 'github', 'downloadUrl',
    'fileSize', 'featured', 'createdAt', 'updatedAt'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    Logger.log('Sheet initialized.');
  } else {
    Logger.log('Sheet already has data — headers not overwritten.');
  }
}


// ── GET APPS ───────────────────────────────────────────────────
function getApps() {
  const sheet = getSheet_();
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  return data.slice(1).map(row => rowToObj_(headers, row)).filter(a => a.id);
}

function getApp(id) {
  if (!id) return { error: 'id required' };
  const apps = getApps();
  return apps.find(a => a.id === id) || { error: 'Not found' };
}


// ── ADD APP ────────────────────────────────────────────────────
function addApp(app) {
  if (!app || !app.name) return { error: 'App name required', ok: false };

  const sheet   = getSheet_();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const now     = new Date().toISOString();

  app.id        = 'app_' + Date.now();
  app.createdAt = now;
  app.updatedAt = now;

  // Serialize arrays
  if (Array.isArray(app.platform))       app.platform       = app.platform.join(',');
  if (Array.isArray(app.tech))           app.tech           = app.tech.join(',');
  if (Array.isArray(app.screenshotUrls)) app.screenshotUrls = app.screenshotUrls.join(',');

  const row = headers.map(h => app[h] !== undefined ? app[h] : '');
  sheet.appendRow(row);

  return { ok: true, id: app.id, message: 'App added successfully.' };
}


// ── UPDATE APP ─────────────────────────────────────────────────
function updateApp(id, updates) {
  if (!id) return { error: 'id required', ok: false };

  const sheet   = getSheet_();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol   = headers.indexOf('id');

  for (let r = 1; r < data.length; r++) {
    if (data[r][idCol] === id) {
      updates.updatedAt = new Date().toISOString();

      if (Array.isArray(updates.platform))       updates.platform       = updates.platform.join(',');
      if (Array.isArray(updates.tech))           updates.tech           = updates.tech.join(',');
      if (Array.isArray(updates.screenshotUrls)) updates.screenshotUrls = updates.screenshotUrls.join(',');

      headers.forEach((h, c) => {
        if (updates[h] !== undefined) {
          sheet.getRange(r + 1, c + 1).setValue(updates[h]);
        }
      });

      return { ok: true, message: 'App updated.' };
    }
  }

  return { error: 'App not found', ok: false };
}


// ── DELETE APP ─────────────────────────────────────────────────
function deleteApp(id) {
  if (!id) return { error: 'id required', ok: false };

  const sheet   = getSheet_();
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol   = headers.indexOf('id');

  for (let r = 1; r < data.length; r++) {
    if (data[r][idCol] === id) {
      sheet.deleteRow(r + 1);
      return { ok: true, message: 'App deleted.' };
    }
  }

  return { error: 'App not found', ok: false };
}


// ── UPLOAD FILE ────────────────────────────────────────────────
/**
 * body: { password, fileType, fileName, mimeType, base64Data, appId }
 * fileType: 'logo' | 'screenshot' | 'video' | 'download'
 * Returns: { ok, url }
 */
function uploadFile(body) {
  if (!body.base64Data || !body.fileName) {
    return { error: 'fileName and base64Data required', ok: false };
  }

  const folder   = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const bytes    = Utilities.base64Decode(body.base64Data);
  const blob     = Utilities.newBlob(bytes, body.mimeType || 'application/octet-stream', body.fileName);
  const file     = folder.createFile(blob);

  // Make file publicly viewable
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId  = file.getId();
  // Direct download URL for Drive files
  const url = 'https://drive.google.com/uc?export=view&id=' + fileId;

  return { ok: true, url, fileId, message: 'File uploaded.' };
}


// ── SEND MESSAGE ───────────────────────────────────────────────
function sendMessage(body) {
  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return { error: 'name, email, and message are required', ok: false };
  }

  const subj = subject || 'New message from Fusion Portfolio';
  const html = `
    <h2 style="font-family:sans-serif;color:#6c63ff">New Contact Message — Fusion</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">From</td><td>${name}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;font-weight:600">Subject</td><td>${subj}</td></tr>
    </table>
    <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
    <div style="font-family:sans-serif;font-size:15px;line-height:1.7;white-space:pre-wrap">${message}</div>
    <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
    <p style="font-family:sans-serif;font-size:12px;color:#aaa">Sent via fusion393.github.io contact form</p>
  `;

  try {
    MailApp.sendEmail({
      to:       CONTACT_EMAIL,
      replyTo:  email,
      subject:  `[Fusion] ${subj}`,
      htmlBody: html,
    });
    return { ok: true, message: 'Message sent successfully.' };
  } catch (err) {
    return { error: 'Failed to send email: ' + err.message, ok: false };
  }
}


// ── HELPERS ────────────────────────────────────────────────────
function getSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

function rowToObj_(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });

  // Parse arrays
  ['platform', 'tech', 'screenshotUrls'].forEach(key => {
    if (typeof obj[key] === 'string' && obj[key]) {
      obj[key] = obj[key].split(',').map(s => s.trim()).filter(Boolean);
    } else {
      obj[key] = [];
    }
  });

  obj.featured = obj.featured === true || obj.featured === 'TRUE' || obj.featured === 'true';

  return obj;
}

function buildResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
