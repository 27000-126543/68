import ReactECharts from 'echarts-for-react';
import type { ProvinceData } from '../../types';
import { useMemo } from 'react';

interface HeatMapProps {
  data: ProvinceData[];
  onProvinceClick?: (province: string) => void;
}

export function HeatMap({ data, onProvinceClick }: HeatMapProps) {
  const option = useMemo(() => {
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 52, 96, 0.92)',
        borderColor: 'transparent',
        borderWidth: 0,
        textStyle: { color: '#fff', fontSize: 13, fontFamily: 'PingFang SC' },
        padding: [10, 14],
        formatter: (params: { name: string; value?: number }) => {
          const item = data.find(d => d.name === params.name);
          if (!item) return params.name;
          const topCity = [...item.cities].sort((a, b) => b.value - a.value)[0];
          return `<div style="font-weight:600;margin-bottom:6px">${params.name}</div>
            <div style="opacity:.85">投递量：<b style="color:#8ba8ff">${item.value.toLocaleString()}</b></div>
            ${topCity ? `<div style="opacity:.85;margin-top:4px">TOP城市：<b>${topCity.name}</b> (${topCity.value.toLocaleString()})</div>` : ''}`;
        }
      },
      visualMap: {
        left: 20,
        bottom: 20,
        min: 0,
        max: max,
        text: ['高', '低'],
        calculable: true,
        itemHeight: 140,
        itemWidth: 10,
        textStyle: { color: '#475569', fontSize: 12 },
        inRange: {
          color: ['#dbe6ff', '#8ba8ff', '#5a7eff', '#165DFF', '#0b3aab']
        }
      },
      series: [
        {
          type: 'map',
          map: 'china',
          roam: false,
          zoom: 1.18,
          center: [104.5, 36],
          label: {
            show: false
          },
          emphasis: {
            label: { show: true, color: '#0F3460', fontWeight: 600, fontSize: 12 },
            itemStyle: {
              areaColor: '#fff8e6',
              borderColor: '#FAAD14',
              borderWidth: 2,
              shadowColor: 'rgba(22,93,255,0.35)',
              shadowBlur: 16
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            areaColor: '#eef2ff'
          },
          data: data.map(d => ({ name: d.name, value: d.value }))
        }
      ]
    };
  }, [data]);

  const handleClick = (params: { name: string }) => {
    onProvinceClick?.(params.name);
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', minHeight: 520, width: '100%' }}
      onEvents={{ click: handleClick }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
