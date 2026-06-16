'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, Cpu, MapPin, Zap,
  Rss, SwitchCamera, Play, ArrowLeft, ArrowRight,
  Home, Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import {
  type PlanPoint,
  type StudioDevice,
  type Confidence,
  type FeedbackKind,
  FB_LABEL,
  FB_DESC,
  FB_ICON,
  CONFIDENCE_CFG,
  ROOM_ORDER,
  deviceDisplayName,
  mappingReasonText,
} from '@/lib/device-mapping';

// ─── Props ──────────────────────────────────────────────────────────────

export interface DeviceMappingPanelProps {
  points: PlanPoint[];
  studioDevices: StudioDevice[];
  /** Called when a point is confirmed */
  onConfirm: (pointCode: string) => void;
  /** Called to trigger physical feedback on a device */
  onTriggerFeedback: (pointCode: string) => void;
  /** Called to reassign a matched device */
  onReassign: (pointCode: string) => void;
  /** Called to manually assign a Studio device to a point */
  onAssignDevice: (pointCode: string, deviceId: string) => void;
  /** Called to batch-confirm all high-confidence pending points */
  onBatchConfirmHigh: () => void;
  /** Layout variant: 'app' = single column mobile-first, 'ide' = desktop two-column */
  variant?: 'app' | 'ide';
  /** Optional class for the root container */
  className?: string;
}

// ─── Main Component ─────────────────────────────────────────────────────

