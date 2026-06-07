import type {
  KpiSummary, ProvinceData, HotJob, TrendPoint, DistributionData,
  Alert, AlertStatus, AlertLevel, WeeklyReport, PermissionUser,
  GapForecast, UniversityRecommendation, User, TargetPosition
} from '../types';

const baseURL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

type FetchOptions = Omit<RequestInit, 'body'> & { body?: any };

async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${baseURL}${path}`;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (typeof options.body === 'string' || options.body instanceof FormData) {
      body = options.body;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }
  }

  const finalOptions: RequestInit = { ...options as RequestInit, headers, body };
  const res = await fetch(url, finalOptions);

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData?.error) errMsg = errData.error;
    } catch {
      // ignore parse error
    }
    throw new Error(errMsg);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as unknown as T;
  }

  const data = await res.json() as ApiResponse<T>;
  if (!data.success) {
    throw new Error(data.error || '请求失败');
  }
  return data.data;
}

export interface KpiParams {
  industry?: string;
  province?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
}

export function getKpi(params?: KpiParams): Promise<KpiSummary> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
    });
  }
  const qs = search.toString();
  return fetchJson<KpiSummary>(`/metrics/kpi${qs ? `?${qs}` : ''}`);
}

export function getDeliveryMap(): Promise<ProvinceData[]> {
  return fetchJson<ProvinceData[]>('/metrics/delivery-map');
}

export function getHotJobs(): Promise<HotJob[]> {
  return fetchJson<HotJob[]>('/metrics/hot-jobs');
}

export function getTrend(city?: string): Promise<TrendPoint[]> {
  const qs = city ? `?city=${encodeURIComponent(city)}` : '';
  return fetchJson<TrendPoint[]>(`/metrics/trend${qs}`);
}

export function getEducationDist(city?: string): Promise<DistributionData[]> {
  const qs = city ? `?city=${encodeURIComponent(city)}` : '';
  return fetchJson<DistributionData[]>(`/metrics/distribution/education${qs}`);
}

export function getExperienceDist(city?: string): Promise<DistributionData[]> {
  const qs = city ? `?city=${encodeURIComponent(city)}` : '';
  return fetchJson<DistributionData[]>(`/metrics/distribution/experience${qs}`);
}

export interface AlertParams {
  status?: AlertStatus;
  level?: AlertLevel;
  keyword?: string;
}

export function getAlerts(params?: AlertParams): Promise<Alert[]> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
    });
  }
  const qs = search.toString();
  return fetchJson<Alert[]>(`/alerts${qs ? `?${qs}` : ''}`);
}

export interface AlertCount {
  level1: number;
  level2: number;
  pending: number;
}

export function getAlertCount(): Promise<AlertCount> {
  return fetchJson<AlertCount>('/alerts/count');
}

export interface ApprovePayload {
  role: 'hq' | 'region' | 'enterprise';
  comment?: string;
  approverName?: string;
}

export function approveAlert(id: string, payload: ApprovePayload): Promise<Alert> {
  return fetchJson<Alert>(`/alerts/${id}/approve`, {
    method: 'POST',
    body: payload
  });
}

export function escalateAlert(id: string): Promise<Alert> {
  return fetchJson<Alert>(`/alerts/${id}/escalate`, {
    method: 'POST'
  });
}

export function resolveAlert(id: string): Promise<Alert> {
  return fetchJson<Alert>(`/alerts/${id}/resolve`, {
    method: 'POST'
  });
}

export function getReports(): Promise<WeeklyReport[]> {
  return fetchJson<WeeklyReport[]>('/reports');
}

export function getReport(id: string): Promise<WeeklyReport> {
  return fetchJson<WeeklyReport>(`/reports/${id}`);
}

export function getPermissionUsers(): Promise<PermissionUser[]> {
  return fetchJson<PermissionUser[]>('/permissions/users');
}

export function forecastCampusGap(positions: TargetPosition[]): Promise<GapForecast[]> {
  return fetchJson<GapForecast[]>('/campus/forecast', {
    method: 'POST',
    body: { positions }
  });
}

export function recommendUniversities(cities: string[]): Promise<UniversityRecommendation[]> {
  return fetchJson<UniversityRecommendation[]>('/campus/recommend-universities', {
    method: 'POST',
    body: { cities }
  });
}

export function getLoginUsers(): Promise<User[]> {
  return fetchJson<User[]>('/users');
}
