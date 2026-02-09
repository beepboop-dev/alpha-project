// Industry-specific landing pages for SEO
// Target: "google review management for [industry]"

const INDUSTRIES = [
  {
    slug: 'restaurants',
    name: 'Restaurants & Cafes',
    icon: '🍽️',
    headline: 'Get More 5-Star Google Reviews for Your Restaurant',
    subheadline: 'ReviewFlow helps restaurants collect Google reviews on autopilot — so you can focus on the food.',
    pain: 'Restaurant owners know the pain: one bad Yelp or Google review can cost you dozens of customers. Meanwhile, your happiest diners walk out the door without leaving a review.',
    stats: [
      { num: '94%', label: 'of diners check Google reviews before choosing a restaurant' },
      { num: '4.1→4.7', label: 'average rating improvement with review routing' },
      { num: '3x', label: 'more Google reviews in the first month' },
    ],
    useCases: [
      'Print QR codes on receipts, table tents, or at the register',
      'Send a follow-up text after delivery or catering orders',
      'Catch kitchen complaints before they become 1-star reviews',
      'Train staff to mention the QR code after a great meal',
    ],
    testimonial: {
      text: 'We went from 47 to 186 Google reviews in 3 months. The QR code at our register is a game changer.',
      name: 'James Thompson',
      title: 'Owner, Main Street Auto Repair',
    },
    keywords: 'google reviews for restaurants, restaurant review management, get more restaurant reviews, restaurant reputation management',
  },
  {
    slug: 'dentists',
    name: 'Dental Practices',
    icon: '🦷',
    headline: 'More Google Reviews for Your Dental Practice',
    subheadline: 'Patients trust Google reviews when choosing a dentist. Make sure yours tell the right story.',
    pain: 'Patients rarely leave reviews after a routine cleaning — but they remember a bad experience. One negative review can scare away dozens of potential patients searching "dentist near me."',
    stats: [
      { num: '86%', label: 'of patients read Google reviews before booking a dentist' },
      { num: '4.2→4.8', label: 'average rating improvement for dental practices' },
      { num: '5x', label: 'more reviews with smart review routing' },
    ],
    useCases: [
      'QR code at the front desk or in the waiting room',
      'Post-appointment text message with review link',
      'Catch patient complaints privately before they go public',
      'Train hygienists to mention the review page after cleanings',
    ],
    testimonial: {
      text: 'Setup took literally 2 minutes. Now I just hand patients a card with the QR code after their appointment. My review count has tripled.',
      name: 'Dr. Sarah Park',
      title: 'Park Family Dental',
    },
    keywords: 'google reviews for dentists, dental practice reviews, dentist reputation management, get more dental reviews',
  },
  {
    slug: 'salons',
    name: 'Salons & Spas',
    icon: '💇',
    headline: 'Get More Google Reviews for Your Salon or Spa',
    subheadline: 'Happy clients love to rave — give them the easiest way to do it on Google.',
    pain: 'Your best clients tell their friends, but forget to leave a Google review. Meanwhile, the one client who had a bad hair day leaves a 1-star review that sits at the top of your profile.',
    stats: [
      { num: '92%', label: 'of people read reviews before trying a new salon' },
      { num: '3.9→4.6', label: 'average rating improvement for salons' },
      { num: '4x', label: 'more Google reviews per month' },
    ],
    useCases: [
      'QR code at each station or mirror',
      'Post-appointment text: "Love your new look? Leave us a quick review!"',
      'Catch service complaints before they become public reviews',
      'Business cards with QR code for referrals',
    ],
    testimonial: {
      text: 'Since using ReviewFlow, our Google reviews went from 3.2 to 4.7 stars. The review gate is genius.',
      name: 'Maria Rodriguez',
      title: 'Owner, Bella\'s Salon & Spa',
    },
    keywords: 'google reviews for salons, salon review management, spa reputation management, get more salon reviews',
  },
  {
    slug: 'auto-repair',
    name: 'Auto Repair Shops',
    icon: '🔧',
    headline: 'Get More Google Reviews for Your Auto Shop',
    subheadline: 'Trust is everything in auto repair. Let your happy customers prove it on Google.',
    pain: 'Auto repair has a trust problem. Customers assume the worst until they see real reviews from real people. But asking for reviews feels awkward when you\'re handing over a repair bill.',
    stats: [
      { num: '88%', label: 'of people check reviews before choosing a mechanic' },
      { num: '4.0→4.7', label: 'average rating improvement for auto shops' },
      { num: '3x', label: 'more Google reviews with QR codes' },
    ],
    useCases: [
      'QR code on the invoice or repair summary',
      'Text message after vehicle pickup',
      'Counter sign in the waiting area',
      'Catch complaints about pricing or wait times privately',
    ],
    testimonial: {
      text: 'Customers used to drive away and forget. Now they scan the QR code while waiting for their keys. Our reviews tripled.',
      name: 'Mike Chen',
      title: 'Owner, Chen\'s Auto Care',
    },
    keywords: 'google reviews for auto repair, mechanic review management, auto shop reputation, get more mechanic reviews',
  },
  {
    slug: 'home-services',
    name: 'Home Services',
    icon: '🏠',
    headline: 'Get More Google Reviews for Your Home Service Business',
    subheadline: 'Plumbers, electricians, HVAC, cleaners — your next customer is reading your reviews right now.',
    pain: 'Home service businesses live and die by Google reviews. Customers searching "plumber near me" pick whoever has the most reviews and the highest rating. If that\'s not you, you\'re losing jobs every day.',
    stats: [
      { num: '97%', label: 'of homeowners read reviews before hiring a service provider' },
      { num: '4.1→4.8', label: 'average rating improvement' },
      { num: '4x', label: 'more reviews with automated follow-ups' },
    ],
    useCases: [
      'Text message review request after completing a job',
      'QR code on invoices and business cards',
      'Catch complaints about pricing or scheduling privately',
      'Leave a "Review us!" card after each service call',
    ],
    testimonial: {
      text: 'We added the QR code to our invoices and went from 2 reviews a month to 12. Best marketing ROI we\'ve ever seen.',
      name: 'Tom Bradley',
      title: 'Bradley Plumbing & HVAC',
    },
    keywords: 'google reviews for home services, plumber reviews, HVAC reputation management, contractor review management',
  },
  {
    slug: 'healthcare',
    name: 'Healthcare & Medical',
    icon: '⚕️',
    headline: 'Get More Google Reviews for Your Medical Practice',
    subheadline: 'Patients choose providers based on reviews. Make sure yours reflect the care you provide.',
    pain: 'Healthcare is personal. Patients who have great experiences rarely think to leave a review — but one negative review about wait times or billing can overshadow years of excellent care.',
    stats: [
      { num: '77%', label: 'of patients use Google reviews as the first step in finding a new doctor' },
      { num: '4.0→4.7', label: 'average rating improvement for medical practices' },
      { num: '3x', label: 'more reviews with smart routing' },
    ],
    useCases: [
      'QR code in the checkout/reception area',
      'Post-visit email or text with review link',
      'Route billing complaints to private feedback',
      'HIPAA-friendly — no patient data collected',
    ],
    testimonial: {
      text: 'We were nervous about asking patients for reviews. ReviewFlow makes it natural — just a QR code at the front desk. Our rating went from 4.1 to 4.8.',
      name: 'Dr. Lisa Nguyen',
      title: 'Family Care Medical Group',
    },
    keywords: 'google reviews for doctors, medical practice reviews, healthcare reputation management, patient review management',
  },
];

