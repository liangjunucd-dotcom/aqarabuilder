import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Package, Server, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUMMARY_METRICS = [
  { icon: Server, label: '设备总数', value: '1', tail: '/0', tailTone: 'danger' as const },
  { icon: Bell, label: '需处理告警数量', value: '0', muted: true },
  { icon: Workflow, label: '自动化数量', value: '0', tail: '/0', tailTone: 'danger' as const },
];

const PROTOCOL_DATA = [{ label: 'Aqara', value: 1 }];
const DEVICE_TYPE_DATA = [{ label: '网关', value: 1 }];
const AXIS_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const CPU_SAMPLES = [
  1, 1, 2, 1, 1, 2, 1, 1, 25, 2, 2, 2, 4, 2, 3, 100, 5, 4, 3, 2,
  2, 1, 1, 1, 3, 2, 1, 1, 25, 2, 1, 1, 2, 2, 2, 2, 6, 12, 25, 4,
  3, 2, 2, 1, 1, 2, 1, 1, 2, 1, 1, 25, 2, 1, 1, 1, 18, 22, 2, 2,
  2, 2, 27, 3, 2, 2,
];
const CPU_LABELS = [
  '13:50:21',
  '13:52:20',
  '13:53:41',
  '13:54:52',
  '13:56:29',
  '13:58:24',
  '13:59:57',
  '14:01:43',
  '14:02:44',
  '14:04:09',
  '14:05:12',
  '14:06:32',
  '14:08:47',
  '14:10:47',
  '14:12:08',
  '14:13:48',
  '14:15:18',
];

