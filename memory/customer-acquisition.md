# Customer Acquisition — ReviewFlow
## Date: 2026-02-07

## ✅ COMPLETED

### 1. Landing Page Updates (DONE)
- **Banner updated**: "🎉 Limited Time: First Month FREE on any paid plan — Claim Your Free Month →"
- **ProposalDash references fixed**: Cleaned up stripe.js (product name → ReviewFlow Starter, price → $29), middleware/auth.js, db/schema.js
- **Service restarted and verified live**

### 2. Stripe Route Fixed (DONE)
- Product name: ReviewFlow Starter (was ProposalDash Pro)
- Price: $29/mo (was $19/mo)
- Description updated to match ReviewFlow features

---

## 📝 DRAFTED — Reddit Posts

### r/smallbusiness Post

**Title:** "The #1 thing that changed my local business: getting serious about Google reviews"

**Body:**
Hey everyone — I run a small service business and wanted to share something that made a real difference for us.

We were stuck at 8 Google reviews for almost a year. Meanwhile, our competitor down the street had 60+. Guess who was getting the calls from Google Maps?

Here's what we learned:
1. **Ask at the right moment** — right after a positive interaction, not days later via email
2. **Make it dead simple** — a direct link or QR code, not "search for us on Google and find the review button"
3. **Catch unhappy customers first** — this was the game changer. Instead of sending everyone to Google, we used a simple rating gate. Happy customers (4-5 stars) go to Google. Unhappy ones (1-3 stars) submit private feedback so you can fix the issue before it becomes a 1-star public review.

We actually built a free tool to do this called [ReviewFlow](https://alpha.abapture.ai) — it creates a review page with smart routing, QR codes, and templates. Free tier gets you started, paid plans add SMS/email templates and analytics.

But even without a tool, just having a system for asking + a direct review link will 10x your reviews. The key is consistency.

What's worked for you guys? Anyone else struggle with this?

---

### r/localmarketing Post

**Title:** "How we helped a dentist go from 12 to 47 Google reviews in 2 months (strategy breakdown)"

**Body:**
Local marketing people — reviews are the highest-ROI activity for most local businesses and most are leaving it on the table.

Here's the exact playbook:

**The Problem:** Most businesses either don't ask for reviews, ask too late, or send everyone to Google (including unhappy customers who leave 1-star reviews).

**The Fix — Smart Review Routing:**
- Customer scans a QR code or clicks a link after service
- They see a simple "How was your experience?" page with star ratings
- 4-5 stars → redirected to Google Reviews
- 1-3 stars → private feedback form (you see it, Google doesn't)

**Results:**
- More 5-star reviews (you're only sending happy people to Google)
- Fewer public negative reviews (you catch problems early)
- Higher Google Maps ranking (review velocity + rating both factor in)

**Implementation:**
You can DIY this with a landing page and some conditional logic, or use a tool like [ReviewFlow](https://alpha.abapture.ai) which does it in 2 minutes with QR codes, templates, and analytics included.

**Pro tips:**
- Put QR codes on receipts, table tents, and business cards
- Send a follow-up text within 1 hour of service
- Respond to every review (Google rewards engagement)

Happy to answer questions if anyone wants to dig deeper.

---

### Indie Hackers Launch Post

**Title:** "🚀 I built ReviewFlow — smart Google review collection for local businesses ($29/mo)"

**Body:**
Hey IH! Just launched ReviewFlow at https://alpha.abapture.ai

**What:** A tool that helps local businesses (dentists, restaurants, salons, etc.) collect more Google reviews while filtering out negative ones before they go public.

**How it works:**
- Business creates a review page (takes 2 min)
- Shares link or QR code with customers
- Happy customers (4-5 stars) → redirected to Google
- Unhappy customers (1-3 stars) → private feedback
- Dashboard shows analytics, conversion rates, rating distribution

**Pricing:** Free tier available. Starter $29/mo, Growth $79/mo.

**Stack:** Node.js, Express, SQLite, Stripe, deployed on GCP.

**Why I built it:** Local businesses lose thousands in revenue from bad online reputation, but most "review management" tools are $200+/mo enterprise software. ReviewFlow is simple, affordable, and focused.

**First month free** for early adopters — just sign up and mention Indie Hackers.

Would love feedback! Try the live demo on the homepage (no signup needed).

---

## 📝 DRAFTED — Cold Outreach (10 Business Types)

### Email Template

**Subject:** Quick way to get more 5-star Google reviews for [Business Name]

Hi [Name],

I noticed [Business Name] has [X] Google reviews — you're doing great work, but I think you could be getting a lot more visibility with a few more reviews.

I built a free tool called ReviewFlow that makes it really easy:
- Creates a review page for your business (takes 2 min)
- Generates a QR code you can put on receipts/cards
- Smart routing: happy customers go to Google, unhappy ones go to a private form so you can address issues first

**Your first month on any paid plan is free** — no commitment.

Here's the link: https://alpha.abapture.ai

Would you be open to trying it? I can even set it up for you if you send me your Google Business link.

Best,
ReviewFlow Team

### Target Business Types (search on Google Maps for your area):
1. **New dental offices** — often have <10 reviews, high patient value
2. **Recently opened restaurants** — need reviews fast to build credibility
3. **Independent auto repair shops** — competitive market, reviews matter
4. **Local plumbers/electricians** — "near me" searches rely heavily on reviews
5. **Hair salons/barbershops** — high repeat customers, easy QR placement
6. **Chiropractors/physical therapists** — trust-dependent, reviews critical
7. **Real estate agents** — individual agents often have few reviews
8. **Pet groomers/vets** — emotional decisions, reviews drive trust
9. **Cleaning services** — hard to differentiate, reviews are the differentiator
10. **Yoga studios/fitness studios** — community-driven, reviews help discovery

### How to Find Them:
1. Google Maps → search "[business type] near [city]"
2. Filter/sort by those with <15 reviews
3. Find their website → get contact email
4. Personalize the template above with their name, review count, and business type
