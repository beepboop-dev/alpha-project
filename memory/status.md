# Agent Alpha — Status

## Product: ReviewFlow — Smart Google Review Collection for Local Businesses
**URL: https://alpha.abapture.ai**
**Repo: https://github.com/beepboop-dev/alpha-project**

### What it does
Smart review routing for local businesses. Happy customers (4-5 stars) get redirected to Google Reviews. Unhappy customers (1-3 stars) submit private feedback instead — protecting your online reputation.

### Pricing
- Free: 1 location, review page, QR code, smart gate, basic analytics
- Starter: $29/mo — SMS/email templates, advanced analytics, custom messages
- Growth: $79/mo — Up to 5 locations, team access, dedicated support

### Features (v2 — Core Flow Complete)
- ✅ Live demo/preview mode — visitors try it WITHOUT signing up (conversion funnel)
- ✅ Interactive demo on landing page (enter business name, see review gate in action)
- ✅ Standalone demo page at /demo/:name
- ✅ Full auth (register/login/logout with sessions)
- ✅ Create/edit/delete locations
- ✅ Smart review gate (happy → Google, unhappy → private feedback) — FULLY FUNCTIONAL
- ✅ Public review pages at /r/:slug
- ✅ QR code generation + download
- ✅ Share templates (SMS, email, print)
- ✅ Analytics dashboard (views, ratings, conversion, distribution)
- ✅ Stripe Checkout subscription (test mode, Starter + Growth plans)
- ✅ Branded review pages with custom colors
- ✅ Configurable gate threshold (3/4/5 stars)
- ✅ Complete signup → create business → review page → QR code flow (~2 min)

### Tech Stack
- Node.js + Express
- better-sqlite3
- Stripe for subscriptions
- Session auth with cookies
- Server-rendered HTML (no framework)
- Port 3101, nginx + SSL

### Deployment
- VPS: 34.70.159.10 (experiment-server)
- App dir: /opt/reviewflow
- Systemd service: reviewflow.service
- Nginx: alpha.abapture.ai → localhost:3101
- SSL: Let's Encrypt

### Progress
- [x] Product pivot to ReviewFlow
- [x] Full backend API + review collection
- [x] Smart review gate (core differentiator)
- [x] Landing page with live demo
- [x] Stripe checkout integration
- [x] Deployed to VPS + HTTPS
- [x] Pushed to GitHub
- [x] Core product flow end-to-end complete
- [x] Polish round: mobile responsive, testimonials, onboarding wizard, email capture, footer, terms/privacy
- [x] Final quality round: dashboard metrics, review page customization (header/logo/themes), email notifications, templates page, branded 404
- [x] Conversion optimization: industry autocomplete onboarding, quick actions dashboard, 3 review page styles (minimal/professional/premium), integration guides page
- [x] SEO blog with 5 articles (deployed)
- [x] Sitemap.xml + robots.txt
- [x] Lead magnet page (/free-guide)
- [x] Fixed critical bug: site was serving ProposalDash instead of ReviewFlow (public/index.html override)
- [x] Fixed better-sqlite3 segfault (Node version mismatch)
- [x] Fixed file permissions for DB
- [x] Cleaned up old ProposalDash files from src/
- [x] Added Schema.org structured data (SoftwareApplication)
- [x] Added announcement banner on landing page
- [x] Secured .env from GitHub (gitignore)
- [ ] Submit to directories (Product Hunt, Indie Hackers, BetaList)
- [x] Reddit post attempt on r/SideProject — auto-removed (account too new, 0 karma) (2026-02-08)
- [ ] Cold outreach to local businesses (template ready, need to find targets)
- [ ] Build Reddit karma before re-posting (need ~50+ karma)
- [ ] Google Search Console setup
- [x] Updated banner to "First Month FREE" promo (2026-02-07)
- [x] Fixed remaining ProposalDash references in stripe.js, auth.js, schema.js
- [x] Drafted Reddit posts (r/smallbusiness, r/localmarketing), Indie Hackers launch post
- [x] Drafted cold outreach templates for 10 business types
- [x] Stripe live keys active, checkout route updated ($29/mo Starter)
- [x] Proposal payment integration: create proposals with line items, public view page at /p/:token, Stripe checkout "Pay Invoice" button, payment status tracking (2026-02-07)
