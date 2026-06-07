import type { TargetPosition, GapForecast } from '../types';

export interface ForecastParams {
  historicalGrowth?: number;
  seasonalityFactor?: number;
  competitionIndex?: number;
}

export function forecastTalentGap(
  positions: TargetPosition[],
  months: number = 3,
  params: ForecastParams = {}
): GapForecast[] {
  const { historicalGrowth = 0.08, seasonalityFactor = 0.15, competitionIndex = 0.7 } = params;
  const forecasts: GapForecast[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthSeasonFactor = Math.sin((i / months) * Math.PI * 2) * seasonalityFactor + 1;

    positions.forEach(p => {
      const monthlyHeadcount = Math.ceil(p.headcount / months);
      const baseSupply = monthlyHeadcount * competitionIndex * (1 + historicalGrowth);
      const adjustedSupply = Math.floor(baseSupply * monthSeasonFactor);
      const gap = monthlyHeadcount - adjustedSupply;

      forecasts.push({
        month: monthStr,
        position: p.name,
        headcount: monthlyHeadcount,
        predictedSupply: Math.max(0, adjustedSupply),
        gap: Math.max(0, gap)
      });
    });
  }
  return forecasts;
}

export function getSeverity(gap: number, headcount: number): 'low' | 'medium' | 'high' | 'critical' {
  if (headcount === 0) return 'low';
  const ratio = gap / headcount;
  if (ratio < 0.1) return 'low';
  if (ratio < 0.25) return 'medium';
  if (ratio < 0.4) return 'high';
  return 'critical';
}

export function getTotalGap(forecasts: GapForecast[]): number {
  return forecasts.reduce((sum, f) => sum + f.gap, 0);
}

export function getPositionGapSummary(forecasts: GapForecast[]) {
  const map = new Map<string, { headcount: number; supply: number; gap: number }>();
  forecasts.forEach(f => {
    const cur = map.get(f.position) || { headcount: 0, supply: 0, gap: 0 };
    cur.headcount += f.headcount;
    cur.supply += f.predictedSupply;
    cur.gap += f.gap;
    map.set(f.position, cur);
  });
  return Array.from(map.entries()).map(([name, v]) => ({
    position: name,
    ...v,
    fillRate: v.headcount > 0 ? (v.supply / v.headcount) * 100 : 0
  })).sort((a, b) => b.gap - a.gap);
}
