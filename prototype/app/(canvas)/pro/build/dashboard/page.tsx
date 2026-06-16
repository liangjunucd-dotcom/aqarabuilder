'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Home,
  LayoutDashboard,
  Lock,
  PackageCheck,
  QrCode,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Users,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PersonaId = 'owner' | 'child' | 'elder' | 'guest';
type DeliveryMode = 'qr' | 'push' | 'private';
type WidgetId = 'security' | 'energy' | 'scene' | 'care';

const HOME_SNAPSHOT = {
  home: '吴先生别墅',
  studio: 'aq-wu-villa',
  devices: 96,
  scenes: 18,
  members: 4,
  sync: '刚刚',
};

const PERSONAS: Array<{
  id: PersonaId;
  name: string;
  role: string;
  accent: string;
  widgets: WidgetId[];
  permissions: string[];
}> = [
  { id: 'owner', name: '家主人', role: 'Admin', accent: '#2563eb', widgets: ['security', 'energy', 'scene', 'care'], permissions: ['全屋设备', '成员管理', '安防布撤防', '账单订阅'] },
  { id: 'child', name: '儿童版', role: 'Child', accent: '#8b5cf6', widgets: ['scene', 'care'], permissions: ['儿童房照明', '学习场景', '睡前模式'] },
  { id: 'elder', name: '老人版', role: 'Elder', accent: '#0f766e', widgets: ['care', 'scene', 'security'], permissions: ['紧急呼叫', '夜间路径', '常用场景'] },
  { id: 'guest', name: '访客版', role: 'Guest', accent: '#ea580c', widgets: ['scene', 'security'], permissions: ['临时门锁', '客厅厨房', '到期撤销'] },
];

const WIDGETS: Record<WidgetId, { title: string; value: string; sub: string }> = {
  security: { title: '安防', value: 'Armed', sub: '门窗已关闭' },
  energy: { title: '能耗', value: '7.2 kWh', sub: '今日' },
  scene: { title: '常用场景', value: '4', sub: '一键触发' },
  care: { title: '照护', value: 'Ready', sub: '提醒在线' },
};

const DELIVERY_OPTIONS: Array<{ id: DeliveryMode; label: string }> = [
  { id: 'qr', label: '二维码领取' },
  { id: 'push', label: '推送到账户' },
  { id: 'private', label: '保存私有包' },
];

