import ReactECharts from 'echarts-for-react';
import type { DistributionData } from '../../types';
import { useMemo } from 'react';

interface PieDistributionProps {
  data: DistributionData[];
  title?: string;
  height?: number;
  type?: 'pie' | 'bar';
}

const PIE_COLORS = ['#165DFF', '#0F3460', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1', '#13C2C2', '#EB2F96'];

export function PieDistribution({ data, title, height = 280, type = 'pie' }: PieDistributionProps) {
  const option = useMemo(() => {
    if (type === 'bar') {
      return {
        grid: { left: 80, right: 30, top: 20, bottom: 24 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(15, 52, 96, 0.92)',
          borderColor: 'transparent',
          textStyle: { color: '#fff' },
          padding: [10, 14],
          formatter: (p: { name: string; value: number }[]) => `${p[0].name}<br/>占比：<b>${p[0].value}%</b>`
        },
        xAxis: {
          type: 'value',
          max: 100,
          splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
          axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' }
        },
        yAxis: {
          type: 'category',
          data: [...data].reverse().map(d => d.name),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#475569', fontSize: 12, fontFamily: 'PingFang SC' }
        },
        series: [{
          type: 'bar',
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 7, 7, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#8ba8ff' },
                { offset: 1, color: '#165DFF' }
              ]
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#0F3460',
            fontWeight: 600,
            fontSize: 12,
            formatter: '{c}%'
          },
          data: [...data].reverse().map(d => d.value)
        }]
      };
    }
    return {
      title: title ? { text: title, left: 'center', top: 0, textStyle: { fontSize: 14, color: '#0F3460', fontWeight: 600, fontFamily: 'Noto Serif SC' } } : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 52, 96, 0.92)',
        borderColor: 'transparent',
        textStyle: { color: '#fff', fontFamily: 'PingFang SC', fontSize: 13 },
        padding: [10, 14],
        formatter: (p: { name: string; value: number; percent: number }) => `${p.name}<br/>人数占比：<b>${p.percent}%</b>`
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        icon: 'circle',
        itemGap: 10,
        textStyle: { color: '#475569', fontSize: 12, fontFamily: 'PingFang SC' }
      },
      series: [{
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: { show: true, formatter: '{b}\n{d}%', color: '#0F3460', fontWeight: 600, fontSize: 12 }
        },
        data: data.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] } }))
      }]
    };
  }, [data, title, type]);

  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'canvas' }} />;
}
