const express = require('express');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function genShareToken() {
  return crypto.randomBytes(6).toString('base64url');
}

function getProposalWithItems(proposalId, userId) {
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ? AND user_id = ?').get(proposalId, userId);
  if (!proposal) return null;
  proposal.line_items = db.prepare('SELECT * FROM line_items WHERE proposal_id = ? ORDER BY sort_order').all(proposalId);
  return proposal;
}

// List proposals
router.get('/', authMiddleware, (req, res) => {
  const proposals = db.prepare(`
    SELECT p.*, 
      (SELECT SUM(quantity * unit_price) FROM line_items WHERE proposal_id = p.id) as subtotal
    FROM proposals p WHERE p.user_id = ? ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json({ proposals });
});

// Create proposal
router.post('/', authMiddleware, (req, res) => {
  try {
    // Check limits: free = 5 active proposals
    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.user.id);
    if (user.plan === 'free') {
      const count = db.prepare("SELECT COUNT(*) as c FROM proposals WHERE user_id = ? AND status != 'archived'").get(req.user.id).c;
      if (count >= 5) return res.status(403).json({ error: 'Free plan limited to 5 active proposals. Upgrade to Pro for unlimited.' });
    }

    const id = uuid();
    const share_token = genShareToken();
    const { title, client_name, client_email, client_company, intro_text, terms_text, currency, discount_percent, tax_percent, valid_until, line_items } = req.body;

    db.prepare(`INSERT INTO proposals (id, user_id, share_token, title, client_name, client_email, client_company, intro_text, terms_text, currency, discount_percent, tax_percent, valid_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, share_token, title || 'Untitled Proposal',
      client_name || '', client_email || '', client_company || '',
      intro_text || '', terms_text || '', currency || 'USD',
      discount_percent || 0, tax_percent || 0, valid_until || null
    );

    if (line_items?.length) {
      const insert = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      line_items.forEach((item, i) => {
        insert.run(uuid(), id, item.description, item.quantity || 1, item.unit_price || 0, i);
      });
    }

    res.json({ ok: true, proposal: getProposalWithItems(id, req.user.id) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single proposal
router.get('/:id', authMiddleware, (req, res) => {
  const proposal = getProposalWithItems(req.params.id, req.user.id);
  if (!proposal) return res.status(404).json({ error: 'Not found' });
  res.json({ proposal });
});

// Update proposal
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, client_name, client_email, client_company, intro_text, terms_text, status, currency, discount_percent, tax_percent, valid_until, line_items } = req.body;
    
    const existing = db.prepare('SELECT id FROM proposals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    db.prepare(`UPDATE proposals SET 
      title = COALESCE(?, title), client_name = COALESCE(?, client_name), client_email = COALESCE(?, client_email),
      client_company = COALESCE(?, client_company), intro_text = COALESCE(?, intro_text), terms_text = COALESCE(?, terms_text),
      status = COALESCE(?, status), currency = COALESCE(?, currency), discount_percent = COALESCE(?, discount_percent),
      tax_percent = COALESCE(?, tax_percent), valid_until = COALESCE(?, valid_until), updated_at = datetime('now')
      WHERE id = ?`).run(title, client_name, client_email, client_company, intro_text, terms_text, status, currency, discount_percent, tax_percent, valid_until, req.params.id);

    if (line_items) {
      db.prepare('DELETE FROM line_items WHERE proposal_id = ?').run(req.params.id);
      const insert = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      line_items.forEach((item, i) => {
        insert.run(uuid(), req.params.id, item.description, item.quantity || 1, item.unit_price || 0, i);
      });
    }

    res.json({ ok: true, proposal: getProposalWithItems(req.params.id, req.user.id) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete proposal
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM proposals WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// Duplicate proposal
router.post('/:id/duplicate', authMiddleware, (req, res) => {
  try {
    const orig = getProposalWithItems(req.params.id, req.user.id);
    if (!orig) return res.status(404).json({ error: 'Not found' });

    const id = uuid();
    const share_token = genShareToken();
    db.prepare(`INSERT INTO proposals (id, user_id, share_token, title, client_name, client_email, client_company, intro_text, terms_text, currency, discount_percent, tax_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, share_token, orig.title + ' (Copy)', orig.client_name, orig.client_email, orig.client_company, orig.intro_text, orig.terms_text, orig.currency, orig.discount_percent, orig.tax_percent
    );

    const insert = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    orig.line_items.forEach((item, i) => {
      insert.run(uuid(), id, item.description, item.quantity, item.unit_price, i);
    });

    res.json({ ok: true, proposal: getProposalWithItems(id, req.user.id) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public view (by share token)
router.get('/public/:token', (req, res) => {
  const proposal = db.prepare('SELECT * FROM proposals WHERE share_token = ?').get(req.params.token);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  
  // Track view
  db.prepare('UPDATE proposals SET view_count = view_count + 1, last_viewed_at = datetime("now") WHERE id = ?').run(proposal.id);
  db.prepare('INSERT INTO proposal_views (proposal_id, ip, user_agent) VALUES (?, ?, ?)').run(proposal.id, req.ip, req.get('user-agent'));

  proposal.line_items = db.prepare('SELECT * FROM line_items WHERE proposal_id = ? ORDER BY sort_order').all(proposal.id);
  const user = db.prepare('SELECT name, company, logo_url, brand_color, email FROM users WHERE id = ?').get(proposal.user_id);
  
  res.json({ proposal, sender: user });
});

// Accept proposal (client action)
router.post('/public/:token/accept', (req, res) => {
  const { signature } = req.body;
  const proposal = db.prepare('SELECT * FROM proposals WHERE share_token = ? AND status = ?').get(req.params.token, 'sent');
  if (!proposal) return res.status(404).json({ error: 'Proposal not found or not available for acceptance' });

  db.prepare("UPDATE proposals SET status = 'accepted', accepted_at = datetime('now'), accepted_signature = ? WHERE id = ?").run(signature || 'Accepted', proposal.id);
  res.json({ ok: true });
});

module.exports = router;
