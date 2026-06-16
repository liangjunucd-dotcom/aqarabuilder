'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Cable,
  Check,
  ChevronRight,
  Code2,
  FileText,
  GitBranch,
  Play,
  Rocket,
  Save,
  Server,
  Sparkles,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProtocolType = 'MQTT' | 'HTTP' | 'TCP' | 'UDP';
type StageId = 'doc' | 'schema' | 'script' | 'test' | 'deploy';
type PreviewTab = 'schema' | 'script' | 'log';

const PROTOCOLS: Array<{ id: ProtocolType; label: string; note: string }> = [
  { id: 'MQTT', label: 'MQTT', note: 'Topic / Payload' },
  { id: 'HTTP', label: 'HTTP', note: 'REST / Webhook' },
  { id: 'TCP', label: 'TCP', note: 'Socket / Frame' },
  { id: 'UDP', label: 'UDP', note: 'Discovery / Broadcast' },
];

const STAGES: Array<{ id: StageId; label: string; icon: typeof FileText }> = [
  { id: 'doc', label: '文档', icon: FileText },
  { id: 'schema', label: '能力模型', icon: GitBranch },
  { id: 'script', label: '脚本', icon: Code2 },
  { id: 'test', label: '测试', icon: Play },
  { id: 'deploy', label: '部署', icon: Rocket },
];

const PROJECT_STUDIOS = [
  { id: 'aq-wu-villa', project: '吴先生别墅 · 庭院二期', space: '吴先生别墅', studio: 'aq-wu-villa', devices: 96 },
  { id: 'aq-zhao-rental-1', project: '出租公寓 · 房东省心包', space: '赵房东 · 101', studio: 'aq-zhao-rental-1', devices: 12 },
  { id: 'aq-zhao-rental-2', project: '出租公寓 · 房东省心包', space: '赵房东 · 102', studio: 'aq-zhao-rental-2', devices: 12 },
];

const PREVIEW: Record<PreviewTab, string> = {
  schema: `{
  "driverId": "mqtt.th-pro-x1.v1",
  "protocol": "MQTT",
  "model": "TH-Pro-X1",
  "properties": ["temperature", "humidity", "battery"],
  "commands": ["setReportInterval"],
  "confidence": 0.91
}`,
  script: `export default defineDriver({
  id: 'mqtt.th-pro-x1.v1',
  subscribe: ['aqara/pro-x1/{deviceId}/state'],
  parse(message) {
    const p = JSON.parse(message.payload);
    return { temperature: p.temp, humidity: p.rh, battery: p.battery };
  }
});`,
  log: `00:01  文档解析完成
00:02  生成 9 个字段
00:04  JS 编译通过
00:06  回放 36 条 payload：35 通过 / 1 待确认`,
};