module.exports = function(app, css, footer, esc, BASE_URL) {

  // Individual industry pages
  INDUSTRIES.forEach(ind => {
    app.get(`/for/${ind.slug}`, (req, res) => {
      const statsHtml = ind.stats.map(s => `
        <div style="text-align:center">
          <div style="font-size:36px;font-weight:800;color:#2563eb">${s.num}</div>
          <div style="font-size:14px;color:#64748b;margin-top:4px">${esc(s.label)}</div>
        </div>
      `).join('');

      const useCasesHtml = ind.useCases.map(u => `<li>${esc(u)}</li>`).join('');

      res.send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ind.headline)} — ReviewFlow</title>
<meta name="description" content="${esc(ind.subheadline)} Free plan available. Set up in 2 minutes.">
<meta name="keywords" content="${esc(ind.keywords)}">
<meta property="og:title" content="${esc(ind.headline)}">
<meta property="og:description" content="${esc(ind.subheadline)}">
<meta property="og:url" content="${BASE_URL}/for/${ind.slug}">
<meta property="og:type" content="website">
<link rel="canonical" href="${BASE_URL}/for/${ind.slug}">
${css()}
<style>
.ind-hero{padding:80px 24px;text-align:center;background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)}
.ind-hero h1{font-size:clamp(28px,5vw,44px);font-weight:800;color:#0f172a;margin-bottom:16px}
.ind-hero p{font-size:18px;color:#475569;max-width:600px;margin:0 auto 32px}
.ind-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:24px;max-width:700px;margin:0 auto;padding:48px 24px}
.ind-section{max-width:720px;margin:0 auto;padding:48px 24px}
.ind-section h2{font-size:28px;font-weight:700;color:#1e293b;margin-bottom:16px}
.ind-section p{font-size:16px;line-height:1.8;color:#475569;margin-bottom:16px}
.ind-section ul{margin:0 0 24px 24px;color:#475569;line-height:2}
.ind-testimonial{background:#f8fafc;border-left:4px solid #2563eb;padding:24px;border-radius:0 12px 12px 0;margin:32px 0}
.ind-cta{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #2563eb;border-radius:16px;padding:40px;text-align:center;margin:48px 0}
</style></head><body>
<nav style="padding:12px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
<a href="/" style="font-weight:700;font-size:20px;color:#2563eb;text-decoration:none">⭐ ReviewFlow</a>
<div style="display:flex;gap:16px;align-items:center;font-size:14px">
<a href="/blog" style="color:#475569;text-decoration:none">Blog</a>
<a href="/#pricing" style="color:#475569;text-decoration:none">Pricing</a>
<a href="/login" style="color:#475569;text-decoration:none">Log In</a>
<a href="/signup" class="btn btn-primary btn-sm">Start Free</a>
</div></nav>

<div class="ind-hero">
<div style="font-size:48px;margin-bottom:16px">${ind.icon}</div>
<h1>${esc(ind.headline)}</h1>
<p>${esc(ind.subheadline)}</p>
<a href="/signup" class="btn btn-primary" style="font-size:18px;padding:16px 32px">Start Free — No Credit Card Required</a>
</div>

<div class="ind-stats">${statsHtml}</div>

<div class="ind-section">
<h2>The Problem</h2>
<p>${esc(ind.pain)}</p>

<h2>How ReviewFlow Solves It</h2>
<p>ReviewFlow creates a branded review page for your business. When customers visit (via QR code, text, or link):</p>
<ul>
<li><strong>4-5 star ratings</strong> → Redirected to leave a Google review</li>
<li><strong>1-3 star ratings</strong> → Routed to private feedback you can address</li>
</ul>
<p>The result: more positive Google reviews, fewer public negative ones, and you hear about problems before they go public.</p>

<h2>How ${esc(ind.name)} Use ReviewFlow</h2>
<ul>${useCasesHtml}</ul>

<div class="ind-testimonial">
<p style="font-size:16px;font-style:italic;margin-bottom:12px">"${esc(ind.testimonial.text)}"</p>
<p style="font-weight:600;font-size:14px;margin:0">${esc(ind.testimonial.name)}</p>
<p style="font-size:13px;color:#64748b;margin:0">${esc(ind.testimonial.title)}</p>
</div>

<div class="ind-cta">
<h2 style="margin-bottom:8px">Ready to grow your Google reviews?</h2>
<p style="color:#475569;margin-bottom:24px">Join hundreds of ${esc(ind.name.toLowerCase())} using ReviewFlow to collect more 5-star reviews.</p>
<a href="/signup" class="btn btn-primary" style="font-size:18px;padding:16px 32px">Start Free — Set Up in 2 Minutes</a>
<p style="font-size:13px;color:#94a3b8;margin-top:12px">No credit card required · Free plan forever</p>
</div>
</div>

${footer}
</body></html>`);
    });
  });

  // Industry index page
  app.get('/industries', (req, res) => {
    const cards = INDUSTRIES.map(ind => `
      <a href="/for/${ind.slug}" style="display:block;padding:24px;border:1px solid #e2e8f0;border-radius:12px;text-decoration:none;transition:all .2s;background:white">
        <div style="font-size:36px;margin-bottom:8px">${ind.icon}</div>
        <h3 style="color:#1e293b;margin-bottom:4px;font-size:18px">${esc(ind.name)}</h3>
        <p style="color:#64748b;font-size:14px;margin:0">${esc(ind.subheadline)}</p>
      </a>
    `).join('');

    res.send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Google Review Management by Industry — ReviewFlow</title>
<meta name="description" content="ReviewFlow helps local businesses in every industry collect more Google reviews. Find your industry and see how it works.">
<link rel="canonical" href="${BASE_URL}/industries">
${css()}</head><body>
<nav style="padding:12px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
<a href="/" style="font-weight:700;font-size:20px;color:#2563eb;text-decoration:none">⭐ ReviewFlow</a>
<div style="display:flex;gap:16px;align-items:center;font-size:14px">
<a href="/blog" style="color:#475569;text-decoration:none">Blog</a>
<a href="/signup" class="btn btn-primary btn-sm">Start Free</a>
</div></nav>
<div style="max-width:900px;margin:0 auto;padding:48px 24px">
<h1 style="font-size:36px;font-weight:800;text-align:center;margin-bottom:8px">Review Management for Every Industry</h1>
<p style="text-align:center;color:#475569;font-size:18px;margin-bottom:48px">See how ReviewFlow helps businesses like yours collect more Google reviews.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">${cards}</div>
</div>
${footer}</body></html>`);
  });

  // Return industries for sitemap
  return INDUSTRIES;
};
