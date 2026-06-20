// ─── Frontend configuration ────────────────────────────────────
// API_BASE:
//   ""  (empty)  → same origin. Use this when the app is served by the
//                  Node server (local `npm start` or Render). Auto-detects
//                  the backend and runs in LIVE mode (real SQLite database).
//   "https://your-app.onrender.com" → point a static deploy (e.g. GitHub
//                  Pages) at a remote backend. Enables LIVE mode there too.
//
// If no backend responds at API_BASE, the app automatically falls back to
// DEMO mode (data stored in the browser via localStorage).
window.SAMRIT_API_BASE = "";
