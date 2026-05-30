'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DemoState, LatLng, Role } from './types';
import { createSeedState } from './seed';
import {
  ALLEY_AFTER_IMAGE,
  ALLEY_BEFORE_IMAGE,
  PLACEHOLDER_PROOF_IMAGE,
  PLACEHOLDER_TASK_IMAGE,
  STORE_KEY,
  STORE_VERSION,
} from './constants';
import * as R from './reducers';

interface DemoActions {
  claimTask: (taskId: string, workerId: string) => void;
  checkInTask: (claimId: string, coords: LatLng) => void;
  submitProof: (claimId: string, proof: { beforePhoto: string; afterPhoto: string; notes: string }) => void;
  reviewSubmission: (submissionId: string, decision: 'approve' | 'reject', opts?: { reason?: string; approvedAmount?: number }) => void;
  cashOut: (workerId: string) => void;
  createReport: (payload: { userId: string; category: string; note: string; location: LatLng; photoUrl: string }) => void;
  createTask: (payload: Parameters<typeof R.createTask>[1]) => void;
  promoteReportToTask: (reportId: string, payload: Parameters<typeof R.promoteReportToTask>[2]) => void;
  simulateOpsEvent: () => void;
  setPersona: (role: Role, userId: string) => void;
  resetDemo: () => void;
}

export type DemoStore = DemoState & DemoActions;

function durablePhotoUrl(value: string, fallback: string) {
  if (!value) return fallback;
  if (value.startsWith('data:') || value.startsWith('blob:') || value.length > 2000) return fallback;
  return value;
}

function migrateProofImage(value: string, fallback: string) {
  if (value === PLACEHOLDER_TASK_IMAGE) return ALLEY_BEFORE_IMAGE;
  if (value === PLACEHOLDER_PROOF_IMAGE) return ALLEY_AFTER_IMAGE;
  return durablePhotoUrl(value, fallback);
}

function sanitizeDemoState(state: DemoState): DemoState {
  return {
    workers: state.workers,
    admins: state.admins,
    sponsors: state.sponsors,
    neighborhoods: state.neighborhoods,
    campaigns: state.campaigns,
    tasks: state.tasks,
    claims: state.claims,
    submissions: state.submissions.map((submission) => ({
      ...submission,
      beforePhoto: migrateProofImage(submission.beforePhoto, ALLEY_BEFORE_IMAGE),
      afterPhoto: migrateProofImage(submission.afterPhoto, ALLEY_AFTER_IMAGE),
    })),
    payments: state.payments,
    reports: state.reports.map((report) => ({
      ...report,
      photoUrl: durablePhotoUrl(report.photoUrl, PLACEHOLDER_TASK_IMAGE),
    })),
    activePersona: state.activePersona,
  };
}

function isDemoState(value: unknown): value is DemoState {
  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray((value as DemoState).workers) &&
    Array.isArray((value as DemoState).submissions) &&
    Array.isArray((value as DemoState).reports) &&
    (value as DemoState).activePersona,
  );
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      ...createSeedState(),
      claimTask: (taskId, workerId) => set((s) => R.claimTask(s, taskId, workerId)),
      checkInTask: (claimId, coords) => set((s) => R.checkInTask(s, claimId, coords)),
      submitProof: (claimId, proof) => set((s) => R.submitProof(s, claimId, proof)),
      reviewSubmission: (id, decision, opts) => set((s) => R.reviewSubmission(s, id, decision, opts)),
      cashOut: (workerId) => set((s) => R.cashOut(s, workerId)),
      createReport: (payload) => set((s) => R.createReport(s, payload)),
      createTask: (payload) => set((s) => R.createTask(s, payload)),
      promoteReportToTask: (reportId, payload) => set((s) => R.promoteReportToTask(s, reportId, payload)),
      simulateOpsEvent: () => set((s) => R.simulateOpsEvent(s)),
      setPersona: (role, userId) => set(() => ({ activePersona: { role, userId } })),
      resetDemo: () => set(() => ({ ...createSeedState() })),
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Persist only entity state, never the action functions. Actions always
      // come from the initializer above and are merged back on rehydrate.
      partialize: (state): DemoState => sanitizeDemoState(state),
      migrate: (persistedState) => (
        isDemoState(persistedState)
          ? sanitizeDemoState(persistedState)
          : createSeedState()
      ) as Partial<DemoStore>,
    },
  ),
);
