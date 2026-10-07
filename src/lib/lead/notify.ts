import 'server-only';
import { Resend } from 'resend';
import { LEAD_SITE_TYPE_LABEL } from '@/lib/content/labels';
import { formatIsraeliPhone } from '@/lib/domain/phone';
import { env, isConfigured } from '@/lib/env.server';
import { logError, logWarn } from '@/lib/logger';
import type { LeadInput } from './lead-schema';

let resend: Resend | null = null;
const client = () => (resend ??= new Resend(env.RESEND_API_KEY));

// Plain-text emails only: user input never becomes HTML.
async function send(to: string, subject: string, text: string, scope: string): Promise<boolean> {
  if (!isConfigured.resend()) {
    logWarn(scope, 'Resend not configured; email skipped');
    return false;
  }
  try {
    const { error } = await client().emails.send({ from: env.EMAIL_FROM, to, subject, text });
    if (error) {
      logError(scope, new Error(error.message));
      return false;
    }
    return true;
  } catch (error) {
    logError(scope, error);
    return false;
  }
}

/** Backup copy to Avishi, so a lead survives even if the customer never presses "send" in WhatsApp. */
export function sendOwnerBackup(lead: LeadInput, replyWindow: string, savedInSanity: boolean): Promise<boolean> {
  const lines = [
    `שם: ${lead.name}`,
    `טלפון: ${formatIsraeliPhone(lead.phone)}`,
    `סוג אתר: ${LEAD_SITE_TYPE_LABEL[lead.siteType]}`,
    lead.email ? `מייל: ${lead.email}` : null,
    lead.message ? `הודעה: ${lead.message}` : null,
    '',
    `עמוד: ${lead.page}`,
    lead.utmSource ? `utm_source: ${lead.utmSource}` : null,
    lead.utmCampaign ? `utm_campaign: ${lead.utmCampaign}` : null,
    '',
    `הובטח ללקוח: נחזור ${replyWindow}`,
    savedInSanity ? 'נשמר ב-Sanity (פניות).' : 'לא נשמר ב-Sanity. המייל הזה הוא העותק היחיד.',
  ].filter((line): line is string => line !== null);
  return send(env.OWNER_EMAIL, `פנייה חדשה מהאתר: ${lead.name}`, lines.join('\n'), 'lead.owner-email');
}

export function sendCustomerConfirmation(lead: LeadInput, replyWindow: string): Promise<boolean> {
  if (!lead.email) return Promise.resolve(false);
  const text = [
    `היי ${lead.name},`,
    '',
    `הפנייה שלך התקבלה. אחזור אליך ${replyWindow}.`,
    'בשיחת היכרות, בחינם ובלי התחייבות, נבין מה העסק צריך. אחריה אשלח הצעת מחיר כתובה.',
    '',
    'אבישי · עומק',
    '',
    'המייל הזה נשלח פעם אחת כאישור לפנייה. לא תקבלו דיוור.',
  ].join('\n');
  return send(lead.email, 'הפנייה שלך לעומק התקבלה', text, 'lead.customer-email');
}
