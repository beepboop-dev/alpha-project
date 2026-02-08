module.exports = function(app, css, footer, esc, BASE_URL) {

app.get("/tools/google-review-link-generator", (req, res) => {
  var jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Google Review Link Generator",
    "description": "Generate a direct Google review link for your business. Free tool, no signup required.",
    "url": BASE_URL + "/tools/google-review-link-generator",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  });

  var html = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">"
    + "<title>Free Google Review Link Generator — Get Your Direct Review URL | ReviewFlow</title>"
    + "<meta name=\"description\" content=\"Generate a direct Google review link for your business in seconds. Free tool — no signup required. Share via QR code, SMS, or email to get more reviews.\">"
    + "<link rel=\"canonical\" href=\"" + BASE_URL + "/tools/google-review-link-generator\">"
    + "<meta property=\"og:title\" content=\"Free Google Review Link Generator\">"
    + "<meta property=\"og:description\" content=\"Get a direct Google review link for your business. Free, no signup required.\">"
    + "<meta property=\"og:type\" content=\"website\">"
    + "<script type=\"application/ld+json\">" + jsonLd + "</script>"
    + css()
    + "<style>"
    + ".tool-wrap{max-width:720px;margin:0 auto;padding:48px 24px}"
    + ".tool-box{background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:32px;margin:32px 0}"
    + ".tool-input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:16px;margin-bottom:16px;box-sizing:border-box}"
    + ".tool-input:focus{outline:none;border-color:#2563eb}"
    + ".tool-btn{background:#2563eb;color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;width:100%}"
    + ".tool-btn:hover{background:#1d4ed8}"
    + ".result-box{background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;margin-top:20px;display:none}"
    + ".result-link{word-break:break-all;font-family:monospace;font-size:14px;background:#fff;padding:12px;border-radius:8px;border:1px solid #e2e8f0;margin:12px 0}"
    + ".copy-btn{background:#22c55e;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}"
    + ".copy-btn:hover{background:#16a34a}"
    + ".step{display:flex;gap:16px;margin-bottom:24px;align-items:flex-start}"
    + ".step-num{background:#2563eb;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}"
    + ".step-content h3{margin:0 0 4px;font-size:16px}.step-content p{margin:0;color:#64748b;font-size:14px}"
    + ".tool-cta{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #2563eb;border-radius:16px;padding:32px;text-align:center;margin:40px 0}"
    + "</style></head><body>"
    + "<nav class=\"nav\"><div class=\"container nav-inner\"><a href=\"/\" class=\"nav-brand\">⭐ ReviewFlow</a>"
    + "<div class=\"nav-links\"><a href=\"/blog\">Blog</a><a href=\"/tools/google-review-link-generator\">Free Tool</a><a href=\"/#pricing\">Pricing</a><a href=\"/login\">Log In</a><a href=\"/signup\" class=\"btn btn-primary btn-sm\">Start Free</a></div></div></nav>"
    + "<div class=\"tool-wrap\">"
    + "<h1 style=\"font-size:36px;margin-bottom:8px\">Free Google Review Link Generator</h1>"
    + "<p style=\"color:#64748b;font-size:18px;margin-bottom:32px\">Get a direct link to your Google review page. Share it with customers to collect more 5-star reviews.</p>"
    + "<div class=\"tool-box\">"
    + "<h2 style=\"font-size:20px;margin-bottom:16px\">Find Your Business</h2>"
    + "<input type=\"text\" id=\"bizSearch\" class=\"tool-input\" placeholder=\"Search your business name (e.g. Joe&#39;s Pizza Los Angeles)\">"
    + "<button class=\"tool-btn\" onclick=\"searchBiz()\">&#x1F50D; Search Google Places</button>"
    + "<div id=\"searchResults\" class=\"search-results\"></div>"
    + "<div id=\"resultBox\" class=\"result-box\">"
    + "<h3 style=\"margin-bottom:8px\">&#x2705; Your Google Review Link</h3>"
    + "<p style=\"color:#64748b;font-size:14px\">Share this link with your customers:</p>"
    + "<div id=\"reviewLink\" class=\"result-link\"></div>"
    + "<div style=\"display:flex;gap:12px;flex-wrap:wrap\">"
    + "<button class=\"copy-btn\" onclick=\"copyLink()\">&#x1F4CB; Copy Link</button>"
    + "<button class=\"copy-btn\" style=\"background:#2563eb\" onclick=\"window.location.href='/signup'\">&#x1F680; Create Review Page + QR Code</button>"
    + "</div>"
    + "<p style=\"color:#64748b;font-size:13px;margin-top:16px\"><strong>Want more?</strong> ReviewFlow creates a branded review page with smart routing, QR codes, and analytics — <a href=\"/signup\" style=\"color:#2563eb\">free to start</a>.</p>"
    + "</div></div>"
    + "<h2 style=\"margin-top:40px;margin-bottom:24px\">How to Find Your Google Review Link Manually</h2>"
    + "<div class=\"step\"><div class=\"step-num\">1</div><div class=\"step-content\"><h3>Search for your business on Google Maps</h3><p>Go to <a href=\"https://maps.google.com\" style=\"color:#2563eb\">maps.google.com</a> and search for your business name.</p></div></div>"
    + "<div class=\"step\"><div class=\"step-num\">2</div><div class=\"step-content\"><h3>Find your Place ID</h3><p>Click your business listing. The Place ID is in the URL or use Google Place ID Finder.</p></div></div>"
    + "<div class=\"step\"><div class=\"step-num\">3</div><div class=\"step-content\"><h3>Build your review link</h3><p>Your direct review URL format: <code>https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID</code></p></div></div>"
    + "<div class=\"step\"><div class=\"step-num\">4</div><div class=\"step-content\"><h3>Or use the generator above</h3><p>Our tool does all this automatically — just search and click.</p></div></div>"
    + "<h2 style=\"margin-top:40px;margin-bottom:16px\">Why You Need a Direct Google Review Link</h2>"
    + "<ul style=\"color:#475569;line-height:2\">"
    + "<li><strong>3x more reviews</strong> — Remove friction and customers actually follow through</li>"
    + "<li><strong>Higher star rating</strong> — Direct links catch customers while the experience is fresh</li>"
    + "<li><strong>Better local SEO</strong> — More reviews = higher Google Maps ranking</li>"
    + "<li><strong>Easy to share</strong> — Works in SMS, email, QR codes, and social media</li></ul>"
    + "<h2 style=\"margin-top:40px;margin-bottom:16px\">Where to Share Your Google Review Link</h2>"
    + "<ul style=\"color:#475569;line-height:2\">"
    + "<li>&#x1F4F1; <strong>Text messages</strong> after a service visit</li>"
    + "<li>&#x1F4E7; <strong>Follow-up emails</strong> to recent customers</li>"
    + "<li>&#x1F4CB; <strong>QR codes</strong> at your register, tables, or waiting room</li>"
    + "<li>&#x1F4B3; <strong>Business cards</strong> and receipts</li>"
    + "<li>&#x1F310; <strong>Your website</strong> and social media profiles</li></ul>"
    + "<div class=\"tool-cta\">"
    + "<h3 style=\"font-size:22px;margin-bottom:8px\">Go Beyond a Simple Link</h3>"
    + "<p style=\"color:#64748b;margin-bottom:16px\">ReviewFlow creates a branded review page that routes happy customers to Google and catches unhappy feedback privately. Plus QR codes and analytics.</p>"
    + "<a href=\"/signup\" class=\"btn btn-primary\" style=\"padding:14px 36px;font-size:16px\">Create Your Review Page — Free</a>"
    + "<p style=\"color:#64748b;font-size:13px;margin-top:8px\">No credit card required · 2-minute setup</p>"
    + "</div></div>"
    + footer()
    + "<script>"
    + "async function searchBiz(){var q=document.getElementById(\"bizSearch\").value.trim();if(!q)return;var el=document.getElementById(\"searchResults\");el.innerHTML=\"<div style=\\\"text-align:center;padding:20px;color:#64748b\\\">Searching...</div>\";try{var res=await fetch(\"/api/places-search-public?q=\"+encodeURIComponent(q));var data=await res.json();if(data.error){el.innerHTML=\"<p style=\\\"color:#ef4444\\\">\"+data.error+\"</p>\";return;}if(!data.results||data.results.length===0){el.innerHTML=\"<p style=\\\"color:#64748b\\\">No businesses found. Try adding your city name.</p>\";return;}el.innerHTML=data.results.map(function(p){return\"<div style=\\\"background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;cursor:pointer\\\" onclick=\\\"selectPlace(\"+JSON.stringify(p.place_id)+\",\"+JSON.stringify(p.name)+\")\\\">\"+\"<div style=\\\"font-weight:600;color:#1e293b\\\">\"+esc(p.name)+\"</div>\"+(p.formatted_address?\"<div style=\\\"color:#64748b;font-size:14px;margin-top:4px\\\">\"+esc(p.formatted_address)+\"</div>\":\"\")+(p.rating?\"<div style=\\\"color:#f59e0b;font-size:14px;margin-top:4px\\\">&#x2B50; \"+p.rating+\" (\"+p.user_ratings_total+\" reviews)</div>\":\"\")+(\"</div>\");}).join(\"\");}catch(e){el.innerHTML=\"<p style=\\\"color:#ef4444\\\">Search failed. Try again.</p>\";}}function esc(s){if(!s)return\"\";return s.replace(/&/g,\"&amp;\").replace(/</g,\"&lt;\").replace(/>/g,\"&gt;\");}function selectPlace(id,name){var link=\"https://search.google.com/local/writereview?placeid=\"+id;document.getElementById(\"reviewLink\").textContent=link;document.getElementById(\"resultBox\").style.display=\"block\";document.getElementById(\"searchResults\").innerHTML=\"<p style=\\\"color:#22c55e;font-weight:600\\\">Selected: \"+esc(name)+\"</p>\";}function copyLink(){var link=document.getElementById(\"reviewLink\").textContent;navigator.clipboard.writeText(link).then(function(){var b=document.querySelector(\".copy-btn\");b.textContent=\"Copied!\";setTimeout(function(){b.textContent=\"Copy Link\";},2000);});}document.getElementById(\"bizSearch\").addEventListener(\"keydown\",function(e){if(e.key===\"Enter\")searchBiz();});"
    + "</script></body></html>";

  res.send(html);
});

