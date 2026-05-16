# Fusion — App Portfolio System

> **GitHub Pages + Google Apps Script + Google Drive + Google Sheets**  
> Zero cost · No server · No paid database · No GitHub tokens  
> Live site: [https://fusion393.github.io](https://fusion393.github.io)

---

## Architecture Overview

```
GitHub Pages (frontend)
    ├── index.html          Public portfolio
    ├── style.css
    ├── script.js           Fetches apps from Apps Script; falls back to JSON
    ├── data/
    │   ├── config.json     Site config + backend URL
    │   └── apps-fallback.json   Static fallback if backend is unavailable
    ├── admin/
    │   ├── index.html      Password-protected admin panel
    │   ├── admin.css
    │   └── admin.js        Calls Apps Script for all write operations
    └── apps-script-code.gs  → Deploy separately on script.google.com
```

```
Google Apps Script (backend API)
    ├── doGet  → getApps, getApp, ping
    └── doPost → addApp, updateApp, deleteApp, uploadFile, sendMessage, verifyPassword

Google Sheets → App database (one row per app)
Google Drive  → Stores logos, screenshots, videos, APK/ZIP files
```

---

## Complete Setup Guide

### Step 1 — Fork & Deploy to GitHub Pages

1. Create a repository named `fusion393.github.io` (or your username)
2. Upload all files from this project into the repo root
3. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
4. Your site is live at `https://fusion393.github.io`

---

### Step 2 — Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name the first sheet tab **Apps** (exact spelling)
3. Copy the Sheet ID from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SHEET_ID`**`/edit`

---

### Step 3 — Create Google Drive Folder

1. Go to [drive.google.com](https://drive.google.com) and create a new folder, e.g. **FusionFiles**
2. Right-click the folder → **Share** → **Anyone with the link can view**
3. Copy the folder ID from the URL:  
   `https://drive.google.com/drive/folders/`**`YOUR_FOLDER_ID`**

---

### Step 4 — Deploy Google Apps Script

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Paste the entire contents of `apps-script-code.gs`
3. At the top of the file, fill in:
   ```js
   const SHEET_ID       = 'YOUR_GOOGLE_SHEET_ID_HERE';
   const DRIVE_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';
   const CONTACT_EMAIL  = 'your@email.com';
   ```
4. Also update the password in `setAdminPassword()`:
   ```js
   PropertiesService.getScriptProperties().setProperty(PASSWORD_KEY, 'your_secure_password');
   ```
5. **Run `initSetup()`** once from the editor (authorize when prompted). This:
   - Sets your admin password in PropertiesService (never stored in code)
   - Creates the spreadsheet headers
6. **Deploy as Web App:**
   - Click **Deploy → New deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the Web App URL

---

### Step 5 — Connect Frontend to Backend

Open `data/config.json` and paste your Web App URL:

```json
{
  "site": {
    "name": "Fusion",
    "author": "Md. Shamim Al Razi",
    "url": "https://fusion393.github.io",
    "email": "your@email.com",
    "github": "https://github.com/fusion393"
  },
  "backend": {
    "appsScriptUrl": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
  }
}
```

Push the updated `config.json` to GitHub. Done — the site will now load apps from your Google Sheet.

---

## Adding & Managing Apps (Admin Panel)

Navigate to `https://fusion393.github.io/admin/` and enter your admin password.

### Add an App
1. Click **Add App** in the sidebar
2. Fill in the form (name, description, category, status, links, etc.)
3. Click **Save App** — the row is written to your Google Sheet

### Edit an App
1. Click **Apps** in the sidebar
2. Find the app and click **Edit**
3. Make changes → **Update App**

### Delete an App
1. Click the **trash icon** on any app card
2. Confirm deletion

### Upload Files
1. Click **Upload Files** in the sidebar
2. Drag & drop or select: logo, screenshots, video, or APK/ZIP
3. Click the Upload button — the file goes to Google Drive and becomes publicly viewable
4. Copy the returned URL into the app form's Logo URL / Screenshot URLs / etc. fields

---

## App Fields Reference

| Field            | Type            | Description |
|------------------|-----------------|-------------|
| `id`             | Auto-generated  | Unique identifier (`app_<timestamp>`) |
| `name`           | String          | App name |
| `shortDescription` | String        | One-liner shown on cards |
| `fullDescription`| String          | Shown in the detail modal |
| `category`       | String          | Productivity, Design Tools, Finance, etc. |
| `status`         | Enum            | `live` · `beta` · `wip` · `planned` |
| `version`        | String          | e.g. `1.0.0` |
| `releaseDate`    | Date string     | `YYYY-MM-DD` |
| `platform`       | Comma-separated | Web, Android, iOS, PWA |
| `tech`           | Comma-separated | React, Firebase, etc. |
| `logoUrl`        | URL             | Uploaded to Drive or external |
| `screenshotUrls` | Comma-separated | One Drive URL per screenshot |
| `videoUrl`       | URL             | YouTube URL or .mp4 link |
| `liveDemo`       | URL             | Live deployment URL |
| `github`         | URL             | GitHub repository URL |
| `downloadUrl`    | URL             | APK/ZIP/installer download link |
| `fileSize`       | String          | e.g. `4.2 MB` |
| `featured`       | Boolean         | Shown in Featured spotlight |

---

## Security Model

| Action               | Who Can Do It          |
|----------------------|------------------------|
| View apps            | Everyone (public)       |
| Send contact message | Everyone (public)       |
| Add app              | Admin password required |
| Edit app             | Admin password required |
| Delete app           | Admin password required |
| Upload files         | Admin password required |

- **Admin password** is stored only in Google Apps Script `PropertiesService` — never in any file, never in GitHub
- The password is never sent to the frontend. The lockscreen sends it to Apps Script for verification
- GitHub Pages is 100% static — no server-side secrets possible
- No API keys, no tokens, no paid services

---

## Fallback Behaviour

If the Apps Script URL is not configured or the request fails:
- `script.js` automatically loads `data/apps-fallback.json`
- The navbar badge shows **Cached data** (amber) vs **Live data** (green)
- Update `data/apps-fallback.json` manually as a static mirror of your real data

---

## File Structure

```
fusion-system/
├── index.html              Main portfolio page
├── style.css               All public site styles
├── script.js               Public JS: loads config, fetches apps, renders UI
├── data/
│   ├── config.json         Site settings + backend URL (edit me!)
│   └── apps-fallback.json  Static app data for offline/no-backend mode
├── admin/
│   ├── index.html          Admin panel (password protected)
│   ├── admin.css           Admin styles
│   └── admin.js            Admin JS: login, CRUD, file upload
├── apps-script-code.gs     Paste this into script.google.com
└── README.md               This file
```

---

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | HTML5, CSS3, Vanilla JS (ES6+) |
| Hosting     | GitHub Pages (free) |
| Backend API | Google Apps Script (free) |
| Database    | Google Sheets (free) |
| File Storage| Google Drive (free, 15 GB) |
| Fonts       | Google Fonts — Syne + DM Sans |
| Icons       | Font Awesome 6 |
| Cost        | **$0.00** |

---

## Updating Your Apps Script

After editing `apps-script-code.gs`:
1. In the Script Editor, go to **Deploy → Manage deployments**
2. Click the pencil (edit) icon on your existing deployment
3. Change **Version** to **New version**
4. Click **Deploy** — the URL stays the same

---

*Built with ♥ by Md. Shamim Al Razi — Fusion Portfolio System*
