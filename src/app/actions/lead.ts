'use server';

import { randomUUID } from 'node:crypto';
import { LEAD_SITE_TYPE_LABEL } from '@/lib/content/labels';
import { getSiteContent } from '@/lib/content/site-content';
import { toWhatsAppNumber } from '@/lib/domain/phone';
import { formatReplyWindow, getReplyWindow } from '@/lib/domain/reply-window';
import { buildLeadMessage, whatsappUrl } from '@/lib/domain/whatsapp';
import { isConfigured, leadsLocked } from '@/lib/env.server';
import { leadInputSchema, type LeadActionState, type LeadField } from '@/lib/lead/lead-schema';
import { sendCustomerConfirmation, sendOwnerBackup } from '@/lib/lead/notify';
import { logError, logInfo, logWarn } from '@/lib/logger';
import { rateLimit } from '@/lib/security/rate-limit';
import { getClientIp, hashIp } from '@/lib/security/request-meta';
import { verifyTurnstile } from '@/lib/security/turnstile';
import { getSanityLeadsWriteClient } from '@/sanity/lib/client';

const FIELDS = ['name', 'phone', 'siteType', 'message', 'email', 'website', 'turnstileToken', 'page', 'utmSource', 'utmMedium', 'utmCampaign'] as const;
const LEAD_FIELDS = new Set<string>(['name', 'phone', 'siteType', 'message', 'email']);

function readForm(formData: FormData): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    out[field] = typeof value === 'string' ? value : undefined;
  }
  return out;
}

export async function submitLead(_prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  if (leadsLocked) return { status: 'error' };

  const parsed = leadInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fieldErrors: Partial<Record<LeadField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (LEAD_FIELDS.has(field) && !fieldErrors[field as LeadField]) fieldErrors[field as LeadField] = issue.message;
    }
    if (Object.keys(fieldErrors).length === 0) return { status: 'error' };
    return { status: 'invalid', fieldErrors };
  }
  const lead = parsed.data;

  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  // Honeypot: generic error, nothing stored.
  if (lead.website) {
    logWarn('lead', 'Honeypot triggered', { ipHash: ipHash.slice(0, 12) });
    return { status: 'error' };
  }

  if (!(await rateLimit('leadIp', ipHash)) || !(await rateLimit('leadPhone', lead.phone))) {
    return { status: 'rate-limited' };
  }

  if (!(await verifyTurnstile(lead.turnstileToken, ip, 'lead'))) {
    return { status: 'error' };
  }

  const content = await getSiteContent();
  const replyWindow = formatReplyWindow(getReplyWindow(new Date(), content.hours));

  let savedInSanity = false;
  if (isConfigured.sanityWrite()) {
    try {
      await getSanityLeadsWriteClient().create({
        _type: 'lead',
        status: 'new',
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        siteType: lead.siteType,
        message: lead.message,
        createdAt: new Date().toISOString(),
        source: { page: lead.page, utmSource: lead.utmSource, utmMedium: lead.utmMedium, utmCampaign: lead.utmCampaign },
        ipHash,
      });
      savedInSanity = true;
    } catch (error) {
      logError('lead.sanity', error);
    }
  }

  const [ownerNotified] = await Promise.all([sendOwnerBackup(lead, replyWindow, savedInSanity), sendCustomerConfirmation(lead, replyWindow)]);

  if (!savedInSanity && !ownerNotified && isConfigured.sanityWrite()) {
    // Nowhere holds this lead; tell the customer to use WhatsApp directly.
    return { status: 'error' };
  }

  const submissionId = randomUUID();
  logInfo('lead', 'Lead received', { submissionId, savedInSanity, ownerNotified, siteType: lead.siteType });

  const text = buildLeadMessage({ name: lead.name, siteTypeLabel: LEAD_SITE_TYPE_LABEL[lead.siteType], message: lead.message });
  return {
    status: 'success',
    name: lead.name,
    whatsappUrl: whatsappUrl(toWhatsAppNumber(content.settings.whatsappE164), text),
    submissionId,
  };
}
