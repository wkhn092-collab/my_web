import type { SceneQuality } from './studio';

export type SceneTier = 'poster' | SceneQuality;

const SESSION_OFF_KEY = 'omek-scene-off';

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Full scene on capable desktops, a lighter one on phones and mid-range devices, the CSS poster otherwise. */
export function detectSceneTier(): SceneTier {
  if (typeof window === 'undefined') return 'poster';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'poster';
  try {
    if (sessionStorage.getItem(SESSION_OFF_KEY) === '1') return 'poster';
  } catch {
    // Storage blocked: keep going.
  }
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return 'poster';
  const memory = nav.deviceMemory;
  // Safari on iPhone/iPad reports a capped core count for privacy (2 on every model), so it says nothing about
  // the device there; the frame guard still catches a device that can't keep up.
  const cores = isAppleMobile() ? undefined : nav.hardwareConcurrency;
  if ((memory !== undefined && memory <= 2) || (cores !== undefined && cores <= 2)) return 'poster';

  const probe = document.createElement('canvas');
  if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return 'poster';

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if ((memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4) || coarse) return 'reduced';
  return 'full';
}

export type StageTier = SceneTier | 'still';

/**
 * Product stages are content, not ambience: on reduced motion they render a single still frame instead of
 * disappearing. Weak devices and the session opt-out still get nothing.
 */
export function detectStageTier(): StageTier {
  if (typeof window === 'undefined') return 'poster';
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return detectSceneTier();
  const probe = document.createElement('canvas');
  return probe.getContext('webgl2') || probe.getContext('webgl') ? 'still' : 'poster';
}

function isAppleMobile(): boolean {
  // iPadOS presents itself as a Mac; touch points tell them apart.
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** The device couldn't keep up: stay on the poster for the rest of this visit. */
export function rememberSceneOff() {
  try {
    sessionStorage.setItem(SESSION_OFF_KEY, '1');
  } catch {
    // Storage blocked: nothing to remember.
  }
}
