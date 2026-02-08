// Template library patch - to be applied to server.js
// This file contains the code to be inserted

const RESPONSE_TEMPLATES_INIT = `
  CREATE TABLE IF NOT EXISTS response_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const DEFAULT_RESPONSE_TEMPLATES = [
  // Positive
  { category: 'positive', title: 'Warm Thank You', body: 'Thank you so much for your wonderful review! We truly appreciate you taking the time to share your experience. It means the world to our team, and we look forward to serving you again soon!' },
  { category: 'positive', title: 'Highlight the Team', body: "What a fantastic review — thank you! We'll make sure the team sees this. Your kind words are what keep us motivated to deliver our best every day. See you next time!" },
  { category: 'positive', title: 'Loyal Customer Appreciation', body: "Thank you for being such a loyal customer and for this amazing review! It's customers like you that make what we do so rewarding. We can't wait to welcome you back!" },
  // Negative
  { category: 'negative', title: 'Sincere Apology', body: "We're truly sorry to hear about your experience. This is not the standard we hold ourselves to, and we take your feedback very seriously. Please reach out to us directly at [contact info] so we can make this right." },
  { category: 'negative', title: 'Acknowledge & Resolve', body: "Thank you for bringing this to our attention. We sincerely apologize for the inconvenience you experienced. We'd love the opportunity to make things right — please contact us at [contact info] and we'll personally ensure a better experience." },
  { category: 'negative', title: 'Empathetic Response', body: "We completely understand your frustration, and we're sorry we fell short of your expectations. Your feedback helps us improve. Could you reach out to us at [contact info]? We'd like to learn more and resolve this for you." },
  // Neutral
  { category: 'neutral', title: 'Grateful & Encouraging', body: "Thank you for your feedback! We're glad you had a good experience and we're always striving to make it even better. If there's anything specific we can improve, we'd love to hear about it!" },
  { category: 'neutral', title: 'Invite Back', body: "Thanks for sharing your thoughts! We appreciate your honest feedback. We're constantly working to improve, and we hope to exceed your expectations on your next visit." },
  // Apology
  { category: 'apology', title: 'Professional Apology', body: "Please accept our sincerest apologies for your experience. We hold ourselves to the highest standards and clearly fell short. We've taken immediate steps to address the issues you mentioned and would be grateful for another chance to serve you." },
  { category: 'apology', title: 'Service Recovery', body: "We owe you an apology. Your experience does not reflect who we are, and we're deeply sorry. We've already begun addressing the issues you raised. Please allow us to make it up to you — reach out at [contact info] for a complimentary visit." },
  // Follow-up
  { category: 'follow-up', title: 'Check-In After Resolution', body: "Hi! We wanted to follow up on your recent feedback. We've made the changes you suggested and would love for you to give us another try. We're confident you'll notice the difference!" },
  { category: 'follow-up', title: 'Thank You for Second Chance', body: "Thank you for giving us another opportunity! We hope your recent visit was a much better experience. Your feedback truly helped us improve, and we're grateful for your patience and support." },
];

module.exports = { RESPONSE_TEMPLATES_INIT, DEFAULT_RESPONSE_TEMPLATES };
