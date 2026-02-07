const express = require('express');
const Database = require('better-sqlite3');
const QRCode = require('qrcode');
const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3101;
const BASE_URL = process.env.BASE_URL || 'https://alpha.abapture.ai';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'reviewflow-k8x7m2p', resave: false, saveUninitialized: false, cookie: { maxAge: 30*24*60*60*1000 } }));

const db = new Database(path.join(__dirname, 'reviewflow.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, business_name TEXT, plan TEXT DEFAULT 'free', stripe_customer_id TEXT, stripe_subscription_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS locations (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, business_name TEXT NOT NULL, business_type TEXT DEFAULT '', google_review_url TEXT NOT NULL, primary_color TEXT DEFAULT '#2563eb', thank_you_message TEXT DEFAULT 'Thank you for your feedback!', gate_threshold INTEGER DEFAULT 4, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));
  CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, location_id TEXT NOT NULL, rating INTEGER NOT NULL, feedback TEXT DEFAULT '', customer_name TEXT DEFAULT '', customer_email TEXT DEFAULT '', redirected_to_google INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (location_id) REFERENCES locations(id));
  CREATE TABLE IF NOT EXISTS page_views (id INTEGER PRIMARY KEY AUTOINCREMENT, location_id TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (location_id) REFERENCES locations(id));
`);

function requireAuth(req, res, next) { if (!req.session.userId) return res.redirect('/login'); next(); }
function getUser(req) { if (!req.session.userId) return null; return db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId); }
function esc(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function css() {
  return `<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;line-height:1.6}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
