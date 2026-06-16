'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Calculator,
  ChevronDown,
  Eye,
  FileText,
  Info,
  List,
  Minus,
  MousePointer2,
  PanelRightClose,
  PenLine,
  Plus,
  RotateCw,
  Ruler,
  Save,
  ScanLine,
  Search,
  Shapes,
  Square,
  Star,
  Undo2,
  UploadCloud,
} from 'lucide-react';
import { getProject } from '@/lib/mock/projects';
import { cn } from '@/lib/utils';

const TAKEOFF_TOOLBAR = [
  { label: 'Rectangle', icon: Square, active: true },
  { label: 'Polygon', icon: Shapes },
  { label: 'Length', icon: Ruler },
  { label: 'Deduct', icon: Minus },
  { label: 'Count', icon: Plus },
  { label: 'Move', icon: MousePointer2 },
  { label: 'Annotate', icon: PenLine },
  { label: 'Undo', icon: Undo2 },
  { label: 'Rotate', icon: RotateCw },
];

const PAGES = [
  { page: 9, active: false, pattern: 'elevation' },
  { page: 10, active: false, pattern: 'section' },
  { page: 11, active: true, pattern: 'floor' },
  { page: 12, active: false, pattern: 'floor2' },
];

export default function TakeoffPlanPage() {
  const params = useParams<{ id?: string; takeoffId?: string }>();
  const projectId = params?.id ?? '';
  const takeoffId = params?.takeoffId ?? 'framing-plan';
  const project = getProject(projectId);

  if (!project) return notFound();

  const planName = getTakeoffName(takeoffId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#efeee9] text-slate-950">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <Link
            href={`/pro/projects/${project.id}/overview`}
            className="inline-flex h-8 items-center gap-2 rounded border border-slate-200 px-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <List size={15} />
            <span className="max-w-[220px] truncate">{project.title}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <button className="inline-flex h-8 items-center gap-2 font-semibold text-slate-900">
            {planName} <ChevronDown size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
            <Info size={15} /> Learning Hub
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 px-4 text-sm font-semibold text-slate-300">
            <Save size={15} /> Save To Files
          </button>
          <button className="inline-flex h-9 items-center rounded bg-slate-200 px-4 text-sm font-semibold text-white">
            Review & Estimate
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_330px]">
        <TakeoffPagesPanel />

        <main className="relative min-w-0 overflow-hidden bg-[#efeee9]">
          <TakeoffWorkToolbar />
          <div className="absolute inset-x-0 bottom-0 top-[104px] overflow-auto">
            <BlueprintSheet />
          </div>
        </main>

        <MeasurementsPanel />
      </div>
    </div>
  );
}

