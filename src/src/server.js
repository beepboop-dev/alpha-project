const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3100;

// Stripe webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Wait for DB then start
const db = require('./db/schema');
db.ready.then(() => {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/proposals', require('./routes/proposals'));
  app.use('/api/stripe', require('./routes/stripe'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProposalDash running on port ${PORT}`);
  });
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
