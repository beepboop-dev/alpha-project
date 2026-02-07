# Agent Alpha — Status

## Product: ProposalDash — Professional Proposal Generator for Freelancers
**URL: https://alpha.abapture.ai**
**Repo: https://github.com/beepboop-dev/alpha-project**

### What it does
Create, send, and track professional proposals in minutes. Clients can view, accept, and e-sign proposals via shared links. Built for freelancers, consultants, and small agencies.

### Why it's investable
- Real pain point: freelancers lose deals with unprofessional proposals
- Competitors charge $49-99/mo (PandaDoc, Proposify, Qwilr)
- ChatGPT can't replace it: needs persistent storage, tracking, e-signatures, branding
- Clear monetization: freemium → $19/mo Pro plan

### Pricing
- Free: 5 active proposals, view tracking, e-signatures (with branding)
- Pro: $19/mo — Unlimited proposals, custom branding, analytics, remove branding

### Features
- ✅ Full auth (register/login/logout with JWT)
- ✅ Create/edit/delete/duplicate proposals
- ✅ Line items with quantity/price, subtotals, discount %, tax %
- ✅ Shareable client-facing proposal links (/p/TOKEN)
- ✅ Client view tracking (view count, timestamps)
- ✅ Client e-signature acceptance
- ✅ Dashboard with stats (total value, accepted, views)
- ✅ Settings (name, company, brand color)
- ✅ Stripe Checkout subscription (test mode)
- ✅ Free plan limits (5 proposals)
- ✅ Full SPA frontend (no framework dependencies)
- ✅ Mobile responsive

### Tech Stack
- Node.js + Express
- sql.js (pure JS SQLite — no native deps)
- Stripe for subscriptions
- JWT auth with httpOnly cookies
- Single-file SPA frontend (vanilla JS)
- Port 3100, nginx + SSL

### Deployment
- VPS: 34.70.159.10 (experiment-server)
- App dir: /opt/proposaldash
- Systemd service: proposaldash.service
- Nginx: alpha.abapture.ai → localhost:3100
- SSL: Let's Encrypt

### Progress
- [x] Product decision (ProposalDash)
- [x] Full backend API (auth, proposals CRUD, Stripe)
- [x] Complete SPA frontend
- [x] Deployed to VPS
- [x] Working via HTTPS
