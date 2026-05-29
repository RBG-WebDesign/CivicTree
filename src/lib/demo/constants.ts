import type { LatLng } from './types';

// Fixed demo user location (Downtown LA) used for deterministic distances.
export const DEMO_USER_LOCATION: LatLng = { lat: 34.0452, lng: -118.2502 };

export const STORE_KEY = 'civictree-demo';
export const STORE_VERSION = 1;

export const PLACEHOLDER_TASK_IMAGE = '/task_thumbnail.png';
export const PLACEHOLDER_PROOF_IMAGE = '/volunteers_working.png';

// Deterministic base time for demo records. Runtime records are stamped at
// DEMO_EPOCH + (sequence * 1 minute) so timestamps are stable, not wall-clock.
export const DEMO_EPOCH = Date.parse('2026-05-29T09:00:00.000Z');
