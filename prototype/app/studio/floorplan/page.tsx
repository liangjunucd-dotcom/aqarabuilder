'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Radar, Map, ZoomIn, ZoomOut, RotateCcw, Plus, Trash2,
  Check, X, Save, Move, GripHorizontal, Maximize2, ChevronLeft,
  Circle, Hexagon, Triangle, Square, Minus, ArrowUp, Settings2,
  Eye, EyeOff, Undo2, Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Point { x: number; y: number; }

interface FP400Zone {
  id: string;
  type: 'polygon' | 'sector' | 'full';
  vertices?: Point[];       // polygon vertices (relative to FP400, in meters)
  radius?: number;           // sector radius in meters
  angle?: number;            // sector angle in degrees
  direction?: number;        // sector direction in degrees (0=up)
  sensitivity: 'high' | 'medium' | 'low';
  label: string;
}

interface FP400Device {
  id: string;
  name: string;
  position: Point;           // position on floor plan (percentage 0-100)
  room: string;
  configured: boolean;       // has zone config from App
  zones: FP400Zone[];
  status: 'online' | 'offline';
}

// ─── Mock FP400s on this floor plan ───────────────────────────────────────

const INITIAL_FP400S: FP400Device[] = [
  {
    id: 'fp400-1',
    name: 'FP400 #1',
    position: { x: 38, y: 32 },
    room: 'Living Room',
    configured: true,
    status: 'online',
    zones: [
      {
        id: 'z1',
        type: 'sector',
        radius: 3.5,
        angle: 90,
        direction: 180,
        sensitivity: 'high',
        label: 'Sofa Area',
      },
      {
        id: 'z2',
        type: 'sector',
        radius: 2.0,
        angle: 60,
        direction: 270,
        sensitivity: 'medium',
        label: 'Walkway',
      },
    ],
  },
  {
    id: 'fp400-2',
    name: 'FP400 #2',
    position: { x: 62, y: 38 },
    room: 'Living Room',
    configured: true,
    status: 'online',
    zones: [
      {
        id: 'z3',
        type: 'polygon',
        vertices: [
          { x: -1.5, y: -1.0 },
          { x: 1.5, y: -1.0 },
          { x: 2.0, y: 1.0 },
          { x: -1.0, y: 1.5 },
        ],
        sensitivity: 'high',
        label: 'Dining Area',
      },
    ],
  },
  {
    id: 'fp400-3',
    name: 'FP400 #3',
    position: { x: 50, y: 55 },
    room: 'Living Room',
    configured: false,
    status: 'online',
    zones: [],
  },
];

const ROOMS = ['Living Room', 'Dining', 'Master Bedroom', 'Kitchen', 'Bathroom', 'Hallway'];

