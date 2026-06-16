'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Smartphone, MapPin, Layers, Cpu, Users,
  ShieldCheck, Brain, Eye, EyeOff, Globe2, Heart,
  GitFork, Clock, Zap, Settings2, ChevronRight,
  LayoutGrid, Wifi, WifiOff, Activity, Home, Wrench,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { getSpaceProfile, PRIVACY_LABELS, type SpacePrivacy, type SpaceProfile } from '@/lib/mock/space-profile';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { cn } from '@/lib/utils';

export default function SpaceProfilePage() {
  const params = useParams<{ id?: string }>();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] ?? '' : rawId ?? '';
  const space = id ? getSpaceProfile(id) : null;

  if (!space) {
    return (
      <>
        <UserTopBar title="Space 未找到" />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Space 未找到</h2>
          <p className="text-text-muted mb-6">ID: {id}</p>
          <Link href="/home/studios" className="text-accent-glow hover:underline">← 返回 Spaces 列表</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <UserTopBar title={space.name} />
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/home/studios" className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text transition mt-1">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{space.name}</h1>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  space.privacy.publicShowcase
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-text-subtle/10 text-text-muted border-border'
                )}>
                  {space.privacy.publicShowcase ? '公开' : '私有'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1"><Home size={13} /> {buildingLabel(space.buildingType)}</span>
                <span>{space.area}m²</span>
                <span>{space.rooms} 房间</span>
                <span className="flex items-center gap-1"><Cpu size={13} /> {space.devices} 设备</span>
                <span className="flex items-center gap-1"><Users size={13} /> {space.personas} Persona</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/5 transition">
              <Heart size={14} /> {space.likeCount}
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/5 transition">
              <GitFork size={14} /> {space.remixCount}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-8">
          {/* Main column */}
          <div className="space-y-8">
            {/* Studio connection */}
            <section className="card p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Smartphone size={15} className="text-accent-glow" /> Studio 连接
              </h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-border">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Cpu size={22} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{space.studioName}</div>
                  <div className="text-xs text-text-muted mt-0.5">ID: {space.studioId}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                  <Wifi size={11} /> 在线
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                <Activity size={12} />
                <span>最后活跃: {space.lastActive}</span>
                <span className="text-text-subtle">·</span>
                <span>创建于 {space.createdAt}</span>
              </div>
            </section>

            {/* Scenes */}
            <section className="card p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <LayoutGrid size={15} className="text-accent-glow" /> 场景 ({space.scenes?.length ?? 0})
              </h2>
              {space.scenes && space.scenes.length > 0 ? (
                <div className="space-y-2">
                  {space.scenes.map(scene => (
                    <div key={scene.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition border border-transparent hover:border-border">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-lg flex-shrink-0">
                        {scene.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{scene.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{scene.triggerDescription}</div>
                      </div>
                      <div className="text-2xs text-text-subtle">{scene.deviceIds.length} 设备</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted py-4 text-center">暂无场景</p>
              )}
            </section>

            {/* Automations */}
            <section className="card p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Zap size={15} className="text-accent-glow" /> 自动化 ({space.automations?.length ?? 0})
              </h2>
              {space.automations && space.automations.length > 0 ? (
                <div className="space-y-2">
                  {space.automations.map(auto => (
                    <div key={auto.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition border border-transparent hover:border-border">
                      <div className={cn(
                        'w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0',
                        auto.active ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-text-subtle/5 border-border'
                      )}>
                        <Settings2 size={16} className={auto.active ? 'text-emerald-400' : 'text-text-muted'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {auto.name}
                          <span className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded-full',
                            auto.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-text-subtle/10 text-text-muted'
                          )}>
                            {auto.active ? '运行中' : '已暂停'}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">{auto.description}</div>
                      </div>
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-white/5 border border-border text-text-muted">{typeLabel(auto.type)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted py-4 text-center">暂无自动化规则</p>
              )}
            </section>

            {/* Floor Plans */}
            {space.floorPlans && space.floorPlans.length > 0 && (
              <section className="card p-5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                  <MapPin size={15} className="text-accent-glow" /> 户型图 ({space.floorPlans.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {space.floorPlans.map(fp => (
                    <div key={fp.id} className="p-3 rounded-lg border border-border hover:border-accent/30 transition bg-white/[0.02]">
                      <div className="h-24 rounded-md bg-gradient-to-br from-accent/5 to-accent2/5 mb-2 flex items-center justify-center">
                        <FloorplanSVG pattern={fp.thumbnailPattern} />
                      </div>
                      <div className="text-xs font-medium">{fp.name}</div>
                      <div className="text-2xs text-text-muted mt-0.5">{fp.rooms} 房间 · {fp.devices} 设备 · {fp.status === 'finalized' ? '已定稿' : '草稿'}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Linked project */}
            {space.linkedProjectId && (
              <section className="card p-5">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Layers size={15} className="text-accent-glow" /> 关联项目
                </h2>
                <Link
                  href={`/pro/projects/${space.linkedProjectId}/overview`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition border border-border hover:border-accent/30"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-sm">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">查看项目详情</div>
                    <div className="text-xs text-text-muted">在 Builder Pro 中管理项目阶段与交付</div>
                  </div>
                  <ChevronRight size={14} className="text-text-subtle" />
                </Link>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Owner card */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {space.ownerId === space.builderId ? '我的家' : '空间归属'}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-sm font-semibold text-white">
                  {space.ownerName[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{space.ownerName}</div>
                  <div className="text-2xs text-text-muted">
                    {space.ownerId === space.builderId ? '业主 & Builder' : '业主'}
                  </div>
                </div>
              </div>
              {space.ownerId !== space.builderId && (
                <div className="border-t border-border pt-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-semibold text-sky-400">
                    <Wrench size={12} />
                  </div>
                  <div>
                    <div className="text-xs font-medium">{space.builderName}</div>
                    <div className="text-2xs text-text-muted">服务商 · Builder</div>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy controls */}
            <PrivacyPanel privacy={space.privacy} spaceId={space.id} />

            {/* Quick stats */}
            <div className="card p-4 space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">空间信息</h3>
              <StatRow icon={Home} label="类型" value={buildingLabel(space.buildingType)} />
              <StatRow icon={MapPin} label="面积" value={`${space.area}m²`} />
              <StatRow icon={Layers} label="房间" value={`${space.rooms}`} />
              <StatRow icon={Cpu} label="设备" value={`${space.devices}`} />
              <StatRow icon={Users} label="Persona" value={`${space.personas}`} />
              <StatRow icon={Clock} label="创建" value={space.createdAt} />
              <StatRow icon={Activity} label="更新" value={space.updatedAt} />
            </div>

            {/* Remix source */}
            {space.remixSourceId && (
              <div className="card p-4">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Remix 来源</h3>
                <Link href={`/home/studios/${space.remixSourceId}`} className="text-sm text-accent-glow hover:underline">
                  查看源 Space →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PrivacyPanel({ privacy, spaceId }: { privacy: SpacePrivacy; spaceId: string }) {
  const [toggles, setToggles] = useState(privacy);

  const handleToggle = (key: keyof SpacePrivacy) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="card p-4">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-amber-400" /> 隐私控制
      </h3>
      <div className="space-y-3">
        {(Object.keys(PRIVACY_LABELS) as (keyof SpacePrivacy)[]).map(key => {
          const meta = PRIVACY_LABELS[key];
          const enabled = toggles[key];
          return (
            <button
              key={key}
              onClick={() => handleToggle(key)}
              className="w-full text-left flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition"
            >
              <div className={cn(
                'w-8 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 relative',
                enabled ? 'bg-accent' : 'bg-text-subtle/30'
              )}>
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
                  enabled ? 'left-[14px]' : 'left-[2px]'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium flex items-center gap-1.5">
                  {meta.label}
                  {enabled ? <Eye size={10} className="text-accent-glow" /> : <EyeOff size={10} className="text-text-muted" />}
                </div>
                <div className="text-2xs text-text-muted mt-0.5 leading-snug">{meta.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-muted flex items-center gap-1.5"><Icon size={11} /> {label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  );
}

function buildingLabel(type: string): string {
  const map: Record<string, string> = {
    apartment: '平层公寓', villa: '别墅', office: '办公空间', store: '商业店铺',
  };
  return map[type] ?? type;
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    schedule: '定时', sensor: '传感器', manual: '手动', ai: 'AI',
  };
  return map[type] ?? type;
}
