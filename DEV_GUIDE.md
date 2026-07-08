# SOLPG Attendance App — Developer Guide

## Prerequisites

Before you begin, make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | https://nodejs.org (choose LTS) |
| **npm** | Comes with Node.js | — |
| **Git** *(optional)* | Any recent version | https://git-scm.com |

### Verify your installation
Open a terminal (PowerShell or Command Prompt) and run:
```powershell
node --version   # should print v18.x.x or higher
npm --version    # should print 8.x.x or higher
```

---

## First-Time Setup

> Do this once after cloning or downloading the project.

### 1. Open the project folder
```powershell
cd "c:\SD2 Confidential\AI Skill Up\BobHandson1\attendance-app\attendance-app-src"
```

### 2. Install dependencies
```powershell
npm install
```
This creates the `node_modules` folder. It only needs to be run once
(or again after pulling changes that update `package.json`).

### 3. Configure environment variables
Copy the example env file and fill in your values:
```powershell
copy .env.example .env
```
Then open `.env` in any text editor and set:

```env
# Your Google Apps Script Web App URL
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Logo image URLs (Google Drive direct links)
VITE_PDCC_LOGO_URL=https://lh3.googleusercontent.com/...
VITE_SOLPG_LOGO_URL=https://lh3.googleusercontent.com/...
```

> ⚠️ The `.env` file is gitignored — it will NOT be committed to source control.
> Never share this file publicly as it contains your Apps Script URL.

---

## Running the App Locally (Development Mode)

Development mode gives you hot-reloading — changes to source files instantly
reflect in the browser without needing to rebuild.

```powershell
npm run dev
```

You should see output like:
```
  VITE v6.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open **http://localhost:5173** in your browser (Chrome or Edge recommended for tablet-like testing).

> 💡 **Tablet testing tip:** If your tablet is on the same Wi-Fi network,
> open the **Network** URL (e.g. `http://192.168.x.x:5173`) on the tablet browser
> to test the responsive layout live.

To stop the dev server, press `Ctrl + C` in the terminal.

---

## Building for Production

The production build compiles and minifies all files into the `dist/` folder,
ready to be opened in any browser or deployed to a hosting service.

```powershell
npm run build
```

You should see output like:
```
✓ 44 modules transformed.
dist/index.html              0.40 kB
dist/assets/index-xxxx.css  29 kB
dist/assets/index-xxxx.js  183 kB
✓ built in 1.6s
```

### Preview the production build locally
To verify the production build works before deploying:
```powershell
npm run preview
```
Then open **http://localhost:4173** in your browser.

---

## Opening the App Directly in a Browser (No Server)

Because `vite.config.js` sets `base: './'`, the built files use relative paths
and can be opened directly from the file system — no web server needed.

1. Run the build:
   ```powershell
   npm run build
   ```
2. Navigate to the `dist/` folder in File Explorer
3. Double-click **`index.html`** to open it in your default browser

> ✅ This is the recommended way to run the app on a **tablet** — just copy the
> entire `dist/` folder to the tablet and open `index.html` in Chrome or Edge.
> The app will work fully offline using the cached roster.

---

## Deploying to GitHub Pages

### One-time setup
1. Push the project to a GitHub repository
2. In `vite.config.js`, update the `base` to match your repo name:
   ```js
   base: '/your-repo-name/',
   ```
3. Rebuild:
   ```powershell
   npm run build
   ```

### Deploy
```powershell
npm run deploy
```
This builds the app and pushes the `dist/` folder to the `gh-pages` branch.

Your app will be live at:
`https://your-github-username.github.io/your-repo-name/`

---

## Deploying to Netlify (Alternative)

1. Go to https://netlify.com and sign in with GitHub
2. Click **"Add new site" → "Import an existing project"**
3. Connect your GitHub repository
4. Set the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add your environment variables under **Site settings → Environment variables**:
   - `VITE_APPS_SCRIPT_URL`
   - `VITE_PDCC_LOGO_URL`
   - `VITE_SOLPG_LOGO_URL`
6. Click **Deploy site**

Every time you push a commit to `main`, Netlify will automatically rebuild and redeploy.

---

## Common Commands Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies (first-time setup) |
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build for production into `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build + deploy to GitHub Pages |

---

## Project File Structure

```
attendance-app-src/
├── .env                    ← Your private config (not committed)
├── .env.example            ← Template — copy this to .env
├── vite.config.js          ← Vite + Tailwind configuration
├── package.json            ← Project dependencies and scripts
├── index.html              ← App entry point
├── DEV_GUIDE.md            ← This file
├── APPS_SCRIPT_SETUP.md    ← Google Apps Script setup instructions
└── src/
    ├── main.jsx            ← React entry point
    ├── App.jsx             ← Root component — wires everything together
    ├── index.css           ← Global styles (Tailwind import)
    ├── config.js           ← Reads env variables
    ├── data/
    │   └── defaultRoster.js        ← Offline fallback member list
    ├── services/
    │   ├── sheetsService.js        ← Google Sheets API calls
    │   ├── storageService.js       ← localStorage read/write
    │   └── csvService.js           ← CSV export and import
    ├── hooks/
    │   ├── useRoster.js            ← Offline-first roster management
    │   ├── useAttendance.js        ← Attendance state + sync
    │   └── useGroupedRoster.js     ← Couple/single grouping logic
    └── components/
        ├── Header.jsx              ← Logo bar, date picker, total count
        ├── ClusterNav.jsx          ← Cluster selector buttons
        ├── HouseholdNav.jsx        ← Household list with badges
        ├── MemberPanel.jsx         ← Right panel member list
        ├── CoupleCard.jsx          ← Side-by-side spouse card
        ├── MemberCard.jsx          ← Single member card
        ├── OperationsPanel.jsx     ← Action buttons
        ├── GuestModal.jsx          ← Guest registration form
        └── Toast.jsx               ← Success/error notifications
```

---

## Troubleshooting

### `npm` is not recognized
Node.js is not installed or not in your PATH.
→ Install Node.js from https://nodejs.org and restart your terminal.

### `node` is not recognized (but `npm` works)
Node.js is installed but not in your system PATH.
→ Add `C:\Program Files\nodejs` to your system PATH environment variable,
  then restart your terminal.

### PowerShell script execution is disabled
→ Run this in PowerShell **as Administrator**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### App loads but shows no members / blank roster
→ Check that your `.env` file exists and `VITE_APPS_SCRIPT_URL` is set correctly.
→ The app will fall back to the default hardcoded roster if Google Sheets is unreachable.

### Logos don't appear
→ Google Drive direct links can sometimes expire. Update `VITE_PDCC_LOGO_URL` and
  `VITE_SOLPG_LOGO_URL` in your `.env` file with fresh links, then rebuild.

### Changes to `.env` don't take effect
→ Vite reads `.env` at build time. After editing `.env`, you must restart the dev
  server (`Ctrl+C` then `npm run dev`) or rebuild (`npm run build`).
