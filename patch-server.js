// Run this on the server: node patch-server.js
const fs = require('fs');
const path = '/opt/reviewflow/server.js';
let code = fs.readFileSync(path, 'utf8');

// Backup
fs.writeFileSync(path + '.bak2', code);

// 1. Add response_templates table creation
code = code.replace(
  "CREATE TABLE IF NOT EXISTS email_signups",
  "CREATE TABLE IF NOT EXISTS response_templates (id TEXT PRIMARY KEY, user_id TEXT, category TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, is_default INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);\n  CREATE TABLE IF NOT EXISTS email_signups"
);

// 2. Add nav link
code = code.replace(
  '<a href="/review-analytics">📊 Analytics</a><a href="/pricing">Upgrade</a>',
  '<a href="/review-analytics">📊 Analytics</a><a href="/response-templates">📝 Templates</a><a href="/pricing">Upgrade</a>'
);

// 3. Insert routes before 404 handler
const newRoutes = `
// ===== RESPONSE TEMPLATE LIBRARY =====
const DEFAULT_RESPONSE_TEMPLATES = [
  { category: 'positive', title: 'Warm Thank You', body: 'Thank you so much for your wonderful review! We truly appreciate you taking the time to share your experience. It means the world to our team, and we look forward to serving you again soon!' },
  { category: 'positive', title: 'Highlight the Team', body: "What a fantastic review \\u2014 thank you! We'll make sure the team sees this. Your kind words are what keep us motivated to deliver our best every day. See you next time!" },
  { category: 'positive', title: 'Loyal Customer Appreciation', body: "Thank you for being such a loyal customer and for this amazing review! It's customers like you that make what we do so rewarding. We can't wait to welcome you back!" },
  { category: 'negative', title: 'Sincere Apology', body: "We're truly sorry to hear about your experience. This is not the standard we hold ourselves to, and we take your feedback very seriously. Please reach out to us directly so we can make this right." },
  { category: 'negative', title: 'Acknowledge & Resolve', body: "Thank you for bringing this to our attention. We sincerely apologize for the inconvenience. We'd love the opportunity to make things right \\u2014 please contact us and we'll personally ensure a better experience." },
  { category: 'negative', title: 'Empathetic Response', body: "We completely understand your frustration, and we're sorry we fell short. Your feedback helps us improve. We'd like to learn more and resolve this for you." },
  { category: 'neutral', title: 'Grateful & Encouraging', body: "Thank you for your feedback! We're glad you had a good experience and we're always striving to make it even better. If there's anything specific we can improve, we'd love to hear!" },
  { category: 'neutral', title: 'Invite Back', body: "Thanks for sharing your thoughts! We appreciate your honest feedback. We're constantly working to improve, and we hope to exceed your expectations on your next visit." },
  { category: 'apology', title: 'Professional Apology', body: "Please accept our sincerest apologies. We hold ourselves to the highest standards and clearly fell short. We've taken immediate steps to address the issues you mentioned and would be grateful for another chance to serve you." },
  { category: 'apology', title: 'Service Recovery', body: "We owe you an apology. Your experience does not reflect who we are, and we're deeply sorry. We've already begun addressing the issues you raised. Please allow us to make it up to you." },
  { category: 'follow-up', title: 'Check-In After Resolution', body: "Hi! We wanted to follow up on your recent feedback. We've made the changes you suggested and would love for you to give us another try. We're confident you'll notice the difference!" },
  { category: 'follow-up', title: 'Thank You for Second Chance', body: "Thank you for giving us another opportunity! We hope your recent visit was much better. Your feedback truly helped us improve, and we're grateful for your patience." },
];

// Seed default templates if empty
(function seedResponseTemplates() {
  const count = db.prepare('SELECT COUNT(*) as c FROM response_templates WHERE is_default=1').get().c;
  if (count === 0) {
    const ins = db.prepare('INSERT INTO response_templates (id,user_id,category,title,body,is_default) VALUES (?,?,?,?,?,1)');
    DEFAULT_RESPONSE_TEMPLATES.forEach(t => ins.run(uuidv4(), null, t.category, t.title, t.body));
  }
})();

// Response Templates Page
app.get('/response-templates', requireAuth, (req, res) => {
  const user = getUser(req);
  const category = req.query.category || 'all';
  
  let templates;
  if (category === 'all') {
    templates = db.prepare('SELECT * FROM response_templates WHERE (user_id IS NULL OR user_id = ?) ORDER BY category, is_default DESC, created_at DESC').all(user.id);
  } else {
    templates = db.prepare('SELECT * FROM response_templates WHERE (user_id IS NULL OR user_id = ?) AND category = ? ORDER BY is_default DESC, created_at DESC').all(user.id, category);
  }

  const categories = [
    { id: 'all', label: 'All Templates', icon: '\\ud83d\\udccb', color: '#6366f1' },
    { id: 'positive', label: 'Positive', icon: '\\ud83d\\ude0a', color: '#22c55e' },
    { id: 'negative', label: 'Negative', icon: '\\ud83d\\ude1f', color: '#ef4444' },
    { id: 'neutral', label: 'Neutral', icon: '\\ud83d\\ude10', color: '#f59e0b' },
    { id: 'apology', label: 'Apology', icon: '\\ud83d\\ude4f', color: '#8b5cf6' },
    { id: 'follow-up', label: 'Follow-up', icon: '\\ud83d\\udd04', color: '#06b6d4' },
  ];

  const catColors = { positive: '#22c55e', negative: '#ef4444', neutral: '#f59e0b', apology: '#8b5cf6', 'follow-up': '#06b6d4' };

  let html = '<div style="max-width:900px;margin:0 auto">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">';
  html += '<div><h1 style="font-size:28px;margin:0">\\ud83d\\udcdd Response Template Library</h1><p style="color:#64748b;margin:4px 0 0">Professional templates for responding to customer reviews</p></div>';
  html += \`<button onclick="document.getElementById('newTplModal').style.display='flex'" class="btn btn-primary">+ Create Template</button></div>\`;

  // Category filter pills
  html += '<div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">';
  categories.forEach(c => {
    const active = category === c.id;
    html += \`<a href="/response-templates?category=\${c.id}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;border:2px solid \${active ? c.color : '#e2e8f0'};background:\${active ? c.color + '15' : '#fff'};color:\${active ? c.color : '#64748b'}">\${c.icon} \${c.label}</a>\`;
  });
  html += '</div>';

  // Template cards
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px">';
  templates.forEach(t => {
    const color = catColors[t.category] || '#6366f1';
    const isCustom = t.user_id !== null;
    html += \`<div class="card" style="position:relative;border-left:4px solid \${color};transition:transform 0.15s" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='none'">\`;
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
    html += \`<div><span style="display:inline-block;padding:2px 10px;border-radius:100px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;background:\${color}18;color:\${color}">\${esc(t.category)}</span>\`;
    if (isCustom) html += ' <span style="display:inline-block;padding:2px 8px;border-radius:100px;font-size:11px;background:#f1f5f9;color:#64748b">Custom</span>';
    html += '</div>';
    if (isCustom) html += \`<button onclick="deleteTpl('\${t.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px" title="Delete">\\ud83d\\uddd1</button>\`;
    html += '</div>';
    html += \`<h3 style="font-size:16px;margin:8px 0">\${esc(t.title)}</h3>\`;
    html += \`<p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:12px">\${esc(t.body).substring(0, 180)}\${t.body.length > 180 ? '...' : ''}</p>\`;
    html += '<div style="display:flex;gap:8px">';
    html += \`<button onclick="copyTpl(this, '\${t.id}')" class="btn btn-primary btn-sm" style="font-size:13px">\\ud83d\\udccb Copy</button>\`;
    html += \`<button onclick="expandTpl('\${t.id}')" class="btn btn-sm" style="font-size:13px;background:#f1f5f9;border:1px solid #e2e8f0;color:#334155">\\ud83d\\udc41 Preview</button>\`;
    html += '</div></div>';
  });
  if (templates.length === 0) {
    html += '<div class="card" style="text-align:center;padding:40px;grid-column:1/-1"><p style="color:#64748b">No templates in this category yet.</p></div>';
  }
  html += '</div>';

  // New template modal
  html += \`<div id="newTplModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;padding:24px" onclick="if(event.target===this)this.style.display='none'">
<div style="background:#fff;border-radius:16px;padding:32px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:22px;margin:0">Create Custom Template</h2><button onclick="document.getElementById('newTplModal').style.display='none'" style="background:none;border:none;font-size:24px;cursor:pointer;color:#64748b">&times;</button></div>
<form id="newTplForm" onsubmit="saveTpl(event)">
<div class="form-group"><label>Category</label><select name="category" required style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px"><option value="positive">Positive</option><option value="negative">Negative</option><option value="neutral">Neutral</option><option value="apology">Apology</option><option value="follow-up">Follow-up</option></select></div>
<div class="form-group"><label>Template Name</label><input name="title" required placeholder="e.g. My Thank You Response" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px"></div>
<div class="form-group"><label>Response Text</label><textarea name="body" required rows="6" placeholder="Write your template response..." style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;resize:vertical"></textarea></div>
<button type="submit" class="btn btn-primary" style="width:100%;padding:12px">Save Template</button>
</form></div></div>\`;

  // Preview modal
  html += \`<div id="previewModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;padding:24px" onclick="if(event.target===this)this.style.display='none'">
<div style="background:#fff;border-radius:16px;padding:32px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 id="previewTitle" style="font-size:20px;margin:0"></h2><button onclick="document.getElementById('previewModal').style.display='none'" style="background:none;border:none;font-size:24px;cursor:pointer;color:#64748b">&times;</button></div>
<div id="previewBody" style="white-space:pre-wrap;line-height:1.7;color:#334155;font-size:15px;background:#f8fafc;padding:20px;border-radius:12px"></div>
<button onclick="navigator.clipboard.writeText(document.getElementById('previewBody').textContent);this.textContent='\\u2713 Copied!';setTimeout(()=>this.textContent='Copy to Clipboard',2000)" class="btn btn-primary" style="width:100%;margin-top:16px;padding:12px">Copy to Clipboard</button>
</div></div>\`;

  // JS
  html += '<scr' + 'ipt>';
  html += 'const tplData = ' + JSON.stringify(templates.map(t => ({ id: t.id, title: t.title, body: t.body }))) + ';';
  html += \`
function copyTpl(btn, id) { const t = tplData.find(x=>x.id===id); if(t){navigator.clipboard.writeText(t.body);btn.textContent="\\u2713 Copied!";setTimeout(()=>btn.textContent="\\ud83d\\udccb Copy",2000);} }
function expandTpl(id) { const t = tplData.find(x=>x.id===id); if(t){document.getElementById("previewTitle").textContent=t.title;document.getElementById("previewBody").textContent=t.body;document.getElementById("previewModal").style.display="flex";} }
async function saveTpl(e) { e.preventDefault(); const f=new FormData(e.target); const r=await fetch("/api/response-templates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({category:f.get("category"),title:f.get("title"),body:f.get("body")})}); const d=await r.json(); if(d.ok) location.reload(); else alert(d.error||"Error saving"); }
async function deleteTpl(id) { if(!confirm("Delete this template?")) return; const r=await fetch("/api/response-templates/"+id,{method:"DELETE"}); const d=await r.json(); if(d.ok) location.reload(); else alert(d.error||"Error"); }
\`;
  html += '</scr' + 'ipt>';

  html += '</div>';
  res.send(dashLayout(user, html));
});

// API: Create response template
app.post('/api/response-templates', requireAuth, (req, res) => {
  const user = getUser(req);
  const { category, title, body } = req.body;
  if (!category || !title || !body) return res.json({ error: 'All fields required' });
  const id = uuidv4();
  db.prepare('INSERT INTO response_templates (id,user_id,category,title,body,is_default) VALUES (?,?,?,?,?,0)').run(id, user.id, category, title, body);
  res.json({ ok: true, id });
});

// API: Delete response template (only custom ones)
app.delete('/api/response-templates/:id', requireAuth, (req, res) => {
  const user = getUser(req);
  const r = db.prepare('DELETE FROM response_templates WHERE id=? AND user_id=? AND is_default=0').run(req.params.id, user.id);
  res.json({ ok: r.changes > 0 });
});

// API: Get templates for picker
app.get('/api/response-templates', requireAuth, (req, res) => {
  const user = getUser(req);
  const cat = req.query.category;
  let templates;
  if (cat && cat !== 'all') {
    templates = db.prepare('SELECT id,category,title,body FROM response_templates WHERE (user_id IS NULL OR user_id=?) AND category=? ORDER BY is_default DESC').all(user.id, cat);
  } else {
    templates = db.prepare('SELECT id,category,title,body FROM response_templates WHERE (user_id IS NULL OR user_id=?) ORDER BY category').all(user.id);
  }
  res.json(templates);
});
`;

code = code.replace(
  "app.use((req, res) => { res.status(404).send(notFoundPage()); });",
  newRoutes + "\napp.use((req, res) => { res.status(404).send(notFoundPage()); });"
);

fs.writeFileSync(path, code);
console.log('Patch applied successfully! Lines:', code.split('\n').length);
