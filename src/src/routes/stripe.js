const express = require('express');
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (user.plan === 'pro') return res.status(400).json({ error: "You're already on the Pro plan!" });
    
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { user_id: user.id } });
      customerId = customer.id;
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, user.id);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'ProposalDash Pro', description: 'Unlimited proposals, analytics, custom branding, e-signatures' },
          unit_amount: 1900,
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { user_id: user.id }
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error:', e);
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        db.prepare("UPDATE users SET plan = 'pro', stripe_subscription_id = ? WHERE id = ?").run(session.subscription, userId);
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      db.prepare("UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE stripe_subscription_id = ?").run(sub.id);
    }
    res.json({ received: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
