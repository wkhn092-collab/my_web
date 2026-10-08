import 'server-only';
import { LEAD_SITE_TYPE_LABEL } from '@/lib/content/labels';
import { formatIsraeliPhone } from '@/lib/domain/phone';
import { env, isConfigured } from '@/lib/env.server';
import { logError, logWarn } from '@/lib/logger';
import type { LeadInput } from './lead-schema';

/**
 * Body of the approved UTILITY template (scripts/create-lead-alert-template.mjs submits exactly this).
 * Meta rejects bodies that start or end with a variable, so the last line is fixed text.
 */
export const LEAD_ALERT_BODY = '📩 פנייה חדשה מהאתר\nשם: {{1}}\nסוג אתר: {{2}}\nטלפון: {{3}}\nהפרטים המלאים במייל ובסטודיו.';

const PARAM_MAX = 60;

/** Meta rejects parameters with new lines, tabs or runs of spaces (error 132018). */
function toParam(value: string): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > PARAM_MAX ? `${flat.slice(0, PARAM_MAX - 1)}…` : flat;
}

/** Only what Avishi needs to call back; the message and email stay out of Meta's servers. */
export function buildLeadAlertParams(lead: Pick<LeadInput, 'name' | 'phone' | 'siteType'>): string[] {
  return [toParam(lead.name), toParam(LEAD_SITE_TYPE_LABEL[lead.siteType]), toParam(formatIsraeliPhone(lead.phone))];
}

/** WhatsApp alert to Avishi. Never throws and never blocks the lead: the email and Sanity copy remain the record. */
export async function sendOwnerWhatsAppAlert(lead: LeadInput): Promise<boolean> {
  if (!isConfigured.whatsappAlert()) {
    logWarn('lead.owner-whatsapp', 'WhatsApp alert not configured; skipped');
    return false;
  }
  try {
    const response = await fetch(`https://graph.facebook.com/${env.WA_GRAPH_API_VERSION}/${env.WA_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: env.OWNER_WHATSAPP,
        type: 'template',
        template: {
          name: env.LEAD_ALERT_TEMPLATE,
          language: { code: env.LEAD_ALERT_TEMPLATE_LANG },
          components: [{ type: 'body', parameters: buildLeadAlertParams(lead).map((text) => ({ type: 'text', text })) }],
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    if (response.ok) return true;
    const { error } = (await response.json().catch(() => ({}))) as { error?: { code?: number } };
    logWarn('lead.owner-whatsapp', 'Meta rejected the alert', { status: response.status, code: error?.code });
    return false;
  } catch (error) {
    logError('lead.owner-whatsapp', error);
    return false;
  }
}