export default function DriverStudio() {
  const router = useRouter();
  const [protocol, setProtocol] = useState<ProtocolType>('MQTT');
  const [stage, setStage] = useState<StageId>('doc');
  const [tab, setTab] = useState<PreviewTab>('schema');
  const [selectedStudio, setSelectedStudio] = useState(PROJECT_STUDIOS[0].id);
  const [completed, setCompleted] = useState<StageId[]>(['doc']);
  const [message, setMessage] = useState('已载入示例协议文档');

  const currentIndex = STAGES.findIndex(item => item.id === stage);
  const studio = useMemo(
    () => PROJECT_STUDIOS.find(item => item.id === selectedStudio) ?? PROJECT_STUDIOS[0],
    [selectedStudio],
  );

  const runStage = (id = stage) => {
    setCompleted(prev => (prev.includes(id) ? prev : [...prev, id]));
    if (id === 'schema') setTab('schema');
    if (id === 'script') setTab('script');
    if (id === 'test' || id === 'deploy') setTab('log');
    setMessage(`${STAGES.find(item => item.id === id)?.label} 已完成`);
  };

  const nextStage = () => {
    const next = STAGES[Math.min(currentIndex + 1, STAGES.length - 1)];
    setStage(next.id);
    runStage(next.id);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f8fc] text-slate-950">
      <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <button onClick={() => router.back()} className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-950" aria-label="Back">
          <ArrowLeft size={15} />
        </button>
        <Cable size={17} className="text-blue-600" />
        <div>
          <div className="text-sm font-semibold">Protocol Driver</div>
          <div className="text-[11px] text-slate-500">{protocol} · {studio.studio}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setMessage('草稿已保存'); runStage(stage); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950">
            <Save size={12} /> 保存
          </button>
          <button onClick={() => { setStage('deploy'); runStage('deploy'); }} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200">
            <Rocket size={12} /> 部署
          </button>
        </div>
      </header>

      <main className="grid h-[calc(100vh-56px)] grid-cols-[260px_minmax(520px,1fr)_320px]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Protocol</div>
          <div className="mt-3 grid gap-2">
            {PROTOCOLS.map(item => (
              <button
                key={item.id}
                onClick={() => { setProtocol(item.id); setMessage(`已切换到 ${item.id}`); }}
                className={cn('rounded-2xl border p-3 text-left transition', protocol === item.id ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-50')}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-1 text-[11px] text-slate-500">{item.note}</div>
              </button>
            ))}
          </div>

          <button onClick={() => { setStage('doc'); runStage('doc'); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-3 py-4 text-sm font-semibold text-blue-700">
            <Upload size={15} /> 上传协议文档
          </button>

          <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Studio</div>
          <div className="mt-3 space-y-2">
            {PROJECT_STUDIOS.map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedStudio(item.id); setMessage(`已选择 ${item.studio}`); }}
                className={cn('w-full rounded-2xl border p-3 text-left transition', selectedStudio === item.id ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white hover:bg-slate-50')}
              >
                <div className="text-xs font-semibold">{item.space}</div>
                <div className="mt-1 text-[11px] text-slate-500">{item.studio} · {item.devices} 设备</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="relative overflow-auto p-6">
          <div className="absolute inset-0 bg-[linear-gradient(#dbe7f3_1px,transparent_1px),linear-gradient(90deg,#dbe7f3_1px,transparent_1px)] bg-[size:32px_32px] opacity-45" />
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-[2rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Canvas</div>
                  <h1 className="mt-1 text-2xl font-semibold">TH-Pro-X1 Driver</h1>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{message}</div>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-3">
                {STAGES.map((item, index) => {
                  const active = stage === item.id;
                  const done = completed.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setStage(item.id); setMessage(`查看 ${item.label}`); }}
                      className={cn('min-h-28 rounded-2xl border p-4 text-left transition', active ? 'border-blue-400 bg-blue-50 shadow-sm' : done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50')}
                    >
                      <div className="flex items-center justify-between">
                        <item.icon size={17} className={active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'} />
                        {done && <Check size={14} className="text-emerald-600" />}
                      </div>
                      <div className="mt-4 text-sm font-semibold">{item.label}</div>
                      <div className="mt-1 text-[11px] text-slate-500">Step {index + 1}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm text-slate-600">当前阶段：<span className="font-semibold text-slate-950">{STAGES[currentIndex].label}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => runStage()} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950">
                    运行当前阶段
                  </button>
                  <button onClick={nextStage} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                    下一步 <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {(['schema', 'script', 'log'] as PreviewTab[]).map(item => (
                    <button
                      key={item}
                      onClick={() => setTab(item)}
                      className={cn('rounded-lg px-3 py-1.5 text-xs font-medium capitalize', tab === item ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500')}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500">Confidence 91%</span>
              </div>
              <pre className="h-[330px] overflow-auto p-5 text-xs leading-relaxed text-slate-700">{PREVIEW[tab]}</pre>
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-200 bg-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inspector</div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">{studio.project}</div>
            <div className="mt-2 text-xs text-slate-500">{studio.space} · {studio.studio}</div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              ['协议', protocol],
              ['字段', '9'],
              ['命令', '1'],
              ['测试', completed.includes('test') ? '通过' : '待运行'],
              ['部署', completed.includes('deploy') ? '已准备' : '未部署'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
          <Link href="/pro/build/marketplace" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-950">
            <Server size={14} /> 保存为私有资产
          </Link>
        </aside>
      </main>
    </div>
  );
}
