const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');
const db = require('../db/schema');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create sample proposals for new users
function createSampleProposals(userId) {
  const samples = [
    {
      title: 'Website Redesign — Sample Proposal',
      client_name: 'Sarah Johnson',
      client_email: 'sarah@example.com',
      client_company: 'Bloom Marketing Agency',
      intro_text: 'Thank you for the opportunity to present our proposal for redesigning the Bloom Marketing Agency website. We understand you need a modern, responsive site that better reflects your brand and converts more visitors into clients.\n\nOur approach combines strategic UX design with fast, accessible development to create a site that not only looks beautiful but performs exceptionally.',
      terms_text: '• 50% deposit required to begin work\n• Remaining 50% due upon project completion\n• Includes 2 rounds of revisions\n• Timeline: 4-6 weeks from deposit\n• 30-day bug fix warranty after launch',
      status: 'sent',
      line_items: [
        { description: 'UX Research & Strategy', quantity: 1, unit_price: 2500 },
        { description: 'UI Design (Homepage + 5 Inner Pages)', quantity: 1, unit_price: 4000 },
        { description: 'Frontend Development (Responsive)', quantity: 1, unit_price: 5000 },
        { description: 'CMS Integration (WordPress)', quantity: 1, unit_price: 1500 },
        { description: 'SEO Setup & Optimization', quantity: 1, unit_price: 800 },
      ],
      discount_percent: 5,
      tax_percent: 0,
    },
    {
      title: 'Monthly Social Media Management — Sample',
      client_name: 'Mike Chen',
      client_email: 'mike@example.com',
      client_company: 'FreshBite Restaurant',
      intro_text: 'Here\'s our proposal for managing FreshBite\'s social media presence across Instagram, Facebook, and TikTok. We\'ll create engaging content that showcases your food, builds community, and drives foot traffic.',
      terms_text: '• Month-to-month agreement, cancel anytime with 30 days notice\n• Content calendar delivered by the 25th of each month for approval\n• Reporting delivered on the 1st of each month',
      status: 'accepted',
      accepted_signature: 'Mike Chen',
      line_items: [
        { description: 'Social Media Strategy & Planning', quantity: 1, unit_price: 500 },
        { description: 'Content Creation (20 posts/month)', quantity: 1, unit_price: 1200 },
        { description: 'Community Management & Engagement', quantity: 1, unit_price: 400 },
        { description: 'Monthly Analytics Report', quantity: 1, unit_price: 200 },
      ],
      discount_percent: 0,
      tax_percent: 8,
    }
  ];

  for (const sample of samples) {
    const id = uuid();
    const share_token = crypto.randomBytes(6).toString('base64url');
    db.prepare(`INSERT INTO proposals (id, user_id, share_token, title, client_name, client_email, client_company, intro_text, terms_text, currency, discount_percent, tax_percent, status, is_sample, accepted_at, accepted_signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`).run(
      id, userId, share_token, sample.title, sample.client_name, sample.client_email, sample.client_company,
      sample.intro_text, sample.terms_text, 'USD', sample.discount_percent, sample.tax_percent, sample.status,
      sample.accepted_signature ? new Date().toISOString() : null,
      sample.accepted_signature || null
    );
    const insert = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    sample.line_items.forEach((item, i) => {
      insert.run(uuid(), id, item.description, item.quantity, item.unit_price, i);
    });
  }
}

router.post('/register', (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (name.trim().length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' });

    const id = uuid();
    const password_hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, email, password_hash, name, company) VALUES (?, ?, ?, ?, ?)').run(id, email.toLowerCase().trim(), password_hash, name.trim(), (company || '').trim());

    // Create sample proposals
    createSampleProposals(id);

    const token = generateToken({ id, email: email.toLowerCase().trim() });
    res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.json({ ok: true, token, user: { id, email: email.toLowerCase().trim(), name: name.trim(), company: (company || '').trim(), plan: 'free' } });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    }
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, company: user.company, plan: user.plan, brand_color: user.brand_color } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, company, logo_url, brand_color, plan, email_notifications, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.put('/me', authMiddleware, (req, res) => {
  const { name, company, brand_color, email_notifications } = req.body;
  if (name !== undefined && name.trim().length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
  db.prepare('UPDATE users SET name = COALESCE(?, name), company = COALESCE(?, company), brand_color = COALESCE(?, brand_color), email_notifications = COALESCE(?, email_notifications), updated_at = datetime("now") WHERE id = ?')
    .run(name?.trim(), company?.trim(), brand_color, email_notifications !== undefined ? (email_notifications ? 1 : 0) : null, req.user.id);
  res.json({ ok: true });
});

module.exports = router;
