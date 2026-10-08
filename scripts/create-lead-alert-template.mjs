// Submits the "new lead" WhatsApp template to Meta, once. Run: npm run whatsapp:template
// Reads .env.local: WA_ACCESS_TOKEN (System User token with whatsapp_business_management),
// WA_BUSINESS_ACCOUNT_ID, and optionally LEAD_ALERT_TEMPLATE / LEAD_ALERT_TEMPLATE_LANG.
// An approved template can't be edited by re-running: change the wording under a new name (…_v2).

// Must stay identical to LEAD_ALERT_BODY in src/lib/lead/whatsapp-alert.ts (checked by a unit test).
const BODY = '📩 פנייה חדשה מהאתר\nשם: {{1}}\nסוג אתר: {{2}}\nטלפון: {{3}}\nהפרטים המלאים במייל ובסטודיו.';
const EXAMPLE = ['דנה כהן', 'אתר תדמית', '050-123-4567'];

const token = process.env.WA_ACCESS_TOKEN;
const wabaId = process.env.WA_BUSINESS_ACCOUNT_ID;
const name = process.env.LEAD_ALERT_TEMPLATE || 'omek_new_lead';
const language = process.env.LEAD_ALERT_TEMPLATE_LANG || 'he';
const version = process.env.WA_GRAPH_API_VERSION || 'v25.0';

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

if (!token || !wabaId) fail('Set WA_ACCESS_TOKEN and WA_BUSINESS_ACCOUNT_ID in .env.local first.');
if (!/^[a-z0-9_]{1,512}$/.test(name)) fail(`Template names may only use lowercase letters, numbers and _: "${name}"`);
if (!/^\d{5,25}$/.test(wabaId)) fail('WA_BUSINESS_ACCOUNT_ID should be digits only.');

const response = await fetch(`https://graph.facebook.com/${version}/${wabaId}/message_templates`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name,
    language,
    category: 'UTILITY',
    components: [{ type: 'BODY', text: BODY, example: { body_text: [EXAMPLE] } }],
  }),
});
const result = await response.json().catch(() => ({}));

if (!response.ok) {
  const reason = result.error?.error_user_msg ?? result.error?.message ?? response.statusText;
  fail(`Meta didn't accept the template: ${reason}`);
}

console.log(`✔ Template "${name}" (${language}) submitted — status: ${result.status ?? 'unknown'}, category: ${result.category ?? '?'}`);
if (result.status !== 'APPROVED') console.log('  Alerts start once it is APPROVED (WhatsApp Manager → Message templates).');
console.log(`\nSet on Vercel: LEAD_ALERT_TEMPLATE=${name}  LEAD_ALERT_TEMPLATE_LANG=${language}`);