export function DeviceMappingPanel({
  points,
  studioDevices,
  onConfirm,
  onTriggerFeedback,
  onReassign,
  onAssignDevice,
  onBatchConfirmHigh,
  variant = 'app',
  className,
}: DeviceMappingPanelProps) {
  const [filter, setFilter] = useState<Confidence | 'all'>('all');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(
    new Set(ROOM_ORDER)
  );
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [feedbackTrigger, setFeedbackTrigger] = useState<{ code: string; ts: number } | null>(null);
  const [walkthrough, setWalkthrough] = useState(false);
  const [walkRoomIdx, setWalkRoomIdx] = useState(0);

  const selectedPoint = points.find(p => p.pointCode === selectedCode) ?? null;

  const toggleRoom = (room: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  };

  const summary = useMemo(() => {
    const high = points.filter(p => p.confidence === 'high' && p.status === 'pending').length;
    const medium = points.filter(p => p.confidence === 'medium' && p.status === 'pending').length;
    const manual = points.filter(p => p.confidence === 'manual' && p.status === 'pending').length;
    const confirmed = points.filter(p => p.status === 'confirmed').length;
    return { high, medium, manual, total: points.length, confirmed };
  }, [points]);

  const pendingPoints = points.filter(p => p.status === 'pending');

  const unpairedDevices = studioDevices.filter(
    d => !points.some(p => p.matchedDid === d.did)
  );

  const displayPoints = filter === 'all'
    ? points
    : points.filter(p => p.confidence === filter);

  const roomGroups = ROOM_ORDER.map(room => ({
    room,
    points: displayPoints.filter(p => p.room === room),
  })).filter(g => g.points.length > 0);

  const highPending = points.filter(p => p.confidence === 'high' && p.status === 'pending').length;

  const handleSelectPoint = (code: string) => {
    const pt = points.find(p => p.pointCode === code);
    if (!pt || pt.status === 'confirmed') return;
    setSelectedCode(code);
    setFeedbackTrigger(null);
  };

  const handleTriggerFeedback = (code: string) => {
    onTriggerFeedback(code);
    setFeedbackTrigger({ code, ts: Date.now() });
    setTimeout(() => setFeedbackTrigger(null), 2500);
  };

  const handleConfirm = (code: string) => {
    onConfirm(code);
    setFeedbackTrigger(null);
    // auto-advance to next pending
    setTimeout(() => {
      setSelectedCode(prev => {
        if (!prev) return null;
        const remaining = points.filter(p => p.status === 'pending' && p.pointCode !== code);
        return remaining.length > 0 ? remaining[0].pointCode : null;
      });
    }, 300);
  };

  const isIde = variant === 'ide';

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="text-2xs uppercase tracking-wide text-text-muted font-medium">
          方案设备 · 现场绑定
        </div>
        <span className="text-2xs num text-accent-glow">
          {summary.confirmed} / {points.length}
        </span>
      </div>

      {/* Progress + batch action */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${(summary.confirmed / points.length) * 100}%` }}
          />
        </div>
        {highPending > 0 && (
          <button
            onClick={onBatchConfirmHigh}
            className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition inline-flex items-center gap-1"
          >
            <Zap size={9} /> 一键确认 {highPending} 个
          </button>
        )}
      </div>

      {/* Walkthrough mode toggle */}
      {!walkthrough && pendingPoints.length > 0 && (
        <button
          onClick={() => {
            setWalkthrough(true);
            // Find first room with pending points
            const firstPendingRoom = ROOM_ORDER.find(r =>
              roomGroups.find(g => g.room === r)?.points.some(p => p.status === 'pending')
            );
            setWalkRoomIdx(firstPendingRoom ? ROOM_ORDER.indexOf(firstPendingRoom) : 0);
          }}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-accent/10 to-accent2/10 border border-accent/30 hover:border-accent/50 transition group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <Play size={16} className="text-accent-glow ml-0.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">开始逐房间绑定</div>
              <div className="text-2xs text-text-muted mt-0.5">
               按房间顺序确认设备 — 触发现场反馈 → 绑定方案设备 → 确认映射
              </div>
            </div>
            <span className="ml-auto text-2xs px-2 py-1 rounded bg-accent/10 text-accent-glow border border-accent/30">
              {ROOM_ORDER.filter(r => roomGroups.find(g => g.room === r)?.points.some(p => p.status === 'pending')).length} 个房间待安装
            </span>
          </div>
        </button>
      )}

      {/* Walkthrough guided mode */}
      {walkthrough && (() => {
        const walkRooms = ROOM_ORDER.filter(r =>
          roomGroups.find(g => g.room === r)?.points.some(p => p.status === 'pending')
        );
        const currentRoom = walkRooms[walkRoomIdx];
        const roomGroup = roomGroups.find(g => g.room === currentRoom);
        const roomPending = roomGroup?.points.filter(p => p.status === 'pending') ?? [];
        const roomDone = roomGroup?.points.filter(p => p.status === 'confirmed').length ?? 0;
        const roomTotal = roomGroup?.points.length ?? 0;
        const canPrev = walkRoomIdx > 0;
        const canNext = walkRoomIdx < walkRooms.length - 1;
        const allRoomDone = roomPending.length === 0;

        return (
          <div className="card p-4 border-accent/30 bg-accent/[0.02] space-y-4">
            {/* Walkthrough header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setWalkthrough(false); setSelectedCode(null); }}
                className="p-1.5 rounded-md hover:bg-white/5 text-text-muted transition"
              >
                <ArrowLeft size={14} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Navigation size={11} className="text-accent-glow" />
                  <span>逐房间绑定</span>
                  <span className="text-text-subtle">·</span>
                  <span className="text-text font-medium">{walkRoomIdx + 1}/{walkRooms.length}</span>
                </div>
                <div className="h-1.5 mt-1.5 bg-bg-elevated rounded-full overflow-hidden flex">
                  {walkRooms.map((r, i) => {
                    const rg = roomGroups.find(g => g.room === r);
                    const done = rg?.points.filter(p => p.status === 'confirmed').length ?? 0;
                    const total = rg?.points.length ?? 1;
                    const pct = total > 0 ? done / total : 0;
                    return (
                      <div key={r} className="flex-1 h-full first:rounded-l-full last:rounded-r-full"
                        style={{
                          background: i === walkRoomIdx
                            ? `linear-gradient(90deg, var(--accent) ${pct*100}%, rgba(255,255,255,0.06) ${pct*100}%)`
                            : i < walkRoomIdx
                            ? 'var(--success)'
                            : 'rgba(255,255,255,0.06)'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <span className="text-2xs text-text-muted shrink-0">
                全部 {summary.confirmed}/{points.length}
              </span>
            </div>

            {/* Current room banner */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-elevated border border-border">
              <Home size={18} className="text-accent-glow" />
              <div>
                <div className="text-sm font-semibold text-text">
                  {currentRoom ?? '—'}
                </div>
                <div className="text-2xs text-text-muted">
                  {allRoomDone
                    ? '本房间全部确认 ✓'
                    : `${roomPending.length} 个设备待确认 · 站在房间内逐个触发反馈`}
                </div>
              </div>
              <div className="ml-auto text-2xs text-text-muted">
                {roomDone}/{roomTotal} 已确认
              </div>
            </div>

            {/* Two-column: floor plan + room point list */}
            <div className="grid grid-cols-2 gap-4">
              {/* Floor plan — shows current room points highlighted */}
              <div className="card p-3 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent-glow" /> 户型设备图
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-subtle">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />已确认</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />待确认</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />待绑定</span>
                  </div>
                </div>
                <FloorplanMap
                  points={roomGroup?.points ?? []}
                  allPoints={points}
                  selectedCode={selectedCode}
                  feedbackTrigger={feedbackTrigger}
                  onSelect={handleSelectPoint}
                />
              </div>

              {/* Room point list */}
              <div className="space-y-2 overflow-y-auto max-h-72">
                {(roomGroup?.points ?? []).map(pt => {
                const isSelected = selectedCode === pt.pointCode;
                const isConfirmed = pt.status === 'confirmed';
                const dev = studioDevices.find(d => d.did === pt.matchedDid);
                const FeedbackIcon = FB_ICON[pt.feedback];

                return (
                  <div
                    key={pt.pointCode}
                    onClick={() => !isConfirmed && handleSelectPoint(pt.pointCode)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg border transition cursor-pointer',
                      isConfirmed
                        ? 'border-emerald-500/20 bg-emerald-500/[0.04] opacity-60'
                        : isSelected
                        ? 'border-accent/50 bg-accent/[0.06] shadow-sm'
                        : 'border-border bg-bg-elevated/40 hover:border-border-strong'
                    )}
                  >
                    {/* Status indicator */}
                    {isConfirmed ? (
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0',
                          isSelected ? 'border-accent bg-accent/20' : 'border-border'
                        )}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className={cn('text-sm font-medium', isConfirmed && 'line-through text-text-muted')}>
                        {pt.slot}
                      </div>
                      <div className="text-2xs text-text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{pt.modelLabel}</span>
                        <span className="text-text-subtle">· {pt.pointCode}</span>
                        {dev && (
                          <span className="font-mono text-text-subtle">· DID: {dev.did.slice(-8)}</span>
                        )}
                        {pt.matchedRssi != null && (
                          <span className="flex items-center gap-0.5 text-text-subtle">
                            <Rss size={8} /> {pt.matchedRssi}dBm
                          </span>
                        )}
                      </div>

                      {/* Inline mini action bar for selected point */}
                      {isSelected && !isConfirmed && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTriggerFeedback(pt.pointCode); }}
                            className={cn(
                              'flex-[2] px-3 py-2 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition border',
                              feedbackTrigger?.code === pt.pointCode
                                ? 'bg-amber-500/15 border-amber-400/40 text-amber-400'
                                : 'bg-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                            )}
                          >
                            <FeedbackIcon size={13} />
                            {FB_LABEL[pt.feedback]}确认
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleConfirm(pt.pointCode); }}
                            className="flex-[2] px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={13} /> 确认
                          </button>
                          {pt.matchedDid && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onReassign(pt.pointCode); }}
                              className="px-2.5 py-2 rounded-lg text-xs border border-border text-text-muted hover:text-text transition inline-flex items-center justify-center"
                            >
                              <SwitchCamera size={12} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Feedback animation inline */}
                      {isSelected && feedbackTrigger?.code === pt.pointCode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-2xs text-amber-400 flex items-center gap-2"
                        >
                          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: 3 }}>
                            <FeedbackIcon size={14} />
                          </motion.span>
                          <span>{FB_DESC[pt.feedback]}</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Confidence badge */}
                    {!isConfirmed && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${CONFIDENCE_CFG[pt.confidence].color}10`,
                          color: CONFIDENCE_CFG[pt.confidence].color,
                        }}
                      >
                        {CONFIDENCE_CFG[pt.confidence].label}
                      </span>
                    )}
                  </div>
                );
              })}
              </div>
            </div>

            {/* Room nav buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button
                disabled={!canPrev}
                onClick={() => { setWalkRoomIdx(i => i - 1); setSelectedCode(null); }}
                className="px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text disabled:opacity-30 text-2xs inline-flex items-center gap-1.5 transition"
              >
                <ArrowLeft size={11} /> 上一房间
              </button>
              <div className="flex-1" />
              {allRoomDone && canNext && (
                <button
                  onClick={() => { setWalkRoomIdx(i => i + 1); setSelectedCode(null); }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent2 text-white text-2xs font-medium inline-flex items-center gap-1.5"
                >
                  下一房间 <ArrowRight size={11} />
                </button>
              )}
              {allRoomDone && !canNext && (
                <button
                  onClick={() => setWalkthrough(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-2xs font-medium inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={11} /> 完成安装
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Filter chips — hidden during walkthrough */}
      {!walkthrough && (
        <div className="flex items-center gap-1.5 text-2xs flex-wrap">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="全部" count={points.length} />
          <FilterChip active={filter === 'high'} onClick={() => setFilter('high')} label="高置信" count={summary.high + points.filter(p => p.confidence === 'high' && p.status === 'confirmed').length} color="#10b981" />
          <FilterChip active={filter === 'medium'} onClick={() => setFilter('medium')} label="待确认" count={summary.medium + points.filter(p => p.confidence === 'medium' && p.status === 'confirmed').length} color="#f59e0b" />
          <FilterChip active={filter === 'manual'} onClick={() => setFilter('manual')} label="需人工" count={summary.manual + points.filter(p => p.confidence === 'manual' && p.status === 'confirmed').length} color="#ef4444" />
        </div>
      )}

      {/* Main content: two-column on IDE, single on App — hidden during walkthrough */}
      {!walkthrough && (
      <div className={cn(isIde ? 'grid grid-cols-2 gap-4' : 'space-y-3')}>
        {/* Floorplan */}
        <div className="card p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium flex items-center gap-1.5">
              <MapPin size={12} className="text-accent-glow" /> 户型设备图
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-subtle">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />已确认</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />待确认</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />待绑定</span>
            </div>
          </div>
          <FloorplanMap
            points={displayPoints}
            allPoints={points}
            selectedCode={selectedCode}
            feedbackTrigger={feedbackTrigger}
            onSelect={handleSelectPoint}
          />
        </div>

        {/* Device list + action bar column */}
        <div className="space-y-3">
          {/* Room-grouped device list */}
          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium flex items-center gap-1.5">
                <Cpu size={12} className="text-text-muted" /> 方案设备 · 按房间
              </div>
              <span className="text-[10px] text-text-subtle">{studioDevices.length} 在线</span>
            </div>
            <div className={cn('space-y-0.5 overflow-y-auto', isIde ? 'max-h-80' : 'max-h-72')}>
              {roomGroups.map(group => {
                const confirmed = group.points.filter(p => p.status === 'confirmed').length;
                const isExpanded = expandedRooms.has(group.room);
                return (
                  <div key={group.room}>
                    <button
                      onClick={() => toggleRoom(group.room)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-bg-subtle/50 transition"
                    >
                      <ChevronRight
                        size={12}
                        className={cn('text-text-subtle transition-transform', isExpanded && 'rotate-90')}
                      />
                      <span className="text-2xs font-medium text-text">{group.room}</span>
                      <span className="text-[10px] text-text-subtle ml-auto">
                        {confirmed}/{group.points.length}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden ml-4 space-y-0.5"
                        >
                          {group.points.map(pt => {
                            const dev = studioDevices.find(d => d.did === pt.matchedDid);
                            return (
                              <DeviceItem
                                key={pt.pointCode}
                                point={pt}
                                device={dev}
                                selected={selectedCode === pt.pointCode}
                                feedbackActive={feedbackTrigger?.code === pt.pointCode}
                                onClick={() => handleSelectPoint(pt.pointCode)}
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action bar */}
          <AnimatePresence>
            {selectedPoint && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="card p-4 border-accent/40 shadow-lg shadow-accent/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-2xs font-bold"
                      style={{
                        background: `${CONFIDENCE_CFG[selectedPoint.confidence].color}18`,
                        border: `1px solid ${CONFIDENCE_CFG[selectedPoint.confidence].color}40`,
                        color: CONFIDENCE_CFG[selectedPoint.confidence].color,
                      }}
                    >
                      {selectedPoint.pointCode}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${CONFIDENCE_CFG[selectedPoint.confidence].color}10`,
                        color: CONFIDENCE_CFG[selectedPoint.confidence].color,
                      }}
                    >
                      {CONFIDENCE_CFG[selectedPoint.confidence].label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{selectedPoint.room} · {selectedPoint.slot}</div>
                    <div className="text-2xs text-text-muted mt-0.5 truncate">
                      {selectedPoint.modelLabel}
                      {selectedPoint.matchedDid && (
                        <span className="ml-1.5 font-mono text-text-subtle">DID: {selectedPoint.matchedDid.slice(-8)}</span>
                      )}
                      <span className="ml-1.5 text-text-subtle">· {mappingReasonText(selectedPoint)}</span>
                    </div>
                  </div>
                  {selectedPoint.matchedDid && (
                    <div className="text-right shrink-0">
                      <div className="text-2xs text-text-subtle flex items-center gap-1">
                        <Rss size={9} /> {selectedPoint.matchedRssi}dBm
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback animation */}
                <AnimatePresence>
                  {feedbackTrigger && feedbackTrigger.code === selectedPoint.pointCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-2xs text-amber-400 flex items-center gap-2 overflow-hidden relative"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6, repeat: 3 }}
                      >
                        {(() => { const Icon = FB_ICON[selectedPoint.feedback]; return <Icon size={15} />; })()}
                      </motion.span>
                      <span className="font-medium">{FB_DESC[selectedPoint.feedback]}</span>
                      <span className="text-amber-500/60">— 看到现场反馈后请确认</span>
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-amber-400/40"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 2, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                {selectedPoint.matchedDid ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTriggerFeedback(selectedPoint.pointCode)}
                      className={cn(
                        'flex-[2] px-3 py-2.5 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition border',
                        feedbackTrigger?.code === selectedPoint.pointCode
                          ? 'bg-amber-500/15 border-amber-400/40 text-amber-400'
                          : 'bg-bg-elevated border-border text-text-muted hover:border-amber-500/30 hover:text-amber-400 active:scale-[0.98]'
                      )}
                    >
                      {(() => { const Icon = FB_ICON[selectedPoint.feedback]; return <Icon size={13} />; })()}
                      {feedbackTrigger?.code === selectedPoint.pointCode ? '再次' : ''}{FB_LABEL[selectedPoint.feedback]}
                    </button>
                    <button
                      onClick={() => handleConfirm(selectedPoint.pointCode)}
                      className="flex-[3] px-3 py-2.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={13} /> 确认安装
                    </button>
                    <button
                      onClick={() => onReassign(selectedPoint.pointCode)}
                      className="flex-1 px-2.5 py-2.5 rounded-lg text-xs border border-border text-text-muted hover:text-text hover:border-border-strong active:scale-[0.98] transition inline-flex items-center justify-center gap-1"
                    >
                      <SwitchCamera size={12} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xs text-text-muted mb-2">选择现场设备进行人工绑定：</div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {unpairedDevices.map(d => (
                        <button
                          key={d.id}
                          onClick={() => onAssignDevice(selectedPoint.pointCode, d.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:border-accent/40 active:bg-accent/[0.04] text-left text-2xs transition"
                        >
                          <span className="font-mono text-text font-medium w-16 truncate">{d.did.slice(-8)}</span>
                          <span className="text-text-muted">{deviceDisplayName(d)}</span>
                          <span className="text-text-subtle text-[10px]">{d.model}</span>
                          {d.model !== selectedPoint.model && (
                            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-400">能力绑定</span>
                          )}
                          <span className="ml-auto text-text-subtle flex items-center gap-1"><Rss size={8} /> {d.rssi}dBm</span>
                        </button>
                      ))}
                      {unpairedDevices.length === 0 && (
                        <div className="text-2xs text-text-subtle text-center py-2">所有设备已分配</div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No selection hint */}
          {!selectedPoint && pendingPoints.length > 0 && (
            <div className="text-center text-2xs text-text-subtle py-2">
              点击户型图设备或设备列表，开始确认绑定
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// ─── FilterChip ─────────────────────────────────────────────────────────

function FilterChip({
  active, onClick, label, count, color,
}: {
  active: boolean; onClick: () => void; label: string; count: number; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-2xs border transition inline-flex items-center gap-1',
        active
          ? 'bg-accent/10 border-accent/40 text-accent-glow'
          : 'border-border text-text-muted hover:border-border-strong'
      )}
      style={active && color ? { borderColor: `${color}50`, background: `${color}15`, color } : undefined}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

// ─── FloorplanMap ────────────────────────────────────────────────────────

function FloorplanMap({
  points, allPoints, selectedCode, feedbackTrigger, onSelect,
}: {
  points: PlanPoint[];
  allPoints: PlanPoint[];
  selectedCode: string | null;
  feedbackTrigger: { code: string; ts: number } | null;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="relative h-72 rounded-xl border border-border bg-bg-elevated overflow-hidden">
      <div className="absolute inset-0 opacity-60 text-text-subtle">
        <FloorplanSVG pattern="rooms" showDevices={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/20 pointer-events-none" />

      {/* Room labels */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '70%', top: '23%' }}>客厅</span>
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '25%', top: '30%' }}>主卧</span>
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '50%', top: '60%' }}>次卧</span>
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '77%', top: '65%' }}>厨房</span>
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '62%', top: '75%' }}>主卫</span>
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '45%', top: '78%' }}>入户</span>
        <span className="absolute text-[10px] text-text-subtle/60 font-medium" style={{ left: '52%', top: '52%' }}>走廊</span>
      </div>

      {points.map(pt => {
        const active = selectedCode === pt.pointCode;
        const isFeedback = feedbackTrigger?.code === pt.pointCode;
        const FeedbackIcon = FB_ICON[pt.feedback];

        let dotBg = 'bg-bg-elevated/90 text-text-muted border-border';
        let dotRing = '';
        let dotScale = 'scale-100';
        if (pt.status === 'confirmed') {
          dotBg = 'bg-emerald-500 text-white border-emerald-400/60';
        } else if (active) {
          dotBg = 'bg-amber-500 text-white border-amber-300';
          dotRing = 'ring-2 ring-amber-400/40';
          dotScale = 'scale-110';
        } else if (pt.confidence === 'manual') {
          dotBg = 'bg-red-500/80 text-white border-red-400/40';
        } else if (pt.confidence === 'high') {
          dotBg = 'bg-emerald-500/70 text-white border-emerald-400/30';
        }

        return (
          <div
            key={pt.pointCode}
            className={cn('absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform', dotScale)}
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          >
            {isFeedback && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-amber-400/60"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.2, repeat: 2 }}
              />
            )}
            <button
              onClick={() => onSelect(pt.pointCode)}
              className={cn(
                'relative w-8 h-8 rounded-full border shadow-md flex items-center justify-center transition-all',
                dotBg, dotRing,
                pt.status !== 'confirmed' && 'hover:scale-115 cursor-pointer active:scale-95',
                pt.status === 'confirmed' && 'cursor-default'
              )}
            >
              {pt.status === 'confirmed' ? <CheckCircle2 size={15} /> : <FeedbackIcon size={13} />}
            </button>
            <div
              className={cn(
                'absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] border backdrop-blur-md font-medium',
                pt.status === 'confirmed'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : active
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-bg/85 border-border text-text-muted'
              )}
            >
              {pt.pointCode}
            </div>
          </div>
        );
      })}

      {/* Dimmed confirmed points from other filters */}
      {allPoints.filter(p => !points.includes(p) && p.status === 'confirmed').map(pt => (
        <div
          key={pt.pointCode}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-5 opacity-30"
          style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/40 border border-emerald-400/30 flex items-center justify-center">
            <CheckCircle2 size={11} className="text-white" />
          </div>
        </div>
      ))}

      {/* Bottom legend */}
      {selectedCode && (() => {
        const pt = allPoints.find(p => p.pointCode === selectedCode);
        if (!pt) return null;
        return (
          <div className="absolute left-3 right-3 bottom-3 rounded-xl border border-border bg-bg/90 backdrop-blur-md p-2.5">
            <div className="flex items-center gap-2 text-2xs">
              <span
                className="px-1.5 py-0.5 rounded font-bold"
                style={{ background: `${CONFIDENCE_CFG[pt.confidence].color}18`, color: CONFIDENCE_CFG[pt.confidence].color }}
              >
                {pt.pointCode}
              </span>
              <span className="font-medium text-text">{pt.room} · {pt.slot}</span>
              <span className="text-text-muted truncate">{pt.modelLabel} → {pt.matchedDid ? pt.matchedDid.slice(-8) : '待绑定'}</span>
              {pt.status === 'confirmed' ? (
                <span className="ml-auto text-emerald-400 text-[10px]">已确认</span>
              ) : (
                <span className="ml-auto text-2xs text-text-subtle">点击触发反馈</span>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── DeviceItem ──────────────────────────────────────────────────────────

function DeviceItem({
  point, device, selected, feedbackActive, onClick,
}: {
  point: PlanPoint;
  device?: StudioDevice;
  selected: boolean;
  feedbackActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition border',
        point.status === 'confirmed'
          ? 'border-emerald-500/15 bg-emerald-500/[0.03]'
          : selected
          ? 'border-amber-500/40 bg-amber-500/[0.06] shadow-sm'
          : 'border-transparent hover:border-border hover:bg-bg-subtle'
      )}
    >
      {point.status === 'confirmed' ? (
        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
      ) : feedbackActive ? (
        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: 3 }}>
          {(() => { const Icon = FB_ICON[point.feedback]; return <Icon size={13} className="text-amber-400 shrink-0" />; })()}
        </motion.span>
      ) : (
        <div className={cn(
          'w-2.5 h-2.5 rounded-full shrink-0',
          point.confidence === 'manual' ? 'bg-red-400' :
          point.confidence === 'medium' ? 'bg-amber-400' : 'bg-emerald-400/60'
        )} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-2xs font-bold text-text">{point.pointCode}</span>
          <span className="text-[10px] text-text-muted truncate">{point.slot}</span>
        </div>
        <div className="text-[10px] text-text-subtle mt-0.5">
          {point.modelLabel}
          {device && <span className="ml-1 font-mono text-text-subtle/70">· {device.did.slice(-8)}</span>}
          {device && <span className="ml-1 text-text-subtle/70">· {mappingReasonText(point)}</span>}
          {!device && point.status !== 'confirmed' && <span className="ml-1 text-red-400/70">待绑定</span>}
        </div>
      </div>

      {point.status !== 'confirmed' && (
        <span
          className="text-[9px] px-1 py-0.5 rounded-full border shrink-0"
          style={{
            background: `${CONFIDENCE_CFG[point.confidence].color}08`,
            borderColor: `${CONFIDENCE_CFG[point.confidence].color}25`,
            color: CONFIDENCE_CFG[point.confidence].color,
          }}
        >
          {CONFIDENCE_CFG[point.confidence].label}
        </span>
      )}
    </button>
  );
}

export default DeviceMappingPanel;
