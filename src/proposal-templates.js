const PROPOSAL_TEMPLATES = [
  {
    id: "consulting",
    title: "Consulting Engagement",
    description: "Professional consulting proposal with discovery, strategy, and implementation phases",
    industry: "Consulting",
    icon: "\ud83c\udfaf",
    color: "#2563eb",
    preview: "A structured consulting proposal covering discovery workshops, strategic recommendations, implementation support, and success metrics.",
    intro_text: "Thank you for considering [Your Company] for your consulting needs. We are excited about the opportunity to partner with you and drive meaningful results for your organization.\n\nBased on our initial discussions, we have prepared this proposal outlining our recommended approach, timeline, and investment.",
    terms_text: "Payment Terms: 50% due upon signing, 25% at midpoint, 25% upon completion.\n\nThis proposal is valid for 30 days from the date of issue.\n\nAll work product and deliverables become the property of the client upon full payment.\n\nEither party may terminate with 14 days written notice. Work completed to date will be billed proportionally.",
    sections: {
      scope: "Phase 1 - Discovery & Assessment (Weeks 1-2)\n- Stakeholder interviews and workshops\n- Current state analysis and documentation\n- Gap identification and opportunity mapping\n\nPhase 2 - Strategy Development (Weeks 3-4)\n- Strategic recommendations report\n- Implementation roadmap\n- ROI projections and success metrics\n\nPhase 3 - Implementation Support (Weeks 5-8)\n- Hands-on implementation guidance\n- Team training and knowledge transfer\n- Progress monitoring and optimization",
      timeline: "Total Duration: 8 weeks\n\nWeek 1-2: Discovery & Assessment\nWeek 3-4: Strategy Development\nWeek 5-8: Implementation Support\n\nWeekly status updates provided every Friday.",
    },
    line_items: [
      { description: "Discovery & Assessment Phase", quantity: 1, unit_price: 5000 },
      { description: "Strategy Development & Roadmap", quantity: 1, unit_price: 7500 },
      { description: "Implementation Support (4 weeks)", quantity: 4, unit_price: 3000 },
      { description: "Training & Knowledge Transfer Workshop", quantity: 1, unit_price: 2500 },
    ]
  },
  {
    id: "freelance",
    title: "Freelance Project",
    description: "Clean freelance proposal for design, development, or creative projects",
    industry: "Freelance",
    icon: "\ud83d\udcbb",
    color: "#7c3aed",
    preview: "A straightforward freelance proposal with clear deliverables, milestones, and revision rounds included.",
    intro_text: "Hi [Client Name],\n\nThanks for reaching out! I am excited about this project and confident I can deliver exactly what you are looking for.\n\nBelow you will find a breakdown of the work, timeline, and pricing. Happy to hop on a call to discuss any questions.",
    terms_text: "Payment Terms: 50% deposit upfront, 50% upon final delivery.\n\nIncludes 2 rounds of revisions. Additional revisions billed at $150/hour.\n\nAll source files delivered upon final payment.\n\nTimeline begins after deposit is received and project brief is approved.",
    sections: {
      scope: "Project Deliverables:\n- Homepage design mockup\n- 5 interior page designs\n- Mobile responsive versions\n- Style guide / design system\n\nInclusions:\n- 2 rounds of revisions per deliverable\n- Source files (Figma/PSD/AI)\n- Final export in all required formats",
      timeline: "Total Duration: 3-4 weeks\n\nWeek 1: Research, moodboard & initial concepts\nWeek 2: First draft delivery + feedback\nWeek 3: Revisions and refinement\nWeek 4: Final delivery & handoff",
    },
    line_items: [
      { description: "Project Design & Development", quantity: 1, unit_price: 3500 },
      { description: "Revisions & Refinement (2 rounds included)", quantity: 1, unit_price: 0 },
      { description: "Source File Package & Handoff", quantity: 1, unit_price: 500 },
    ]
  },
  {
    id: "saas",
    title: "SaaS Implementation",
    description: "Software implementation proposal with setup, integration, training, and ongoing support",
    industry: "SaaS / Technology",
    icon: "\u2601\ufe0f",
    color: "#0891b2",
    preview: "A comprehensive SaaS onboarding and implementation proposal covering setup, data migration, integrations, and training.",
    intro_text: "We are thrilled to help [Client Company] get started with [Product Name]. This proposal outlines our implementation plan to ensure a smooth rollout and maximum value from day one.\n\nOur implementation team has successfully onboarded 200+ companies and we will apply those best practices to your setup.",
    terms_text: "Payment Terms: Implementation fee due upon signing. Subscription billed monthly/annually as selected.\n\nService Level Agreement: 99.9% uptime guarantee. Priority support response within 2 hours.\n\n30-day satisfaction guarantee on implementation services.\n\nSubscription can be cancelled with 30 days notice.",
    sections: {
      scope: "Phase 1 - Setup & Configuration\n- Account setup and environment configuration\n- Custom workflow design\n- User roles and permissions setup\n\nPhase 2 - Data Migration\n- Data audit and mapping\n- Migration from existing system\n- Data validation and quality checks\n\nPhase 3 - Integrations\n- API integrations with existing tools\n- Webhook configuration\n- Automated workflow setup\n\nPhase 4 - Training & Launch\n- Admin training (2 sessions)\n- End-user training (3 sessions)\n- Go-live support",
      timeline: "Total Duration: 4-6 weeks\n\nWeek 1: Kickoff, setup & configuration\nWeek 2-3: Data migration & integrations\nWeek 4: Testing & QA\nWeek 5: Training sessions\nWeek 6: Go-live & support",
    },
    line_items: [
      { description: "Platform Setup & Configuration", quantity: 1, unit_price: 2000 },
      { description: "Data Migration Service", quantity: 1, unit_price: 3000 },
      { description: "Custom Integrations (up to 3)", quantity: 3, unit_price: 1500 },
      { description: "Training Sessions (5 sessions)", quantity: 5, unit_price: 500 },
      { description: "Annual Platform Subscription", quantity: 1, unit_price: 12000 },
    ]
  },
  {
    id: "agency",
    title: "Agency Retainer",
    description: "Monthly retainer proposal for marketing, design, or development agencies",
    industry: "Agency",
    icon: "\ud83c\udfe2",
    color: "#dc2626",
    preview: "A professional agency retainer proposal with monthly deliverables, reporting cadence, and scalable pricing tiers.",
    intro_text: "Thank you for considering [Agency Name] as your strategic partner. We have reviewed your goals and are confident our team can deliver exceptional results.\n\nThis retainer proposal outlines our recommended monthly engagement, deliverables, and the team dedicated to your account.",
    terms_text: "Payment Terms: Monthly retainer billed on the 1st of each month, due within 15 days.\n\nMinimum commitment: 3 months. After initial term, month-to-month with 30 days notice.\n\nUnused hours do not roll over. Additional hours billed at $175/hour.\n\nAll campaign assets and creative belong to the client.",
    sections: {
      scope: "Monthly Retainer Includes:\n\nStrategy & Planning\n- Monthly strategy session (1 hour)\n- Campaign planning and calendar\n- Competitive analysis updates\n\nContent & Creative\n- Blog posts / articles per month\n- Social media posts per month\n- Email campaigns per month\n- Graphic design for all content\n\nManagement & Reporting\n- Dedicated account manager\n- Weekly check-in calls (30 min)\n- Monthly performance report with insights\n- Quarterly strategy review",
      timeline: "Ongoing Monthly Engagement\n\nMonth 1: Onboarding, brand audit, strategy development\nMonth 2: Campaign launch, content calendar begins\nMonth 3+: Optimization, scaling, and growth\n\nReporting: Monthly report delivered by the 5th of each month.",
    },
    line_items: [
      { description: "Monthly Retainer - Strategy & Management", quantity: 1, unit_price: 3000 },
      { description: "Content Creation Package", quantity: 1, unit_price: 4000 },
      { description: "Paid Media Management (up to $10k spend)", quantity: 1, unit_price: 2000 },
      { description: "Monthly Analytics & Reporting", quantity: 1, unit_price: 1000 },
    ]
  },
  {
    id: "construction",
    title: "Construction / Renovation",
    description: "Construction or renovation project proposal with materials, labor, and phase breakdown",
    industry: "Construction",
    icon: "\ud83c\udfd7\ufe0f",
    color: "#ca8a04",
    preview: "A detailed construction proposal with materials breakdown, labor costs, permits, and project phases from demolition to final walkthrough.",
    intro_text: "Thank you for the opportunity to bid on your project. After our site visit, we have prepared this detailed proposal for your review.\n\nAll work will be performed by licensed, insured professionals and will comply with local building codes and regulations.",
    terms_text: "Payment Schedule:\n- 10% deposit upon contract signing\n- 30% upon completion of demolition/prep\n- 30% upon completion of rough-in work\n- 25% upon substantial completion\n- 5% upon final inspection and walkthrough\n\nWarranty: 1-year workmanship warranty on all labor. Manufacturer warranties apply to all materials.\n\nChange Orders: Any changes to scope must be documented in writing and may affect timeline and cost.\n\nPermits: All required permits included in pricing.",
    sections: {
      scope: "Project Scope:\n\nPhase 1 - Demolition & Preparation\n- Remove existing fixtures/structures\n- Site preparation and protection\n- Waste removal and disposal\n\nPhase 2 - Rough Work\n- Framing and structural modifications\n- Electrical rough-in\n- Plumbing rough-in\n- HVAC modifications\n\nPhase 3 - Finishing\n- Drywall, tape, and texture\n- Flooring installation\n- Cabinet and fixture installation\n- Painting and trim work\n\nPhase 4 - Final\n- Fixture connections and testing\n- Final inspections\n- Clean-up and walkthrough\n- Punch list completion",
      timeline: "Estimated Duration: 8-12 weeks\n\nWeek 1-2: Permits, demolition, preparation\nWeek 3-5: Rough-in work\nWeek 5-6: Inspections\nWeek 6-10: Finishing work\nWeek 10-11: Final fixtures, testing\nWeek 12: Clean-up, walkthrough, handover",
    },
    line_items: [
      { description: "Demolition & Site Preparation", quantity: 1, unit_price: 4500 },
      { description: "Materials (as specified)", quantity: 1, unit_price: 18000 },
      { description: "Labor - Rough Work (framing, electrical, plumbing)", quantity: 1, unit_price: 15000 },
      { description: "Labor - Finishing (drywall, flooring, paint, trim)", quantity: 1, unit_price: 12000 },
      { description: "Permits & Inspections", quantity: 1, unit_price: 1500 },
      { description: "Project Management & Cleanup", quantity: 1, unit_price: 2000 },
    ]
  },
  {
    id: "marketing",
    title: "Marketing Campaign",
    description: "Marketing campaign proposal with research, creative, execution, and analytics",
    industry: "Marketing",
    icon: "\ud83d\udcc8",
    color: "#16a34a",
    preview: "A results-driven marketing campaign proposal covering market research, creative development, multi-channel execution, and performance analytics.",
    intro_text: "We are excited to present our campaign proposal. Based on our understanding of your target audience and business objectives, we have designed a multi-channel approach to maximize reach and conversions.\n\nOur goal is to generate measurable results and provide full transparency on campaign performance.",
    terms_text: "Payment Terms: 40% upon approval, 30% at campaign launch, 30% upon campaign completion.\n\nAd spend is billed separately and directly to client ad accounts.\n\nPerformance reporting provided weekly during active campaign period.\n\nCreative assets and campaign data belong to the client.\n\nCancellation: Campaign can be paused with 7 days notice. Non-refundable once creative production begins.",
    sections: {
      scope: "Campaign Components:\n\n1. Research & Strategy\n- Audience research and persona development\n- Competitive landscape analysis\n- Channel strategy and budget allocation\n- KPI definition and tracking setup\n\n2. Creative Development\n- Campaign concept and messaging framework\n- Ad creative (static + video) for all channels\n- Landing page design and copy\n- Email sequence (nurture campaign)\n\n3. Campaign Execution\n- Paid social (Facebook/Instagram/LinkedIn)\n- Google Ads (Search + Display)\n- Email marketing automation\n- Organic social content support\n\n4. Analytics & Optimization\n- Real-time dashboard setup\n- Weekly optimization adjustments\n- A/B testing on top-performing channels\n- Final campaign report with insights",
      timeline: "Total Duration: 12 weeks\n\nWeek 1-2: Research, strategy, KPI setup\nWeek 3-4: Creative development & landing pages\nWeek 5: Campaign setup & QA\nWeek 6-10: Active campaign period\nWeek 11: Optimization & final push\nWeek 12: Wrap-up, reporting, recommendations",
    },
    line_items: [
      { description: "Market Research & Strategy", quantity: 1, unit_price: 3500 },
      { description: "Creative Production (ads, landing pages, emails)", quantity: 1, unit_price: 6000 },
      { description: "Campaign Management (6 weeks)", quantity: 6, unit_price: 1500 },
      { description: "Analytics & Reporting Package", quantity: 1, unit_price: 2000 },
    ]
  }
];

module.exports = PROPOSAL_TEMPLATES;
