'use client';

import { MapPin, Plus, ExternalLink } from 'lucide-react';
import type { FloorPlanRef } from '@/lib/mock/projects';

export function FloorPlansTab({
  floorPlans, projectId, leadId,
}: {
  floorPlans: FloorPlanRef[];
  projectId: string;
  leadId?: string;
}) {
  const openSpaceWorkflow = (floorplanId?: string) => {
    const params = new URLSearchParams({ entry: 'pro', demo_as: 'pro', workflow: 'space' });
    if (projectId) params.set('project', projectId);
    if (leadId) params.set('lead', leadId);
    if (floorplanId) params.set('floorplan', floorplanId);
    window.open(`/build?${params.toString()}`, '_blank');
  };

  const handleCreateNew = () => {
    openSpaceWorkflow();
  };

  const handleOpenPlan = (fpId: string) => {
    openSpaceWorkflow(fpId);
  };

  if (floorPlans.length === 0) {
    return (
      <div className="card p-10 text-center border-dashed">
        <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
          <MapPin size={20} className="text-accent-glow" />
        </div>
        <p className="text-sm text-text-muted mb-1">暂无户型图</p>
        <p className="text-2xs text-text-muted mb-3">进入 Design Platform · Space 创建空间模型</p>
        <button
          onClick={handleCreateNew}
          className="px-3 py-1.5 rounded-md text-2xs bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5"
        >
          <Plus size={10} /> 新建 Space Model
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xs text-text-muted">{floorPlans.length} 个户型图</span>
        <button
          onClick={handleCreateNew}
          className="px-2.5 py-1 rounded text-[10px] border border-accent/30 bg-accent/5 text-accent-glow hover:bg-accent/10 transition inline-flex items-center gap-1"
        >
          <Plus size={10} /> 新建 Space
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {floorPlans.map((fp) => (
          <button
            key={fp.id}
            onClick={() => handleOpenPlan(fp.id)}
            className="card p-3 text-left hover:border-accent/30 transition group"
          >
            <div className="h-20 rounded-lg mb-2 relative" style={{
              background: fp.status === 'finalized'
                ? 'linear-gradient(135deg, #10b98120, #06b6d420)'
                : 'linear-gradient(135deg, #a855f720, #6366f120)'
            }}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl opacity-40">🏠</span>
              </div>
              <ExternalLink size={10} className="absolute top-2 right-2 text-text-subtle opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-xs font-medium text-text truncate">{fp.name}</div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
              <span>{fp.rooms} 房间</span>
              <span>·</span>
              <span>{fp.devices} 设备</span>
              <span
                className="ml-auto px-1 py-0.5 rounded text-[8px]"
                style={{
                  background: fp.status === 'finalized' ? '#10b98115' : '#f59e0b15',
                  color: fp.status === 'finalized' ? '#10b981' : '#f59e0b',
                }}
              >
                {fp.status === 'finalized' ? '已定稿' : '草稿'}
              </span>
            </div>
            <div className="text-[9px] text-text-subtle mt-1">更新于 {fp.updatedAt}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
