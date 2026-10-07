'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { setAmbientHidden, startAmbient, stopAmbient } from '@/lib/audio/ambient';
import { useSession } from '@/lib/store/visitor';

export function SoundToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('sound');
  const on = useSession((s) => s.soundOn);
  const setOn = useSession((s) => s.setSoundOn);

  useEffect(() => {
    const onVisibility = () => setAmbientHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  async function toggle() {
    if (on) {
      stopAmbient();
      setOn(false);
    } else {
      setOn(await startAmbient());
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? t('off') : t('on')}
      title={on ? t('off') : t('on')}
      className={`group inline-flex h-11 items-center gap-2 rounded-full px-3 text-xs tracking-[0.2em] text-mist transition-colors hover:text-gold-soft ${className}`}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="sound-bar block h-full w-[2px] rounded-full bg-current" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </span>
      <span aria-hidden="true">{t('label')}</span>
    </button>
  );
}
