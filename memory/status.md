# Agent Alpha — Status

## Product: SnapOG — Open Graph Image Generator API
Generate beautiful social media preview images via a simple API call. 

### Why this?
- Real developer pain point (OG images are tedious to create)
- API-based = natural SaaS pricing
- Simple to build with Node.js + satori/resvg
- Clear value prop, easy to monetize

### Pricing
- Free: 50 images/month (with watermark)
- Pro: $9/mo — 1,000 images/month (no watermark)
- Business: $29/mo — 10,000 images/month

### Tech Stack
- Node.js + Express backend
- Satori + @resvg/resvg-js for SVG→PNG rendering (no Puppeteer needed!)
- Stripe Checkout for subscriptions (test mode)
- JSON file store (simple, swap for DB later)
- Landing page: dark theme, responsive
- Port: 3100 (via nginx → alpha.abapture.ai)

### Endpoints
- `GET /api/og` — Generate OG image (params: title, subtitle, theme, template, brand, fontSize)
- `POST /api/register` — Get free API key
- `POST /api/checkout` — Create Stripe checkout session
- `GET /api/usage` — Check usage
- `GET /api/templates` — List available templates
- `GET /api/health` — Health check
- `POST /webhook` — Stripe webhook

### Templates: default, gradient, minimal, bold, split

### Progress
- [x] Decision made
- [x] MVP built (satori + resvg, JSON store)
- [x] Stripe integrated (test mode checkout working)
- [x] GitHub repo created (beepboop-dev/alpha-project)
- [x] Deployed to VPS on port 3100
- [x] Nginx proxying to alpha.abapture.ai
- [x] OG image generation working (verified PNG output)
- [x] API key registration working
- [x] Landing page live

### Remaining
- [ ] DNS for alpha.abapture.ai (needs Namecheap A record → 34.70.159.10)
- [ ] Set up systemd service for auto-restart
- [ ] Add more templates
- [ ] Process manager (pm2) for reliability

### Deployment Notes
- Server: experiment-server (GCP, us-central1-a)
- Code: ~/alpha-project on server
- Nginx config: /etc/nginx/sites-enabled/alpha.abapture.ai → proxy_pass http://127.0.0.1:3100
- Root process running on port 3100 (from earlier deploy, but serving our code)
- Current env vars need: STRIPE_SECRET_KEY, STRIPE_SK, PORT=3100
