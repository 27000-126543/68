import * as XLSX from 'xlsx';
import type { TargetPosition } from '../types';

export async function parseCampusPlanExcel(file: File): Promise<TargetPosition[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        const positions: TargetPosition[] = [];
        json.forEach((row, idx) => {
          const name = String(
            row['岗位名称'] || row['职位名称'] || row['岗位'] || row['position'] || row['name'] || ''
          ).trim();
          const headcount = Number(
            row['招聘人数'] || row['人数'] || row['计划人数'] || row['headcount'] || row['count'] || 0
          );
          const city = String(row['工作城市'] || row['城市'] || row['地点'] || row['city'] || '北京').trim();
          const major = String(row['专业要求'] || row['专业'] || row['major'] || '计算机相关').trim();
          const education = String(row['学历要求'] || row['学历'] || row['education'] || '本科').trim();

          if (name && headcount > 0) {
            positions.push({
              name,
              headcount,
              city,
              major,
              education
            });
          }
          void idx;
        });
        resolve(positions);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function generateSampleExcel(): Blob {
  const data = [
    { 岗位名称: 'Java开发工程师', 招聘人数: 50, 工作城市: '北京', 专业要求: '计算机相关', 学历要求: '本科' },
    { 岗位名称: '前端开发工程师', 招聘人数: 30, 工作城市: '上海', 专业要求: '计算机相关', 学历要求: '本科' },
    { 岗位名称: '算法工程师', 招聘人数: 20, 工作城市: '深圳', 专业要求: '计算机/数学', 学历要求: '硕士' },
    { 岗位名称: '产品经理', 招聘人数: 15, 工作城市: '杭州', 专业要求: '不限', 学历要求: '本科' },
    { 岗位名称: '数据分析师', 招聘人数: 25, 工作城市: '北京', 专业要求: '统计学/计算机', 学历要求: '本科' }
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '校招计划');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as unknown as Blob;
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
