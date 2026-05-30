export type Role = 'worker' | 'admin' | 'sponsor';

export type TaskStatus =
  | 'open' | 'claimed' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type ClaimStatus = 'claimed' | 'in_progress' | 'submitted' | 'completed';
export type SubmissionStatus = 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'pending_review' | 'available' | 'paid' | 'rejected';
export type ReportStatus =
  | 'pending' | 'approved_paid' | 'approved_funding' | 'city_routed' | 'rejected';

export interface LatLng { lat: number; lng: number; }

export interface Worker {
  id: string; name: string; role: 'worker';
  onboardingCompleted: boolean; neighborhoodId: string;
  level: number; reliabilityScore: number; safetyScore: number;
  unlockedTaskTypes: string[];
}
export interface Admin { id: string; name: string; role: 'admin'; }
export interface Sponsor { id: string; name: string; role: 'sponsor'; campaignIds: string[]; }

export interface Neighborhood {
  id: string; name: string; state: string; level: number;
  tasksCompleted: number; paidTotal: number; blocksImproved: number;
  openReports: number;
}

export interface Campaign {
  id: string; title: string; description: string; sponsorId: string;
  targetGoal: number; completedGoal: number;
  totalBudget: number; remainingBudget: number;
}

export interface Task {
  id: string; title: string; description: string; status: TaskStatus;
  payoutAmount: number; estimatedMinutes: number;
  requiredTools: string[]; safetyNotes: string;
  doList: string[]; dontList: string[];
  location: LatLng; taskType: string;
  neighborhoodId: string; campaignId: string | null;
  isFundingNeeded: boolean; isComingSoon: boolean;
  reportedByUserId: string | null;
}

export interface Claim {
  id: string; taskId: string; workerId: string; status: ClaimStatus;
  claimedAt: string; startedAt: string | null; completedAt: string | null;
  gpsCheckin: LatLng | null;
}

export interface Submission {
  id: string; taskId: string; workerId: string; claimId: string;
  beforePhoto: string; afterPhoto: string; notes: string;
  status: SubmissionStatus; submittedAt: string;
  reviewReason: string | null;
}

export interface Payment {
  id: string; workerId: string; submissionId: string;
  amount: number; status: PaymentStatus; createdAt: string;
}

export interface Report {
  id: string; userId: string; photoUrl: string; location: LatLng;
  category: string; note: string; status: ReportStatus; createdAt: string;
}

export interface DemoState {
  workers: Worker[]; admins: Admin[]; sponsors: Sponsor[];
  neighborhoods: Neighborhood[]; campaigns: Campaign[];
  tasks: Task[]; claims: Claim[]; submissions: Submission[];
  payments: Payment[]; reports: Report[];
  activePersona: { role: Role; userId: string };
}
