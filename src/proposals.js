// proposals.js — Proposal routes with payment integration
module.exports = function(app, db, stripe, { uuidv4, requireAuth, getUser, esc, css, dashLayout, notFoundPage, footer, BASE_URL }) {

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      share_token TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL DEFAULT 'Untitled Proposal',
      client_name TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      client_company TEXT DEFAULT '',
      intro_text TEXT DEFAULT '',
      terms_text TEXT DEFAULT '',
      currency TEXT DEFAULT 'USD',
      discount_percent REAL DEFAULT 0,
      tax_percent REAL DEFAULT 0,
      payment_amount INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'unpaid',
      stripe_payment_id TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY,
      proposal_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id)
    );
  `);
  try { db.exec("ALTER TABLE proposals ADD COLUMN payment_amount INTEGER DEFAULT 0"); } catch(e) {}
  try { db.exec("ALTER TABLE proposals ADD COLUMN payment_status TEXT DEFAULT 'unpaid'"); } catch(e) {}
  try { db.exec("ALTER TABLE proposals ADD COLUMN stripe_payment_id TEXT DEFAULT ''"); } catch(e) {}

  // List proposals
  app.get('/proposals', requireAuth, (req, res) => {
    const user = getUser(req);
    const proposals = db.prepare('SELECT * FROM proposals WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div><h1 style="font-size:28px;margin-bottom:4px">Proposals</h1>
      <p style="color:#64748b;font-size:14px">Create and send proposals with built-in payment</p></div>
      <a href="/proposals/new" class="btn btn-primary">+ New Proposal</a></div>`;

    if (!proposals.length) {
      html += `<div class="card" style="text-align:center;padding:60px">
        <div style="font-size:64px;margin-bottom:16px">📄</div>
        <h2>No proposals yet</h2>
        <p style="color:#64748b;margin:12px 0 24px">Create your first proposal with a payment button</p>
        <a href="/proposals/new" class="btn btn-primary">Create Proposal</a></div>`;
    } else {
      proposals.forEach(p => {
        const items = db.prepare('SELECT * FROM line_items WHERE proposal_id = ?').all(p.id);
        const total = items.reduce((s,i) => s + i.quantity * i.unit_price, 0);
        const payAmt = p.payment_amount ? '$' + (p.payment_amount / 100).toFixed(2) : (total ? '$' + total.toFixed(2) : '—');
        const statusColors = { unpaid: '#f59e0b', paid: '#22c55e', draft: '#94a3b8' };
        const sc = statusColors[p.payment_status] || '#94a3b8';
        const pubUrl = `${BASE_URL}/p/${p.share_token}`;
        html += `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div><h3 style="font-size:18px">${esc(p.title)}</h3>
            <span style="font-size:13px;color:#64748b">${p.client_name ? 'To: ' + esc(p.client_name) : 'No client'} · ${new Date(p.created_at).toLocaleDateString()}</span></div>
            <div style="display:flex;gap:8px;align-items:center">
              <span style="font-weight:700;font-size:18px">${payAmt}</span>
              <span style="background:${sc}20;color:${sc};padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;text-transform:uppercase">${esc(p.payment_status)}</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <a href="/proposals/${p.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
            <a href="/p/${p.share_token}" target="_blank" class="btn btn-secondary btn-sm">View Public Page</a>
            <button onclick="navigator.clipboard.writeText('${pubUrl}');this.textContent='Copied!'" class="btn btn-secondary btn-sm">Copy Link</button>
            <form method="POST" action="/proposals/${p.id}/delete" style="display:inline" onsubmit="return confirm('Delete?')">
              <button type="submit" class="btn btn-danger btn-sm">Delete</button></form>
          </div></div>`;
      });
    }
    res.send(dashLayout(user, `<div style="max-width:800px;margin:0 auto">${html}</div>`));
  });

  // New proposal form
  app.get('/proposals/new', requireAuth, (req, res) => {
    res.send(proposalFormPage(getUser(req)));
  });

  // Create proposal
  app.post('/proposals', requireAuth, (req, res) => {
    const user = getUser(req);
    const { title, client_name, client_email, client_company, intro_text, terms_text, payment_amount, item_desc, item_qty, item_price } = req.body;
    const id = uuidv4();
    const shareToken = uuidv4().slice(0, 8);
    const amountCents = Math.round(parseFloat(payment_amount || 0) * 100);
    db.prepare('INSERT INTO proposals (id, user_id, share_token, title, client_name, client_email, client_company, intro_text, terms_text, payment_amount) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(id, user.id, shareToken, title || 'Untitled Proposal', client_name||'', client_email||'', client_company||'', intro_text||'', terms_text||'', amountCents);
    saveLineItems(id, req.body);
    res.redirect('/proposals');
  });

  // Edit form
  app.get('/proposals/:id/edit', requireAuth, (req, res) => {
    const user = getUser(req);
    const p = db.prepare('SELECT * FROM proposals WHERE id=? AND user_id=?').get(req.params.id, user.id);
    if (!p) return res.redirect('/proposals');
    const items = db.prepare('SELECT * FROM line_items WHERE proposal_id=? ORDER BY sort_order').all(p.id);
    res.send(proposalFormPage(user, null, p, items));
  });

  // Update proposal
  app.post('/proposals/:id/edit', requireAuth, (req, res) => {
    const user = getUser(req);
    const { title, client_name, client_email, client_company, intro_text, terms_text, payment_amount } = req.body;
    const amountCents = Math.round(parseFloat(payment_amount || 0) * 100);
    db.prepare('UPDATE proposals SET title=?, client_name=?, client_email=?, client_company=?, intro_text=?, terms_text=?, payment_amount=? WHERE id=? AND user_id=?')
      .run(title||'Untitled', client_name||'', client_email||'', client_company||'', intro_text||'', terms_text||'', amountCents, req.params.id, user.id);
    db.prepare('DELETE FROM line_items WHERE proposal_id=?').run(req.params.id);
    saveLineItems(req.params.id, req.body);
    res.redirect('/proposals');
  });

  // Delete
  app.post('/proposals/:id/delete', requireAuth, (req, res) => {
    const user = getUser(req);
    db.prepare('DELETE FROM line_items WHERE proposal_id IN (SELECT id FROM proposals WHERE id=? AND user_id=?)').run(req.params.id, user.id);
    db.prepare('DELETE FROM proposals WHERE id=? AND user_id=?').run(req.params.id, user.id);
    res.redirect('/proposals');
  });

  // ===== PUBLIC PROPOSAL VIEW =====
  app.get('/p/:token', (req, res) => {
    const proposal = db.prepare('SELECT * FROM proposals WHERE share_token=?').get(req.params.token);
    if (!proposal) return res.status(404).send(notFoundPage());
    const items = db.prepare('SELECT * FROM line_items WHERE proposal_id=? ORDER BY sort_order').all(proposal.id);
    const owner = db.prepare('SELECT business_name, email FROM users WHERE id=?').get(proposal.user_id);
    const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const payAmount = proposal.payment_amount || Math.round(total * 100);
    const showPay = payAmount > 0 && proposal.payment_status !== 'paid';
    const isPaid = proposal.payment_status === 'paid';

    let itemsHtml = '';
    if (items.length) {
      itemsHtml = `<table style="width:100%;border-collapse:collapse;margin:24px 0">
        <thead><tr style="border-bottom:2px solid #e2e8f0">
          <th style="text-align:left;padding:12px 8px;font-size:14px;color:#64748b">Description</th>
          <th style="text-align:right;padding:12px 8px;font-size:14px;color:#64748b;width:80px">Qty</th>
          <th style="text-align:right;padding:12px 8px;font-size:14px;color:#64748b;width:120px">Price</th>
          <th style="text-align:right;padding:12px 8px;font-size:14px;color:#64748b;width:120px">Total</th>
        </tr></thead><tbody>`;
      items.forEach(i => {
        itemsHtml += `<tr style="border-bottom:1px solid #f1f5f9">
          <td style="padding:12px 8px;font-size:15px">${esc(i.description)}</td>
          <td style="text-align:right;padding:12px 8px;font-size:15px">${i.quantity}</td>
          <td style="text-align:right;padding:12px 8px;font-size:15px">$${i.unit_price.toFixed(2)}</td>
          <td style="text-align:right;padding:12px 8px;font-size:15px;font-weight:600">$${(i.quantity * i.unit_price).toFixed(2)}</td></tr>`;
      });
      itemsHtml += `</tbody><tfoot><tr style="border-top:2px solid #1e293b">
        <td colspan="3" style="text-align:right;padding:16px 8px;font-size:18px;font-weight:700">Total</td>
        <td style="text-align:right;padding:16px 8px;font-size:18px;font-weight:700">$${total.toFixed(2)}</td>
      </tr></tfoot></table>`;
    }

    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(proposal.title)}</title>
${css()}
<style>body{background:#f8fafc;padding:24px}
.proposal{max-width:800px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden}
.proposal-header{background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:40px}
.proposal-body{padding:40px}
.section{margin-bottom:32px}
.section h2{font-size:20px;color:#1e293b;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0}
@media(max-width:600px){.proposal-header,.proposal-body{padding:24px}}
</style></head><body>
<div class="proposal">
  <div class="proposal-header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
      <div>
        <h1 style="font-size:32px;font-weight:800;margin-bottom:8px">${esc(proposal.title)}</h1>
        ${owner && owner.business_name ? `<p style="opacity:.8;font-size:16px">From: ${esc(owner.business_name)}</p>` : ''}
      </div>
      <div style="text-align:right">
        ${proposal.client_name ? `<p style="opacity:.8;font-size:14px">Prepared for</p>
        <p style="font-size:18px;font-weight:600">${esc(proposal.client_name)}</p>
        ${proposal.client_company ? `<p style="opacity:.8;font-size:14px">${esc(proposal.client_company)}</p>` : ''}` : ''}
      </div>
    </div>
    ${isPaid ? '<div style="margin-top:16px;background:#22c55e;color:#fff;display:inline-block;padding:8px 20px;border-radius:8px;font-weight:700;font-size:14px">✓ PAID</div>' : ''}
  </div>
  <div class="proposal-body">
    ${proposal.intro_text ? `<div class="section"><h2>Overview</h2>
      <div style="color:#475569;font-size:15px;line-height:1.8;white-space:pre-wrap">${esc(proposal.intro_text)}</div></div>` : ''}
    ${items.length ? `<div class="section"><h2>Pricing</h2>${itemsHtml}</div>` : ''}
    ${proposal.terms_text ? `<div class="section"><h2>Terms & Conditions</h2>
      <div style="color:#475569;font-size:14px;line-height:1.8;white-space:pre-wrap">${esc(proposal.terms_text)}</div></div>` : ''}
    ${showPay ? `<div style="text-align:center;padding:32px;background:linear-gradient(135deg,#f0fdf4,#eff6ff);border-radius:16px;border:2px solid #22c55e">
      <div style="font-size:48px;margin-bottom:12px">💳</div>
      <p style="font-size:24px;font-weight:800;margin-bottom:8px">$${(payAmount / 100).toFixed(2)}</p>
      <p style="color:#64748b;margin-bottom:20px">Click below to pay securely via Stripe</p>
      <button onclick="payInvoice()" id="pay-btn" class="btn btn-primary" style="padding:16px 48px;font-size:18px;background:#22c55e">Pay Invoice →</button>
    </div>` : ''}
    <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:13px;color:#94a3b8">
      Created with <a href="${BASE_URL}" style="color:#2563eb;text-decoration:none">ReviewFlow</a>
    </div>
  </div>
</div>
<script>
async function payInvoice() {
  var btn = document.getElementById('pay-btn');
  btn.disabled = true; btn.textContent = 'Loading...';
  try {
    var r = await fetch('/api/proposal-payment/${req.params.token}', { method: 'POST' });
    var d = await r.json();
    if (d.url) window.location.href = d.url;
    else { alert('Error: ' + (d.error || 'Unknown')); btn.disabled = false; btn.textContent = 'Pay Invoice →'; }
  } catch(e) { alert('Error'); btn.disabled = false; btn.textContent = 'Pay Invoice →'; }
}
</script></body></html>`);
  });

  // Stripe checkout for proposal payment
  app.post('/api/proposal-payment/:token', async (req, res) => {
    const proposal = db.prepare('SELECT * FROM proposals WHERE share_token=?').get(req.params.token);
    if (!proposal) return res.status(404).json({ error: 'Not found' });
    const items = db.prepare('SELECT * FROM line_items WHERE proposal_id=?').all(proposal.id);
    const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const payAmount = proposal.payment_amount || Math.round(total * 100);
    if (payAmount <= 0) return res.status(400).json({ error: 'No payment amount' });
    if (proposal.payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: proposal.title, description: proposal.client_company ? 'Proposal for ' + proposal.client_company : 'Proposal payment' },
            unit_amount: payAmount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${BASE_URL}/p/${proposal.share_token}/paid?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/p/${proposal.share_token}`,
        customer_email: proposal.client_email || undefined,
        metadata: { proposal_id: proposal.id },
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error('Stripe proposal payment:', e);
      res.status(500).json({ error: 'Payment error' });
    }
  });

  // Payment success callback
  app.get('/p/:token/paid', async (req, res) => {
    const proposal = db.prepare('SELECT * FROM proposals WHERE share_token=?').get(req.params.token);
    if (!proposal) return res.status(404).send(notFoundPage());
    try {
      if (req.query.session_id) {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        if (session.payment_status === 'paid') {
          db.prepare('UPDATE proposals SET payment_status=?, stripe_payment_id=? WHERE id=?')
            .run('paid', session.payment_intent, proposal.id);
        }
      }
    } catch(e) { console.error('Payment verify error:', e); }
    res.redirect('/p/' + req.params.token);
  });

  // Helper: save line items from form
  function saveLineItems(proposalId, body) {
    const { item_desc, item_qty, item_price } = body;
    if (!item_desc) return;
    const descs = Array.isArray(item_desc) ? item_desc : [item_desc];
    const qtys = Array.isArray(item_qty) ? item_qty : [item_qty];
    const prices = Array.isArray(item_price) ? item_price : [item_price];
    const ins = db.prepare('INSERT INTO line_items (id, proposal_id, description, quantity, unit_price, sort_order) VALUES (?,?,?,?,?,?)');
    descs.forEach((d, i) => {
      if (d && d.trim()) ins.run(uuidv4(), proposalId, d.trim(), parseFloat(qtys[i]) || 1, parseFloat(prices[i]) || 0, i);
    });
  }

  // Helper: proposal form page
  function proposalFormPage(user, error, proposal, items) {
    const p = proposal || {};
    const isEdit = !!proposal;
    const payDollars = p.payment_amount ? (p.payment_amount / 100).toFixed(2) : '';
    const existingItems = items || [];

    let itemsHtml = '';
    if (existingItems.length) {
      existingItems.forEach(it => {
        itemsHtml += `<div class="line-item" style="display:grid;grid-template-columns:2fr 80px 120px 40px;gap:8px;margin-bottom:8px;align-items:center">
          <input type="text" name="item_desc" value="${esc(it.description)}" placeholder="Description">
          <input type="number" name="item_qty" value="${it.quantity}" placeholder="Qty" step="0.01" min="0">
          <input type="number" name="item_price" value="${it.unit_price}" placeholder="Price ($)" step="0.01" min="0">
          <button type="button" onclick="this.parentElement.remove();calcTotal()" style="background:#fee2e2;color:#ef4444;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:16px">&times;</button></div>`;
      });
    } else {
      itemsHtml = `<div class="line-item" style="display:grid;grid-template-columns:2fr 80px 120px 40px;gap:8px;margin-bottom:8px;align-items:center">
        <input type="text" name="item_desc" placeholder="Description">
        <input type="number" name="item_qty" value="1" placeholder="Qty" step="0.01" min="0">
        <input type="number" name="item_price" placeholder="Price ($)" step="0.01" min="0">
        <button type="button" onclick="this.parentElement.remove();calcTotal()" style="background:#fee2e2;color:#ef4444;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:16px">&times;</button></div>`;
    }

    return dashLayout(user, `<div style="max-width:700px;margin:0 auto">
      <h1 style="font-size:28px;margin-bottom:24px">${isEdit ? 'Edit Proposal' : 'New Proposal'}</h1>
      ${error ? `<div class="alert alert-error">${error}</div>` : ''}
      <form method="POST" action="${isEdit ? '/proposals/' + p.id + '/edit' : '/proposals'}">
        <div class="card">
          <h3 style="margin-bottom:16px">Proposal Details</h3>
          <div class="form-group"><label>Title *</label>
            <input type="text" name="title" required value="${esc(p.title || '')}" placeholder="e.g. Website Redesign Proposal"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div class="form-group"><label>Client Name</label>
              <input type="text" name="client_name" value="${esc(p.client_name || '')}" placeholder="Jane Smith"></div>
            <div class="form-group"><label>Client Email</label>
              <input type="email" name="client_email" value="${esc(p.client_email || '')}" placeholder="jane@company.com"></div>
          </div>
          <div class="form-group"><label>Client Company</label>
            <input type="text" name="client_company" value="${esc(p.client_company || '')}" placeholder="Acme Inc."></div>
          <div class="form-group"><label>Introduction / Description</label>
            <textarea name="intro_text" rows="4" placeholder="Describe the project scope...">${esc(p.intro_text || '')}</textarea></div>
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px">Line Items</h3>
          <div id="line-items">${itemsHtml}</div>
          <button type="button" onclick="addLineItem()" class="btn btn-secondary btn-sm" style="margin-top:8px">+ Add Line Item</button>
          <div style="margin-top:16px;text-align:right;font-size:18px;font-weight:700" id="line-total"></div>
        </div>

        <div class="card" style="border:2px solid #22c55e;background:#f0fdf4">
          <h3 style="margin-bottom:8px">💳 Payment</h3>
          <p style="color:#64748b;font-size:14px;margin-bottom:16px">Set the payment amount for the "Pay Invoice" button on the public proposal page.</p>
          <div class="form-group"><label>Payment Amount ($)</label>
            <input type="number" name="payment_amount" id="payment_amount" value="${esc(payDollars)}" placeholder="0.00" step="0.01" min="0">
            <div class="form-hint">Leave blank or 0 for no payment button.</div></div>
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px">Terms &amp; Conditions</h3>
          <div class="form-group"><textarea name="terms_text" rows="3" placeholder="Payment terms, delivery timeline...">${esc(p.terms_text || '')}</textarea></div>
        </div>

        <div style="display:flex;gap:12px;margin-top:16px">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Proposal'}</button>
          <a href="/proposals" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
    <script>
    function addLineItem() {
      var d = document.createElement('div');
      d.className = 'line-item';
      d.style.cssText = 'display:grid;grid-template-columns:2fr 80px 120px 40px;gap:8px;margin-bottom:8px;align-items:center';
      d.innerHTML = '<input type="text" name="item_desc" placeholder="Description"><input type="number" name="item_qty" value="1" placeholder="Qty" step="0.01" min="0"><input type="number" name="item_price" placeholder="Price ($)" step="0.01" min="0"><button type="button" onclick="this.parentElement.remove();calcTotal()" style="background:#fee2e2;color:#ef4444;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:16px">&times;</button>';
      document.getElementById('line-items').appendChild(d);
      d.querySelectorAll('input').forEach(i => i.addEventListener('input', calcTotal));
    }
    function calcTotal() {
      var t = 0;
      document.querySelectorAll('.line-item').forEach(r => {
        var q = parseFloat(r.querySelectorAll('input')[1].value) || 0;
        var p = parseFloat(r.querySelectorAll('input')[2].value) || 0;
        t += q * p;
      });
      document.getElementById('line-total').textContent = 'Total: $' + t.toFixed(2);
      var pa = document.getElementById('payment_amount');
      if (!pa.value || pa.dataset.auto === '1') { pa.value = t.toFixed(2); pa.dataset.auto = '1'; }
    }
    document.querySelectorAll('.line-item input').forEach(i => i.addEventListener('input', calcTotal));
    document.getElementById('payment_amount').addEventListener('input', function() { this.dataset.auto = ''; });
    calcTotal();
    </script>`);
  }
};