.btn{display:inline-block;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;cursor:pointer;border:none;transition:all .2s}
.btn-primary{background:#2563eb;color:#fff}.btn-primary:hover{background:#1d4ed8}
.btn-secondary{background:#f1f5f9;color:#334155;border:1px solid #e2e8f0}.btn-secondary:hover{background:#e2e8f0}
.btn-danger{background:#ef4444;color:#fff}.btn-sm{padding:8px 16px;font-size:13px}
.card{background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:24px;margin-bottom:16px}
input,select,textarea{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;font-family:inherit}
input:focus,select:focus,textarea:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
label{display:block;font-weight:600;font-size:14px;margin-bottom:6px;color:#374151}
.form-group{margin-bottom:20px}.form-hint{font-size:13px;color:#6b7280;margin-top:4px}
.alert{padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px}
.alert-error{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.alert-success{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center}
.stat-value{font-size:32px;font-weight:700;color:#1e293b}.stat-label{font-size:13px;color:#64748b;margin-top:4px}
.nav{background:#fff;border-bottom:1px solid #e2e8f0;padding:16px 0}
.nav-inner{display:flex;justify-content:space-between;align-items:center}
.nav-brand{font-size:20px;font-weight:700;color:#2563eb;text-decoration:none;display:flex;align-items:center;gap:8px}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{color:#64748b;text-decoration:none;font-size:14px;font-weight:500}.nav-links a:hover{color:#1e293b}
.badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600}
.badge-free{background:#f1f5f9;color:#64748b}.badge-starter{background:#dbeafe;color:#2563eb}.badge-growth{background:#fef3c7;color:#d97706}
@media(max-width:768px){.stat-grid{grid-template-columns:1fr 1fr}.nav-links{gap:12px}}
</style>`;
}

// ===== LANDING PAGE =====
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ReviewFlow — Get More Google Reviews for Your Business</title>
<meta name="description" content="Help your local business collect more 5-star Google reviews with smart review routing, QR codes, and analytics.">
${css()}
<style>
.hero{padding:80px 0;text-align:center;background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)}
.hero h1{font-size:48px;font-weight:800;line-height:1.1;margin-bottom:20px}.hero h1 span{color:#2563eb}
.hero p{font-size:20px;color:#64748b;max-width:600px;margin:0 auto 32px}
.features{padding:80px 0}.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.feature-card{text-align:center;padding:32px}.feature-icon{font-size:48px;margin-bottom:16px}
.feature-card h3{font-size:20px;margin-bottom:8px}.feature-card p{color:#64748b;font-size:15px}
.how-it-works{padding:80px 0;background:#f8fafc}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:40px}
.step{text-align:center}.step-number{width:48px;height:48px;border-radius:50%;background:#2563eb;color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.step h3{margin-bottom:8px}.step p{color:#64748b;font-size:15px}
.pricing-section{padding:80px 0}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:900px;margin:40px auto 0}
.pricing-card{border:2px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center}
.pricing-card.featured{border-color:#2563eb;position:relative}
.pricing-card.featured::before{content:'MOST POPULAR';position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#2563eb;color:#fff;padding:4px 16px;border-radius:999px;font-size:12px;font-weight:700}
.pricing-card h3{font-size:22px;margin-bottom:8px}
.pricing-card .price{font-size:42px;font-weight:800;margin:16px 0 8px}.pricing-card .price span{font-size:16px;font-weight:400;color:#64748b}
.pricing-card ul{list-style:none;text-align:left;margin:24px 0}
.pricing-card li{padding:8px 0;font-size:15px;color:#475569}.pricing-card li::before{content:'✓';color:#22c55e;font-weight:700;margin-right:8px}
.cta{padding:80px 0;text-align:center;background:#1e293b;color:#fff}
.cta h2{font-size:36px;margin-bottom:16px}.cta p{color:#94a3b8;font-size:18px;margin-bottom:32px}
footer{padding:40px 0;text-align:center;color:#94a3b8;font-size:14px;border-top:1px solid #e2e8f0}
@media(max-width:768px){.hero h1{font-size:32px}.features-grid,.steps,.pricing-grid{grid-template-columns:1fr}}
</style></head><body>
<nav class="nav"><div class="container nav-inner"><a href="/" class="nav-brand">⭐ ReviewFlow</a>
<div class="nav-links"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="/login">Log In</a><a href="/signup" class="btn btn-primary btn-sm">Start Free</a></div></div></nav>

<section class="hero"><div class="container">
<h1>Get More <span>5-Star Reviews</span><br>Without the Hassle</h1>
<p>ReviewFlow helps local businesses collect Google reviews on autopilot. Smart review routing sends happy customers to Google — and catches unhappy ones before they go public.</p>
<a href="/signup" class="btn btn-primary" style="padding:16px 40px;font-size:17px">Start Collecting Reviews — Free</a>
<a href="#demo" class="btn btn-secondary" style="padding:16px 32px;font-size:17px;margin-left:12px">Try Live Demo ↓</a>
<p style="font-size:14px;color:#94a3b8;margin-top:12px">No credit card required · Set up in 2 minutes</p>
</div></section>

<section id="demo" style="padding:60px 0;background:#fff"><div class="container" style="max-width:900px;margin:0 auto">
<h2 style="text-align:center;font-size:36px;margin-bottom:8px">Try It Right Now</h2>
<p style="text-align:center;color:#64748b;font-size:18px;margin-bottom:32px">Enter your business name to see what your review page would look like — no signup needed.</p>
<div style="display:flex;gap:12px;max-width:500px;margin:0 auto 32px;flex-wrap:wrap">
<input type="text" id="demo-name" placeholder="e.g. Joe's Coffee Shop" style="flex:1;padding:14px 18px;border:2px solid #e2e8f0;border-radius:10px;font-size:16px;min-width:200px" oninput="updateDemo()">
<input type="color" id="demo-color" value="#2563eb" style="width:52px;height:52px;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;padding:4px" oninput="updateDemo()">
</div>
<div style="display:flex;justify-content:center"><div id="demo-preview" style="background:#f8fafc;border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,.12);max-width:420px;width:100%;padding:40px 32px;text-align:center;transition:all .3s">
<div id="dp-name" style="font-size:24px;font-weight:700;color:#1e293b;margin-bottom:8px">Your Business Name</div>
<div style="font-size:18px;color:#475569;margin-bottom:24px">How was your experience?</div>
<div style="display:flex;justify-content:center;gap:8px;margin-bottom:24px" id="demo-stars">
<span class="dstar" style="font-size:48px;cursor:pointer;filter:grayscale(1) opacity(.3);transition:all .15s" onclick="demoPick(1)">⭐</span>
<span class="dstar" style="font-size:48px;cursor:pointer;filter:grayscale(1) opacity(.3);transition:all .15s" onclick="demoPick(2)">⭐</span>
<span class="dstar" style="font-size:48px;cursor:pointer;filter:grayscale(1) opacity(.3);transition:all .15s" onclick="demoPick(3)">⭐</span>
<span class="dstar" style="font-size:48px;cursor:pointer;filter:grayscale(1) opacity(.3);transition:all .15s" onclick="demoPick(4)">⭐</span>
<span class="dstar" style="font-size:48px;cursor:pointer;filter:grayscale(1) opacity(.3);transition:all .15s" onclick="demoPick(5)">⭐</span>
</div>
<div id="demo-result" style="display:none"></div>
<div style="margin-top:20px;font-size:12px;color:#cbd5e1">Powered by <span style="color:#94a3b8">ReviewFlow</span></div>
</div></div>
<div style="text-align:center;margin-top:32px">
<a href="#" onclick="var n=document.getElementById('demo-name').value||'Your Business';window.open('/demo/'+encodeURIComponent(n)+'?color='+encodeURIComponent(document.getElementById('demo-color').value),'_blank');return false" class="btn btn-secondary" style="padding:14px 28px;font-size:16px;margin-right:12px">Open Full Preview ↗</a>
<a href="/signup" class="btn btn-primary" style="padding:14px 36px;font-size:16px">Create Your Review Page Free →</a></div>
</div>
<script>
function updateDemo(){var n=document.getElementById('demo-name').value||'Your Business Name';document.getElementById('dp-name').textContent=n;resetDemo()}
function resetDemo(){document.querySelectorAll('.dstar').forEach(s=>{s.style.filter='grayscale(1) opacity(.3)';s.style.transform='scale(1)'});document.getElementById('demo-result').style.display='none'}
function demoPick(r){var stars=document.querySelectorAll('.dstar');stars.forEach((s,i)=>{s.style.filter=i<r?'none':'grayscale(1) opacity(.3)';s.style.transform=i<r?'scale(1.15)':'scale(1)'});
var c=document.getElementById('demo-color').value;var dr=document.getElementById('demo-result');dr.style.display='block';
if(r>=4){dr.innerHTML='<div style="margin:16px 0"><div style="font-size:48px;margin-bottom:12px">🎉</div><p style="font-size:16px;color:#475569">Great! The customer gets redirected to <strong>Google Reviews</strong>.</p><button style="margin-top:12px;padding:12px 24px;background:'+c+';color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:default">Leave a Google Review →</button></div>'}
else{dr.innerHTML='<div style="margin:16px 0"><div style="font-size:48px;margin-bottom:12px">🛡️</div><p style="font-size:16px;color:#475569">This feedback stays <strong>private</strong> — it never reaches Google.</p><div style="margin-top:12px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:left"><div style="font-size:13px;color:#94a3b8;margin-bottom:4px">Private feedback form appears here</div><div style="background:#f1f5f9;border-radius:4px;height:32px;margin-bottom:8px"></div><div style="background:#f1f5f9;border-radius:4px;height:60px"></div></div></div>'}}
</script></section>

<section id="features" class="features"><div class="container">
<h2 style="text-align:center;font-size:36px;margin-bottom:40px">Everything You Need to Own Your Reviews</h2>
<div class="features-grid">
<div class="feature-card"><div class="feature-icon">🛡️</div><h3>Smart Review Gate</h3><p>Happy customers get sent to Google. Unhappy ones send you private feedback instead.</p></div>
<div class="feature-card"><div class="feature-icon">📱</div><h3>QR Codes</h3><p>Print QR codes for your counter, receipts, tables, or business cards.</p></div>
<div class="feature-card"><div class="feature-icon">📊</div><h3>Real-Time Analytics</h3><p>Track every page view, review, and rating. See how your reputation is trending.</p></div>
<div class="feature-card"><div class="feature-icon">✉️</div><h3>Ready-Made Templates</h3><p>Copy-paste SMS and email templates to request reviews after every visit.</p></div>
<div class="feature-card"><div class="feature-icon">🎨</div><h3>Branded Review Page</h3><p>Your own custom review page with your business name and colors.</p></div>
<div class="feature-card"><div class="feature-icon">⚡</div><h3>2-Minute Setup</h3><p>No technical skills needed. Just paste your Google review link and you're live.</p></div>
</div></div></section>

<section class="how-it-works"><div class="container">
<h2 style="text-align:center;font-size:36px">How It Works</h2>
<div class="steps">
<div class="step"><div class="step-number">1</div><h3>Add Your Business</h3><p>Enter your business name and paste your Google review link.</p></div>
<div class="step"><div class="step-number">2</div><h3>Share With Customers</h3><p>Use QR codes, text messages, or email to send customers to your review page.</p></div>
<div class="step"><div class="step-number">3</div><h3>Watch Reviews Grow</h3><p>Happy customers leave Google reviews. Unhappy ones send private feedback.</p></div>
</div></div></section>

<section id="pricing" class="pricing-section"><div class="container">
<h2 style="text-align:center;font-size:36px;margin-bottom:8px">Simple, Honest Pricing</h2>
<p style="text-align:center;color:#64748b;font-size:18px">Start free. Upgrade when you need more.</p>
<div class="pricing-grid">
<div class="pricing-card"><h3>Free</h3><div class="price">$0<span>/mo</span></div>
<ul><li>1 location</li><li>Branded review page</li><li>QR code</li><li>Basic analytics</li><li>Smart review gate</li></ul>
<a href="/signup" class="btn btn-secondary" style="width:100%">Get Started</a></div>
<div class="pricing-card featured"><h3>Starter</h3><div class="price">$29<span>/mo</span></div>
<ul><li>Everything in Free</li><li>SMS &amp; email templates</li><li>Advanced analytics</li><li>Custom thank-you messages</li><li>Priority support</li></ul>
<a href="/signup" class="btn btn-primary" style="width:100%">Start Free Trial</a></div>
<div class="pricing-card"><h3>Growth</h3><div class="price">$79<span>/mo</span></div>
<ul><li>Everything in Starter</li><li>Up to 5 locations</li><li>Team access</li><li>Review response templates</li><li>Dedicated support</li></ul>
<a href="/signup" class="btn btn-secondary" style="width:100%">Start Free Trial</a></div>
</div></div></section>

<section class="cta"><div class="container">
<h2>Every Day Without Reviews Is a Day You Lose Customers</h2>
<p>Businesses with more reviews get more clicks, more calls, and more customers.</p>
<a href="/signup" class="btn btn-primary" style="padding:16px 48px;font-size:17px">Start Free — No Credit Card</a>
</div></section>
<footer><div class="container"><p>&copy; 2026 ReviewFlow. All rights reserved.</p></div></footer>
</body></html>`);
});

// ===== AUTH =====
app.get('/login', (req, res) => { if (req.session.userId) return res.redirect('/dashboard'); res.send(authPage('login')); });
app.get('/signup', (req, res) => { if (req.session.userId) return res.redirect('/dashboard'); res.send(authPage('signup')); });

app.post('/signup', (req, res) => {
  const { email, password, business_name } = req.body;
  if (!email || !password) return res.send(authPage('signup', 'Email and password required'));
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return res.send(authPage('signup', 'Email already registered'));
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, email, password_hash, business_name) VALUES (?,?,?,?)').run(id, email, bcrypt.hashSync(password, 10), business_name || '');
  req.session.userId = id;
  res.redirect('/dashboard');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.send(authPage('login', 'Invalid email or password'));
  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

function authPage(mode, error) {
  const isLogin = mode === 'login';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${isLogin ? 'Log In' : 'Sign Up'} — ReviewFlow</title>${css()}
<style>body{background:#f8fafc}.auth-wrap{max-width:440px;margin:80px auto;padding:0 24px}.auth-card{background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:40px}
.auth-card h1{font-size:28px;margin-bottom:8px;text-align:center}.auth-card .subtitle{color:#64748b;text-align:center;margin-bottom:32px}
.auth-footer{text-align:center;margin-top:24px;font-size:14px;color:#64748b}.auth-footer a{color:#2563eb;text-decoration:none}</style></head><body>
<nav class="nav"><div class="container nav-inner"><a href="/" class="nav-brand">⭐ ReviewFlow</a><div></div></div></nav>
<div class="auth-wrap"><div class="auth-card">
<h1>${isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>
<p class="subtitle">${isLogin ? 'Log in to your dashboard' : 'Start collecting reviews in 2 minutes'}</p>
${error ? `<div class="alert alert-error">${error}</div>` : ''}
<form method="POST" action="/${mode}">
${!isLogin ? '<div class="form-group"><label>Business Name</label><input type="text" name="business_name" placeholder="e.g. Joe\'s Coffee"></div>' : ''}
<div class="form-group"><label>Email</label><input type="email" name="email" required placeholder="you@business.com"></div>
<div class="form-group"><label>Password</label><input type="password" name="password" required minlength="6" placeholder="${isLogin?'Your password':'Create a password'}"></div>
<button type="submit" class="btn btn-primary" style="width:100%;padding:14px">${isLogin ? 'Log In' : 'Create Account'}</button>
</form>
<div class="auth-footer">${isLogin ? "Don't have an account? <a href='/signup'>Sign up free</a>" : "Already have an account? <a href='/login'>Log in</a>"}</div>
</div></div></body></html>`;
}

// ===== DASHBOARD =====
function dashLayout(user, content) {
  const pb = user.plan === 'growth' ? 'badge-growth' : user.plan === 'starter' ? 'badge-starter' : 'badge-free';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Dashboard — ReviewFlow</title>${css()}<style>body{background:#f8fafc}.dashboard{padding:32px 0}</style></head><body>
<nav class="nav"><div class="container nav-inner"><a href="/dashboard" class="nav-brand">⭐ ReviewFlow</a>
<div class="nav-links"><span class="badge ${pb}">${user.plan.toUpperCase()}</span><a href="/pricing">Upgrade</a><a href="/logout">Log Out</a></div></div></nav>
<div class="dashboard"><div class="container">${content}</div></div></body></html>`;
}

app.get('/dashboard', requireAuth, (req, res) => {
  const user = getUser(req);
  const locations = db.prepare('SELECT * FROM locations WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  const locs = locations.map(loc => {
    const views = db.prepare('SELECT COUNT(*) as c FROM page_views WHERE location_id = ?').get(loc.id).c;
    const total = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id = ?').get(loc.id).c;
    const google = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id = ? AND redirected_to_google = 1').get(loc.id).c;
    const avg = db.prepare('SELECT AVG(rating) as a FROM reviews WHERE location_id = ?').get(loc.id).a || 0;
    const caught = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id = ? AND rating < ? AND redirected_to_google = 0').get(loc.id, loc.gate_threshold).c;
    return { ...loc, views, total, google, avg: avg.toFixed(1), caught };
  });

  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px">
<h1 style="font-size:28px">Your Locations</h1><a href="/locations/new" class="btn btn-primary">+ Add Location</a></div>`;

  if (!locs.length) {
    html += `<div class="card" style="text-align:center;padding:60px 20px"><div style="font-size:48px;margin-bottom:16px">🏪</div>
<h2>Add Your First Business Location</h2><p style="color:#64748b;margin:16px 0 24px">Set up your review collection page in under 2 minutes</p>
<a href="/locations/new" class="btn btn-primary">+ Add Location</a></div>`;
  } else {
    locs.forEach(l => {
      html += `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
<div><h3 style="font-size:20px">${esc(l.business_name)}</h3><span style="color:#64748b;font-size:14px">${esc(l.business_type||'Business')}</span></div>
<div style="display:flex;gap:8px;flex-wrap:wrap">
<a href="/r/${l.slug}" target="_blank" class="btn btn-secondary btn-sm">Preview</a>
<a href="/locations/${l.id}/qr" class="btn btn-secondary btn-sm">QR Code</a>
<a href="/locations/${l.id}/share" class="btn btn-secondary btn-sm">Share</a>
<a href="/locations/${l.id}/analytics" class="btn btn-secondary btn-sm">Analytics</a>
<a href="/locations/${l.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
</div></div>
<div class="stat-grid">
<div class="stat-card"><div class="stat-value">${l.views}</div><div class="stat-label">Page Views</div></div>
<div class="stat-card"><div class="stat-value">${l.total}</div><div class="stat-label">Total Reviews</div></div>
<div class="stat-card"><div class="stat-value">${l.google}</div><div class="stat-label">Sent to Google</div></div>
<div class="stat-card"><div class="stat-value">${l.avg}★</div><div class="stat-label">Avg Rating</div></div>
<div class="stat-card"><div class="stat-value" style="color:#22c55e">${l.caught}</div><div class="stat-label">Bad Reviews Caught</div></div>
</div></div>`;
    });
  }
  res.send(dashLayout(user, html));
});

// ===== LOCATIONS =====
app.get('/locations/new', requireAuth, (req, res) => {
  const user = getUser(req);
  const count = db.prepare('SELECT COUNT(*) as c FROM locations WHERE user_id = ?').get(user.id).c;
  const max = user.plan === 'growth' ? 5 : 1;
  if (count >= max && user.plan !== 'growth') {
    return res.send(dashLayout(user, '<div class="card" style="text-align:center;padding:60px"><h2>Upgrade to Add More Locations</h2><p style="color:#64748b;margin:16px 0"><a href="/pricing" class="btn btn-primary">View Plans</a></p></div>'));
  }
  res.send(locForm(user));
});

app.post('/locations', requireAuth, (req, res) => {
  const user = getUser(req);
  const { business_name, business_type, google_review_url, primary_color, gate_threshold } = req.body;
  if (!business_name || !google_review_url) return res.send(locForm(user, 'Business name and Google review URL are required'));
  const id = uuidv4();
  const slug = business_name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+id.slice(0,6);
  db.prepare('INSERT INTO locations (id,user_id,slug,business_name,business_type,google_review_url,primary_color,gate_threshold) VALUES (?,?,?,?,?,?,?,?)').run(id,user.id,slug,business_name,business_type||'',google_review_url,primary_color||'#2563eb',parseInt(gate_threshold)||4);
  res.redirect('/dashboard');
});

app.get('/locations/:id/edit', requireAuth, (req, res) => {
  const user = getUser(req);
  const loc = db.prepare('SELECT * FROM locations WHERE id=? AND user_id=?').get(req.params.id, user.id);
  if (!loc) return res.redirect('/dashboard');
  res.send(locForm(user, null, loc));
});

app.post('/locations/:id/edit', requireAuth, (req, res) => {
  const user = getUser(req);
  const { business_name, business_type, google_review_url, primary_color, gate_threshold, thank_you_message } = req.body;
  db.prepare('UPDATE locations SET business_name=?,business_type=?,google_review_url=?,primary_color=?,gate_threshold=?,thank_you_message=? WHERE id=? AND user_id=?')
    .run(business_name,business_type||'',google_review_url,primary_color||'#2563eb',parseInt(gate_threshold)||4,thank_you_message||'Thank you!',req.params.id,user.id);
  res.redirect('/dashboard');
});

app.post('/locations/:id/delete', requireAuth, (req, res) => {
  const user = getUser(req);
  db.prepare('DELETE FROM reviews WHERE location_id IN (SELECT id FROM locations WHERE id=? AND user_id=?)').run(req.params.id,user.id);
  db.prepare('DELETE FROM page_views WHERE location_id IN (SELECT id FROM locations WHERE id=? AND user_id=?)').run(req.params.id,user.id);
  db.prepare('DELETE FROM locations WHERE id=? AND user_id=?').run(req.params.id,user.id);
  res.redirect('/dashboard');
});

function locForm(user, error, loc) {
  const isEdit = !!loc;
  const types = ['Restaurant','Salon/Spa','Dental Office','Medical Practice','Auto Shop','Real Estate','Legal Services','Home Services','Retail Store','Fitness/Gym','Other'];
  return dashLayout(user, `<div style="max-width:600px;margin:0 auto">
<h1 style="font-size:28px;margin-bottom:24px">${isEdit?'Edit Location':'Add New Location'}</h1>
${error?`<div class="alert alert-error">${error}</div>`:''}
<div class="card"><form method="POST" action="${isEdit?`/locations/${loc.id}/edit`:'/locations'}">
<div class="form-group"><label>Business Name *</label><input type="text" name="business_name" required value="${esc(loc?.business_name||'')}" placeholder="e.g. Joe's Coffee"></div>
<div class="form-group"><label>Business Type</label><select name="business_type">${types.map(t=>`<option value="${t}" ${loc?.business_type===t?'selected':''}>${t}</option>`).join('')}</select></div>
<div class="form-group"><label>Google Review URL *</label><input type="url" name="google_review_url" required value="${esc(loc?.google_review_url||'')}" placeholder="https://g.page/r/...">
<div class="form-hint">Go to Google Business Profile → Share review link</div></div>
<div class="form-group"><label>Brand Color</label><input type="color" name="primary_color" value="${loc?.primary_color||'#2563eb'}" style="width:80px;height:40px;padding:4px"></div>
<div class="form-group"><label>Review Gate Threshold</label><select name="gate_threshold">${[3,4,5].map(n=>`<option value="${n}" ${(loc?.gate_threshold||4)==n?'selected':''}>${n}+ stars → Google</option>`).join('')}</select>
<div class="form-hint">Below this rating → private feedback form</div></div>
${isEdit?`<div class="form-group"><label>Thank You Message</label><textarea name="thank_you_message" rows="2">${esc(loc?.thank_you_message||'')}</textarea></div>`:''}
<div style="display:flex;gap:12px"><button type="submit" class="btn btn-primary">${isEdit?'Save Changes':'Create Location'}</button><a href="/dashboard" class="btn btn-secondary">Cancel</a></div>
</form></div>
${isEdit?`<div class="card" style="margin-top:24px;border-color:#fecaca"><h3 style="color:#dc2626;margin-bottom:12px">Danger Zone</h3>
<form method="POST" action="/locations/${loc.id}/delete" onsubmit="return confirm('Delete this location?')">
<button type="submit" class="btn btn-danger btn-sm">Delete Location</button></form></div>`:''}</div>`);
}

// ===== ANALYTICS =====
app.get('/locations/:id/analytics', requireAuth, (req, res) => {
  const user = getUser(req);
  const loc = db.prepare('SELECT * FROM locations WHERE id=? AND user_id=?').get(req.params.id,user.id);
  if (!loc) return res.redirect('/dashboard');
  const reviews = db.prepare('SELECT * FROM reviews WHERE location_id=? ORDER BY created_at DESC LIMIT 50').all(loc.id);
  const tv = db.prepare('SELECT COUNT(*) as c FROM page_views WHERE location_id=?').get(loc.id).c;
  const tr = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id=?').get(loc.id).c;
  const gr = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id=? AND redirected_to_google=1').get(loc.id).c;
  const nc = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id=? AND rating<?').get(loc.id,loc.gate_threshold).c;
  const avg = (db.prepare('SELECT AVG(rating) as a FROM reviews WHERE location_id=?').get(loc.id).a||0).toFixed(1);
  const rd = {};
  for (let i=1;i<=5;i++) rd[i] = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE location_id=? AND rating=?').get(loc.id,i).c;

  let bars = '';
  for (let i=5;i>=1;i--) {
    const pct = tr > 0 ? (rd[i]/tr*100) : 0;
    bars += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
<span style="width:24px;text-align:right;font-size:14px;font-weight:600">${i}★</span>
<div style="flex:1;background:#f1f5f9;border-radius:4px;height:20px;overflow:hidden">
<div style="height:100%;background:${i>=4?'#22c55e':i===3?'#eab308':'#ef4444'};width:${pct}%;border-radius:4px"></div></div>
<span style="width:30px;font-size:13px;color:#64748b">${rd[i]}</span></div>`;
  }

  let rl = reviews.map(r=>`<div style="padding:16px 0;border-bottom:1px solid #f1f5f9;display:flex;gap:16px">
<div style="font-size:24px">${r.rating>=4?'😊':r.rating===3?'😐':'😟'}</div><div style="flex:1">
<div style="display:flex;justify-content:space-between"><div><strong>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</strong>
${r.redirected_to_google?'<span style="font-size:12px;background:#dbeafe;color:#2563eb;padding:2px 8px;border-radius:4px;margin-left:8px">→ Google</span>':'<span style="font-size:12px;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:4px;margin-left:8px">Private</span>'}
</div><span style="font-size:13px;color:#94a3b8">${new Date(r.created_at).toLocaleDateString()}</span></div>
${r.feedback?`<p style="margin-top:8px;color:#475569;font-size:14px">${esc(r.feedback)}</p>`:''}
${r.customer_name?`<p style="margin-top:4px;font-size:13px;color:#94a3b8">— ${esc(r.customer_name)}</p>`:''}</div></div>`).join('');

  res.send(dashLayout(user, `<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
<a href="/dashboard" style="color:#64748b;text-decoration:none;font-size:14px">← Back</a>
<h1 style="font-size:28px">${esc(loc.business_name)} — Analytics</h1></div>
<div class="stat-grid">
<div class="stat-card"><div class="stat-value">${tv}</div><div class="stat-label">Page Views</div></div>
<div class="stat-card"><div class="stat-value">${tr}</div><div class="stat-label">Total Reviews</div></div>
<div class="stat-card"><div class="stat-value">${gr}</div><div class="stat-label">Sent to Google</div></div>
<div class="stat-card"><div class="stat-value">${avg}★</div><div class="stat-label">Avg Rating</div></div>
<div class="stat-card"><div class="stat-value" style="color:#22c55e">${nc}</div><div class="stat-label">Bad Reviews Caught</div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div class="card"><h3 style="margin-bottom:16px">Rating Distribution</h3>${bars}</div>
<div class="card"><h3 style="margin-bottom:16px">Conversion Rate</h3>
<div style="text-align:center;padding:20px"><div style="font-size:48px;font-weight:800;color:#2563eb">${tv>0?Math.round(tr/tv*100):0}%</div>
<div style="color:#64748b;font-size:14px;margin-top:8px">Visitors → Reviews</div></div></div></div>
<div class="card" style="margin-top:16px"><h3 style="margin-bottom:16px">Recent Reviews</h3>
${rl||'<p style="color:#94a3b8;text-align:center;padding:32px">No reviews yet</p>'}</div>`));
});

// ===== QR CODE =====
app.get('/locations/:id/qr', requireAuth, async (req, res) => {
  const user = getUser(req);
  const loc = db.prepare('SELECT * FROM locations WHERE id=? AND user_id=?').get(req.params.id,user.id);
  if (!loc) return res.redirect('/dashboard');
  const url = `${BASE_URL}/r/${loc.slug}`;
  const qr = await QRCode.toDataURL(url, { width: 400, margin: 2 });
  res.send(dashLayout(user, `<div style="max-width:600px;margin:0 auto;text-align:center">
<a href="/dashboard" style="color:#64748b;text-decoration:none;font-size:14px;display:block;text-align:left;margin-bottom:16px">← Back</a>
<h1 style="font-size:28px;margin-bottom:8px">QR Code</h1><p style="color:#64748b;margin-bottom:24px">${esc(loc.business_name)}</p>
<div class="card" style="padding:40px"><img src="${qr}" style="width:280px;height:280px;margin:0 auto;display:block">
<p style="margin-top:24px;font-size:14px;color:#64748b;word-break:break-all">${url}</p>
<div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
<a href="/locations/${loc.id}/qr.png" download="reviewflow-qr.png" class="btn btn-primary">Download PNG</a>
<button onclick="navigator.clipboard.writeText('${url}');this.textContent='Copied!'" class="btn btn-secondary">Copy Link</button></div></div>
<div class="card" style="text-align:left;margin-top:16px"><h3 style="margin-bottom:12px">💡 Where to use your QR code</h3>
<ul style="color:#475569;font-size:15px;list-style:disc;padding-left:20px;line-height:2">
<li>Print on receipts</li><li>Display at your counter</li><li>Table tents in restaurants</li><li>Business cards</li><li>Email signatures</li></ul></div></div>`));
});

app.get('/locations/:id/qr.png', requireAuth, async (req, res) => {
  const user = getUser(req);
  const loc = db.prepare('SELECT * FROM locations WHERE id=? AND user_id=?').get(req.params.id,user.id);
  if (!loc) return res.status(404).send('Not found');
  const buf = await QRCode.toBuffer(`${BASE_URL}/r/${loc.slug}`, { width: 600, margin: 2 });
  res.type('image/png').send(buf);
});

// ===== SHARE =====
app.get('/locations/:id/share', requireAuth, (req, res) => {
  const user = getUser(req);
  const loc = db.prepare('SELECT * FROM locations WHERE id=? AND user_id=?').get(req.params.id,user.id);
  if (!loc) return res.redirect('/dashboard');
  const url = `${BASE_URL}/r/${loc.slug}`;
  const sms = `Hi! Thanks for visiting ${loc.business_name}. We'd love your feedback — takes 30 seconds: ${url}`;
  const emailBody = `Hi there,\n\nThank you for choosing ${loc.business_name}!\n\nWe'd really appreciate it if you could share your feedback:\n${url}\n\nThank you!\n${loc.business_name}`;
  res.send(dashLayout(user, `<div style="max-width:700px;margin:0 auto">
<a href="/dashboard" style="color:#64748b;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">← Back</a>
<h1 style="font-size:28px;margin-bottom:24px">Share &amp; Templates — ${esc(loc.business_name)}</h1>
<div class="card"><h3 style="margin-bottom:12px">📋 Your Review Link</h3>
<div style="display:flex;gap:8px"><input type="text" value="${url}" readonly style="background:#f8fafc" id="link">
<button onclick="navigator.clipboard.writeText(document.getElementById('link').value);this.textContent='Copied!'" class="btn btn-primary btn-sm" style="white-space:nowrap">Copy Link</button></div></div>
<div class="card"><h3 style="margin-bottom:12px">💬 SMS Template</h3>
<textarea id="sms" rows="3" style="background:#f8fafc" readonly>${sms}</textarea>
<button onclick="navigator.clipboard.writeText(document.getElementById('sms').value);this.textContent='Copied!'" class="btn btn-secondary btn-sm" style="margin-top:8px">Copy SMS</button></div>
<div class="card"><h3 style="margin-bottom:12px">✉️ Email Template</h3>
<div class="form-group"><label>Subject</label><input type="text" value="How was your experience at ${esc(loc.business_name)}?" readonly style="background:#f8fafc" id="subj"></div>
<textarea id="ebody" rows="6" style="background:#f8fafc" readonly>${esc(emailBody)}</textarea>
<button onclick="navigator.clipboard.writeText(document.getElementById('subj').value+'\\n\\n'+document.getElementById('ebody').value);this.textContent='Copied!'" class="btn btn-secondary btn-sm" style="margin-top:8px">Copy Email</button></div>
<div class="card"><h3 style="margin-bottom:12px">🖨️ Print Materials</h3><a href="/locations/${loc.id}/qr" class="btn btn-secondary btn-sm">Get QR Code →</a></div></div>`));
});

// ===== DEMO PREVIEW PAGE =====
app.get('/demo/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name).slice(0,100);
  const c = req.query.color || '#2563eb';
  const th = 4;
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Demo — ${esc(name)} | ReviewFlow</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.demo-bar{position:fixed;top:0;left:0;right:0;background:#1e293b;color:#fff;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;z-index:99;font-size:14px}
.demo-bar a{color:#fff;background:#2563eb;padding:8px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
.rc{background:#fff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:420px;width:100%;padding:40px 32px;text-align:center;margin-top:40px}
.bn{font-size:24px;font-weight:700;margin-bottom:8px;color:#1e293b}
.prompt{font-size:18px;color:#475569;margin-bottom:24px}
.stars{display:flex;justify-content:center;gap:8px;margin-bottom:32px}
.star{font-size:48px;cursor:pointer;transition:transform .15s;user-select:none;filter:grayscale(1) opacity(.3)}
.star:hover,.star.active{filter:none;transform:scale(1.2)}
.ff{display:none;margin-top:24px;text-align:left}.ff.show{display:block}
.ff label{font-weight:600;font-size:14px;margin-bottom:6px;display:block;color:#374151}
.ff input,.ff textarea{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;font-family:inherit;margin-bottom:16px}
.sb{width:100%;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;background:${esc(c)};color:#fff}
.result{display:none;text-align:center}.result.show{display:block}
.pw{margin-top:32px;font-size:12px;color:#cbd5e1}
</style></head><body>
<div class="demo-bar"><span>🔍 This is a demo preview — <strong>${esc(name)}</strong></span><a href="/signup">Create Your Own →</a></div>
<div class="rc">
<div id="s1"><div class="bn">${esc(name)}</div>
<div class="prompt">How was your experience?</div>
<div class="stars">${[1,2,3,4,5].map(i=>`<div class="star" data-r="${i}" onclick="sel(${i})">⭐</div>`).join('')}</div></div>
<div id="s2" class="ff">
<div id="fp" style="display:none;text-align:center;margin-bottom:24px"><div style="font-size:48px;margin-bottom:12px">🎉</div>
<p style="font-size:18px;color:#475569">We're thrilled! Would you share your experience on Google?</p></div>
<div id="fn" style="display:none"><p style="font-size:16px;color:#475569;margin-bottom:20px;text-align:center">We're sorry. Please tell us how we can improve:</p>
<label>Your Name (optional)</label><input type="text" placeholder="Your name">
<label>What could we do better?</label><textarea rows="4" placeholder="Tell us about your experience..."></textarea></div>
<button class="sb" id="sbtn" onclick="demoSubmit()">Submit</button></div>
<div id="s3" class="result"><div style="font-size:64px;margin-bottom:16px" id="ri">🙏</div><div style="font-size:18px;color:#475569" id="rm"></div>
<div style="margin-top:24px"><a href="/signup" style="display:inline-block;padding:12px 24px;background:${esc(c)};color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Get This For Your Business →</a></div></div>
<div class="pw">Powered by <a href="/" style="color:#94a3b8;text-decoration:none">ReviewFlow</a></div></div>
<script>
let rating=0;
function sel(r){rating=r;document.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('active',i<r));
setTimeout(()=>{document.getElementById('s1').style.display='none';const f=document.getElementById('s2');f.classList.add('show');
if(r>=${th}){document.getElementById('fp').style.display='block';document.getElementById('fn').style.display='none';document.getElementById('sbtn').textContent='Leave a Google Review →'}
else{document.getElementById('fp').style.display='none';document.getElementById('fn').style.display='block';document.getElementById('sbtn').textContent='Send Private Feedback'}},300)}
function demoSubmit(){document.getElementById('s2').style.display='none';var res=document.getElementById('s3');res.classList.add('show');
if(rating>=${th}){document.getElementById('ri').textContent='🌟';document.getElementById('rm').innerHTML='In production, the customer would be redirected to <strong>Google Reviews</strong> right now.'}
else{document.getElementById('ri').textContent='🛡️';document.getElementById('rm').innerHTML='This negative feedback stays <strong>private</strong> — it never reaches Google.'}}
</script></body></html>`);
});

// ===== PUBLIC REVIEW PAGE =====
app.get('/r/:slug', (req, res) => {
  const loc = db.prepare('SELECT * FROM locations WHERE slug=?').get(req.params.slug);
  if (!loc) return res.status(404).send('<h1>Not Found</h1>');
  db.prepare('INSERT INTO page_views (location_id) VALUES (?)').run(loc.id);
  const c = loc.primary_color || '#2563eb';
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Review ${esc(loc.business_name)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.rc{background:#fff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:420px;width:100%;padding:40px 32px;text-align:center}
.bn{font-size:24px;font-weight:700;margin-bottom:8px;color:#1e293b}.bt{font-size:14px;color:#94a3b8;margin-bottom:32px}
.prompt{font-size:18px;color:#475569;margin-bottom:24px}
.stars{display:flex;justify-content:center;gap:8px;margin-bottom:32px}
.star{font-size:48px;cursor:pointer;transition:transform .15s;user-select:none;filter:grayscale(1) opacity(.3)}
.star:hover,.star.active{filter:none;transform:scale(1.2)}
.ff{display:none;margin-top:24px;text-align:left}.ff.show{display:block}
.ff label{font-weight:600;font-size:14px;margin-bottom:6px;display:block;color:#374151}
.ff input,.ff textarea{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;font-family:inherit;margin-bottom:16px}
.ff input:focus,.ff textarea:focus{outline:none;border-color:${c}}
.sb{width:100%;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;background:${c};color:#fff;transition:opacity .2s}.sb:hover{opacity:.9}
.result{display:none;text-align:center}.result.show{display:block}.ri{font-size:64px;margin-bottom:16px}.rm{font-size:18px;color:#475569}
.pw{margin-top:32px;font-size:12px;color:#cbd5e1}.pw a{color:#94a3b8;text-decoration:none}
</style></head><body>
<div class="rc">
<div id="s1"><div class="bn">${esc(loc.business_name)}</div>
${loc.business_type?`<div class="bt">${esc(loc.business_type)}</div>`:''}
<div class="prompt">How was your experience?</div>
<div class="stars" id="stars">${[1,2,3,4,5].map(i=>`<div class="star" data-r="${i}" onclick="sel(${i})">⭐</div>`).join('')}</div></div>
<div id="s2" class="ff">
<div id="fp" style="display:none;text-align:center;margin-bottom:24px"><div style="font-size:48px;margin-bottom:12px">🎉</div>
<p style="font-size:18px;color:#475569">We're thrilled! Would you share your experience on Google?</p></div>
<div id="fn" style="display:none"><p style="font-size:16px;color:#475569;margin-bottom:20px;text-align:center">We're sorry. Please tell us how we can improve:</p>
<label>Your Name (optional)</label><input type="text" id="cn" placeholder="Your name">
<label>Email (optional)</label><input type="email" id="ce" placeholder="your@email.com">
<label>What could we do better?</label><textarea id="fb" rows="4" placeholder="Tell us about your experience..."></textarea></div>
<button class="sb" onclick="submit()" id="sbtn">Submit</button></div>
<div id="s3" class="result"><div class="ri" id="ri">🙏</div><div class="rm" id="rm"></div></div>
<div class="pw">Powered by <a href="${BASE_URL}">ReviewFlow</a></div></div>
<script>
let rating=0;const th=${loc.gate_threshold};
function sel(r){rating=r;document.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('active',i<r));
setTimeout(()=>{document.getElementById('s1').style.display='none';const f=document.getElementById('s2');f.classList.add('show');
if(r>=th){document.getElementById('fp').style.display='block';document.getElementById('fn').style.display='none';document.getElementById('sbtn').textContent='Leave a Google Review →'}
else{document.getElementById('fp').style.display='none';document.getElementById('fn').style.display='block';document.getElementById('sbtn').textContent='Send Feedback'}},300)}
async function submit(){const b=document.getElementById('sbtn');b.disabled=true;b.textContent='Submitting...';
try{const r=await fetch('/r/${loc.slug}/submit',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({rating,feedback:document.getElementById('fb')?.value||'',customer_name:document.getElementById('cn')?.value||'',customer_email:document.getElementById('ce')?.value||''})});
const d=await r.json();document.getElementById('s2').style.display='none';const res=document.getElementById('s3');res.classList.add('show');
if(d.redirect&&d.google_url){document.getElementById('ri').textContent='🌟';document.getElementById('rm').textContent='Thank you! Redirecting to Google...';
setTimeout(()=>window.location.href=d.google_url,1500)}else{document.getElementById('ri').textContent='🙏';document.getElementById('rm').textContent=d.message||'Thank you!'}}
catch(e){b.disabled=false;b.textContent='Try Again'}}
</script></body></html>`);
});

app.post('/r/:slug/submit', (req, res) => {
  const loc = db.prepare('SELECT * FROM locations WHERE slug=?').get(req.params.slug);
  if (!loc) return res.status(404).json({ error: 'Not found' });
  const { rating, feedback, customer_name, customer_email } = req.body;
  const r = parseInt(rating);
  if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'Invalid rating' });
  const redir = r >= loc.gate_threshold;
  db.prepare('INSERT INTO reviews (id,location_id,rating,feedback,customer_name,customer_email,redirected_to_google) VALUES (?,?,?,?,?,?,?)')
    .run(uuidv4(), loc.id, r, feedback||'', customer_name||'', customer_email||'', redir?1:0);
  res.json({ success: true, redirect: redir, google_url: redir ? loc.google_review_url : null, message: redir ? 'Redirecting...' : loc.thank_you_message });
});

// ===== PRICING / STRIPE =====
app.get('/pricing', (req, res) => {
  const user = getUser(req);
  const loggedIn = !!user;
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Pricing — ReviewFlow</title>${css()}
<style>body{background:#f8fafc}.pw{max-width:900px;margin:0 auto;padding:60px 24px}
.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pc{background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center}
.pc.ft{border-color:#2563eb}.pc h3{font-size:22px;margin-bottom:4px}
.pc .pr{font-size:42px;font-weight:800;margin:16px 0}.pc .pr span{font-size:16px;color:#64748b;font-weight:400}
.pc ul{list-style:none;text-align:left;margin:20px 0}.pc li{padding:8px 0;font-size:15px}.pc li::before{content:'✓ ';color:#22c55e;font-weight:700}
@media(max-width:768px){.pg{grid-template-columns:1fr}}</style></head><body>
<nav class="nav"><div class="container nav-inner"><a href="/" class="nav-brand">⭐ ReviewFlow</a>
<div class="nav-links">${loggedIn?'<a href="/dashboard">Dashboard</a><a href="/logout">Log Out</a>':'<a href="/login">Log In</a><a href="/signup" class="btn btn-primary btn-sm">Sign Up</a>'}</div></div></nav>
<div class="pw"><h1 style="text-align:center;font-size:36px;margin-bottom:40px">Choose Your Plan</h1>
<div class="pg">
<div class="pc"><h3>Free</h3><div class="pr">$0<span>/mo</span></div>
<ul><li>1 location</li><li>Branded review page</li><li>QR code</li><li>Smart review gate</li><li>Basic analytics</li></ul>
${loggedIn&&user.plan==='free'?'<div class="btn btn-secondary" style="width:100%;opacity:.6">Current Plan</div>':'<a href="/signup" class="btn btn-secondary" style="width:100%">Get Started</a>'}</div>
<div class="pc ft"><h3>Starter</h3><div class="pr">$29<span>/mo</span></div>
<ul><li>Everything in Free</li><li>SMS &amp; email templates</li><li>Advanced analytics</li><li>Custom messages</li><li>Priority support</li></ul>
${loggedIn?(user.plan==='starter'?'<div class="btn btn-secondary" style="width:100%;opacity:.6">Current Plan</div>':`<button onclick="checkout('starter')" class="btn btn-primary" style="width:100%">Upgrade</button>`):'<a href="/signup" class="btn btn-primary" style="width:100%">Start Free Trial</a>'}</div>
<div class="pc"><h3>Growth</h3><div class="pr">$79<span>/mo</span></div>
<ul><li>Everything in Starter</li><li>Up to 5 locations</li><li>Team access</li><li>Response templates</li><li>Dedicated support</li></ul>
${loggedIn?(user.plan==='growth'?'<div class="btn btn-secondary" style="width:100%;opacity:.6">Current Plan</div>':`<button onclick="checkout('growth')" class="btn btn-primary" style="width:100%">Upgrade</button>`):'<a href="/signup" class="btn btn-secondary" style="width:100%">Start Free Trial</a>'}</div>
</div></div>
<script>async function checkout(p){const r=await fetch('/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:p})});const d=await r.json();if(d.url)window.location.href=d.url;else alert('Error')}</script>
</body></html>`);
});

app.post('/create-checkout', requireAuth, async (req, res) => {
  const user = getUser(req);
  const prices = { starter: { amount: 2900, name: 'ReviewFlow Starter' }, growth: { amount: 7900, name: 'ReviewFlow Growth' } };
  const sel = prices[req.body.plan];
  if (!sel) return res.status(400).json({ error: 'Invalid plan' });
  try {
    let cid = user.stripe_customer_id;
    if (!cid) { const c = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } }); cid = c.id; db.prepare('UPDATE users SET stripe_customer_id=? WHERE id=?').run(cid, user.id); }
    const s = await stripe.checkout.sessions.create({ customer: cid, payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: sel.name }, unit_amount: sel.amount, recurring: { interval: 'month' } }, quantity: 1 }],
      mode: 'subscription', success_url: `${BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${BASE_URL}/pricing` });
    res.json({ url: s.url });
  } catch (e) { console.error('Stripe:', e); res.status(500).json({ error: 'Payment error' }); }
});

app.get('/billing/success', requireAuth, async (req, res) => {
  const user = getUser(req);
  try {
    const s = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const plan = s.amount_total === 7900 ? 'growth' : 'starter';
    db.prepare('UPDATE users SET plan=?,stripe_subscription_id=? WHERE id=?').run(plan, s.subscription, user.id);
  } catch (e) {}
  res.redirect('/dashboard');
});

app.listen(PORT, '0.0.0.0', () => console.log(`ReviewFlow running on port ${PORT} — ${BASE_URL}`));