// ─── Scale: pixels per meter on the canvas ────────────────────────────────
const PX_PER_METER = 28;

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FloorPlanPage() {
  const [fp400s, setFp400s] = useState<FP400Device[]>(INITIAL_FP400S);
  const [selectedId, setSelectedId] = useState<string | null>('fp400-3');
  const [drawingMode, setDrawingMode] = useState<'off' | 'polygon' | 'sector'>('off');
  const [drawingZone, setDrawingZone] = useState<{ type: 'polygon' | 'sector'; vertices: Point[]; radius?: number; angle?: number; direction?: number } | null>(null);
  const [showAllZones, setShowAllZones] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingSensitivity, setEditingSensitivity] = useState<'high' | 'medium' | 'low'>('high');

  const canvasRef = useRef<HTMLDivElement>(null);
  const selected = fp400s.find(f => f.id === selectedId);

  const svgW = 800;
  const svgH = 560;

  // ── Helpers ────────────────────────────────────────────────────────────

  const fp400CanvasPos = useCallback((p: Point): Point => ({
    x: (p.x / 100) * svgW,
    y: (p.y / 100) * svgH,
  }), [svgW, svgH]);

  const meterToPx = (m: number) => m * PX_PER_METER;

  // Convert polygon vertices (meters) to SVG points relative to FP400 canvas position
  const zonePolygonPoints = useCallback((fp400: FP400Device, zone: FP400Zone): string => {
    const base = fp400CanvasPos(fp400.position);
    if (!zone.vertices) return '';
    return zone.vertices.map(v => {
      const sx = base.x + v.x * PX_PER_METER;
      const sy = base.y + v.y * PX_PER_METER;
      return `${sx},${sy}`;
    }).join(' ');
  }, [fp400CanvasPos]);

  // Sector arc path
  const zoneSectorPath = useCallback((fp400: FP400Device, zone: FP400Zone): string => {
    const base = fp400CanvasPos(fp400.position);
    const r = meterToPx(zone.radius ?? 2);
    const dir = ((zone.direction ?? 0) - 90) * (Math.PI / 180);
    const halfAngle = ((zone.angle ?? 90) / 2) * (Math.PI / 180);
    const startAngle = dir - halfAngle;
    const endAngle = dir + halfAngle;

    const x1 = base.x + r * Math.cos(startAngle);
    const y1 = base.y + r * Math.sin(startAngle);
    const x2 = base.x + r * Math.cos(endAngle);
    const y2 = base.y + r * Math.sin(endAngle);
    const largeArc = (zone.angle ?? 90) > 180 ? 1 : 0;

    return `M ${base.x} ${base.y} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }, [fp400CanvasPos, meterToPx]);

  // ── Actions ────────────────────────────────────────────────────────────

  const startDraw = (type: 'polygon' | 'sector') => {
    setDrawingMode(type);
    setDrawingZone({ type, vertices: [] });
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingMode === 'off' || !drawingZone || !selected || !canvasRef.current) return;

    const svgRect = canvasRef.current.querySelector('svg')!.getBoundingClientRect();
    const scaleX = svgW / svgRect.width;
    const scaleY = svgH / svgRect.height;
    const cx = (e.clientX - svgRect.left) * scaleX;
    const cy = (e.clientY - svgRect.top) * scaleY;

    // Convert to meters relative to selected FP400
    const base = fp400CanvasPos(selected.position);
    const relM = { x: (cx - base.x) / PX_PER_METER, y: (cy - base.y) / PX_PER_METER };

    if (drawingMode === 'polygon') {
      setDrawingZone(prev => ({
        ...prev!,
        vertices: [...(prev?.vertices ?? []), relM],
      }));
    } else if (drawingMode === 'sector') {
      // Calculate radius and angle from FP400 to click point
      const dx = cx - base.x;
      const dy = cy - base.y;
      const radius = Math.sqrt(dx * dx + dy * dy) / PX_PER_METER;
      const direction = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
      setDrawingZone(prev => ({
        ...prev!,
        vertices: [relM], // placeholder
        radius: Math.round(radius * 10) / 10,
        angle: 90,
        direction: Math.round(((direction % 360) + 360) % 360),
      }));
    }
  };

  const finishDrawing = () => {
    if (!drawingZone || !selected) return;

    const newZone: FP400Zone = {
      id: `z${Date.now()}`,
      type: drawingZone.type,
      vertices: drawingZone.type === 'polygon' ? drawingZone.vertices : undefined,
      radius: drawingZone.type === 'sector' ? (drawingZone.radius ?? 3) : undefined,
      angle: drawingZone.type === 'sector' ? (drawingZone.angle ?? 90) : undefined,
      direction: drawingZone.type === 'sector' ? (drawingZone.direction ?? 180) : undefined,
      sensitivity: editingSensitivity,
      label: editingLabel || `${selected.room} Zone ${(selected.zones?.length ?? 0) + 1}`,
    };

    setFp400s(prev => prev.map(f => {
      if (f.id === selected.id) {
        return { ...f, zones: [...f.zones, newZone], configured: true };
      }
      return f;
    }));

    setDrawingMode('off');
    setDrawingZone(null);
    setEditingLabel('');
  };

  const cancelDrawing = () => {
    setDrawingMode('off');
    setDrawingZone(null);
  };

  const deleteZone = (zoneId: string) => {
    if (!selected) return;
    setFp400s(prev => prev.map(f => {
      if (f.id === selected.id) {
        const zones = f.zones.filter(z => z.id !== zoneId);
        return { ...f, zones, configured: zones.length > 0 };
      }
      return f;
    }));
  };

  const updateZoneSensitivity = (zoneId: string, sensitivity: 'high' | 'medium' | 'low') => {
    setFp400s(prev => prev.map(f => {
      if (f.id === selected?.id) {
        return { ...f, zones: f.zones.map(z => z.id === zoneId ? { ...z, sensitivity } : z) };
      }
      return f;
    }));
  };

  const saveAll = () => {
    alert('FP400 zone configurations saved to Studio.\n\nAll zones synced to devices. Studio OS will push configs to each FP400.');
  };

  const draggingRef = useRef<string | null>(null);
  const handleFp400MouseDown = (id: string, e: React.MouseEvent) => {
    if (drawingMode !== 'off') return;
    setSelectedId(id);
    draggingRef.current = id;
    e.stopPropagation();
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingRef.current || !canvasRef.current) return;
    const svgRect = canvasRef.current.querySelector('svg')!.getBoundingClientRect();
    const x = ((e.clientX - svgRect.left) / svgRect.width) * 100;
    const y = ((e.clientY - svgRect.top) / svgRect.height) * 100;
    setFp400s(prev => prev.map(f =>
      f.id === draggingRef.current
        ? { ...f, position: { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) } }
        : f
    ));
  };

  const handleSvgMouseUp = () => {
    draggingRef.current = null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Toolbar ── */}
      <header className="h-12 border-b border-white/[0.06] bg-[#0f1014] flex items-center px-4 gap-3 flex-shrink-0">
        <Link href="/studio/spaces" className="flex items-center gap-1 p-1 rounded hover:bg-white/[0.04] text-text-muted hover:text-text transition">
          <ChevronLeft size={14} />
          <span className="text-[10px]">Spaces</span>
        </Link>
        <Map size={14} className="text-emerald-400" />
        <span className="text-sm font-medium">Floor Plan</span>
        <span className="text-[10px] text-text-subtle">· Living Room + Dining</span>

        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-md p-0.5">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 rounded hover:bg-white/[0.06] text-text-muted">
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] text-text-muted w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 rounded hover:bg-white/[0.06] text-text-muted">
            <ZoomIn size={13} />
          </button>
          <button onClick={() => setZoom(1)} className="p-1 rounded hover:bg-white/[0.06] text-text-muted">
            <Maximize2 size={12} />
          </button>
        </div>

        <button
          onClick={() => setShowAllZones(!showAllZones)}
          className={cn('p-1.5 rounded-md transition', showAllZones ? 'bg-white/[0.06] text-text' : 'text-text-subtle')}
          title="Toggle zone visibility"
        >
          {showAllZones ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        <button
          onClick={saveAll}
          className="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-400 transition inline-flex items-center gap-1.5"
        >
          <Save size={12} />
          Save All
        </button>
      </header>

      {/* ── Main: 3-column layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — FP400 List */}
        <aside className="w-[220px] border-r border-white/[0.06] bg-[#0f1014] flex flex-col flex-shrink-0">
          <div className="px-3 py-3 border-b border-white/[0.06]">
            <div className="text-[10px] text-text-subtle uppercase tracking-wider mb-2">FP400 Sensors</div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Configured</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Needs config</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {fp400s.map(fp => {
              const isSel = selectedId === fp.id;
              const hasZones = fp.zones.length > 0;
              return (
                <button
                  key={fp.id}
                  onClick={() => { setSelectedId(fp.id); setDrawingMode('off'); setDrawingZone(null); }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 transition border-l-2',
                    isSel
                      ? 'border-emerald-400 bg-emerald-500/[0.06]'
                      : 'border-transparent hover:bg-white/[0.03]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full border-2',
                      fp.configured ? 'bg-emerald-400 border-emerald-400' : 'bg-transparent border-amber-400'
                    )} />
                    <div>
                      <div className="text-xs font-medium">{fp.name}</div>
                      <div className="text-[9px] text-text-muted">{fp.room}</div>
                    </div>
                    {fp.status === 'online' ? (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" title="Online" />
                    ) : (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-danger" title="Offline" />
                    )}
                  </div>
                  {hasZones && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {fp.zones.map(z => (
                        <span key={z.id} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-subtle">
                          {z.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {!fp.configured && (
                    <div className="mt-1 text-[9px] text-amber-400">No zones configured</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add FP400 button */}
          <div className="p-3 border-t border-white/[0.06]">
            <button className="w-full py-1.5 text-xs rounded-md border border-dashed border-white/[0.1] text-text-muted hover:border-white/[0.2] hover:text-text transition inline-flex items-center justify-center gap-1.5">
              <Plus size={12} /> Add FP400
            </button>
          </div>
        </aside>

        {/* Center — Floor Plan Canvas */}
        <div ref={canvasRef} className="flex-1 bg-[#0a0b0e] relative overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* SVG Floor Plan */}
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-[800px] h-[560px] flex-shrink-0"
              onClick={handleCanvasClick}
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={handleSvgMouseUp}
              style={{ cursor: drawingMode !== 'off' ? 'crosshair' : 'default' }}
            >
              {/* ─── Room Layout (background) ─── */}
              {/* Living Room */}
              <rect x="20" y="20" width="350" height="300" rx="4"
                fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <text x="30" y="38" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="Inter, sans-serif">Living Room</text>
              <text x="30" y="50" fill="rgba(255,255,255,0.12)" fontSize="8" fontFamily="Inter, sans-serif">28.5 m²</text>

              {/* Dining */}
              <rect x="380" y="20" width="240" height="200" rx="4"
                fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <text x="390" y="38" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="Inter, sans-serif">Dining</text>

              {/* Kitchen */}
              <rect x="380" y="230" width="240" height="140" rx="4"
                fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <text x="390" y="248" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="Inter, sans-serif">Kitchen</text>

              {/* Master Bedroom */}
              <rect x="20" y="330" width="340" height="210" rx="4"
                fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <text x="30" y="348" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="Inter, sans-serif">Master Bedroom</text>
              <text x="30" y="360" fill="rgba(255,255,255,0.12)" fontSize="8" fontFamily="Inter, sans-serif">18.2 m²</text>

              {/* Bathroom */}
              <rect x="630" y="20" width="150" height="180" rx="4"
                fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <text x="640" y="38" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="Inter, sans-serif">Bathroom</text>

              {/* Hallway */}
              <rect x="630" y="210" width="150" height="160" rx="4"
                fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <text x="640" y="228" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="Inter, sans-serif">Hallway</text>

              {/* Door openings */}
              <line x1="370" y1="180" x2="380" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
              <line x1="200" y1="320" x2="280" y2="320" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />

              {/* Windows */}
              <line x1="80" y1="20" x2="160" y2="20" stroke="rgba(100,180,255,0.2)" strokeWidth="4" />
              <line x1="250" y1="20" x2="320" y2="20" stroke="rgba(100,180,255,0.2)" strokeWidth="4" />
              <line x1="20" y1="400" x2="20" y2="480" stroke="rgba(100,180,255,0.2)" strokeWidth="4" />

              {/* ─── Scale Bar ─── */}
              <line x1="660" y1="510" x2="760" y2="510" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="660" y1="506" x2="660" y2="514" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="760" y1="506" x2="760" y2="514" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <text x="710" y="524" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" fontFamily="Inter, sans-serif">4m</text>

              {/* ─── FP400 Zone Overlays ─── */}
              {showAllZones && fp400s.map(fp => {
                const base = fp400CanvasPos(fp.position);
                const isSel = selectedId === fp.id;
                return (
                  <g key={fp.id}>
                    {/* Configured zones */}
                    {fp.zones.map(zone => {
                      const isPolygon = zone.type === 'polygon';
                      return (
                        <g key={zone.id}>
                          {isPolygon && zone.vertices && (
                            <>
                              <polygon
                                points={zonePolygonPoints(fp, zone)}
                                fill={isSel ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.07)'}
                                stroke={isSel ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.25)'}
                                strokeWidth={isSel ? 1.5 : 1}
                                strokeDasharray={isSel ? '0' : '4 4'}
                              />
                              {/* Zone label */}
                              <text
                                x={zone.vertices.reduce((s, v) => s + v.x, 0) / zone.vertices.length * PX_PER_METER + base.x}
                                y={zone.vertices.reduce((s, v) => s + v.y, 0) / zone.vertices.length * PX_PER_METER + base.y}
                                fill="rgba(255,255,255,0.5)"
                                fontSize="8"
                                textAnchor="middle"
                                fontFamily="Inter, sans-serif"
                              >
                                {zone.label}
                              </text>
                            </>
                          )}
                          {zone.type === 'sector' && (
                            <g>
                              <path
                                d={zoneSectorPath(fp, zone)}
                                fill={isSel ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.07)'}
                                stroke={isSel ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.25)'}
                                strokeWidth={isSel ? 1.5 : 1}
                                strokeDasharray={isSel ? '0' : '4 4'}
                              />
                              {/* Label at mid-radius */}
                              {zone.radius && (
                                <text
                                  x={base.x + Math.cos((zone.direction ?? 0) * Math.PI / 180) * meterToPx(zone.radius * 0.5)}
                                  y={base.y + Math.sin((zone.direction ?? 0) * Math.PI / 180) * meterToPx(zone.radius * 0.5) - 4}
                                  fill="rgba(255,255,255,0.5)"
                                  fontSize="8"
                                  textAnchor="middle"
                                  fontFamily="Inter, sans-serif"
                                >
                                  {zone.label}
                                </text>
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Unconfigured FP400 highlight */}
                    {!fp.configured && isSel && (
                      <circle cx={base.x} cy={base.y} r={meterToPx(4)}
                        fill="rgba(245,158,11,0.04)"
                        stroke="rgba(245,158,11,0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="6 3"
                      />
                    )}
                  </g>
                );
              })}

              {/* ─── Drawing Preview ─── */}
              {drawingZone && selected && (
                <g>
                  {drawingZone.type === 'polygon' && drawingZone.vertices.length >= 2 && (
                    <>
                      <polygon
                        points={(() => {
                          const base = fp400CanvasPos(selected.position);
                          return drawingZone.vertices.map(v =>
                            `${(base.x + v.x * PX_PER_METER)},${(base.y + v.y * PX_PER_METER)}`
                          ).join(' ');
                        })()}
                        fill="rgba(99,102,241,0.1)"
                        stroke="rgba(99,102,241,0.5)"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      {/* Show last edge while drawing */}
                      {drawingZone.vertices.length >= 3 && (
                        <line
                          x1={fp400CanvasPos(selected.position).x + drawingZone.vertices[drawingZone.vertices.length - 1].x * PX_PER_METER}
                          y1={fp400CanvasPos(selected.position).y + drawingZone.vertices[drawingZone.vertices.length - 1].y * PX_PER_METER}
                          x2={fp400CanvasPos(selected.position).x + drawingZone.vertices[0].x * PX_PER_METER}
                          y2={fp400CanvasPos(selected.position).y + drawingZone.vertices[0].y * PX_PER_METER}
                          stroke="rgba(99,102,241,0.3)"
                          strokeWidth="1"
                          strokeDasharray="3 2"
                        />
                      )}
                    </>
                  )}
                  {drawingZone.type === 'sector' && drawingZone.radius && (
                    <path
                      d={zoneSectorPath(selected, {
                        id: 'preview',
                        type: 'sector',
                        radius: drawingZone.radius,
                        angle: drawingZone.angle ?? 90,
                        direction: drawingZone.direction ?? 180,
                        sensitivity: 'high',
                        label: '',
                      })}
                      fill="rgba(99,102,241,0.1)"
                      stroke="rgba(99,102,241,0.5)"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  )}
                  {/* Drawing vertices */}
                  {drawingZone.vertices.map((v, i) => {
                    const base = fp400CanvasPos(selected.position);
                    return (
                      <circle
                        key={i}
                        cx={base.x + v.x * PX_PER_METER}
                        cy={base.y + v.y * PX_PER_METER}
                        r="4"
                        fill="rgba(99,102,241,0.8)"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              )}

              {/* ─── FP400 Device Markers ─── */}
              {fp400s.map(fp => {
                const base = fp400CanvasPos(fp.position);
                const isSel = selectedId === fp.id;
                const isConfigured = fp.configured;
                return (
                  <g
                    key={fp.id}
                    onMouseDown={(e) => handleFp400MouseDown(fp.id, e)}
                    style={{ cursor: drawingMode === 'off' ? 'grab' : 'default' }}
                  >
                    {/* Range indicator circle */}
                    {isSel && (
                      <circle cx={base.x} cy={base.y} r={meterToPx(3)}
                        fill="none"
                        stroke={isConfigured ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}
                        strokeWidth="0.5"
                      />
                    )}
                    {/* Device body */}
                    <rect
                      x={base.x - 7} y={base.y - 7} width={14} height={14} rx={3}
                      fill={isConfigured ? 'rgba(16,185,129,0.2)' : isSel ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.15)'}
                      stroke={isConfigured ? (isSel ? 'rgba(16,185,129,0.8)' : 'rgba(16,185,129,0.5)') : (isSel ? 'rgba(245,158,11,0.8)' : 'rgba(245,158,11,0.4)')}
                      strokeWidth={isSel ? 1.5 : 1}
                    />
                    {/* Radar icon */}
                    <Radar
                      size={8}
                      x={base.x - 4} y={base.y - 4}
                      color={isConfigured ? 'rgba(16,185,129,0.8)' : 'rgba(245,158,11,0.8)'}
                      strokeWidth={2.5}
                    />
                    {/* Label */}
                    <text
                      x={base.x} y={base.y + 22}
                      fill="rgba(255,255,255,0.7)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="Inter, sans-serif"
                      fontWeight={isSel ? 600 : 400}
                    >
                      {fp.name}
                    </text>
                    {/* Selection indicator */}
                    {isSel && (
                      <rect
                        x={base.x - 10} y={base.y - 10} width={20} height={20} rx={5}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                      />
                    )}
                    {/* Needs config badge */}
                    {!isConfigured && (
                      <circle cx={base.x + 7} cy={base.y - 7} r="5" fill="rgba(245,158,11,0.9)" stroke="#0a0b0e" strokeWidth="1">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Drawing mode overlay hint */}
          {drawingMode !== 'off' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-bg-elevated border border-accent/40 shadow-xl flex items-center gap-3 z-10">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium">
                {drawingMode === 'polygon' ? 'Click to add polygon vertices' : 'Click to set zone direction & radius'}
              </span>
              <span className="text-[10px] text-text-muted">
                {drawingZone && drawingZone.type === 'polygon' && drawingZone.vertices.length > 0
                  ? `${drawingZone.vertices.length} point${drawingZone.vertices.length > 1 ? 's' : ''}`
                  : 'Click on floor plan'}
              </span>
              <div className="w-px h-4 bg-border" />
              <button onClick={finishDrawing} className="px-2.5 py-1 text-[10px] rounded bg-accent text-white font-medium">
                Finish
              </button>
              <button onClick={cancelDrawing} className="px-2.5 py-1 text-[10px] rounded border border-border text-text-muted hover:text-text">
                Cancel
              </button>
            </div>
          )}

          {/* Info — click floor plan hint */}
          {drawingMode === 'off' && !selected?.configured && selectedId === 'fp400-3' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
              Select FP400 #3 and click <b>Configure Zone</b> to start drawing its detection area
            </div>
          )}
        </div>

        {/* Right Panel — Configuration */}
        <aside className="w-[300px] border-l border-white/[0.06] bg-[#0f1014] flex flex-col flex-shrink-0 overflow-y-auto">
          {selected ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selected.configured ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-amber-500/15 border border-amber-500/30'
                  )}>
                    <Radar size={14} className={selected.configured ? 'text-emerald-400' : 'text-amber-400'} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selected.name}</div>
                    <div className="text-[10px] text-text-muted">{selected.room} · {selected.status === 'online' ? 'Online' : 'Offline'}</div>
                  </div>
                  {!selected.configured && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Needs Config
                    </span>
                  )}
                </div>
              </div>

              {/* Zone list */}
              <div className="flex-1">
                <div className="px-4 py-2 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-subtle uppercase tracking-wider">
                      Detection Zones ({selected.zones.length})
                    </span>
                  </div>
                </div>

                {selected.zones.length === 0 && !drawingMode && (
                  <div className="px-4 py-6 text-center">
                    <Radar size={28} className="text-text-subtle mx-auto mb-2 opacity-40" />
                    <div className="text-xs text-text-muted mb-1">No zones configured</div>
                    <div className="text-[10px] text-text-subtle mb-4">Define detection areas for this FP400</div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => startDraw('sector')}
                        className="w-full py-2 text-xs rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 transition"
                      >
                        Sector Zone (wall-mount)
                      </button>
                      <button
                        onClick={() => startDraw('polygon')}
                        className="w-full py-2 text-xs rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/15 transition"
                      >
                        Polygon Zone (ceiling-mount)
                      </button>
                    </div>
                    <div className="mt-3 text-[9px] text-text-subtle leading-relaxed">
                      Sector: wall-mounted FP400, define detection radius & angle
                      <br />
                      Polygon: ceiling-mounted FP400, click corners to draw custom area
                    </div>
                  </div>
                )}

                {selected.zones.map(zone => (
                  <div key={zone.id} className="px-4 py-3 border-b border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {zone.type === 'sector' ? <Triangle size={12} className="text-emerald-400" /> :
                         zone.type === 'polygon' ? <Hexagon size={12} className="text-violet-400" /> :
                         <Square size={12} className="text-text-muted" />}
                        <span className="text-xs font-medium">{zone.label}</span>
                      </div>
                      <button onClick={() => deleteZone(zone.id)} className="p-1 rounded hover:bg-white/[0.06] text-text-subtle hover:text-danger transition">
                        <Trash2 size={11} />
                      </button>
                    </div>

                    {/* Zone details */}
                    <div className="space-y-1.5">
                      {zone.type === 'sector' && (
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div className="text-text-subtle">Radius</div>
                          <div className="text-text-muted text-right">{zone.radius}m</div>
                          <div className="text-text-subtle">Angle</div>
                          <div className="text-text-muted text-right">{zone.angle}°</div>
                          <div className="text-text-subtle">Direction</div>
                          <div className="text-text-muted text-right">{zone.direction}°</div>
                        </div>
                      )}
                      {zone.type === 'polygon' && zone.vertices && (
                        <div className="text-[10px] text-text-muted">
                          {zone.vertices.length} vertices
                        </div>
                      )}

                      {/* Sensitivity selector */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-text-subtle w-12 flex-shrink-0">Sensitivity</span>
                        <div className="flex bg-white/[0.04] rounded p-0.5 flex-1">
                          {(['low', 'medium', 'high'] as const).map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => updateZoneSensitivity(zone.id, lvl)}
                              className={cn(
                                'flex-1 text-[9px] py-0.5 rounded transition',
                                zone.sensitivity === lvl
                                  ? lvl === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                                    lvl === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-white/[0.08] text-text'
                                  : 'text-text-subtle hover:text-text'
                              )}
                            >
                              {lvl === 'high' ? 'High' : lvl === 'medium' ? 'Med' : 'Low'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Active drawing zone preview */}
                {drawingZone && (
                  <div className="px-4 py-3 border-b border-accent/20 bg-accent/[0.03]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-xs font-medium text-accent-glow">
                        Drawing {drawingZone.type === 'polygon' ? 'Polygon' : 'Sector'}
                      </span>
                    </div>
                    {drawingZone.type === 'polygon' && (
                      <div className="text-[10px] text-text-muted">
                        {drawingZone.vertices.length} point{drawingZone.vertices.length !== 1 && 's'} placed.
                        Click more points, then <b>Finish</b>.
                      </div>
                    )}
                    {drawingZone.type === 'sector' && drawingZone.radius && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-text-muted">
                          Radius: <span className="text-text">{drawingZone.radius}m</span> ·
                          Angle: <span className="text-text">{drawingZone.angle}°</span> ·
                          Dir: <span className="text-text">{drawingZone.direction}°</span>
                        </div>
                      </div>
                    )}
                    {/* Zone label input */}
                    <div className="mt-2">
                      <input
                        value={editingLabel}
                        onChange={e => setEditingLabel(e.target.value)}
                        placeholder="Zone name (e.g. Sofa Area)"
                        className="w-full h-7 px-2 text-[10px] bg-white/[0.04] border border-white/[0.08] rounded focus:outline-none focus:border-accent/40 text-text placeholder:text-text-subtle"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Add zone buttons (when configured) */}
              {selected.configured && drawingMode === 'off' && (
                <div className="px-4 py-2 border-t border-white/[0.06] space-y-1.5">
                  <button
                    onClick={() => startDraw('sector')}
                    className="w-full py-1.5 text-[10px] rounded border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/[0.06] transition inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus size={10} /> Add Sector Zone
                  </button>
                  <button
                    onClick={() => startDraw('polygon')}
                    className="w-full py-1.5 text-[10px] rounded border border-violet-500/20 text-violet-400 hover:bg-violet-500/[0.06] transition inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus size={10} /> Add Polygon Zone
                  </button>
                </div>
              )}

              {/* Sensor info */}
              <div className="px-4 py-3 border-t border-white/[0.06]">
                <div className="text-[10px] text-text-subtle space-y-1">
                  <div className="flex justify-between"><span>Model</span><span className="text-text-muted">FP400</span></div>
                  <div className="flex justify-between"><span>Protocol</span><span className="text-text-muted">Zigbee 3.0 / Matter</span></div>
                  <div className="flex justify-between"><span>Max Range</span><span className="text-text-muted">8m</span></div>
                  <div className="flex justify-between"><span>Max Zones</span><span className="text-text-muted">5</span></div>
                  <div className="flex justify-between"><span>Data Source</span><span className="text-text-muted">{selected.configured ? 'Studio OS' : 'Pending'}</span></div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-subtle text-xs">
              Select an FP400 to configure
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