function TakeoffPagesPanel() {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-10 items-center gap-2 border-b border-slate-200 px-4 text-sm font-semibold text-slate-700">
        <ChevronDown size={15} /> PAGE
      </div>
      <div className="border-b border-slate-200 p-3">
        <label className="relative block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            placeholder="Search Keywords"
          />
        </label>
        <div className="mt-3 grid grid-cols-3 border-b border-slate-200 text-slate-500">
          {[FileText, ScanLine, Star].map((Icon, index) => (
            <button
              key={index}
              className={cn('flex h-9 items-center justify-center border-b-2', index === 0 ? 'border-slate-950 text-slate-950' : 'border-transparent')}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {PAGES.map(page => (
            <button key={page.page} className="grid w-full grid-cols-[26px_minmax(0,1fr)] gap-2 text-left">
              <div className="pt-24 text-sm font-medium text-slate-600">{page.page}</div>
              <div className={cn('rounded border bg-white p-2 shadow-sm', page.active ? 'border-slate-950 ring-1 ring-slate-950' : 'border-slate-200')}>
                <MiniBlueprint pattern={page.pattern} />
                <div className="mt-2 flex items-center justify-between text-slate-500">
                  <span className="text-xs">{page.active ? 'Floor plan' : 'Sheet preview'}</span>
                  <span className="text-lg leading-none">...</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="flex h-11 items-center gap-2 px-4 text-sm font-semibold text-slate-700">
          <ChevronDown size={15} /> PAGE SETTINGS
        </div>
        <div className="space-y-3 px-4 pb-4 text-sm">
          <SettingsRow label="Line Width" value="1.0" />
          <SettingsRow label="Page Scale" value={'1/4"=1\'0'} />
        </div>
      </div>
    </aside>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <button className="inline-flex h-8 items-center gap-2 rounded border border-slate-200 px-2 font-medium text-slate-700">
        {value} <ChevronDown size={13} />
      </button>
    </div>
  );
}

function TakeoffWorkToolbar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex h-11 items-center border-b border-slate-200">
        <button className="flex h-full items-center gap-2 border-r border-slate-200 px-5 text-sm font-semibold text-indigo-600">
          <ScanLine size={16} /> AutoMate
        </button>
        <button className="flex h-full items-center gap-2 border-r border-slate-200 px-5 text-sm font-semibold text-slate-700">
          <Star size={16} className="fill-slate-800 text-slate-800" /> Manage Favorites
        </button>
      </div>

      <div className="flex h-[60px] items-center justify-center">
        <div className="flex items-stretch overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
          {TAKEOFF_TOOLBAR.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                className={cn(
                  'flex h-[58px] min-w-[72px] flex-col items-center justify-center gap-1 border-r border-slate-200 px-3 text-xs font-medium last:border-r-0',
                  tool.active ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                )}
              >
                <Icon size={17} />
                {tool.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex h-9 items-center justify-center border-t border-slate-200 bg-white">
        <div className="flex h-full min-w-[720px] items-center gap-6 px-4 text-sm">
          <button className="font-semibold text-slate-700">Group</button>
          <button className="font-semibold text-slate-950">Individual Measurement</button>
          <ChevronDown size={15} className="ml-auto text-slate-500" />
          <span className="h-4 w-4 rounded bg-rose-500" />
          <ChevronDown size={15} className="text-slate-500" />
          <button className="font-semibold text-slate-700">New Group</button>
        </div>
      </div>
    </div>
  );
}

function MeasurementsPanel() {
  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white">
      <div className="flex h-10 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ChevronDown size={15} /> MEASUREMENTS
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <Eye size={16} />
          <PanelRightClose size={16} />
        </div>
      </div>
      <div className="grid flex-1 place-items-center bg-[#f3f2ed] px-8 text-center">
        <div>
          <Ruler size={48} className="mx-auto text-slate-500" />
          <div className="mt-4 text-sm font-semibold text-slate-950">No Measurements Yet</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">
            Your results will show up here when you start measuring.
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
          Smart Takeoff
          <Calculator size={16} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Metric label="Areas" value="0" />
          <Metric label="Lengths" value="0" />
          <Metric label="Counts" value="0" />
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-2">
      <div className="text-base font-semibold text-slate-950">{value}</div>
      <div className="mt-0.5 text-slate-500">{label}</div>
    </div>
  );
}

function BlueprintSheet() {
  return (
    <div className="mx-auto my-10 h-[980px] w-[1040px] bg-white shadow-sm ring-1 ring-slate-200">
      <svg viewBox="0 0 1040 980" className="h-full w-full">
        <defs>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#d7d7d7" strokeWidth="2" />
          </pattern>
        </defs>

        <g stroke="#d7d7d7" strokeWidth="1">
          {Array.from({ length: 10 }).map((_, index) => (
            <line key={`v-${index}`} x1={120 + index * 90} y1="64" x2={120 + index * 90} y2="910" strokeDasharray="8 8" />
          ))}
          {Array.from({ length: 7 }).map((_, index) => (
            <line key={`h-${index}`} x1="72" y1={120 + index * 110} x2="960" y2={120 + index * 110} strokeDasharray="8 8" />
          ))}
        </g>

        <g fill="none" stroke="#222" strokeWidth="3">
          <rect x="330" y="170" width="465" height="185" />
          <polyline points="330,355 230,355 230,270 300,270 300,200 330,200" />
          <rect x="365" y="210" width="120" height="70" />
          <rect x="500" y="265" width="90" height="90" />
          <rect x="600" y="250" width="185" height="105" />
          <rect x="360" y="610" width="460" height="215" />
          <rect x="432" y="690" width="120" height="135" />
          <rect x="555" y="610" width="150" height="130" />
          <rect x="705" y="650" width="115" height="175" />
        </g>

        <g fill="url(#hatch)" stroke="#c7c7c7" strokeWidth="1">
          <rect x="130" y="735" width="210" height="90" />
          <rect x="820" y="610" width="130" height="120" />
        </g>

        <g fill="#222" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="600" textAnchor="middle">
          <text x="575" y="235">LIVING</text>
          <text x="670" y="295">KITCHEN</text>
          <text x="548" y="320">BATH</text>
          <text x="285" y="322">GARAGE</text>
          <text x="495" y="760">BDRM 2</text>
          <text x="635" y="690">PRIMARY BEDROOM</text>
          <text x="765" y="735">PRIMARY BATH</text>
          <text x="515" y="138">FLOOR PLAN</text>
        </g>

        <g stroke="#111" strokeWidth="1" fill="none">
          <line x1="360" y1="580" x2="820" y2="580" />
          <line x1="360" y1="575" x2="360" y2="585" />
          <line x1="820" y1="575" x2="820" y2="585" />
          <text x="590" y="570" fill="#111" fontSize="12" textAnchor="middle">42'-7"</text>
          <line x1="320" y1="610" x2="320" y2="825" />
          <line x1="315" y1="610" x2="325" y2="610" />
          <line x1="315" y1="825" x2="325" y2="825" />
          <text x="306" y="722" fill="#111" fontSize="12" textAnchor="middle" transform="rotate(-90 306 722)">21'-4"</text>
        </g>

        <g>
          <rect x="330" y="170" width="72" height="72" fill="#777" opacity="0.28" stroke="#111" strokeWidth="2" />
          <rect x="805" y="300" width="10" height="10" fill="#fff" stroke="#111" />
          <rect x="902" y="428" width="10" height="10" fill="#fff" stroke="#111" />
          <rect x="870" y="525" width="10" height="10" fill="#111" />
          <path d="M803 202 l8 12 l-8 12 l-8 -12 z" fill="#fff" stroke="#111" />
        </g>

        <g fill="#666" stroke="#aaa" strokeWidth="1">
          {[1, 2, 3, 4, 5, 6].map((n, index) => (
            <g key={n}>
              <circle cx={250 + index * 115} cy="90" r="10" fill="#fff" />
              <text x={250 + index * 115} y="94" textAnchor="middle" fontSize="10" fill="#666">{n}</text>
            </g>
          ))}
          {['A', 'B', 'C', 'D', 'F'].map((letter, index) => (
            <g key={letter}>
              <circle cx="170" cy={260 + index * 45} r="10" fill="#fff" />
              <text x="170" y={264 + index * 45} textAnchor="middle" fontSize="10" fill="#666">{letter}</text>
            </g>
          ))}
        </g>

        <g fill="#111" fontFamily="Arial, sans-serif" fontSize="11">
          <text x="88" y="760">WALL & SYMBOL KEY</text>
          <rect x="88" y="775" width="22" height="5" fill="#dcdcdc" stroke="#111" />
          <text x="118" y="781">NEW EXTERIOR WALL</text>
          <rect x="88" y="792" width="22" height="5" fill="#fff" stroke="#111" />
          <text x="118" y="798">NEW INTERIOR WALL</text>
          <rect x="88" y="809" width="22" height="5" fill="url(#hatch)" stroke="#111" />
          <text x="118" y="815">ROOF / DECK AREA</text>
        </g>
      </svg>
    </div>
  );
}

function MiniBlueprint({ pattern }: { pattern: string }) {
  return (
    <svg viewBox="0 0 150 92" className="h-[92px] w-full rounded bg-slate-50">
      <rect x="10" y="14" width="130" height="60" fill="#fff" stroke="#e2e8f0" />
      <g fill="none" stroke="#cbd5e1" strokeWidth="1">
        <rect x="24" y="26" width={pattern === 'section' ? 84 : 44} height="24" />
        <rect x="70" y="26" width="46" height="24" />
        <rect x="24" y="52" width="92" height="12" />
        <line x1="18" y1="70" x2="132" y2="70" />
      </g>
      {pattern === 'floor' && <rect x="78" y="28" width="18" height="18" fill="#d1d5db" stroke="#94a3b8" />}
    </svg>
  );
}

function getTakeoffName(takeoffId: string) {
  if (takeoffId === 'framing-plan') return 'Framing Plan';
  return takeoffId
    .split('-')
    .filter(Boolean)
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Takeoff Plan';
}