app.get("/api/places-search-public", async (req, res) => {
  var q = (req.query.q || "").trim();
  if (!q || q.length < 2) return res.json({ error: "Please enter a business name" });
  try {
    var apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) return res.json({ error: "Places search not configured. Use the manual method below." });
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + encodeURIComponent(q) + "&type=establishment&key=" + apiKey;
    var resp = await fetch(url);
    var data = await resp.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return res.json({ error: "Search unavailable right now." });
    var results = (data.results || []).slice(0, 5).map(function(p) {
      return { place_id: p.place_id, name: p.name, formatted_address: p.formatted_address, rating: p.rating, user_ratings_total: p.user_ratings_total };
    });
    res.json({ results: results });
  } catch(e) {
    res.json({ error: "Search failed. Try again." });
  }
});


app.get("/tools/review-response-generator", (req, res) => {
  var jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Google Review Response Generator",
    "description": "Generate professional responses to Google reviews in seconds. Free tool for local businesses.",
    "url": BASE_URL + "/tools/review-response-generator",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  });

  var html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Free Google Review Response Generator — Professional Reply Templates | ReviewFlow</title>
<meta name="description" content="Generate professional responses to positive and negative Google reviews in seconds. Free templates for local businesses. No signup required.">
<link rel="canonical" href="${BASE_URL}/tools/review-response-generator">
<meta property="og:title" content="Free Google Review Response Generator">
<meta property="og:description" content="Generate professional responses to Google reviews. Free tool for local businesses.">
<meta property="og:type" content="website">
<script type="application/ld+json">${jsonLd}</script>
${css()}
<style>
.tool-wrap{max-width:720px;margin:0 auto;padding:48px 24px}
.tool-box{background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:32px;margin:32px 0}
.tool-input,.tool-select{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:16px;margin-bottom:16px;box-sizing:border-box;font-family:inherit}
.tool-input:focus,.tool-select:focus{outline:none;border-color:#2563eb}
.tool-btn{background:#2563eb;color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;width:100%}
.tool-btn:hover{background:#1d4ed8}
.result-box{background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;margin-top:20px;display:none}
.response-text{font-size:15px;line-height:1.7;background:#fff;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin:12px 0;white-space:pre-wrap}
.copy-btn{background:#22c55e;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
.copy-btn:hover{background:#16a34a}
.regen-btn{background:#6366f1;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
.regen-btn:hover{background:#4f46e5}
.star-select{display:flex;gap:8px;margin-bottom:16px}
.star-btn{width:48px;height:48px;border-radius:10px;border:2px solid #e2e8f0;background:#fff;font-size:24px;cursor:pointer;transition:all .2s}
.star-btn:hover,.star-btn.active{border-color:#f59e0b;background:#fffbeb}
.tone-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.tone-chip{padding:8px 16px;border-radius:20px;border:2px solid #e2e8f0;background:#fff;font-size:14px;cursor:pointer;transition:all .2s}
.tone-chip:hover,.tone-chip.active{border-color:#2563eb;background:#eff6ff;color:#2563eb}
.tool-cta{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #2563eb;border-radius:16px;padding:32px;text-align:center;margin:40px 0}
.faq-item{border-bottom:1px solid #e2e8f0;padding:16px 0}
.faq-q{font-weight:600;font-size:16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.faq-a{color:#64748b;font-size:15px;margin-top:8px;display:none;line-height:1.6}
.faq-item.open .faq-a{display:block}
</style></head><body>
<nav class="nav"><div class="container nav-inner"><a href="/" class="nav-brand">⭐ ReviewFlow</a>
<div class="nav-links"><a href="/blog">Blog</a><a href="/tools/google-review-link-generator">Review Link Tool</a><a href="/#pricing">Pricing</a><a href="/login">Log In</a><a href="/signup" class="btn btn-primary btn-sm">Start Free</a></div></div></nav>
<div class="tool-wrap">
<h1 style="font-size:36px;margin-bottom:8px">Free Google Review Response Generator</h1>
<p style="color:#64748b;font-size:18px;margin-bottom:32px">Generate professional, personalized responses to customer reviews in seconds. No signup required.</p>

<div class="tool-box">
<h2 style="font-size:20px;margin-bottom:16px">Step 1: What rating did the customer give?</h2>
<div class="star-select" id="starSelect">
<button class="star-btn" data-star="1" onclick="selectStar(1)">1⭐</button>
<button class="star-btn" data-star="2" onclick="selectStar(2)">2⭐</button>
<button class="star-btn" data-star="3" onclick="selectStar(3)">3⭐</button>
<button class="star-btn" data-star="4" onclick="selectStar(4)">4⭐</button>
<button class="star-btn active" data-star="5" onclick="selectStar(5)">5⭐</button>
</div>

<h2 style="font-size:20px;margin-bottom:16px">Step 2: Customer's name (optional)</h2>
<input type="text" id="custName" class="tool-input" placeholder="e.g. Sarah">

<h2 style="font-size:20px;margin-bottom:16px">Step 3: What did they mention? (optional)</h2>
<input type="text" id="custMention" class="tool-input" placeholder="e.g. great coffee, friendly staff, long wait time">

<h2 style="font-size:20px;margin-bottom:16px">Step 4: Your business name</h2>
<input type="text" id="bizName" class="tool-input" placeholder="e.g. Joe's Coffee Shop">

<h2 style="font-size:20px;margin-bottom:16px">Step 5: Choose your tone</h2>
<div class="tone-chips">
<div class="tone-chip active" data-tone="professional" onclick="selectTone(this)">Professional</div>
<div class="tone-chip" data-tone="friendly" onclick="selectTone(this)">Friendly & Warm</div>
<div class="tone-chip" data-tone="casual" onclick="selectTone(this)">Casual</div>
<div class="tone-chip" data-tone="formal" onclick="selectTone(this)">Formal</div>
</div>

<button class="tool-btn" onclick="generateResponse()">✨ Generate Response</button>

<div id="resultBox" class="result-box">
<h3 style="margin-bottom:8px">✅ Your Review Response</h3>
<div id="responseText" class="response-text"></div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<button class="copy-btn" onclick="copyResponse()">📋 Copy Response</button>
<button class="regen-btn" onclick="generateResponse()">🔄 Generate Another</button>
</div>
</div>
</div>

<h2 style="margin-top:48px;margin-bottom:24px">Why Responding to Google Reviews Matters</h2>
<ul style="color:#475569;line-height:2.2">
<li><strong>53% of customers</strong> expect a response to their review within 7 days</li>
<li>Businesses that respond to reviews earn <strong>35% more revenue</strong> on average</li>
<li>Google confirms that <strong>responding to reviews improves your local SEO ranking</strong></li>
<li>A thoughtful response to a negative review can <strong>win back 70% of unhappy customers</strong></li>
<li>Potential customers read your responses — it's <strong>free marketing</strong></li>
</ul>

<h2 style="margin-top:40px;margin-bottom:24px">How to Respond to Different Star Ratings</h2>

<h3 style="margin-top:24px;color:#22c55e">⭐⭐⭐⭐⭐ 5-Star Reviews</h3>
<p style="color:#475569;margin-bottom:16px">Thank the customer by name, mention what they enjoyed, and invite them back. Keep it genuine — avoid copy-paste responses.</p>

<h3 style="margin-top:24px;color:#eab308">⭐⭐⭐⭐ 4-Star Reviews</h3>
<p style="color:#475569;margin-bottom:16px">Thank them, acknowledge what went well, and gently ask what could make it 5 stars next time. Shows you care about improvement.</p>

<h3 style="margin-top:24px;color:#f97316">⭐⭐⭐ 3-Star Reviews</h3>
<p style="color:#475569;margin-bottom:16px">Acknowledge their mixed experience. Thank them for the feedback. Ask them to reach out privately so you can improve.</p>

<h3 style="margin-top:24px;color:#ef4444">⭐⭐ and ⭐ 1-2 Star Reviews</h3>
<p style="color:#475569;margin-bottom:16px">Apologize sincerely. Don't be defensive. Take the conversation offline. Offer to make it right. Follow up after resolving.</p>

<h2 style="margin-top:40px;margin-bottom:16px">Frequently Asked Questions</h2>
<div id="faqList">
<div class="faq-item" onclick="this.classList.toggle('open')">
<div class="faq-q">Should I respond to every Google review? <span>+</span></div>
<div class="faq-a">Yes. Google has confirmed that responding to reviews improves your local search ranking. It also shows potential customers that you value feedback. Aim to respond within 24-48 hours.</div>
</div>
<div class="faq-item" onclick="this.classList.toggle('open')">
<div class="faq-q">How long should my review response be? <span>+</span></div>
<div class="faq-a">Keep it concise — 2-4 sentences for positive reviews, 3-5 sentences for negative reviews. Long responses can seem defensive. Be genuine and specific.</div>
</div>
<div class="faq-item" onclick="this.classList.toggle('open')">
<div class="faq-q">Should I respond to negative reviews publicly? <span>+</span></div>
<div class="faq-a">Yes, respond publicly to acknowledge the issue, but take the detailed conversation offline. Provide a phone number or email. This shows other readers you care while keeping the resolution private.</div>
</div>
<div class="faq-item" onclick="this.classList.toggle('open')">
<div class="faq-q">Can I delete a negative Google review? <span>+</span></div>
<div class="faq-a">You can only flag reviews that violate Google's policies (spam, fake, offensive). Legitimate negative reviews cannot be removed. The best strategy is to respond professionally and collect more positive reviews to push the rating up.</div>
</div>
<div class="faq-item" onclick="this.classList.toggle('open')">
<div class="faq-q">How can I prevent negative reviews? <span>+</span></div>
<div class="faq-a">Use smart review routing (like ReviewFlow) to ask customers about their experience first. Happy customers go to Google. Unhappy customers get a private feedback form, giving you a chance to fix issues before they go public.</div>
</div>
</div>

<div class="tool-cta">
<h3 style="font-size:22px;margin-bottom:8px">Stop Chasing Reviews. Start Routing Them.</h3>
<p style="color:#64748b;margin-bottom:16px">ReviewFlow automatically sends happy customers to Google and catches unhappy feedback privately. QR codes, analytics, and response templates included.</p>
<a href="/signup" class="btn btn-primary" style="padding:14px 36px;font-size:16px">Get ReviewFlow — Free</a>
<p style="color:#64748b;font-size:13px;margin-top:8px">No credit card required · 2-minute setup</p>
</div>
</div>

${footer()}

<script>
var selectedStar = 5;
var selectedTone = "professional";

function selectStar(n) {
  selectedStar = n;
  document.querySelectorAll(".star-btn").forEach(function(b) {
    b.classList.toggle("active", parseInt(b.dataset.star) === n);
  });
}

function selectTone(el) {
  selectedTone = el.dataset.tone;
  document.querySelectorAll(".tone-chip").forEach(function(c) { c.classList.remove("active"); });
  el.classList.add("active");
}

function generateResponse() {
  var name = document.getElementById("custName").value.trim() || "";
  var mention = document.getElementById("custMention").value.trim() || "";
  var biz = document.getElementById("bizName").value.trim() || "our business";
  var greeting = name ? "Hi " + name + "," : "Hi there,";

  var templates = {
    5: {
      professional: [
        greeting + " thank you so much for the wonderful 5-star review! " + (mention ? "We're thrilled to hear you enjoyed " + mention + ". " : "") + "Your feedback means the world to our team at " + biz + ". We look forward to welcoming you back soon!",
        greeting + " we truly appreciate you taking the time to leave such a fantastic review! " + (mention ? "It's great to know that " + mention + " made your experience special. " : "") + "Thank you for choosing " + biz + " — we can't wait to see you again!",
        greeting + " wow, thank you for the amazing review! " + (mention ? "We're so glad " + mention + " stood out to you. " : "") + "Your kind words motivate our entire team at " + biz + ". See you next time!"
      ],
      friendly: [
        greeting + " you just made our day! 😊 Thank you so much for the 5-star review. " + (mention ? "So happy you loved " + mention + "! " : "") + "We can't wait to have you back at " + biz + "!",
        greeting + " thank you, thank you, thank you! 🙏 " + (mention ? "We love hearing that " + mention + " hit the mark. " : "") + "You're always welcome at " + biz + " — see you soon!",
        greeting + " this review absolutely made our week! " + (mention ? "Thrilled that " + mention + " was a highlight for you. " : "") + "Thanks for supporting " + biz + " — you're the best! 🌟"
      ],
      casual: [
        greeting + " thanks a ton for the awesome review! " + (mention ? "Stoked you enjoyed " + mention + ". " : "") + "Hope to see you back at " + biz + " soon!",
        greeting + " really appreciate the 5 stars! " + (mention ? "Glad " + mention + " was on point. " : "") + "Come back anytime — " + biz + " loves having you!",
        greeting + " you rock! Thanks for the great review. " + (mention ? "Happy to hear " + mention + " was a win. " : "") + "See you around at " + biz + "!"
      ],
      formal: [
        greeting + " thank you sincerely for your generous 5-star review. " + (mention ? "We are pleased to learn that " + mention + " met your expectations. " : "") + "At " + biz + ", we are committed to providing an excellent experience, and your feedback reinforces our dedication. We look forward to serving you again.",
        greeting + " we are deeply grateful for your outstanding review. " + (mention ? "It is gratifying to know that " + mention + " contributed positively to your visit. " : "") + "We at " + biz + " value your patronage and look forward to your next visit."
      ]
    },
    4: {
      professional: [
        greeting + " thank you for the great 4-star review! " + (mention ? "We're glad you appreciated " + mention + ". " : "") + "We'd love to know what would make it a perfect 5 next time. Your feedback helps " + biz + " keep improving!",
        greeting + " we appreciate your feedback and the 4-star rating! " + (mention ? "Happy to hear " + mention + " was a positive part of your experience. " : "") + "If there's anything we can do better, we're all ears. Thank you for choosing " + biz + "!"
      ],
      friendly: [
        greeting + " thanks so much for the 4 stars! 😊 " + (mention ? "Love that " + mention + " was great for you! " : "") + "We're always looking to improve — let us know how we can earn that 5th star next time!",
        greeting + " really appreciate the kind review! " + (mention ? "So glad " + mention + " worked out well. " : "") + "We're curious what could make it even better — feel free to reach out anytime!"
      ],
      casual: [
        greeting + " thanks for the 4-star review! " + (mention ? "Glad you liked " + mention + ". " : "") + "Let us know what we can do to make it a 5 next time!",
        greeting + " appreciate the review! " + (mention ? "Cool that " + mention + " was solid. " : "") + "Always trying to get better — come back and see!"
      ],
      formal: [
        greeting + " thank you for your thoughtful 4-star review. " + (mention ? "We are pleased that " + mention + " met your expectations. " : "") + "We continually strive for excellence at " + biz + " and welcome any suggestions for improvement. We look forward to serving you again."
      ]
    },
    3: {
      professional: [
        greeting + " thank you for your honest feedback. " + (mention ? "We appreciate you sharing your thoughts about " + mention + ". " : "") + "We take every review seriously at " + biz + " and would love to learn more about how we can improve. Please feel free to reach out to us directly so we can make your next visit exceptional.",
        greeting + " we appreciate you taking the time to share your experience. " + (mention ? "Your comments about " + mention + " are noted. " : "") + "At " + biz + ", we're committed to doing better. We'd welcome the chance to discuss your feedback — please don't hesitate to contact us."
      ],
      friendly: [
        greeting + " thanks for being honest with us! " + (mention ? "We hear you on " + mention + ". " : "") + "We want every visit to " + biz + " to be great, and we'd love to chat about how we can do better. Drop us a line anytime! 💙",
        greeting + " we appreciate you sharing this! " + (mention ? "Noted on " + mention + " — we're on it. " : "") + "We'd love a chance to make it right. Reach out anytime!"
      ],
      casual: [
        greeting + " thanks for the feedback! " + (mention ? "Hear you on " + mention + ". " : "") + "We want to do better — reach out if you want to chat about it.",
      ],
      formal: [
        greeting + " we appreciate your candid review. " + (mention ? "Your observations regarding " + mention + " have been noted. " : "") + "At " + biz + ", we are dedicated to continuous improvement. We would welcome the opportunity to discuss your experience further and ensure your next visit exceeds expectations."
      ]
    },
    2: {
      professional: [
        greeting + " we're sorry to hear your experience didn't meet expectations. " + (mention ? "Your feedback about " + mention + " is important to us. " : "") + "At " + biz + ", we hold ourselves to a high standard, and we'd appreciate the opportunity to make this right. Please contact us directly so we can address your concerns.",
        greeting + " thank you for sharing your experience, and we sincerely apologize for falling short. " + (mention ? "We take your comments about " + mention + " very seriously. " : "") + "We'd like to make this right — please reach out to us directly at " + biz + "."
      ],
      friendly: [
        greeting + " we're really sorry about your experience. " + (mention ? "We hear you on " + mention + ", and that's not the standard we hold at " + biz + ". " : "") + "We'd love a chance to make it right — please reach out to us and give us another shot. 🙏",
      ],
      casual: [
        greeting + " sorry about that. " + (mention ? "We hear you on " + mention + ". " : "") + "Not our best showing and we want to fix it. Reach out to us — we'll make it right.",
      ],
      formal: [
        greeting + " we sincerely apologize that your experience with " + biz + " was unsatisfactory. " + (mention ? "Your concerns regarding " + mention + " have been escalated to our management team. " : "") + "We would appreciate the opportunity to address this matter directly. Please contact us at your earliest convenience."
      ]
    },
    1: {
      professional: [
        greeting + " we are truly sorry about your experience. " + (mention ? "Your concerns regarding " + mention + " are completely valid and have been brought to the attention of our leadership team. " : "") + "This is not the level of service we strive for at " + biz + ". We would greatly appreciate the opportunity to speak with you directly and make this right. Please reach out to us — we want to earn back your trust.",
        greeting + " we sincerely apologize that we fell so short of your expectations. " + (mention ? "We take your feedback about " + mention + " very seriously. " : "") + "At " + biz + ", every customer matters, and we want to resolve this. Please contact us so we can address your concerns personally."
      ],
      friendly: [
        greeting + " we're so sorry. This isn't the experience we want anyone to have at " + biz + ". " + (mention ? "We hear you about " + mention + " and we're on it. " : "") + "Please give us a chance to make this right — reach out to us and we promise to do better. 💙",
      ],
      casual: [
        greeting + " really sorry about this. " + (mention ? "Totally hear you on " + mention + ". " : "") + "We dropped the ball and want to fix it. Reach out to us — we'll make it right.",
      ],
      formal: [
        greeting + " we extend our sincerest apologies for the experience you described. " + (mention ? "The matters you raised concerning " + mention + " have been immediately escalated to our senior management. " : "") + "At " + biz + ", we are committed to the highest standards of service. We respectfully request the opportunity to discuss this matter with you directly and work toward a resolution."
      ]
    }
  };

  var pool = templates[selectedStar] && templates[selectedStar][selectedTone];
  if (!pool) pool = templates[selectedStar] && templates[selectedStar]["professional"];
  if (!pool) pool = ["Thank you for your review! We appreciate your feedback."];

  var response = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById("responseText").textContent = response;
  document.getElementById("resultBox").style.display = "block";
  document.getElementById("resultBox").scrollIntoView({ behavior: "smooth", block: "center" });
}

function copyResponse() {
  var text = document.getElementById("responseText").textContent;
  navigator.clipboard.writeText(text).then(function() {
    var b = document.querySelector(".copy-btn");
    b.textContent = "✅ Copied!";
    setTimeout(function() { b.textContent = "📋 Copy Response"; }, 2000);
  });
}
</script></body></html>`;

  res.send(html);
});


app.get("/tools/review-calculator", (req, res) => {
  var jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Google Review Calculator",
    "description": "Calculate how many 5-star reviews you need to reach your target Google rating. Free tool.",
    "url": BASE_URL + "/tools/review-calculator",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  });

  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
    + '<title>Google Review Calculator \u2014 How Many 5-Star Reviews Do You Need? | ReviewFlow</title>'
    + '<meta name="description" content="Calculate exactly how many 5-star Google reviews your business needs to reach your target rating. Free calculator for local businesses.">'
    + '<link rel="canonical" href="' + BASE_URL + '/tools/review-calculator">'
    + '<meta property="og:title" content="Google Review Calculator">'
    + '<meta property="og:description" content="Find out how many 5-star reviews it takes to reach your target Google rating.">'
    + '<meta property="og:type" content="website">'
    + '<script type="application/ld+json">' + jsonLd + '<\/script>'
    + css()
    + '<style>'
    + '.tool-wrap{max-width:720px;margin:0 auto;padding:48px 24px}'
    + '.tool-box{background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:32px;margin:32px 0}'
    + '.tool-input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:16px;margin-bottom:16px;box-sizing:border-box}'
    + '.tool-input:focus{outline:none;border-color:#2563eb}'
    + '.tool-btn{background:#2563eb;color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;width:100%}'
    + '.tool-btn:hover{background:#1d4ed8}'
    + '.result-box{background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:24px;margin-top:20px;display:none}'
    + '.input-group{margin-bottom:20px}'
    + '.input-group label{display:block;font-weight:600;margin-bottom:8px;color:#1e293b}'
    + '.input-group small{color:#64748b;font-size:13px}'
    + '.result-num{font-size:48px;font-weight:800;color:#2563eb;text-align:center;margin:16px 0}'
    + '.result-detail{color:#475569;text-align:center;font-size:16px;line-height:1.6}'
    + '.tool-cta{background:linear-gradient(135deg,#eff6ff,#f0fdf4);border:2px solid #2563eb;border-radius:16px;padding:32px;text-align:center;margin:40px 0}'
    + '</style></head><body>'
    + '<nav class="nav"><div class="container nav-inner"><a href="/" class="nav-brand">\u2B50 ReviewFlow</a>'
    + '<div class="nav-links"><a href="/blog">Blog</a><a href="/tools/review-calculator">Calculator</a><a href="/#pricing">Pricing</a><a href="/login">Log In</a><a href="/signup" class="btn btn-primary btn-sm">Start Free</a></div></div></nav>'
    + '<div class="tool-wrap">'
    + '<h1 style="font-size:36px;margin-bottom:8px">Google Review Calculator</h1>'
    + '<p style="color:#64748b;font-size:18px;margin-bottom:32px">Find out exactly how many 5-star reviews you need to reach your target Google rating.</p>'
    + '<div class="tool-box">'
    + '<div class="input-group"><label>Your current Google rating</label><input type="number" id="curRating" class="tool-input" placeholder="e.g. 3.8" step="0.1" min="1" max="5"><small>Find this on your Google Business Profile</small></div>'
    + '<div class="input-group"><label>Your current number of reviews</label><input type="number" id="curCount" class="tool-input" placeholder="e.g. 45" min="0"></div>'
    + '<div class="input-group"><label>Your target rating</label><input type="number" id="targetRating" class="tool-input" placeholder="e.g. 4.5" step="0.1" min="1" max="5"></div>'
    + '<button class="tool-btn" onclick="calculate()">Calculate Reviews Needed</button>'
    + '<div id="resultBox" class="result-box">'
    + '<p style="font-weight:600;text-align:center;margin-bottom:4px">You need approximately</p>'
    + '<div id="resultNum" class="result-num"></div>'
    + '<div id="resultDetail" class="result-detail"></div>'
    + '</div></div>'
    + '<script>'
    + 'function calculate(){'
    + 'var cr=parseFloat(document.getElementById("curRating").value);'
    + 'var cc=parseInt(document.getElementById("curCount").value);'
    + 'var tr=parseFloat(document.getElementById("targetRating").value);'
    + 'if(isNaN(cr)||isNaN(cc)||isNaN(tr)){alert("Please fill in all fields");return;}'
    + 'if(cr<1||cr>5||tr<1||tr>5){alert("Ratings must be between 1 and 5");return;}'
    + 'if(tr<=cr){document.getElementById("resultBox").style.display="block";document.getElementById("resultNum").textContent="0";document.getElementById("resultDetail").innerHTML="Your current rating already meets your target! \\ud83c\\udf89<br>Focus on maintaining it by collecting reviews consistently.";return;}'
    + 'var totalPoints=cr*cc;'
    + 'var needed=Math.ceil((tr*cc-totalPoints)/(5-tr));'
    + 'if(needed<1)needed=1;'
    + 'var newTotal=cc+needed;var newRating=((totalPoints+(needed*5))/newTotal).toFixed(1);'
    + 'document.getElementById("resultBox").style.display="block";'
    + 'document.getElementById("resultNum").textContent=needed+" five-star reviews";'
    + 'document.getElementById("resultDetail").innerHTML='
    + '"With "+needed+" new 5-star reviews, you will go from <strong>"+cr+" \\u2605 ("+cc+" reviews)</strong> to <strong>"+newRating+" \\u2605 ("+newTotal+" reviews)</strong>.<br><br>"'
    + '+"<strong>Pro tip:</strong> At 2 new reviews per week, that is about <strong>"+Math.ceil(needed/2)+" weeks</strong>. ReviewFlow can help you get there faster with QR codes and automated review requests.";'
    + '}<\/script>'
    + '<h2 style="margin-top:48px;margin-bottom:16px">How Google Calculates Your Star Rating</h2>'
    + '<p style="color:#475569;line-height:1.8">Google calculates your star rating as a <strong>weighted average</strong> of all your reviews. Each review contributes equally. This means every new 5-star review pulls your average up, but the impact decreases as you accumulate more reviews.</p>'
    + '<p style="color:#475569;line-height:1.8">For example, if you have 20 reviews at 3.5 stars and get one 5-star review, your new rating would be about 3.57. But if you have 200 reviews at 3.5 stars, one 5-star review only moves you to 3.51.</p>'
    + '<h2 style="margin-top:32px;margin-bottom:16px">Why Your Google Rating Matters</h2>'
    + '<ul style="color:#475569;line-height:2">'
    + '<li><strong>93%</strong> of consumers say online reviews impact their purchasing decisions</li>'
    + '<li>A <strong>one-star increase</strong> on Google can lead to a <strong>5-9% increase in revenue</strong></li>'
    + '<li>Businesses below <strong>4.0 stars</strong> are filtered out by most customers</li>'
    + '<li>Google uses review quantity and quality as a <strong>local SEO ranking factor</strong></li></ul>'
    + '<h2 style="margin-top:32px;margin-bottom:16px">Tips to Get More 5-Star Reviews</h2>'
    + '<ol style="color:#475569;line-height:2">'
    + '<li><strong>Ask at the right moment</strong> \u2014 Right after a great experience, not days later</li>'
    + '<li><strong>Make it easy</strong> \u2014 Use a direct review link or QR code</li>'
    + '<li><strong>Use smart routing</strong> \u2014 Send happy customers to Google, catch unhappy ones privately</li>'
    + '<li><strong>Follow up</strong> \u2014 A polite SMS or email reminder doubles response rates</li>'
    + '<li><strong>Respond to every review</strong> \u2014 It encourages more reviews and improves SEO</li></ol>'
    + '<div class="tool-cta">'
    + '<h3 style="font-size:22px;margin-bottom:8px">Reach Your Target Rating Faster</h3>'
    + '<p style="color:#64748b;margin-bottom:16px">ReviewFlow creates a branded review page with smart routing \u2014 happy customers go to Google, unhappy ones send you private feedback. Free to start.</p>'
    + '<a href="/signup" class="btn btn-primary" style="padding:14px 36px;font-size:16px">Start Collecting Reviews \u2014 Free</a>'
    + '</div>'
    + '<h2 style="margin-top:40px;margin-bottom:16px">Frequently Asked Questions</h2>'
    + '<details style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:10px;padding:16px"><summary style="font-weight:600;cursor:pointer">Can I remove negative Google reviews?</summary><p style="margin-top:12px;color:#475569">You can only flag reviews that violate Google\'s policies (spam, fake, or offensive content). Legitimate negative reviews cannot be removed. The best strategy is to dilute them with new positive reviews.</p></details>'
    + '<details style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:10px;padding:16px"><summary style="font-weight:600;cursor:pointer">How long does it take to improve my rating?</summary><p style="margin-top:12px;color:#475569">It depends on your current number of reviews. A business with 20 reviews can move from 3.5 to 4.0 with about 5 five-star reviews. A business with 200 reviews needs about 50. Use the calculator above to find your specific number.</p></details>'
    + '<details style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:10px;padding:16px"><summary style="font-weight:600;cursor:pointer">Is it against Google\'s rules to ask for reviews?</summary><p style="margin-top:12px;color:#475569">No! Google explicitly encourages businesses to ask customers for reviews. What is not allowed: offering incentives (discounts, gifts) in exchange for reviews, or buying fake reviews.</p></details>'
    + '<details style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:10px;padding:16px"><summary style="font-weight:600;cursor:pointer">What is review gating and is it allowed?</summary><p style="margin-top:12px;color:#475569">Review gating asks customers about their experience first, then routes them accordingly. ReviewFlow uses smart routing \u2014 happy customers are guided to Google, while unhappy customers get a private feedback channel. This is a common practice used by businesses of all sizes.</p></details>'
    + '</div>' + footer + '</body></html>';
  res.send(html);
});

};