export default function StudioOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-[1720px] p-4 sm:p-6 xl:px-8 xl:py-7">
      <h1 className="mb-5 text-[22px] font-semibold tracking-[-0.03em] text-[#16181f]">概览</h1>

      <section className="overflow-hidden rounded-[22px] border border-[#e8edf5] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <div className="grid divide-y divide-[#e2e7f0] md:grid-cols-3 md:divide-x md:divide-y-0">
          {SUMMARY_METRICS.map(metric => (
            <MetricItem key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CardShell title="各协议的设备数统计">
          <ProtocolBarChart />
        </CardShell>

        <CardShell title="自动化类型占比">
          <AutomationEmptyState />
        </CardShell>

        <CardShell title="设备类型统计占比">
          <DeviceTypeChart />
        </CardShell>

        <CardShell title="CPU负载">
          <CpuLoadChart />
        </CardShell>
      </div>
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
  tail,
  tailTone,
  muted,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tail?: string;
  tailTone?: 'danger';
  muted?: boolean;
}) {
  return (
    <div className="flex min-h-[176px] flex-col items-center justify-center px-6 py-8 text-center">
      <div className="flex items-center gap-2 text-[15px] text-[#7f8695]">
        <Icon size={20} strokeWidth={1.8} />
        <span>{label}</span>
      </div>
      <div className="mt-5 flex items-end justify-center gap-1">
        <span
          className={cn(
            'text-[38px] font-semibold tracking-[-0.05em] sm:text-[40px]',
            muted ? 'text-[#8f9299]' : 'text-[#17191f]'
          )}
        >
          {value}
        </span>
        {tail && (
          <span
            className={cn(
              'pb-1 text-[16px] font-medium tracking-[-0.03em]',
              tailTone === 'danger' ? 'text-[#ff4d4f]' : 'text-[#17191f]'
            )}
          >
            {tail}
          </span>
        )}
      </div>
    </div>
  );
}

function CardShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#e8edf5] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#eef2f7] px-6 py-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#171a20]">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ProtocolBarChart() {
  const width = 720;
  const height = 270;
  const left = 52;
  const right = 24;
  const top = 12;
  const bottom = 38;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const barWidth = 28;
  const centerX = left + chartWidth * 0.5;
  const barHeight = chartHeight * PROTOCOL_DATA[0].value;
  const barY = top + chartHeight - barHeight;

  return (
    <div className="h-[260px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
        {AXIS_STEPS.map(step => {
          const y = top + chartHeight - step * chartHeight;
          const label = step === 0 || step === 1 ? String(step) : step.toFixed(1);
          return (
            <g key={step}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#d8e2f0" strokeWidth="1" />
              <text x={left - 18} y={y + 4} fontSize="11" fill="#7f8897">
                {label}
              </text>
            </g>
          );
        })}

        <rect x={centerX - barWidth / 2} y={barY} width={barWidth} height={barHeight} rx={2} fill="#4569f0" />
        <text x={centerX} y={barY - 10} textAnchor="middle" fontSize="14" fill="#343b47">
          1
        </text>
        <text x={centerX} y={height - 12} textAnchor="middle" fontSize="11" fill="#7f8897">
          Aqara
        </text>
      </svg>
    </div>
  );
}

function AutomationEmptyState() {
  return (
    <div className="flex h-[260px] items-center justify-center">
      <div className="flex flex-col items-center text-center text-[#afb5c1]">
        <div className="mb-4 rounded-[20px] bg-[#f5f7fb] p-5 text-[#d2d6de]">
          <Package size={42} strokeWidth={1.5} />
        </div>
        <div className="text-[15px]">暂无数据</div>
      </div>
    </div>
  );
}

function DeviceTypeChart() {
  const width = 720;
  const height = 250;
  const left = 78;
  const right = 26;
  const top = 24;
  const bottom = 40;
  const chartWidth = width - left - right;
  const axisY = top + 12;
  const barX = left;
  const barW = chartWidth;
  const barH = 20;

  return (
    <div className="h-[252px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
        <line x1={left} y1={top} x2={left} y2={height - bottom} stroke="#79808c" strokeWidth="1.2" />
        {[0, 1, 2, 3, 4, 5].map(index => {
          const y = top + index * 28;
          return <line key={index} x1={left - 8} y1={y} x2={left} y2={y} stroke="#79808c" strokeWidth="1.2" />;
        })}
        <rect x={barX} y={axisY} width={barW} height={barH} rx={10} fill="#4569f0" />
        <text x={left - 16} y={axisY + 15} textAnchor="end" fontSize="12" fill="#6c7380">
          网关
        </text>
        <text x={left + barW + 4} y={axisY + 15} fontSize="14" fill="#313842">
          1
        </text>
        <text x={left} y={height - 10} textAnchor="middle" fontSize="11" fill="#6c7380">
          0
        </text>
        <text x={left + chartWidth} y={height - 10} textAnchor="middle" fontSize="11" fill="#6c7380">
          1
        </text>
      </svg>
    </div>
  );
}

function CpuLoadChart() {
  const width = 720;
  const height = 258;
  const left = 42;
  const right = 18;
  const top = 20;
  const bottom = 34;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const points = CPU_SAMPLES.map((value, index) => {
    const x = left + (index / (CPU_SAMPLES.length - 1)) * chartWidth;
    const y = top + chartHeight - (value / 100) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 px-1">
        <div className="flex items-baseline gap-4">
          <span className="text-[22px] font-semibold tracking-[-0.04em] text-[#17191f]">2%</span>
          <span className="text-[15px] text-[#9ca3b2]">利用率</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#9ca3b2]">
          <span className="w-7 border-t-2 border-dashed border-[#ff4d4f]" />
          最大CPU负载率
        </div>
      </div>

      <div className="h-[215px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
          {[0, 20, 40, 60, 80, 100].map(value => {
            const y = top + chartHeight - (value / 100) * chartHeight;
            return (
              <g key={value}>
                <line x1={left} y1={y} x2={width - right} y2={y} stroke="#dbe4f1" strokeWidth="1" />
                <text x={left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#7f8897">
                  {value}
                </text>
              </g>
            );
          })}

          <line
            x1={left}
            y1={top}
            x2={width - right}
            y2={top}
            stroke="#ff4d4f"
            strokeWidth="2"
            strokeDasharray="10 6"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#4f8cf7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {CPU_LABELS.map((label, index) => {
            const x = left + (index / (CPU_LABELS.length - 1)) * chartWidth;
            return (
              <text key={label} x={x} y={height - 8} textAnchor="middle" fontSize="11" fill="#7f8897">
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
