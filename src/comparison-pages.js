// comparison-pages.js — SEO comparison landing pages
// Targets: "podium alternative", "birdeye alternative", "nicejob alternative"

const COMPETITORS = [
  {
    slug: 'podium',
    name: 'Podium',
    title: 'ReviewFlow vs Podium — The Affordable Alternative',
    metaDesc: 'Compare ReviewFlow vs Podium for Google review management. Get the same review collection features at a fraction of the cost. Free plan available.',
    heroSubtitle: 'Podium charges $249+/month. ReviewFlow starts free.',
    pricing: '$249–$599/mo',
    founded: '2014',
    focus: 'Multi-channel messaging + reviews for enterprise',
    weaknesses: [
      'Starts at $249/month — overkill for small businesses',
      'Requires annual contracts',
      'Complex setup with many features you won\'t use',
      'No free plan available',
      'Heavy focus on messaging/texting, reviews are secondary',
    ],
    strengths: [
      'Well-established brand with large customer base',
      'Multi-channel messaging (SMS, webchat, payments)',
      'Integrations with many CRMs and POS systems',
    ],
  },
  {
    slug: 'birdeye',
    name: 'Birdeye',
    title: 'ReviewFlow vs Birdeye — Simple & Affordable Review Management',
    metaDesc: 'Compare ReviewFlow vs Birdeye. ReviewFlow offers Google review collection with smart routing for free — no $299/month enterprise pricing needed.',
    heroSubtitle: 'Birdeye charges $299+/month. ReviewFlow starts free.',
    pricing: '$299–$399/mo',
    founded: '2012',
    focus: 'Enterprise reputation management across 200+ sites',
    weaknesses: [
      'Starts at $299/month — designed for enterprises',
      'Complex platform with steep learning curve',
      'Long-term contracts often required',
      'No free plan — not even a free trial without sales call',
      'Overkill for businesses that just need Google reviews',
    ],
    strengths: [
      'Manages reviews across 200+ review sites',
      'AI-powered review response suggestions',
      'Comprehensive reporting and analytics',
    ],
  },
  {
    slug: 'nicejob',
    name: 'NiceJob',
    title: 'ReviewFlow vs NiceJob — Simpler Review Collection',
    metaDesc: 'Compare ReviewFlow vs NiceJob for getting more Google reviews. ReviewFlow offers smart review routing with a free forever plan. No $75/month minimum.',
    heroSubtitle: 'NiceJob charges $75+/month. ReviewFlow starts free.',
    pricing: '$75–$174/mo',
    founded: '2018',
    focus: 'Automated review collection for home services',
    weaknesses: [
      'Starts at $75/month with no free plan',
      'Primarily focused on home services industry',
      'Automated drip campaigns can feel impersonal to customers',
      'Limited customization of review pages',
      'No review gate — all reviews go public (risky for low ratings)',
    ],
    strengths: [
      'Good automation for follow-up sequences',
      'Social proof widgets for websites',
      'Decent integrations for home services businesses',
    ],
  },
  {
    slug: 'gradeus',
    name: 'Grade.us',
    title: 'ReviewFlow vs Grade.us — The Simpler Alternative',
    metaDesc: 'Compare ReviewFlow vs Grade.us for Google review management. ReviewFlow offers smart review routing with a free plan — no $90/month minimum.',
    heroSubtitle: 'Grade.us charges $90+/month. ReviewFlow starts free.',
    pricing: '$90–$300/mo',
    founded: '2013',
    focus: 'White-label review management for agencies',
    weaknesses: [
      'Starts at $90/month per seat — expensive for single locations',
      'Primarily designed for agencies, not individual businesses',
      'Complex white-label setup process',
      'No free plan or free trial without credit card',
      'Interface feels dated compared to modern tools',
    ],
    strengths: [
      'Strong white-label capabilities for agencies',
      'Review funnel (similar to review gating)',
      'Multi-platform review monitoring',
    ],
  },
  {
    slug: 'reputation',
    name: 'Reputation.com',
    title: 'ReviewFlow vs Reputation.com — The Small Business Alternative',
    metaDesc: 'Compare ReviewFlow vs Reputation.com. ReviewFlow gives small businesses Google review management for free — no enterprise contracts needed.',
    heroSubtitle: 'Reputation.com is enterprise-only. ReviewFlow starts free.',
    pricing: 'Custom (typically $500+/mo)',
    founded: '2006',
    focus: 'Enterprise reputation management platform',
    weaknesses: [
      'Enterprise pricing — typically $500+/month',
      'Requires a sales demo just to see pricing',
      'Designed for large multi-location brands, not small businesses',
      'Long implementation and onboarding process',
      'Overkill feature set for businesses that just need Google reviews',
    ],
    strengths: [
      'Comprehensive enterprise reputation suite',
      'AI-powered insights and competitive benchmarking',
      'Used by major brands and healthcare systems',
    ],
  },
  {
    slug: 'gatherup',
    name: 'GatherUp',
    title: 'ReviewFlow vs GatherUp — The Free Alternative',
    metaDesc: 'Compare ReviewFlow vs GatherUp for review collection. ReviewFlow offers smart review gating and QR codes for free — no $99/month subscription.',
    heroSubtitle: 'GatherUp charges $99+/month. ReviewFlow starts free.',
    pricing: '$99–$350/mo',
    founded: '2013',
    focus: 'Customer experience and review management',
    weaknesses: [
      'Starts at $99/month — no free plan',
      'Limited customization on lower-tier plans',
      'Setup requires more technical knowledge',
      'No review gating on basic plans',
      'Cluttered dashboard with too many features',
    ],
    strengths: [
      'Good review request automation sequences',
      'First-party review collection',
      'Net Promoter Score (NPS) surveys',
    ],
  },
];

