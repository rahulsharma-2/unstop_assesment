# Quick Deployment

Use GitHub for the code repository, Render for the Express backend, and Vercel for the React frontend.

## 1. Push Code To GitHub

From `C:\Users\rsharma3\Desktop\unstop_assesment`:

```powershell
git init
git add .
git commit -m "Build hotel room reservation system"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 2. Deploy Backend On Render

Create a new Render Web Service from the GitHub repo.

- Root Directory: `unstop_backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variable:
  - `CLIENT_ORIGIN`: your Vercel frontend URL, for example `https://your-app.vercel.app`

After deployment, copy the Render backend URL, for example:

```text
https://your-backend.onrender.com
```

## 3. Deploy Frontend On Vercel

Create a new Vercel project from the same GitHub repo.

- Root Directory: `booking_frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable:
  - `VITE_API_URL`: your Render backend URL, for example `https://your-backend.onrender.com`

Redeploy the frontend after setting `VITE_API_URL`.

## 4. Final Checks

Open the Vercel URL and test:

- Book rooms
- Generate random occupancy
- Reset rooms
- Confirm selected rooms and travel time update

