import { useEffect, useRef, useState } from 'react';
import {
  Upload, Download, Plus, Edit2, Trash2, Save, X,
  GraduationCap, Target, BarChart3, Building2, AlertTriangle
} from 'lucide-react';
import type { TargetPosition, GapForecast, UniversityRecommendation } from '../types';
import {
  forecastTalentGap, getPositionGapSummary, getSeverity
} from '../utils/forecast';
import {
  parseCampusPlanExcel, generateSampleExcel, downloadFile
} from '../utils/excelParser';
import { generateUniversityRecommendations } from '../data/mockData';
import { ForecastArea } from '../components/charts/ForecastArea';

export default function CampusPlanning() {
  const [positions, setPositions] = useState<TargetPosition[]>([]);
  const [forecasts, setForecasts] = useState<GapForecast[]>([]);
  const [universities, setUniversities] = useState<UniversityRecommendation[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TargetPosition | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<TargetPosition>({
    name: '', headcount: 0, city: '北京', major: '', education: '本科'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (positions.length > 0) {
      setForecasts(forecastTalentGap(positions, 3));
      const cities = Array.from(new Set(positions.map(p => p.city)));
      setUniversities(generateUniversityRecommendations(cities));
    } else {
      setForecasts([]);
      setUniversities([]);
    }
  }, [positions]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseCampusPlanExcel(file);
      setPositions(parsed);
    } catch (err) {
      console.error('Excel解析失败:', err);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const blob = generateSampleExcel();
    downloadFile(blob, '校招计划模板.xlsx');
  };

  const handleAdd = () => {
    if (!addForm.name.trim() || addForm.headcount <= 0) return;
    setPositions([...positions, { ...addForm }]);
    setAddForm({ name: '', headcount: 0, city: '北京', major: '', education: '本科' });
    setIsAdding(false);
  };

  const handleEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditForm({ ...positions[idx] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return;
    if (!editForm.name.trim() || editForm.headcount <= 0) return;
    const updated = [...positions];
    updated[editingIndex] = editForm;
    setPositions(updated);
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleDelete = (idx: number) => {
    setPositions(positions.filter((_, i) => i !== idx));
  };

  const gapSummary = getPositionGapSummary(forecasts);
  const totalGap = forecasts.reduce((s, f) => s + f.gap, 0);
  const totalHeadcount = positions.reduce((s, p) => s + p.headcount, 0);

  const severityColor = (s: string) => {
    if (s === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const severityLabel = (s: string) => {
    if (s === 'critical') return '严重';
    if (s === 'high') return '较高';
    if (s === 'medium') return '中等';
    return '较低';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slatePlus-900 tracking-tight">校招智能规划</h1>
          <p className="text-sm text-slatePlus-500 mt-1">
            Excel批量导入岗位 · 人才缺口趋势预测 · 院校合作智能推荐
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <button onClick={handleUploadClick} className="btn-primary !py-2 text-sm">
            <Upload size={15} />上传校招计划Excel
          </button>
          <button onClick={handleDownloadTemplate} className="btn-secondary !py-2 text-sm">
            <Download size={15} />下载Excel模板
          </button>
        </div>
      </div>

      {positions.length > 0 && (
        <div className="grid grid-cols-4 gap-5">
          <div className="kpi-card bg-gradient-to-br from-navy-800 to-brand-600">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/85">目标岗位数</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{positions.length}</p>
                <p className="mt-2 text-xs text-white/70">已导入的招聘岗位</p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 backdrop-blur text-white">
                <Target size={22} />
              </div>
            </div>
          </div>
          <div className="kpi-card bg-gradient-to-br from-slate-700 to-slatePlus-800">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/85">招聘总人数</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{totalHeadcount}</p>
                <p className="mt-2 text-xs text-white/70">所有岗位累计需求</p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 backdrop-blur text-white">
                <GraduationCap size={22} />
              </div>
            </div>
          </div>
          <div className="kpi-card bg-gradient-to-br from-rose-500 to-pink-600">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/85">预计人才缺口</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{totalGap}</p>
                <p className="mt-2 text-xs text-white/70">未来3个月累计缺口</p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 backdrop-blur text-white">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>
          <div className="kpi-card bg-gradient-to-br from-emerald-600 to-teal-500">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/85">推荐院校数</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{universities.length}</p>
                <p className="mt-2 text-xs text-white/70">基于岗位城市匹配</p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 backdrop-blur text-white">
                <Building2 size={22} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 data-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">
                <Target className="inline-block mr-2" size={20} />
                目标岗位列表
              </h2>
              <p className="section-subtitle">支持手动新增、编辑和删除岗位</p>
            </div>
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="btn-primary !py-2 text-sm">
                <Plus size={15} />新增岗位
              </button>
            )}
          </div>

          {isAdding && (
            <div className="mb-4 p-4 rounded-xl bg-brand-50/60 border border-brand-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="input-field !py-2 text-sm"
                  placeholder="岗位名称"
                />
                <input
                  type="number"
                  min={0}
                  value={addForm.headcount || ''}
                  onChange={e => setAddForm({ ...addForm, headcount: Number(e.target.value) })}
                  className="input-field !py-2 text-sm"
                  placeholder="招聘人数"
                />
                <input
                  value={addForm.city}
                  onChange={e => setAddForm({ ...addForm, city: e.target.value })}
                  className="input-field !py-2 text-sm"
                  placeholder="工作城市"
                />
                <input
                  value={addForm.major}
                  onChange={e => setAddForm({ ...addForm, major: e.target.value })}
                  className="input-field !py-2 text-sm"
                  placeholder="专业要求"
                />
              </div>
              <input
                value={addForm.education}
                onChange={e => setAddForm({ ...addForm, education: e.target.value })}
                className="input-field !py-2 text-sm"
                placeholder="学历要求"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="btn-secondary !py-2 text-sm"
                >
                  <X size={14} />取消
                </button>
                <button onClick={handleAdd} className="btn-primary !py-2 text-sm">
                  <Save size={14} />确认新增
                </button>
              </div>
            </div>
          )}

          {positions.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slatePlus-400">
              <Target size={42} className="opacity-30 mb-3" />
              <p className="font-medium text-slatePlus-500">暂无岗位数据</p>
              <p className="text-sm mt-1">请上传Excel或点击新增按钮添加岗位</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-auto scrollbar-thin pr-1">
              {positions.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slatePlus-100 hover:border-brand-200 hover:bg-slatePlus-50/50 transition-all"
                >
                  {editingIndex === idx && editForm ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="input-field !py-2 text-sm"
                          placeholder="岗位名称"
                        />
                        <input
                          type="number"
                          min={0}
                          value={editForm.headcount || ''}
                          onChange={e => setEditForm({ ...editForm, headcount: Number(e.target.value) })}
                          className="input-field !py-2 text-sm"
                          placeholder="招聘人数"
                        />
                        <input
                          value={editForm.city}
                          onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                          className="input-field !py-2 text-sm"
                          placeholder="工作城市"
                        />
                        <input
                          value={editForm.major}
                          onChange={e => setEditForm({ ...editForm, major: e.target.value })}
                          className="input-field !py-2 text-sm"
                          placeholder="专业要求"
                        />
                      </div>
                      <input
                        value={editForm.education}
                        onChange={e => setEditForm({ ...editForm, education: e.target.value })}
                        className="input-field !py-2 text-sm"
                        placeholder="学历要求"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={handleCancelEdit} className="btn-secondary !py-2 text-sm">
                          <X size={14} />取消
                        </button>
                        <button onClick={handleSaveEdit} className="btn-primary !py-2 text-sm">
                          <Save size={14} />保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-semibold text-slatePlus-800">{p.name}</span>
                          <span className="tag bg-brand-50 text-brand-700 border border-brand-200">
                            {p.headcount}人
                          </span>
                          <span className="tag bg-slatePlus-50 text-slatePlus-600 border border-slatePlus-200">
                            {p.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slatePlus-500">
                          <span>专业：{p.major || '不限'}</span>
                          <span>·</span>
                          <span>学历：{p.education}</span>
                          {gapSummary[idx] && (
                            <>
                              <span>·</span>
                              <span className={`tag border ${severityColor(getSeverity(gapSummary[idx].gap, gapSummary[idx].headcount))}`}>
                                缺口 {gapSummary[idx].gap} 人 · {severityLabel(getSeverity(gapSummary[idx].gap, gapSummary[idx].headcount))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="p-2 rounded-lg hover:bg-brand-50 text-slatePlus-400 hover:text-brand-600 transition-all"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slatePlus-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-7 space-y-6">
          <div className="data-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title">
                  <BarChart3 className="inline-block mr-2" size={20} />
                  人才缺口预测趋势
                </h2>
                <p className="section-subtitle">未来3个月招聘需求 vs 预计供给 vs 人才缺口</p>
              </div>
            </div>
            {forecasts.length > 0 ? (
              <ForecastArea data={forecasts} height={320} />
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-slatePlus-400">
                <BarChart3 size={42} className="opacity-30 mb-3" />
                <p className="font-medium text-slatePlus-500">暂无预测数据</p>
                <p className="text-sm mt-1">请先导入或添加目标岗位</p>
              </div>
            )}
          </div>

          <div className="data-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title">
                  <GraduationCap className="inline-block mr-2" size={20} />
                  院校合作推荐
                </h2>
                <p className="section-subtitle">基于岗位城市、专业匹配度综合排序</p>
              </div>
            </div>
            {universities.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slatePlus-400">
                <GraduationCap size={42} className="opacity-30 mb-3" />
                <p className="font-medium text-slatePlus-500">暂无推荐院校</p>
                <p className="text-sm mt-1">请先导入或添加目标岗位</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slatePlus-500 border-b border-slatePlus-100">
                      <th className="px-3 py-3 font-medium">排名</th>
                      <th className="px-3 py-3 font-medium">院校名称</th>
                      <th className="px-3 py-3 font-medium">所在地</th>
                      <th className="px-3 py-3 font-medium">匹配专业</th>
                      <th className="px-3 py-3 font-medium text-right">匹配度</th>
                      <th className="px-3 py-3 font-medium text-right">预计毕业生</th>
                      <th className="px-3 py-3 font-medium">合作情况</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slatePlus-50">
                    {universities.map(u => (
                      <tr key={u.rank} className="hover:bg-slatePlus-50/60 transition-colors">
                        <td className="px-3 py-3.5">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                            u.rank === 1 ? 'bg-amber-100 text-amber-700' :
                            u.rank === 2 ? 'bg-slatePlus-100 text-slatePlus-600' :
                            u.rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-slatePlus-50 text-slatePlus-500'
                          }`}>
                            {u.rank}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 font-semibold text-slatePlus-800">{u.name}</td>
                        <td className="px-3 py-3.5 text-slatePlus-600">{u.province} · {u.city}</td>
                        <td className="px-3 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.majors.map((m, mi) => (
                              <span key={mi} className="tag bg-slatePlus-50 text-slatePlus-600 border border-slatePlus-100">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-2 rounded-full bg-slatePlus-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                style={{ width: `${u.matchScore}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slatePlus-800 w-10 text-right">{u.matchScore}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right font-medium text-slatePlus-700">
                          {u.expectedGraduates.toLocaleString()}人
                        </td>
                        <td className="px-3 py-3.5">
                          <span className={`tag border ${
                            u.cooperationHistory === '深度合作'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : u.cooperationHistory === '常规合作'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slatePlus-50 text-slatePlus-600 border-slatePlus-200'
                          }`}>
                            {u.cooperationHistory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
