'use client';

import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { submitLead } from '@/app/actions/lead';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { track } from '@/lib/analytics';
import { LEAD_GOAL_LABEL, LEAD_SITE_TYPE_LABEL } from '@/lib/content/labels';
import { LEAD_GOALS, LEAD_SITE_TYPES, type Addon, type LeadGoal, type LeadSiteType } from '@/lib/content/types';
import { addonsForSiteType } from '@/lib/domain/addons';
import { FAB_MESSAGE, MESSAGE_MAX, buildLeadMessage, whatsappUrl } from '@/lib/domain/whatsapp';
import { publicEnv } from '@/lib/env.public';
import { leadInputSchema, type LeadActionState, type LeadField } from '@/lib/lead/lead-schema';
import { useSession, useVisitor } from '@/lib/store/visitor';
import { Turnstile } from './Turnstile';

type Values = { name: string; phone: string; siteType: LeadSiteType | ''; goal: LeadGoal | ''; message: string; email: string };
type Banner = 'rate-limited' | 'error' | 'offline' | null;
type Step = 1 | 2 | 3;

const FIELD_ORDER: LeadField[] = ['name', 'phone', 'siteType', 'message', 'email'];
const LEAVE_MS = 160;
const whatsappOnlySchema = leadInputSchema.omit({ phone: true });

/**
 * One question per screen: site type, then what matters most, then name and phone. The rest is optional and folded
 * away. Every step lives inside one <form>, so the server receives exactly what the old single-page form sent.
 * `whatsappOnly` (while the server refuses leads) asks the same questions but stores nothing: the answers go out as
 * a ready WhatsApp message, and the phone is not asked because WhatsApp already carries it.
 */
