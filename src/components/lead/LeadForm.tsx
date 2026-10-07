'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { submitLead } from '@/app/actions/lead';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { track } from '@/lib/analytics';
import { LEAD_SITE_TYPE_LABEL } from '@/lib/content/labels';
import { LEAD_SITE_TYPES, type LeadSiteType } from '@/lib/content/types';
import { FAB_MESSAGE, MESSAGE_MAX, whatsappUrl } from '@/lib/domain/whatsapp';
import { publicEnv } from '@/lib/env.public';
import { leadInputSchema, type LeadActionState, type LeadField } from '@/lib/lead/lead-schema';
import { motion } from '@/lib/motion-tokens';
import { useSession, useVisitor } from '@/lib/store/visitor';
import { Turnstile } from './Turnstile';

type Values = { name: string; phone: string; siteType: LeadSiteType | ''; message: string; email: string };
type Banner = 'rate-limited' | 'error' | 'offline' | null;

const FIELD_ORDER: LeadField[] = ['name', 'phone', 'siteType', 'message', 'email'];

export function LeadForm({
  whatsappNumber,
  presetSiteType = null,
  nonce,
  location,
}: {
  whatsappNumber: string;
  presetSiteType?: LeadSiteType | null;
  nonce?: string;
  location: 'drawer' | 'inline';
}) {
  const t = useTranslations('form');
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const draftSiteType = useVisitor((s) => s.formDraft.siteType);
  const setDraftSiteType = useVisitor((s) => s.setDraftSiteType);
  const setHandoff = useSession((s) => s.setHandoff);
  const closeDrawer = useSession((s) => s.closeDrawer);

  const [values, setValues] = useState<Values>({
    name: '',
    phone: '',
    siteType: presetSiteType ?? draftSiteType ?? '',
    message: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [banner, setBanner] = useState<Banner>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const started = useRef(false);

  const [state, formAction, pending] = useActionState<LeadActionState, FormData>(submitLead, { status: 'idle' });
  const signature = state.status === 'success';

  // Derived-state updates happen during render (not in effects) when the preset or the server answer changes.
  const [prevPreset, setPrevPreset] = useState(presetSiteType);
  if (presetSiteType !== prevPreset) {
    setPrevPreset(presetSiteType);
    if (presetSiteType) setValues((v) => ({ ...v, siteType: presetSiteType }));
  }
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    // Tokens are single-use: every server answer needs a fresh challenge.
    if (state.status !== 'idle') setResetKey((k) => k + 1);
    if (state.status === 'invalid') setErrors(state.fieldErrors);
    if (state.status === 'rate-limited' || state.status === 'error') setBanner(state.status);
  }

  const id = (field: string) => `${uid}-${field}`;

  function focusFirstError(fieldErrors: Partial<Record<LeadField, string>>) {
    const first = FIELD_ORDER.find((f) => fieldErrors[f]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    if (!el) return;
    el.focus();
    shake(el.closest('fieldset') ?? el);
  }

  useEffect(() => {
    if (state.status === 'invalid') {
      focusFirstError(state.fieldErrors);
    } else if (state.status === 'success') {
      track('generate_lead', { location, site_type: values.siteType || undefined });
      setHandoff({ name: state.name, whatsappUrl: state.whatsappUrl, submissionId: state.submissionId });
      window.open(state.whatsappUrl, '_blank', 'noopener,noreferrer');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const delay = reduced ? motion.duration.fast * 1000 : motion.signatureMs;
      const timer = window.setTimeout(() => {
        closeDrawer();
        router.push('/thanks');
      }, delay);
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function update<K extends keyof Values>(field: K, value: Values[K]) {
    if (!started.current) {
      started.current = true;
      track('form_start', { location });
    }
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field as LeadField]) setErrors((e) => ({ ...e, [field]: undefined }));
    if (field === 'siteType') setDraftSiteType((value as LeadSiteType) || null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);
    const formData = new FormData(event.currentTarget);
    appendSource(formData);
    const check = leadInputSchema.safeParse(Object.fromEntries(formData));
    if (!check.success) {
      const fieldErrors: Partial<Record<LeadField, string>> = {};
      for (const issue of check.error.issues) {
        const field = String(issue.path[0]) as LeadField;
        if (FIELD_ORDER.includes(field) && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }
    if (!navigator.onLine) {
      setBanner('offline');
      return;
    }
    track('form_submit', { location });
    startTransition(() => formAction(formData));
  }

  const describedBy = (field: LeadField, hint?: boolean) =>
    [hint ? id(`${field}-hint`) : null, errors[field] ? id(`${field}-error`) : null].filter(Boolean).join(' ') || undefined;

  const inputClass = (field: LeadField) =>
    `mt-2 block w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-pearl outline-none transition-colors duration-300 focus:border-gold focus:bg-white/[0.06] ${
      errors[field] ? 'border-danger' : 'border-pearl/15'
    }`;

  const fallbackWhatsApp = whatsappUrl(whatsappNumber, FAB_MESSAGE);

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-5" aria-describedby={id('privacy')}>
      <div>
        <label htmlFor={id('name')} className="font-medium text-pearl">
          {t('name')}
        </label>
        <input
          id={id('name')}
          name="name"
          autoComplete="name"
          maxLength={60}
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name')}
          className={inputClass('name')}
        />
        {errors.name && (
          <p id={id('name-error')} className="mt-1 text-base text-danger">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={id('phone')} className="font-medium text-pearl">
          {t('phone')}
        </label>
        <p id={id('phone-hint')} className="text-base text-mist">
          {t('phoneHint')}
        </p>
        <input
          id={id('phone')}
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          maxLength={20}
          value={values.phone}
          onChange={(e) => update('phone', e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy('phone', true)}
          className={`${inputClass('phone')} text-right`}
        />
        {errors.phone && (
          <p id={id('phone-error')} className="mt-1 text-base text-danger">
            <bdi>{errors.phone}</bdi>
          </p>
        )}
      </div>

      <fieldset aria-describedby={describedBy('siteType', true)}>
        <legend className="font-medium text-pearl">{t('siteType')}</legend>
        <p id={id('siteType-hint')} className="text-base text-mist">
          {t('siteTypeHint')}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {LEAD_SITE_TYPES.map((type) => (
            <label
              key={type}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-base transition-colors duration-300 hover:border-pearl/35 has-[:checked]:border-gold has-[:checked]:bg-gold/[0.08] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-soft ${
                errors.siteType ? 'border-danger' : 'border-pearl/15'
              }`}
            >
              <input
                type="radio"
                name="siteType"
                value={type}
                checked={values.siteType === type}
                onChange={() => update('siteType', type)}
                className="h-5 w-5 accent-[#C9A66B]"
              />
              {LEAD_SITE_TYPE_LABEL[type]}
            </label>
          ))}
        </div>
        {errors.siteType && (
          <p id={id('siteType-error')} className="mt-1 text-base text-danger">
            {errors.siteType}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor={id('message')} className="font-medium text-pearl">
          {t('message')}
        </label>
        <textarea
          id={id('message')}
          name="message"
          rows={3}
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={[id('message-count'), errors.message ? id('message-error') : null].filter(Boolean).join(' ')}
          className={inputClass('message')}
        />
        <p id={id('message-count')} className={`text-sm ${values.message.length > MESSAGE_MAX ? 'text-danger' : 'text-mist'}`}>
          <bdi>
            {values.message.length}/{MESSAGE_MAX}
          </bdi>
        </p>
        {errors.message && (
          <p id={id('message-error')} className="text-base text-danger">
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={id('email')} className="font-medium text-pearl">
          {t('email')}
        </label>
        <p id={id('email-hint')} className="text-base text-mist">
          {t('emailHint')}
        </p>
        <input
          id={id('email')}
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          maxLength={254}
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email', true)}
          className={`${inputClass('email')} text-right`}
        />
        {errors.email && (
          <p id={id('email-error')} className="mt-1 text-base text-danger">
            {errors.email}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id('website')}>{t('honeypot')}</label>
        <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input type="hidden" name="turnstileToken" value={token ?? ''} />

      {publicEnv.turnstileSiteKey && (
        <Turnstile siteKey={publicEnv.turnstileSiteKey} action="lead" nonce={nonce} onToken={setToken} resetKey={resetKey} />
      )}

      <div aria-live="polite" aria-atomic="true">
        {banner && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-base">
            <p>{banner === 'rate-limited' ? t('errorRateLimited') : banner === 'offline' ? t('errorOffline') : t('errorServer')}</p>
            {banner !== 'offline' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {banner === 'error' && (
                  <button type="submit" className="btn-secondary !min-h-11 text-base">
                    {t('retry')}
                  </button>
                )}
                <a
                  href={fallbackWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary !min-h-11 text-base"
                  onClick={() => track('whatsapp_click', { location: 'form-error' })}
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t('toWhatsApp')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <button type="submit" className="btn-primary relative w-full overflow-hidden" disabled={pending || signature} aria-disabled={pending || signature}>
          {signature ? (
            <>
              <span className="sig-ripple pointer-events-none absolute inset-0 m-auto h-12 w-12 rounded-full bg-pearl" aria-hidden="true" />
              <svg viewBox="0 0 24 24" className="sig-check h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </>
          ) : pending ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-abyss border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
              {t('submitting')}
            </>
          ) : (
            t('submit')
          )}
        </button>
      </div>
      <p id={id('privacy')} className="text-base text-mist">
        {t('privacy')}
      </p>
    </form>
  );
}

/** Page and UTM attribution, read at submit time so server-rendered markup stays identical for everyone. */
function appendSource(formData: FormData) {
  const params = new URLSearchParams(window.location.search);
  formData.set('page', window.location.pathname.slice(0, 200));
  formData.set('utmSource', (params.get('utm_source') ?? '').slice(0, 100));
  formData.set('utmMedium', (params.get('utm_medium') ?? '').slice(0, 100));
  formData.set('utmCampaign', (params.get('utm_campaign') ?? '').slice(0, 100));
}

function shake(el: HTMLElement) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}
