# Decisions Log

## 2026-02-07: Pivot from SnapOG to ProposalDash
- **Why:** OG image generators are too niche, free alternatives exist, not investable
- **New product:** ProposalDash — proposal generator for freelancers
- **Rationale:** 
  - Real pain point (freelancers use Google Docs for proposals)
  - Proven market (PandaDoc $49/mo, Proposify $35/mo, Better Proposals $19/mo)
  - ChatGPT can't replace it (needs persistent data, tracking, signatures, branding)
  - Simple to build, clear monetization
- **Tech choice:** sql.js instead of better-sqlite3 (avoids native compilation issues)
- **Pricing:** Free (5 proposals) → Pro $19/mo (unlimited)
