# Git & Deployment Guide — SOLPG Attendance App

## Overview

```
attendance-app-src/  ──push──▶  GitHub Repository  ──auto-deploy──▶  Netlify / GitHub Pages
    (your code)                  (source control)                       (live public URL)

Workflow after setup:
  Edit code  ▶  npm run build  ▶  git push  ▶  Auto-deployed in ~1 minute
```

---

## Part 1 — Push to GitHub

> ⚠️ Your `.env` file is already gitignored — it will NOT be pushed to GitHub.

### Step 1 — Install Git
Download from https://git-scm.com and verify:
```powershell
git --version
```

### Step 2 — Create a GitHub repository
1. Go to https://github.com/new
2. Repository name: `solpg-attendance-app` (or any name)
3. Set to **Private** (keeps your Apps Script URL safe)
4. ❌ Do NOT initialise with README or any other files
5. Click **Create repository**

### Step 3 — Navigate to your project folder
```powershell
cd "c:\SD2 Confidential\AI Skill Up\BobHandson1\attendance-app\attendance-app-src"
```

### Step 4 — Initialise Git and make your first commit
```powershell
git init
git add .
git commit -m "Initial commit — SOLPG Attendance App"
```

### Step 5 — Connect to GitHub and push
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 6 — Verify
Open your GitHub repo URL. All source files should be listed.
The `.env` file should NOT be there.

---

## Part 2 — Deploy Online

### Option A: Netlify (Recommended)

Netlify is the simpler option — it handles environment variables securely
(your Apps Script URL stays private) and auto-deploys on every git push.

1. Go to https://netlify.com → **Sign up with GitHub**
2. From the dashboard → **Add new site → Import an existing project**
3. Click **Deploy with GitHub** → select your repo
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables (click "Add environment variables" before deploying):
   | Key | Value |
   |-----|-------|
   | `VITE_APPS_SCRIPT_URL` | Your Google Apps Script URL |
   | `VITE_PDCC_LOGO_URL` | `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID` |
   | `VITE_SOLPG_LOGO_URL` | `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID` |
6. Click **Deploy site**

Your app will be live at: `https://random-name.netlify.app`

> Optional: Go to **Site settings → Domain management** to set a custom subdomain
> e.g. `solpg-attendance.netlify.app`

#### Future deployments (Netlify)
```powershell
git add .
git commit -m "Description of change"
git push   # Netlify auto-rebuilds and redeploys — no extra steps needed
```

---

### Option B: GitHub Pages

> ⚠️ Environment variables get baked into the compiled JS and are visible in the browser.
> Use a **private repo** to limit exposure.

1. Update `vite.config.js` — set `base` to your repo name:
   ```js
   base: '/solpg-attendance-app/',
   ```

2. Commit and push the change:
   ```powershell
   git add vite.config.js
   git commit -m "Set base path for GitHub Pages"
   git push
   ```

3. Build and deploy:
   ```powershell
   npm run deploy
   ```

4. Enable GitHub Pages in repo settings:
   - Go to your GitHub repo → **Settings → Pages**
   - Source: branch `gh-pages`, folder `/ (root)`
   - Click **Save**

Your app will be live at: `https://YOUR_USERNAME.github.io/solpg-attendance-app/`

#### Future deployments (GitHub Pages)
```powershell
git add .
git commit -m "Description of change"
git push           # saves source to GitHub
npm run deploy     # rebuilds and redeploys to gh-pages branch
```

---

## Part 3 — Day-to-Day Workflow

### Making and pushing a code change
```powershell
# 1. Edit files in src/
# 2. Test locally
npm run dev

# 3. Commit and push when ready
git add .
git commit -m "Brief description"
git push     # Netlify auto-deploys / GitHub Pages: also run npm run deploy
```

### Useful Git commands
| Command | What it does |
|---------|-------------|
| `git status` | Show changed files |
| `git add .` | Stage all changes |
| `git add src/App.jsx` | Stage a specific file |
| `git commit -m "message"` | Save a snapshot |
| `git push` | Upload to GitHub |
| `git log --oneline` | See commit history |
| `git diff` | See exact line changes |

---

## Security Checklist

| Item | Check |
|------|-------|
| `.env` is gitignored | ✅ Already configured — run `git status` and confirm `.env` is NOT listed |
| Repository visibility | Set to **Private** on GitHub |
| Netlify env vars | Set in dashboard — not in source files |
| `.env.example` is committed | ✅ Safe — contains only placeholder values |

> 🚫 Never commit your real `.env` file. If accidentally pushed, immediately
> redeploy your Apps Script with a new URL to invalidate the old one.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `git push` asks for credentials | Use GitHub CLI (`gh auth login`) or a Personal Access Token |
| Netlify build fails | Check build logs. Add `NODE_VERSION = 18` in Netlify → Site settings → Environment |
| GitHub Pages shows 404 | Ensure `base` in `vite.config.js` matches your exact repo name, then re-run `npm run deploy` |
| App loads but no data/logos | Environment variables not set in Netlify. Add them and trigger a redeploy. |
| `git: command not found` | Install Git from https://git-scm.com and restart terminal |