export default function DashboardStudio() {
  const router = useRouter();
  const [personaId, setPersonaId] = useState<PersonaId>('child');
  const [selectedWidget, setSelectedWidget] = useState<WidgetId>('scene');
  const [delivery, setDelivery] = useState<DeliveryMode>('qr');
  const [enabledPermissions, setEnabledPermissions] = useState<string[]>(PERSONAS[1].permissions);
  const [status, setStatus] = useState('画布已准备');

  const persona = useMemo(() => PERSONAS.find(item => item.id === personaId) ?? PERSONAS[0], [personaId]);

  const selectPersona = (id: PersonaId) => {
    const next = PERSONAS.find(item => item.id === id) ?? PERSONAS[0];
    setPersonaId(id);
    setSelectedWidget(next.widgets[0]);
    setEnabledPermissions(next.permissions);
    setStatus(`已切换 ${next.name}`);
  };

  const togglePermission = (permission: string) => {
    setEnabledPermissions(prev => (
      prev.includes(permission) ? prev.filter(item => item !== permission) : [...prev, permission]
    ));
    setStatus('权限已更新');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f6f8fb] text-slate-950">
      <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <button onClick={() => router.back()} className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-950" aria-label="Back">
          <ArrowLeft size={15} />
        </button>
        <LayoutDashboard size={17} className="text-blue-600" />
        <div>
          <div className="text-sm font-semibold">Life Dashboard</div>
          <div className="text-[11px] text-slate-500">{HOME_SNAPSHOT.home} · {HOME_SNAPSHOT.studio}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setStatus('已重新生成预览')} className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 sm:inline-flex">
            <RefreshCcw size={12} /> 重新生成
          </button>
          <button onClick={() => setStatus('草稿已保存')} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950">
            <Save size={12} /> 保存
          </button>
          <button onClick={() => setStatus('Dashboard 包已生成')} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200">
            <PackageCheck size={12} /> 生成包
          </button>
        </div>
      </header>

      <main className="grid h-[calc(100vh-56px)] grid-cols-[260px_minmax(520px,1fr)_320px]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Persona</div>
          <div className="mt-3 grid gap-2">
            {PERSONAS.map(item => (
              <button
                key={item.id}
                onClick={() => selectPersona(item.id)}
                className={cn('rounded-2xl border p-3 text-left transition', personaId === item.id ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-50')}
              >
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="mt-1 text-[11px] text-slate-500">{item.role}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Home size={14} className="text-blue-600" />
              Home Data
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Mini label="Devices" value={HOME_SNAPSHOT.devices.toString()} />
              <Mini label="Scenes" value={HOME_SNAPSHOT.scenes.toString()} />
              <Mini label="Members" value={HOME_SNAPSHOT.members.toString()} />
              <Mini label="Sync" value={HOME_SNAPSHOT.sync} />
            </div>
          </div>
        </aside>

        <section className="relative overflow-auto p-6">
          <div className="absolute inset-0 bg-[linear-gradient(#dbe7f3_1px,transparent_1px),linear-gradient(90deg,#dbe7f3_1px,transparent_1px)] bg-[size:32px_32px] opacity-45" />
          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white/92 px-5 py-4 shadow-sm">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Canvas</div>
                <h1 className="mt-1 text-2xl font-semibold">{persona.name} Dashboard</h1>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{status}</div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                    <Smartphone size={13} /> Aqara Life Preview
                  </div>
                  <button onClick={() => setStatus('已应用微调')} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950">
                    <Wand2 size={12} /> 微调
                  </button>
                </div>

                <div className="mx-auto w-[310px] rounded-[2.3rem] border border-slate-200 bg-slate-950 p-3 shadow-xl">
                  <div className="min-h-[610px] rounded-[1.8rem] px-5 pb-5 pt-12" style={{ background: `linear-gradient(160deg, ${persona.accent}2a, #ffffff 34%, #f8fbff)` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">9:41 · {HOME_SNAPSHOT.home}</div>
                        <div className="mt-2 text-xl font-semibold">{persona.name} 你好</div>
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: persona.accent }}>
                        <User size={18} />
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      {['回家', '睡眠', '离家'].map(item => (
                        <button key={item} onClick={() => setStatus(`已选择场景：${item}`)} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                          {item}
                        </button>
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {persona.widgets.map(widgetId => {
                        const widget = WIDGETS[widgetId];
                        const active = selectedWidget === widgetId;
                        return (
                          <button
                            key={widgetId}
                            onClick={() => { setSelectedWidget(widgetId); setStatus(`正在编辑 ${widget.title}`); }}
                            className={cn('min-h-[112px] rounded-3xl border bg-white p-4 text-left shadow-sm transition', active ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200')}
                          >
                            <div className="text-xs text-slate-500">{widget.title}</div>
                            <div className="mt-4 text-lg font-semibold">{widget.value}</div>
                            <div className="mt-1 text-xs text-slate-500">{widget.sub}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck size={16} style={{ color: persona.accent }} />
                        权限
                      </div>
                      <div className="mt-3 space-y-2">
                        {enabledPermissions.slice(0, 3).map(item => (
                          <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                            <Check size={12} className="text-emerald-500" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {persona.widgets.map(widgetId => {
                  const widget = WIDGETS[widgetId];
                  return (
                    <button
                      key={widgetId}
                      onClick={() => setSelectedWidget(widgetId)}
                      className={cn('w-full rounded-2xl border p-4 text-left transition', selectedWidget === widgetId ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50')}
                    >
                      <div className="text-sm font-semibold">{widget.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{widget.value} · {widget.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-200 bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inspector</div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">{WIDGETS[selectedWidget].title}</div>
            <div className="mt-1 text-xs text-slate-500">{WIDGETS[selectedWidget].sub}</div>
          </div>

          <div className="mt-4 text-xs font-semibold text-slate-500">权限</div>
          <div className="mt-2 space-y-2">
            {persona.permissions.map(permission => {
              const active = enabledPermissions.includes(permission);
              return (
                <button
                  key={permission}
                  onClick={() => togglePermission(permission)}
                  className={cn('flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition', active ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-500')}
                >
                  <Lock size={12} />
                  {permission}
                </button>
              );
            })}
          </div>

          <div className="mt-5 text-xs font-semibold text-slate-500">分发</div>
          <div className="mt-2 grid gap-2">
            {DELIVERY_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => { setDelivery(option.id); setStatus(`已选择${option.label}`); }}
                className={cn('rounded-xl border px-3 py-2 text-left text-sm transition', delivery === option.id ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Link href={delivery === 'qr' ? '/life/plugins/scan' : '/pro/build/marketplace'} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-semibold text-white">
            {delivery === 'qr' ? <QrCode size={14} /> : <Send size={14} />}
            {delivery === 'qr' ? '生成领取二维码' : '创建分发任务'}
          </Link>
        </aside>
      </main>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="mt-1 text-xs font-semibold">{value}</div>
    </div>
  );
}
