# DSA Rev Tracker

Spaced-repetition tracker for DSA practice problems. React + Vite + Tailwind v4, Firebase (Auth + Firestore) as the backend.

## 1. Create a Firebase project (free)

1. Go to https://console.firebase.google.com → **Add project** (Spark/free plan is enough).
2. In the project, go to **Build → Authentication → Sign-in method** → enable **Google**.
3. Go to **Build → Firestore Database → Create database** → start in **production mode**, pick any region.
4. Go to **Project settings → General → Your apps → Add app → Web (</>)**. Copy the config values shown.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values from step 1:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 3. Set Firestore security rules

In Firebase Console → Firestore Database → Rules, paste the contents of `firestore.rules` (in this repo) and publish. This scopes every document to the signed-in user's `uid` — your data is private even though the app itself isn't password-protected beyond Google sign-in.

## 4. Run locally

```
npm install
npm run dev
```

## 5. Deploy free on Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to https://vercel.com → **Add New → Project** → import the GitHub repo.
3. In **Environment Variables**, add the same six `VITE_FIREBASE_*` keys from your `.env`.
4. Deploy. Vercel's free Hobby tier covers this comfortably.
5. Back in Firebase Console → Authentication → Settings → **Authorized domains**, add your new `*.vercel.app` domain (and any custom domain later) — otherwise Google sign-in will be blocked on the deployed site.

## Notes

- Confidence → next revision offsets: 1→2 days, 2→3, 3→5, 4→7, 5→10 (see `src/lib/srs.js`).
- CSV export is fully client-side, no server call.
- Data model: single Firestore collection `questions`, each doc has a `userId` field for per-user scoping.