export function LeadForm({
  whatsappNumber,
  addons,
  presetSiteType = null,
  nonce,
  location,
  whatsappOnly = false,
}: {
  whatsappNumber: string;
  addons: Addon[];
  presetSiteType?: LeadSiteType | null;
  nonce?: string;
  location: 'drawer' | 'inline';
  whatsappOnly?: boolean;
}) {
  const t = useTranslations('form');
  const w = useTranslations('wizard');
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const extrasRef = useRef<HTMLDetailsElement>(null);
  const draftSiteType = useVisitor((s) => s.formDraft.siteType);
  const draftAddons = useVisitor((s) => s.formDraft.addons);
  const setDraftSiteType = useVisitor((s) => s.setDraftSiteType);
  const setDraftAddons = useVisitor((s) => s.setDraftAddons);
  const setHandoff = useSession((s) => s.setHandoff);

  const [step, setStep] = useState<Step>(presetSiteType ? 2 : 1);
  const [leaving, setLeaving] = useState(false);
  const [values, setValues] = useState<Values>({
    name: '',
    phone: '',
    siteType: presetSiteType ?? draftSiteType ?? '',
    goal: '',
    message: '',
    email: '',
  });
  const [chosenAddons, setChosenAddons] = useState<string[]>(draftAddons);
  const visibleAddons = addonsForSiteType(addons, values.siteType);
  // Only extras that suit the current site type are sent; switching type quietly drops the rest.
  const sentAddons = chosenAddons.filter((slug) => visibleAddons.some((a) => a.slug === slug));
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [banner, setBanner] = useState<Banner>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const started = useRef(false);
  const stepChanged = useRef(false);

  const [state, formAction, pending] = useActionState<LeadActionState, FormData>(submitLead, { status: 'idle' });
  const [handoff, setLocalHandoff] = useState<{ name: string; whatsappUrl: string } | null>(null);
  const done = state.status === 'success' || handoff !== null;

  // Derived-state updates happen during render (not in effects) when the preset or the server answer changes.
  const [prevPreset, setPrevPreset] = useState(presetSiteType);
  if (presetSiteType !== prevPreset) {
    setPrevPreset(presetSiteType);
    if (presetSiteType) {
      setValues((v) => ({ ...v, siteType: presetSiteType }));
      if (step === 1) setStep(2);
    }
  }
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    // Tokens are single-use: every server answer needs a fresh challenge.
    if (state.status !== 'idle') setResetKey((k) => k + 1);
    if (state.status === 'invalid') {
      setErrors(state.fieldErrors);
      if (state.fieldErrors.siteType) setStep(1);
    }
    if (state.status === 'rate-limited' || state.status === 'error') setBanner(state.status);
  }

  const id = (field: string) => `${uid}-${field}`;

  // The frame follows the content's height, so each step change glides instead of jumping.
  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    const sync = () => {
      frame.style.height = `${content.offsetHeight}px`;
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(content);
    const raf = requestAnimationFrame(() => frame.classList.add('is-ready'));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Loaded on demand, so the drawer may already be open when the wizard arrives. Inline, focus only moves after the
  // visitor has acted, never on mount.
  useEffect(() => {
    if (location === 'drawer' || stepChanged.current) headingRef.current?.focus({ preventScroll: location === 'drawer' });
  }, [step, done, location]);

  function goTo(next: Step) {
    stepChanged.current = true;
    track('form_step', { location, step: next });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(next);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      setStep(next);
      setLeaving(false);
    }, LEAVE_MS);
  }

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track('form_start', { location });
  }

  function focusFirstError(fieldErrors: Partial<Record<LeadField, string>>) {
    const first = FIELD_ORDER.find((f) => fieldErrors[f]);
    if (!first || first === 'siteType') return;
    if ((first === 'message' || first === 'email') && extrasRef.current) extrasRef.current.open = true;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    if (!el) return;
    el.focus();
    shake(el);
  }

  useEffect(() => {
    if (state.status === 'invalid') {
      focusFirstError(state.fieldErrors);
    } else if (state.status === 'success') {
      stepChanged.current = true;
      track('generate_lead', { location, site_type: values.siteType || undefined, addons: state.addons.length });
      setHandoff({ name: state.name, whatsappUrl: state.whatsappUrl, submissionId: state.submissionId, addons: state.addons });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function update<K extends keyof Values>(field: K, value: Values[K]) {
    markStarted();
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field as LeadField]) setErrors((e) => ({ ...e, [field]: undefined }));
    if (field === 'siteType') setDraftSiteType((value as LeadSiteType) || null);
  }

  function chooseSiteType(type: LeadSiteType) {
    if (leaving) return;
    update('siteType', type);
    goTo(2);
  }

  function chooseGoal(goal: LeadGoal) {
    if (leaving) return;
    update('goal', goal);
    goTo(3);
  }

  function toggleAddon(slug: string, on: boolean) {
    markStarted();
    const next = on ? [...chosenAddons.filter((s) => s !== slug), slug] : chosenAddons.filter((s) => s !== slug);
    setChosenAddons(next);
    setDraftAddons(next);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 3 || done) return;
    setBanner(null);
    const formData = new FormData(event.currentTarget);
    appendSource(formData);
    const check = (whatsappOnly ? whatsappOnlySchema : leadInputSchema).safeParse(Object.fromEntries(formData));
    if (!check.success) {
      const fieldErrors: Partial<Record<LeadField, string>> = {};
      for (const issue of check.error.issues) {
        const field = String(issue.path[0]) as LeadField;
        if (FIELD_ORDER.includes(field) && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      if (fieldErrors.siteType) goTo(1);
      else focusFirstError(fieldErrors);
      return;
    }
    if (whatsappOnly) {
      const lead = check.data;
      const url = whatsappUrl(
        whatsappNumber,
        buildLeadMessage({
          name: lead.name,
          siteTypeLabel: LEAD_SITE_TYPE_LABEL[lead.siteType],
          goalLabel: lead.goal ? LEAD_GOAL_LABEL[lead.goal] : undefined,
          message: lead.message,
          addons: visibleAddons.filter((a) => sentAddons.includes(a.slug)).map((a) => a.title),
        }),
      );
      track('form_submit', { location });
      track('whatsapp_click', { location: `form-${location}` });
      window.open(url, '_blank', 'noopener,noreferrer');
      stepChanged.current = true;
      setLocalHandoff({ name: lead.name, whatsappUrl: url });
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

  const optionClass =
    'group flex min-h-[4.25rem] w-full items-center justify-between gap-4 rounded-2xl border border-pearl/15 bg-white/[0.02] px-5 py-3.5 text-start transition-colors duration-300 hover:border-gold/60 hover:bg-gold/[0.05] aria-pressed:border-gold aria-pressed:bg-gold/[0.08]';

  const fallbackWhatsApp = whatsappUrl(whatsappNumber, FAB_MESSAGE);
  const headingClass = 'text-2xl font-light leading-tight text-pearl outline-none md:text-3xl';

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby={id('privacy')}>
      {!done && (
        <div className="mb-6 flex min-h-11 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`h-1.5 rounded-full transition-all duration-500 ${n === step ? 'w-6 bg-gold' : n < step ? 'w-1.5 bg-gold/60' : 'w-1.5 bg-pearl/20'}`}
                />
              ))}
            </span>
            <span className="text-sm text-mist" aria-live="polite">
              {w('progress', { step })}
            </span>
          </div>
          {step > 1 && (
            <button
              type="button"
              onClick={() => !leaving && goTo((step - 1) as Step)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-base text-mist transition-colors hover:text-pearl"
            >
              <span aria-hidden="true">→</span>
              {w('back')}
            </button>
          )}
        </div>
      )}

      <div ref={frameRef} className="wizard-frame -m-1 overflow-hidden">
        <div ref={contentRef} className="p-1">
          {handoff ? (
            <div className="wizard-step py-2 text-center" role="status">
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold">
                <span className="sig-ripple pointer-events-none absolute inset-0 m-auto h-10 w-10 rounded-full bg-gold/40" aria-hidden="true" />
                <WhatsAppIcon className="h-7 w-7" />
              </div>
              <h3 ref={headingRef} tabIndex={-1} data-wizard-heading="" className={headingClass}>
                {w('doneTitleWhatsApp', { name: handoff.name })}
              </h3>
              <p className="mt-3 text-lg text-pearl/80">{w('doneBodyWhatsApp')}</p>
              <p className="mt-8 text-base text-mist">{w('doneHintWhatsApp')}</p>
              <a
                href={handoff.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full"
                onClick={() => track('whatsapp_click', { location: 'lead-done' })}
              >
                <WhatsAppIcon className="h-5 w-5" />
                {w('doneButtonWhatsApp')}
              </a>
            </div>
          ) : state.status === 'success' ? (
            <div className="wizard-step py-2 text-center" role="status">
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold">
                <span className="sig-ripple pointer-events-none absolute inset-0 m-auto h-10 w-10 rounded-full bg-gold/40" aria-hidden="true" />
                <svg viewBox="0 0 24 24" className="sig-check h-7 w-7" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </div>
              <h3 ref={headingRef} tabIndex={-1} data-wizard-heading="" className={headingClass}>
                {w('doneTitle', { name: state.name })}
              </h3>
              <p className="mt-3 text-lg text-pearl/80">
                <bdi>{w('doneBody', { reply: state.replyWindow })}</bdi>
              </p>
              <p className="mt-8 text-base text-mist">{w('doneWhatsApp')}</p>
              <a
                href={state.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full"
                onClick={() => track('whatsapp_click', { location: 'lead-done' })}
              >
                <WhatsAppIcon className="h-5 w-5" />
                {w('doneButton')}
              </a>
            </div>
          ) : (
            <div key={step} className={`wizard-step ${leaving ? 'is-leaving' : ''}`}>
              {step === 1 && (
                <>
                  <h3 ref={headingRef} tabIndex={-1} data-wizard-heading="" id={id('step-1')} className={headingClass}>
                    {w('step1Title')}
                  </h3>
                  <p className="mt-2 text-base text-mist">{w('step1Hint')}</p>
                  <div role="group" aria-labelledby={id('step-1')} aria-describedby={describedBy('siteType')} className="mt-5 grid gap-2.5">
                    {LEAD_SITE_TYPES.map((type) => (
                      <button key={type} type="button" aria-pressed={values.siteType === type} onClick={() => chooseSiteType(type)} className={optionClass}>
                        <span>
                          <span className="block text-lg text-pearl">{LEAD_SITE_TYPE_LABEL[type]}</span>
                          <span className="block text-sm text-mist">{w(`siteTypeHints.${type}`)}</span>
                        </span>
                        <span className="text-gold/60 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
                          ←
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.siteType && (
                    <p id={id('siteType-error')} className="mt-2 text-base text-danger">
                      {errors.siteType}
                    </p>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <h3 ref={headingRef} tabIndex={-1} data-wizard-heading="" id={id('step-2')} className={headingClass}>
                    {w('step2Title')}
                  </h3>
                  <p className="mt-2 text-base text-mist">{w('step2Hint')}</p>
                  <div role="group" aria-labelledby={id('step-2')} className="mt-5 grid gap-2.5">
                    {LEAD_GOALS.map((goal) => (
                      <button key={goal} type="button" aria-pressed={values.goal === goal} onClick={() => chooseGoal(goal)} className={optionClass}>
                        <span className="text-lg text-pearl">{LEAD_GOAL_LABEL[goal]}</span>
                        <span className="text-gold/60 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
                          ←
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 ref={headingRef} tabIndex={-1} data-wizard-heading="" className={headingClass}>
                      {whatsappOnly ? w('step3TitleWhatsApp') : w('step3Title')}
                    </h3>
                    <p className="mt-2 text-base text-mist">{whatsappOnly ? w('step3HintWhatsApp') : w('step3Hint')}</p>
                  </div>

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

                  {!whatsappOnly && (
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
                  )}

                  <details ref={extrasRef} className="group/extras rounded-2xl border border-pearl/10">
                    <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-3 px-4 text-base text-pearl/85 [&::-webkit-details-marker]:hidden">
                      {w('more')}
                      <span className="text-gold transition-transform duration-300 group-open/extras:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <div className="space-y-5 px-4 pb-5 pt-1">
                      {visibleAddons.length > 0 && (
                        <fieldset aria-describedby={id('addons-hint')}>
                          <legend className="font-medium text-pearl">{t('addonsLegend')}</legend>
                          <p id={id('addons-hint')} className="text-base text-mist">
                            {t('addonsHint')}
                          </p>
                          <div className="mt-2 grid gap-2">
                            {visibleAddons.map((addon) => (
                              <label
                                key={addon.slug}
                                className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-pearl/15 px-4 py-3 text-base transition-colors duration-300 hover:border-pearl/35 has-[:checked]:border-gold has-[:checked]:bg-gold/[0.08] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-soft"
                              >
                                <input
                                  type="checkbox"
                                  value={addon.slug}
                                  checked={sentAddons.includes(addon.slug)}
                                  onChange={(e) => toggleAddon(addon.slug, e.target.checked)}
                                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#C9A66B]"
                                />
                                <span>
                                  <span className="block text-pearl">{addon.title}</span>
                                  <span className="block text-sm text-mist">{addon.benefit}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      )}

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

                      {!whatsappOnly && (
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
                      )}
                    </div>
                  </details>

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

                  <button type="submit" className="btn-primary w-full" disabled={pending} aria-disabled={pending}>
                    {pending ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-abyss border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
                        {t('submitting')}
                      </>
                    ) : whatsappOnly ? (
                      <>
                        <WhatsAppIcon className="h-5 w-5" />
                        {t('submit')}
                      </>
                    ) : (
                      w('submit')
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <input type="hidden" name="siteType" value={values.siteType} />
      <input type="hidden" name="goal" value={values.goal} />
      <input type="hidden" name="addons" value={sentAddons.join(',')} />
      <input type="hidden" name="turnstileToken" value={token ?? ''} />
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id('website')}>{t('honeypot')}</label>
        <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {/* Mounted from the first step, so the challenge is usually solved before the visitor reaches the last one. */}
      {publicEnv.turnstileSiteKey && !done && !whatsappOnly && (
        <div className="mt-4">
          <Turnstile siteKey={publicEnv.turnstileSiteKey} action="lead" nonce={nonce} onToken={setToken} resetKey={resetKey} />
        </div>
      )}

      <p id={id('privacy')} className="mt-5 text-sm text-mist">
        {whatsappOnly ? t('privacyWhatsApp') : t('privacy')}
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
