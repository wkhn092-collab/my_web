'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LeadSiteType } from '@/lib/content/types';

export type Consent = 'granted' | 'denied' | null;

const RECENT_MAX = 6;

/** Persisted memory (rule 19). IDs and choices only: never names, phones, emails, free text or prices. */
type VisitorState = {
  recentProjects: string[];
  lastFilter: string | null;
  formDraft: { siteType: LeadSiteType | null };
  consent: Consent;
  motionPaused: boolean;
  rememberProject: (id: string) => void;
  clearRecent: () => void;
  setLastFilter: (slug: string | null) => void;
  setDraftSiteType: (siteType: LeadSiteType | null) => void;
  setConsent: (consent: Consent) => void;
  setMotionPaused: (paused: boolean) => void;
};

export const useVisitor = create<VisitorState>()(
  persist(
    (set) => ({
      recentProjects: [],
      lastFilter: null,
      formDraft: { siteType: null },
      consent: null,
      motionPaused: false,
      rememberProject: (id) =>
        set((s) => ({ recentProjects: [id, ...s.recentProjects.filter((p) => p !== id)].slice(0, RECENT_MAX) })),
      clearRecent: () => set({ recentProjects: [] }),
      setLastFilter: (slug) => set({ lastFilter: slug }),
      setDraftSiteType: (siteType) => set({ formDraft: { siteType } }),
      setConsent: (consent) => set({ consent }),
      setMotionPaused: (motionPaused) => set({ motionPaused }),
    }),
    {
      name: 'omek-visitor',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ recentProjects, lastFilter, formDraft, consent, motionPaused }) => ({
        recentProjects,
        lastFilter,
        formDraft,
        consent,
        motionPaused,
      }),
      // Drops anything unexpected that a tampered localStorage might contain.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<VisitorState>;
        const ids = Array.isArray(p.recentProjects)
          ? p.recentProjects.filter((id): id is string => typeof id === 'string' && /^[\w.-]{1,120}$/.test(id)).slice(0, RECENT_MAX)
          : [];
        const filter = typeof p.lastFilter === 'string' && /^[a-z0-9-]{1,32}$/.test(p.lastFilter) ? p.lastFilter : null;
        const siteTypes: LeadSiteType[] = ['landing', 'brand', 'premium3d', 'unsure'];
        const draft = siteTypes.includes(p.formDraft?.siteType as LeadSiteType) ? (p.formDraft!.siteType as LeadSiteType) : null;
        const consent = p.consent === 'granted' || p.consent === 'denied' ? p.consent : null;
        return {
          ...current,
          recentProjects: ids,
          lastFilter: filter,
          formDraft: { siteType: draft },
          consent,
          motionPaused: p.motionPaused === true,
        };
      },
    },
  ),
);

/** In-memory only (not persisted): UI state and the one-time hand-off from the form to /thanks. */
type SessionState = {
  drawerOpen: boolean;
  drawerSiteType: LeadSiteType | null;
  handoff: { name: string; whatsappUrl: string; submissionId: string } | null;
  /** Ambient sound: needs a fresh gesture every visit, so it is never persisted. */
  soundOn: boolean;
  openDrawer: (siteType?: LeadSiteType | null) => void;
  closeDrawer: () => void;
  setHandoff: (handoff: SessionState['handoff']) => void;
  setSoundOn: (on: boolean) => void;
};

export const useSession = create<SessionState>()((set) => ({
  drawerOpen: false,
  drawerSiteType: null,
  handoff: null,
  soundOn: false,
  setSoundOn: (soundOn) => set({ soundOn }),
  openDrawer: (siteType = null) => set({ drawerOpen: true, drawerSiteType: siteType }),
  closeDrawer: () => set({ drawerOpen: false }),
  setHandoff: (handoff) => set({ handoff }),
}));

/** True after the persisted store has rehydrated on the client (avoids SSR/CSR mismatches). */
export function useVisitorHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useVisitor.persist.onFinishHydration(onChange),
    () => useVisitor.persist.hasHydrated(),
    () => false,
  );
}
