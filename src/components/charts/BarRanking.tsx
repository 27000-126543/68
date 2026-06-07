import ReactECharts from 'echarts-for-react';
import type { HotJob } from '../../types';
import { useMemo } from 'react';

interface BarRankingProps {
  data: HotJob[];
  height?: number;
}

export function BarRanking({ data, height = 480 }: BarRankingProps) {
  const option = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.applications - b.applications);
    const max = Math.max(...sorted.map(d => d.applications));

    return {
      grid: { left: 120, right: 80, top: 8, bottom: 8 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 52, 96, 0.92)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontFamily: 'PingFang SC', fontSize: 13 },
        padding: [10, 14],
        formatter: (params: { name: string; value: number }[]) => {
          const j = data.find(x => x.title === params[0].name);
          return `<div style="font-weight:600;margin-bottom:4px">${params[0].name}</div>
            <div style="opacity:.85">投递量：<b style="color:#8ba8ff">${params[0].value.toLocaleString()}</b></div>
            ${j ? `<div style="opacity:.85;margin-top:4px">行业：${j.industry} · ${j.city}</div>` : ''}`;
        }
      },
      xAxis: {
        type: 'value',
        show: false,
        max: max * 1.2
      },
      yAxis: {
        type: 'category',
        data: sorted.map(d => d.title),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#0F3460',
          fontSize: 12.5,
          fontWeight: 500,
          fontFamily: 'PingFang SC'
        }
      },
      series: [{
        type: 'bar',
        barWidth: 16,
        data: sorted.map((d) => ({
          value: d.applications,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: d.trend >= 0
              ? { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#8ba8ff' }, { offset: 1, color: '#165DFF' }] }
              : { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#fed7aa' }, { offset: 1, color: '#FAAD14' }] }
          }
        })),
        label: {
          show: true,
          position: 'right',
          color: '#0F3460',
          fontWeight: 600,
          fontSize: 12.5,
          formatter: (p: { value: number }) => {
            const job = sorted.find(d => d.applications === p.value);
            const trend = job?.trend ?? 0;
            const icon = trend >= 0 ? '▲' : '▼';
            const color = trend >= 0 ? '#52C41A' : '#FF4D4F';
            return `{num|${p.value.toLocaleString()}}  {trend|${icon}${Math.abs(trend).toFixed(0)}%}`;
          },
          rich: {
            num: { color: '#0F3460', fontWeight: 600, fontSize: 12.5, padding: [0, 6, 0, 0] },
            trend: { color: '#64748b', fontSize: 11, fontWeight: 500 }
          }
        }
      }]
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}
