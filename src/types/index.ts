export type UserRole = 'hq' | 'region' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  scope: {
    regions?: string[];
    enterprises?: string[];
  };
}

export interface JobPost {
  id: string;
  title: string;
  industry: string;
  city: string;
  province: string;
  education: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  enterpriseId: string;
  enterpriseName: string;
  publishedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  education: string;
  experience: number;
  isMatched: boolean;
  appliedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  invitedAt: string;
  conducted: boolean;
}

export interface Offer {
  id: string;
  interviewId: string;
  sentAt: string;
  accepted: boolean | null;
}

export interface Onboarding {
  id: string;
  offerId: string;
  onboardedAt: string;
  retained3Months: boolean | null;
}

export type AlertType = 'delivery_drop' | 'conversion_low';
export type AlertLevel = 1 | 2;
export type AlertStatus = 'pending' | 'processing' | 'approved' | 'resolved';

export interface ApprovalStep {
  role: 'operation' | 'director' | 'head';
  roleName: string;
  approved: boolean;
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
  comment?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  industry: string;
  region: string;
  description: string;
  triggeredAt: string;
  status: AlertStatus;
  deliveryDropRate?: number;
  conversionGap?: number;
  approvalSteps: ApprovalStep[];
  currentStepIndex: number;
  resolvedAt?: string;
  improvementDays: number;
}

export interface DailyMetric {
  date: string;
  industry: string;
  city: string;
  province: string;
  applications: number;
  matchedApplications: number;
  interviews: number;
  offers: number;
  acceptedOffers: number;
  onboardings: number;
  retainedOnboardings: number;
}

export interface KpiSummary {
  totalApplications: number;
  matchRate: number;
  interviewConversionRate: number;
  offerAcceptanceRate: number;
  retentionRate: number;
  totalJobs: number;
  applicationChange: number;
  matchRateChange: number;
  interviewChange: number;
  offerChange: number;
  retentionChange: number;
}

export interface ProvinceData {
  name: string;
  value: number;
  cities: { name: string; value: number }[];
}

export interface HotJob {
  rank: number;
  title: string;
  industry: string;
  city: string;
  applications: number;
  trend: number;
}

export interface TrendPoint {
  date: string;
  [industry: string]: number | string;
}

export interface DistributionData {
  name: string;
  value: number;
}

export interface TargetPosition {
  name: string;
  headcount: number;
  city: string;
  major: string;
  education: string;
}

export interface GapForecast {
  month: string;
  position: string;
  headcount: number;
  predictedSupply: number;
  gap: number;
}

export interface UniversityRecommendation {
  rank: number;
  name: string;
  city: string;
  province: string;
  majors: string[];
  matchScore: number;
  expectedGraduates: number;
  cooperationHistory: string;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  scope: string;
  summary: {
    totalApplications: number;
    applicationsYoy: number;
    applicationsWow: number;
    matchRate: number;
    matchRateWow: number;
    interviewConversionRate: number;
    interviewConversionWow: number;
    offerAcceptanceRate: number;
    offerAcceptanceWow: number;
    retentionRate: number;
    retentionWow: number;
    avgInterviewDays: number;
  };
  recommendations: {
    channels: string[];
    talentProfile: string[];
    strategies: string[];
  };
}

export interface PermissionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName: string;
  scope: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
