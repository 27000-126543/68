import ReactECharts from 'echarts-for-react';
import type { GapForecast } from '../../types';
import { useMemo } from 'react';

interface ForecastAreaProps {
  data: GapForecast[];
  height?: number;
}

export function ForecastArea({ data, height = 340 }: ForecastAreaProps) {
  const option = useMemo(() => {
    const positions = Array.from(new Set(data.map(d => d.position)));
    const months = Array.from(new Set(data.map(d => d.month)));

    return {
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
        itemWidth: 12,
        itemHeight: 10,
        textStyle: { color: '#475569', fontSize: 12, fontFamily: 'PingFang SC' },
        data: ['招聘需求', '预计供给', '人才缺口']
      },
      grid: { left: 50, right: 24, top: 40, bottom: 36 },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 12, fontFamily: 'PingFang SC' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 12, fontFamily: 'PingFang SC' },
        name: '人数',
        nameTextStyle: { color: '#94a3b8', fontSize: 12 }
      },
      series: [
        {
          name: '招聘需求',
          type: 'line',
          smooth: true,
          stack: false,
          lineStyle: { width: 3, color: '#0F3460' },
          itemStyle: { color: '#0F3460', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(15,52,96,0.28)' }, { offset: 1, color: 'rgba(15,52,96,0.02)' }]
            }
          },
          data: months.map(m => data.filter(d => d.month === m).reduce((s, d) => s + d.headcount, 0))
        },
        {
          name: '预计供给',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3, color: '#52C41A' },
          itemStyle: { color: '#52C41A', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(82,196,26,0.22)' }, { offset: 1, color: 'rgba(82,196,26,0.02)' }]
            }
          },
          data: months.map(m => data.filter(d => d.month === m).reduce((s, d) => s + d.predictedSupply, 0))
        },
        {
          name: '人才缺口',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3, color: '#FF4D4F', type: 'dashed' },
          itemStyle: { color: '#FF4D4F', borderWidth: 2, borderColor: '#fff' },
          symbol: 'diamond',
          symbolSize: 9,
          data: months.map(m => data.filter(d => d.month === m).reduce((s, d) => s + d.gap, 0))
        }
      ],
      graphic: positions.length > 0 ? [{
        type: 'text',
        left: 50,
        bottom: 8,
        style: { text: `覆盖岗位：${positions.join('、')}`, fill: '#94a3b8', fontSize: 11 }
      }] : []
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}
