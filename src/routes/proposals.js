const express = require('express');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function genShareToken() {
  return crypto.randomBytes(6).toString('base64url');
}

function sanitize(str, maxLen = 10000) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen).trim();
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
    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.user.id);
    if (user.plan === 'free') {
      const count = db.prepare("SELECT COUNT(*) as c FROM proposals WHERE user_id = ? AND status != 'archived'").get(req.user.id).c;
      if (count >= 5) return res.status(403).json({ error: 'Free plan limited to 5 active proposals. Upgrade to Pro for unlimited.' });
    }

    const id = uuid();
    const share_token = genShareToken();
    const { title, client_name, client_email, client_company, intro_text, terms_text, currency, discount_percent, tax_percent, valid_until, line_items } = req.body;

    const safeTitle = sanitize(title, 200) || 'Untitled Proposal';
    const safeCurrency = ['USD','EUR','GBP','CAD','AUD','CHF'].includes(currency) ? currency : 'USD';
    const safeDiscount = Math.max(0, Math.min(100, parseFloat(discount_percent) || 0));
    const safeTax = Math.max(0, Math.min(100, parseFloat(tax_percent) || 0));

    db.prepare(`INSERT INTO proposals (id, user_id, share_token, title, client_name, client_email, client_company, intro_text, terms_text, currency, discount_percent, tax_percent, valid_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, req.user.id, share_token, safeTitle,
      sanitize(client_name, 200), sanitize(client_email, 200), sanitize(client_company, 200),
      sanitize(intro_text, 5000), sanitize(terms_text, 5000), safeCurrency,
      safeDiscount, safeTax, valid_until || null
    );

    if (line_items?.length) {
      const insert = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      line_items.slice(0, 50).forEach((item, i) => {
        insert.run(uuid(), id, sanitize(item.description, 500) || 'Item', Math.max(0, parseFloat(item.quantity) || 1), Math.max(0, parseFloat(item.unit_price) || 0), i);
      });
    }

    res.json({ ok: true, proposal: getProposalWithItems(id, req.user.id) });
  } catch (e) {
    console.error('Create proposal error:', e);
    res.status(500).json({ error: 'Failed to create proposal. Please try again.' });
  }
});

// Get single proposal
router.get('/:id', authMiddleware, (req, res) => {
  const proposal = getProposalWithItems(req.params.id, req.user.id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  res.json({ proposal });
});

// Update proposal
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, client_name, client_email, client_company, intro_text, terms_text, status, currency, discount_percent, tax_percent, valid_until, line_items } = req.body;
    
    const existing = db.prepare('SELECT id, status FROM proposals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Proposal not found' });

    // Validate status transitions
    const validStatuses = ['draft', 'sent', 'accepted', 'declined', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Build dynamic update to avoid undefined values (sql.js can't handle undefined)
    const updates = [];
    const params = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(sanitize(title, 200) || 'Untitled Proposal'); }
    if (client_name !== undefined) { updates.push('client_name = ?'); params.push(sanitize(client_name, 200)); }
    if (client_email !== undefined) { updates.push('client_email = ?'); params.push(sanitize(client_email, 200)); }
    if (client_company !== undefined) { updates.push('client_company = ?'); params.push(sanitize(client_company, 200)); }
    if (intro_text !== undefined) { updates.push('intro_text = ?'); params.push(sanitize(intro_text, 5000)); }
    if (terms_text !== undefined) { updates.push('terms_text = ?'); params.push(sanitize(terms_text, 5000)); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (currency !== undefined) { updates.push('currency = ?'); params.push(currency); }
    if (discount_percent !== undefined) { updates.push('discount_percent = ?'); params.push(Math.max(0, Math.min(100, parseFloat(discount_percent) || 0))); }
    if (tax_percent !== undefined) { updates.push('tax_percent = ?'); params.push(Math.max(0, Math.min(100, parseFloat(tax_percent) || 0))); }
    if (valid_until !== undefined) { updates.push('valid_until = ?'); params.push(valid_until || null); }
    
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    
    if (updates.length > 1) {
      db.prepare(`UPDATE proposals SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    if (line_items) {
      db.prepare('DELETE FROM line_items WHERE proposal_id = ?').run(req.params.id);
      const insert = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      line_items.slice(0, 50).forEach((item, i) => {
        insert.run(uuid(), req.params.id, sanitize(item.description, 500) || 'Item', Math.max(0, parseFloat(item.quantity) || 1), Math.max(0, parseFloat(item.unit_price) || 0), i);
      });
    }

    res.json({ ok: true, proposal: getProposalWithItems(req.params.id, req.user.id) });
  } catch (e) {
    console.error('Update proposal error:', e);
    res.status(500).json({ error: 'Failed to update proposal. Please try again.' });
  }
});

