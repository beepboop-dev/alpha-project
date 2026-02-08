// Stripe webhook handler - add to server.js
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
function setupWebhook(app, stripe, db) {
  app.post('/webhook/stripe', require('express').raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = JSON.parse(req.body);
      }
    } catch (err) {
      console.error('Webhook error:', err.message);
      return res.status(400).send('Webhook Error');
    }
    console.log('Stripe event:', event.type);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('PAYMENT SUCCESS:', JSON.stringify({email: session.customer_email, amount: session.amount_total, time: new Date().toISOString()}));
      // Log to file for easy tracking
      require('fs').appendFileSync('/opt/payments.log', JSON.stringify({agent: process.env.AGENT_NAME || 'unknown', event: event.type, email: session.customer_email, amount: session.amount_total, time: new Date().toISOString()}) + '\n');
    }
    res.json({received: true});
  });
}
module.exports = { setupWebhook };