function comparisonPage(comp, css, footer) {
  const rfFeatures = [
    { feature: 'Free Plan', rf: '✅ Free forever', comp: '❌ No free plan' },
    { feature: 'Starting Price', rf: '$0/mo (paid from $29/mo)', comp: comp.pricing },
    { feature: 'Smart Review Gate', rf: '✅ Built-in', comp: comp.slug === 'nicejob' ? '❌ Not available' : '✅ Available' },
    { feature: 'QR Code Generator', rf: '✅ Included', comp: '✅ Included' },
    { feature: 'Setup Time', rf: '2 minutes', comp: '30+ minutes' },
    { feature: 'Branded Review Pages', rf: '✅ Custom colors & branding', comp: '✅ Available' },
    { feature: 'Google Review Focus', rf: '✅ Purpose-built', comp: comp.slug === 'birdeye' ? '⚠️ Multi-platform (diluted focus)' : '✅ Supported' },
    { feature: 'Annual Contract Required', rf: '❌ No contracts', comp: comp.slug === 'nicejob' ? '❌ Monthly available' : '⚠️ Often required' },
    { feature: 'Analytics Dashboard', rf: '✅ Real-time', comp: '✅ Available' },
    { feature: 'SMS/Email Templates', rf: '✅ Industry-specific', comp: '✅ Available' },
    { feature: 'Best For', rf: 'Small local businesses', comp: comp.slug === 'birdeye' ? 'Enterprise/multi-location' : comp.slug === 'podium' ? 'Mid-market businesses' : 'Home services' },
  ];

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${comp.title}</title>
<meta name="description" content="${comp.metaDesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://alpha.abapture.ai/compare/${comp.slug}">
<meta property="og:title" content="${comp.title}">
<meta property="og:description" content="${comp.metaDesc}">
<link rel="canonical" href="https://alpha.abapture.ai/compare/${comp.slug}">
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": comp.title,
  "description": comp.metaDesc,
  "url": "https://alpha.abapture.ai/compare/" + comp.slug,
  "author": { "@type": "Organization", "name": "ReviewFlow" },
  "publisher": { "@type": "Organization", "name": "ReviewFlow" },
  "datePublished": "2026-02-08",
  "dateModified": "2026-02-08"
})}</script>
${css()}
<style>
.comp-hero{padding:60px 0 40px;background:linear-gradient(135deg,#eff6ff 0%,#fff 100%);text-align:center}
.comp-hero h1{font-size:40px;font-weight:800;line-height:1.2;margin-bottom:16px}
.comp-hero h1 span{color:#2563eb}
.comp-hero p{font-size:20px;color:#64748b;max-width:600px;margin:0 auto 24px}
.comp-table{width:100%;border-collapse:collapse;margin:32px 0}
.comp-table th,.comp-table td{padding:14px 20px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:15px}
.comp-table th{background:#f8fafc;font-weight:600;color:#374151}
.comp-table tr:hover{background:#fafbfc}
.comp-table .rf-col{color:#16a34a;font-weight:500}
.comp-table .comp-col{color:#64748b}
.verdict{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-radius:16px;padding:40px;margin:40px 0;text-align:center}
.verdict h2{font-size:28px;margin-bottom:12px}
.verdict p{font-size:16px;color:#475569;max-width:600px;margin:0 auto 24px}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin:32px 0}
.pros-cons>div{padding:24px;border-radius:12px}
.pros-box{background:#f0fdf4;border:1px solid #bbf7d0}
.cons-box{background:#fef2f2;border:1px solid #fecaca}
.pros-cons h3{font-size:18px;margin-bottom:12px}
.pros-cons li{font-size:14px;line-height:1.8;color:#475569}
.content-section{padding:48px 0}
.content-section h2{font-size:28px;margin-bottom:16px}
.content-section p{font-size:16px;color:#475569;line-height:1.7;margin-bottom:16px;max-width:800px}
@media(max-width:768px){.comp-hero h1{font-size:28px}.pros-cons{grid-template-columns:1fr}.comp-table{font-size:13px}.comp-table th,.comp-table td{padding:10px 12px}}
</style></head><body>
<nav class="nav"><div class="container nav-inner"><a href="/" class="nav-brand">⭐ ReviewFlow</a>
<div class="nav-links"><a href="/#features">Features</a><a href="/#pricing">Pricing</a><a href="/blog">Blog</a><a href="/tools/google-review-link-generator">Free Tools</a><a href="/login">Log In</a><a href="/signup" class="btn btn-primary btn-sm">Start Free</a></div></div></nav>

<section class="comp-hero"><div class="container">
<p style="font-size:14px;color:#2563eb;font-weight:600;margin-bottom:8px;letter-spacing:1px">COMPARISON</p>
<h1><span>ReviewFlow</span> vs ${comp.name}</h1>
<p>${comp.heroSubtitle}</p>
<a href="/signup" class="btn btn-primary" style="padding:14px 36px;font-size:16px">Try ReviewFlow Free →</a>
</div></section>

<section class="content-section"><div class="container" style="max-width:900px;margin:0 auto">
<h2>Feature Comparison</h2>
<p>Here's how ReviewFlow stacks up against ${comp.name} for Google review management:</p>

<div style="overflow-x:auto">
<table class="comp-table">
<thead><tr><th>Feature</th><th style="color:#2563eb">ReviewFlow</th><th>${comp.name}</th></tr></thead>
<tbody>
${rfFeatures.map(f => `<tr><td><strong>${f.feature}</strong></td><td class="rf-col">${f.rf}</td><td class="comp-col">${f.comp}</td></tr>`).join('\n')}
</tbody></table>
</div>

<h2 style="margin-top:48px">Why Businesses Switch from ${comp.name} to ReviewFlow</h2>

<div class="pros-cons">
<div class="cons-box">
<h3>⚠️ ${comp.name} Drawbacks</h3>
<ul>${comp.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
</div>
<div class="pros-box">
<h3>✅ ReviewFlow Advantages</h3>
<ul>
<li>Free forever plan — no credit card required</li>
<li>Purpose-built for Google review collection</li>
<li>Smart review gate protects your rating</li>
<li>Set up in 2 minutes, no training needed</li>
<li>No contracts, cancel anytime</li>
<li>Branded review pages with QR codes</li>
</ul>
</div>
</div>

<h2 style="margin-top:48px">Who Is ${comp.name} Best For?</h2>
<p>${comp.name} (founded ${comp.founded}) is a ${comp.focus}. It's a solid platform for mid-to-large businesses that need comprehensive reputation management across multiple channels and have the budget to match (${comp.pricing}).</p>
<p>However, if you're a <strong>small local business</strong> — a restaurant, dental office, salon, auto shop, or any single-location business — you probably don't need all that complexity. You need a simple way to get more Google reviews and protect your rating from negative ones.</p>

<h2 style="margin-top:48px">Who Is ReviewFlow Best For?</h2>
<p>ReviewFlow is built specifically for <strong>small local businesses</strong> that want to:</p>
<ul style="font-size:16px;color:#475569;line-height:2;margin-bottom:24px;padding-left:20px">
<li>Get more 5-star Google reviews without expensive software</li>
<li>Protect their rating with smart review gating</li>
<li>Give customers a simple, branded way to leave feedback</li>
<li>Track reviews and ratings with real-time analytics</li>
<li>Start for free and upgrade only when they need to</li>
</ul>

<div class="verdict">
<h2>The Verdict</h2>
<p>If you're a small local business looking for an affordable, focused Google review management tool, <strong>ReviewFlow is the clear choice</strong>. You get the core features that matter — smart review routing, QR codes, branded pages, and analytics — without the enterprise price tag.</p>
<a href="/signup" class="btn btn-primary" style="padding:16px 40px;font-size:17px">Start Collecting Reviews — Free</a>
<p style="font-size:13px;color:#94a3b8;margin-top:12px">No credit card required · Set up in 2 minutes</p>
</div>

<h2 style="margin-top:48px">Frequently Asked Questions</h2>
<div style="margin-top:16px">
<details style="margin-bottom:12px;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
<summary style="font-weight:600;cursor:pointer;font-size:15px">Is ReviewFlow really free?</summary>
<p style="margin-top:12px;font-size:14px;color:#475569">Yes. ReviewFlow offers a free forever plan that includes 1 location, a branded review page, QR code, smart review gate, and basic analytics. No credit card required.</p>
</details>
<details style="margin-bottom:12px;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
<summary style="font-weight:600;cursor:pointer;font-size:15px">Can I migrate from ${comp.name} to ReviewFlow?</summary>
<p style="margin-top:12px;font-size:14px;color:#475569">Absolutely. ReviewFlow takes just 2 minutes to set up. Simply create an account, add your business details and Google review link, and you're live. You can run both tools in parallel during the transition.</p>
</details>
<details style="margin-bottom:12px;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
<summary style="font-weight:600;cursor:pointer;font-size:15px">What is smart review gating?</summary>
<p style="margin-top:12px;font-size:14px;color:#475569">Smart review gating asks customers to rate their experience first. Happy customers (4-5 stars) are directed to leave a Google review. Unhappy customers (1-3 stars) are routed to a private feedback form so you can resolve their issue before it becomes a public negative review.</p>
</details>
<details style="margin-bottom:12px;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
<summary style="font-weight:600;cursor:pointer;font-size:15px">Does ReviewFlow work with my type of business?</summary>
<p style="margin-top:12px;font-size:14px;color:#475569">ReviewFlow works for any local business that has a Google Business Profile — restaurants, salons, dental offices, auto shops, medical practices, law firms, real estate agents, retail stores, and more. We have industry-specific templates built in.</p>
</details>
</div>

</div></section>

<section class="cta" style="padding:60px 0;background:#1e293b;color:#fff;text-align:center"><div class="container">
<h2 style="font-size:32px;margin-bottom:12px">Ready to Switch from ${comp.name}?</h2>
<p style="color:#94a3b8;font-size:18px;margin-bottom:24px">Join hundreds of local businesses using ReviewFlow to grow their Google reviews.</p>
<a href="/signup" class="btn btn-primary" style="padding:16px 40px;font-size:17px">Start Free — No Credit Card</a>
</div></section>

${footer()}
</body></html>`;
}

module.exports = { COMPETITORS, comparisonPage };