// Delete proposal
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT id FROM proposals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Proposal not found' });
  db.prepare('DELETE FROM line_items WHERE proposal_id = ?').run(req.params.id);
  db.prepare('DELETE FROM proposal_views WHERE proposal_id = ?').run(req.params.id);
  db.prepare('DELETE FROM proposals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Duplicate proposal
router.post('/:id/duplicate', authMiddleware, (req, res) => {
  try {
    const orig = getProposalWithItems(req.params.id, req.user.id);
    if (!orig) return res.status(404).json({ error: 'Proposal not found' });

    // Check limits
    const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.user.id);
    if (user.plan === 'free') {
      const count = db.prepare("SELECT COUNT(*) as c FROM proposals WHERE user_id = ? AND status != 'archived'").get(req.user.id).c;
      if (count >= 5) return res.status(403).json({ error: 'Free plan limited to 5 active proposals. Upgrade to Pro for unlimited.' });
    }

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
    console.error('Duplicate error:', e);
    res.status(500).json({ error: 'Failed to duplicate proposal.' });
  }
});

// Public view (by share token)
router.get('/public/:token', (req, res) => {
  const proposal = db.prepare('SELECT * FROM proposals WHERE share_token = ?').get(req.params.token);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  
  db.prepare('UPDATE proposals SET view_count = view_count + 1, last_viewed_at = datetime("now") WHERE id = ?').run(proposal.id);
  db.prepare('INSERT INTO proposal_views (proposal_id, ip, user_agent) VALUES (?, ?, ?)').run(proposal.id, req.ip, req.get('user-agent'));

  proposal.line_items = db.prepare('SELECT * FROM line_items WHERE proposal_id = ? ORDER BY sort_order').all(proposal.id);
  const user = db.prepare('SELECT name, company, logo_url, brand_color, email FROM users WHERE id = ?').get(proposal.user_id);
  
  res.json({ proposal, sender: user });
});

// Accept proposal (client action)
router.post('/public/:token/accept', (req, res) => {
  const { signature } = req.body;
  if (!signature || !signature.trim()) return res.status(400).json({ error: 'Please type your name to sign the proposal' });
  
  const proposal = db.prepare('SELECT * FROM proposals WHERE share_token = ?').get(req.params.token);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  if (proposal.status === 'accepted') return res.status(400).json({ error: 'This proposal has already been accepted' });
  if (proposal.status !== 'sent') return res.status(400).json({ error: 'This proposal is not available for acceptance' });

  db.prepare("UPDATE proposals SET status = 'accepted', accepted_at = datetime('now'), accepted_signature = ? WHERE id = ?").run(signature.trim(), proposal.id);
  res.json({ ok: true });
});

// PDF data endpoint (returns structured data for client-side PDF generation)
router.get('/:id/pdf-data', authMiddleware, (req, res) => {
  const proposal = getProposalWithItems(req.params.id, req.user.id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  const user = db.prepare('SELECT name, company, email, brand_color FROM users WHERE id = ?').get(req.user.id);
  res.json({ proposal, sender: user });
});

// Public PDF data
router.get('/public/:token/pdf-data', (req, res) => {
  const proposal = db.prepare('SELECT * FROM proposals WHERE share_token = ?').get(req.params.token);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  proposal.line_items = db.prepare('SELECT * FROM line_items WHERE proposal_id = ? ORDER BY sort_order').all(proposal.id);
  const user = db.prepare('SELECT name, company, email, brand_color FROM users WHERE id = ?').get(proposal.user_id);
  res.json({ proposal, sender: user });
});

module.exports = router;
