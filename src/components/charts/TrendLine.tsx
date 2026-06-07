import ReactECharts from 'echarts-for-react';
import type { TrendPoint } from '../../types';
import { useMemo } from 'react';

interface TrendLineProps {
  data: TrendPoint[];
  industries: string[];
  height?: number;
}

const COLORS = ['#165DFF', '#0F3460', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1', '#13C2C2', '#EB2F96'];

export function TrendLine({ data, industries, height = 340 }: TrendLineProps) {
  const option = useMemo(() => {
    const dates = data.map(d => d.date.slice(5));
    const series = industries.filter(i => data.some(d => typeof d[i] === 'number')).map((ind, idx) => ({
      name: ind,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3, color: COLORS[idx % COLORS.length] },
      itemStyle: { color: COLORS[idx % COLORS.length], borderWidth: 2, borderColor: '#fff' },
      areaStyle: idx === 0 ? {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${COLORS[idx % COLORS.length]}33` },
            { offset: 1, color: `${COLORS[idx % COLORS.length]}05` }
          ]
        }
      } : undefined,
      data: data.map(d => d[ind] as number)
    }));

    return {
      grid: { left: 50, right: 24, top: 40, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 52, 96, 0.92)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontFamily: 'PingFang SC', fontSize: 13 },
        padding: [10, 14]
      },
      legend: {
        top: 0,
        right: 0,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 18,
        textStyle: { color: '#475569', fontSize: 12, fontFamily: 'PingFang SC' }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 12, fontFamily: 'PingFang SC' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 12, fontFamily: 'PingFang SC' }
      },
      series
    };
  }, [data, industries]);

  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}
