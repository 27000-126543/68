import * as echarts from 'echarts';

const provinces = [
  { name: '北京', cp: [116.4, 39.9] },
  { name: '天津', cp: [117.2, 39.1] },
  { name: '上海', cp: [121.47, 31.23] },
  { name: '重庆', cp: [106.55, 29.56] },
  { name: '河北', cp: [114.48, 38.03] },
  { name: '山西', cp: [112.53, 37.87] },
  { name: '辽宁', cp: [123.43, 41.8] },
  { name: '吉林', cp: [125.32, 43.9] },
  { name: '黑龙江', cp: [126.63, 45.75] },
  { name: '江苏', cp: [118.78, 32.07] },
  { name: '浙江', cp: [120.15, 30.28] },
  { name: '安徽', cp: [117.27, 31.86] },
  { name: '福建', cp: [119.3, 26.08] },
  { name: '江西', cp: [115.89, 28.68] },
  { name: '山东', cp: [117, 36.65] },
  { name: '河南', cp: [113.65, 34.76] },
  { name: '湖北', cp: [114.31, 30.52] },
  { name: '湖南', cp: [112.98, 28.19] },
  { name: '广东', cp: [113.23, 23.16] },
  { name: '广西', cp: [108.37, 22.82] },
  { name: '海南', cp: [110.33, 20.03] },
  { name: '四川', cp: [104.07, 30.67] },
  { name: '贵州', cp: [106.71, 26.57] },
  { name: '云南', cp: [102.73, 25.04] },
  { name: '西藏', cp: [91.11, 29.97] },
  { name: '陕西', cp: [108.95, 34.27] },
  { name: '甘肃', cp: [103.73, 36.03] },
  { name: '青海', cp: [101.78, 36.62] },
  { name: '宁夏', cp: [106.27, 38.47] },
  { name: '新疆', cp: [87.68, 43.77] },
  { name: '内蒙古', cp: [111.65, 40.82] },
  { name: '台湾', cp: [121.5, 25.05] },
  { name: '香港', cp: [114.17, 22.28] },
  { name: '澳门', cp: [113.55, 22.19] }
];

function buildSimplifiedChinaGeoJSON() {
  const features = provinces.map((p, i) => {
    const [cx, cy] = p.cp;
    const s = i % 2 === 0 ? 3.8 : 3.0;
    const w = s + (i % 3) * 0.4;
    const h = s * 0.85 + (i % 4) * 0.3;
    const coordinates = [[
      [cx - w, cy - h],
      [cx + w, cy - h],
      [cx + w * 1.05, cy],
      [cx + w * 0.85, cy + h],
      [cx - w * 0.9, cy + h * 1.1],
      [cx - w * 1.1, cy + h * 0.2],
      [cx - w, cy - h]
    ]];
    return {
      type: 'Feature',
      properties: { name: p.name, cp: p.cp },
      geometry: { type: 'Polygon', coordinates }
    };
  });
  return { type: 'FeatureCollection', features };
}

let registered = false;
export function registerChinaMap() {
  if (registered) return;
  try {
    const geoJSON = buildSimplifiedChinaGeoJSON();
    echarts.registerMap('china', geoJSON as never);
    registered = true;
  } catch (err) {
    console.warn('China map registration failed, using fallback', err);
    registered = true;
  }
}
