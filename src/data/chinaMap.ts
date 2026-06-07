import * as echarts from 'echarts';
import chinaGeo from './chinaGeo.json';

let registered = false;
export function registerChinaMap() {
  if (registered) return;
  try {
    echarts.registerMap('china', chinaGeo as unknown as never);
    registered = true;
  } catch (err) {
    console.warn('China map registration failed', err);
    registered = true;
  }
}
