import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp, formatNumber, formatPercent, formatTrend } from '../../hooks/useCountUp';

interface KpiCardProps {
  title: string;
  value: number;
  unit?: string;
  format?: 'number' | 'percent';
  change?: number;
  gradient: string;
  icon: React.ReactNode;
  delay?: number;
}

export function KpiCard({ title, value, unit = '', format = 'number', change, gradient, icon, delay = 0 }: KpiCardProps) {
  const displayValue = useCountUp(value, 1400 + delay, [value]);
  const isUp = (change ?? 0) >= 0;

  return (
    <div className={`kpi-card ${gradient}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-3 font-display text-3xl font-bold text-white tracking-tight">
            {format === 'number' ? formatNumber(displayValue) : formatPercent(displayValue)}
            {unit && <span className="text-base font-medium ml-1 opacity-80">{unit}</span>}
          </p>
          {change !== undefined && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 text-sm text-white/90 font-medium">
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{formatTrend(change)}</span>
              <span className="text-white/60 font-normal">较上周期</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm text-white">
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
    </div>
  );
}
