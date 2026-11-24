# Deploying SkillBridge

Order matters: **database first, then backend, then frontend, then connect them.**
Do not leave this until the last day. Allow a few hours the first time.

| Part                   | Service       | Free tier        |
| ---------------------- | ------------- | ---------------- |
| Database               | MongoDB Atlas | M0 cluster       |
| Backend (`server/`)    | Render        | Free web service |
| Frontend (`frontend/`) | Vercel        | Hobby plan       |

## 1. Database (MongoDB Atlas)

1. Create a free **M0** cluster.
2. **Database Access** -> add a database user with a strong password.
   Use letters and numbers only, so the password does not need URL encoding.
3. **Network Access** -> add `0.0.0.0/0`.
   Render's free plan has no fixed IP address, so Atlas must accept connections from anywhere.
   The database user and password still protect it. Mention this trade-off in your report.
4. **Connect -> Drivers** -> copy the connection string. Put the database name before the `?`:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/skillbridge?retryWrites=true&w=majority
   ```

## 2. Backend (Render)

1. Render -> **New -> Web Service** -> connect your GitHub repository.
2. Settings:

   | Setting           | Value         |
   | ----------------- | ------------- |
   | Root Directory    | `server`      |
   | Build Command     | `npm install` |
   | Start Command     | `npm start`   |
   | Health Check Path | `/api/health` |

3. **Environment** variables:

   | Name                | Value                                                              |
   | ------------------- | ------------------------------------------------------------------ |
   | `MONGO_URI`         | the Atlas string from step 1                                       |
   | `JWT_SECRET`        | a long random value (see below)                                    |
   | `CLIENT_URL`        | your Vercel address, **no slash at the end** (add it after step 3) |
   | `NODE_ENV`          | `production`                                                       |
   | `ANTHROPIC_API_KEY` | optional                                                           |

   Generate a secret on your computer:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. Deploy, then open `https://YOUR-API.onrender.com/api/health`. You should see `{"ok":true}`.
5. `https://YOUR-API.onrender.com/api/docs` shows the API documentation.

**Note:** on the free plan, Render puts the service to sleep after a period without traffic.
The first request afterwards can take up to about a minute. Open the site yourself shortly
before your demo and before the marking window.

## 3. Frontend (Vercel)

1. Vercel -> **Add New -> Project** -> import the same repository.
2. Settings:

   | Setting          | Value           |
   | ---------------- | --------------- |
   | Root Directory   | `frontend`      |
   | Framework Preset | Vite            |
   | Build Command    | `npm run build` |
   | Output Directory | `dist`          |

3. Environment variable: `VITE_API_URL` = `https://YOUR-API.onrender.com/api`
4. Deploy. The file `frontend/vercel.json` makes pages like `/jobs` still work after a refresh.

`VITE_API_URL` is added to the app when it is **built**, so if you change it, redeploy the frontend.

## 4. Connect them

1. Copy your Vercel address (for example `https://skillbridge.vercel.app`).
2. In Render, set `CLIENT_URL` to exactly that address (no slash at the end) and redeploy.

## 5. Add demo data (optional)

Run the seed script from your computer, pointing at Atlas. **It deletes existing data.**

```bash
cd server
MONGO_URI="your-atlas-string" npm run seed
```

On Windows PowerShell:

```powershell
$env:MONGO_URI="your-atlas-string"; npm run seed
```

## 6. Test the live site

Do this from a different network, for example your phone on mobile data.

- [ ] Home page loads and the Jobs page shows jobs
- [ ] Refreshing on `/jobs` does not give a 404
- [ ] Register as a candidate, add skills, see match scores
- [ ] Apply for a job
- [ ] Log in as an employer, post a job, view applicants
- [ ] Try a wrong password (you should see an error, not a crash)
- [ ] `/api/docs` opens

Take screenshots of each step. They are evidence for your report.

## Troubleshooting

| Problem                            | Likely cause                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Browser console shows a CORS error | `CLIENT_URL` on Render does not match the Vercel address exactly (check the slash)                       |
| Pages return 404 after refresh     | `frontend/vercel.json` is missing or not in the `frontend` folder                                        |
| API says "DB connection failed"    | Atlas Network Access does not allow the host, or the password in `MONGO_URI` is wrong                    |
| Front end calls `localhost`        | `VITE_API_URL` was not set before the build. Set it and redeploy                                         |
| First request is very slow         | Render free plan was asleep. Wait and try again                                                          |
| Everyone gets "Too many requests"  | Rate limiter is not seeing real IPs. The code already sets `trust proxy`, so check you did not remove it |
