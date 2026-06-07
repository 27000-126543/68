import { createContext, useContext, useEffect, useState } from 'react';

const CounterContext = createContext(0);

export const useCountUp = (target: number, duration = 1200, deps: unknown[] = []) => {
  const [value, setValue] = useState(0);
  const startedAt = useContext(CounterContext);

  useEffect(() => {
    let raf = 0;
    const start = performance.now() - startedAt;
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startedAt, ...deps]);

  return value;
};

export const CountUpProvider = ({ children }: { children: React.ReactNode }) => (
  <CounterContext.Provider value={performance.now()}>{children}</CounterContext.Provider>
);

export const formatNumber = (n: number, digits = 0) => {
  if (n >= 10000) return (n / 10000).toFixed(digits > 0 ? 1 : 0) + '万';
  return n.toLocaleString('zh-CN', { maximumFractionDigits: digits });
};

export const formatPercent = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export const formatTrend = (n: number) => {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
};
