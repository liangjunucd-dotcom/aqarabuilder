'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Target, AlertTriangle, Zap, Camera, ChevronDown, MessageSquare,
  MapPin, Home, Monitor, CheckCircle2, FileText, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomerBrief } from '@/lib/mock/customer-briefs';

function Section({ title, icon: Icon, children, className }: {
  title: string; icon: any; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('card p-4', className)}>
      <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-3">
        <Icon size={13} className="text-accent-glow" />
        {title}
      </h3>
      {children}
    </div>
  );
}

const CHANNEL_BADGE: Record<string, { label: string; color: string }> = {
  email: { label: '邮件询单', color: '#6366f1' },
  chat:   { label: '在线咨询', color: '#10b981' },
  form:   { label: '表单提交', color: '#f59e0b' },
};

export function CustomerBriefCard({ brief, compact }: { brief: CustomerBrief; compact?: boolean }) {
  const [showRaw, setShowRaw] = useState(false);
  const channel = CHANNEL_BADGE[brief.channel] ?? CHANNEL_BADGE['form'];
  const { persona, homeFacts, sensorPlan, attachments, aiSummary, automationFocus, rawText, subject, capturedAt } = brief;

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {/* AI Summary */}
      <Section title="AI 需求摘要" icon={Sparkles}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded border"
            style={{ background: `${channel.color}15`, borderColor: `${channel.color}40`, color: channel.color }}
          >
            {channel.label}
          </span>
          {persona.household && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted inline-flex items-center gap-1">
              <Users size={10} /> {persona.household}
            </span>
          )}
          {homeFacts.sizeSqm && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted inline-flex items-center gap-1">
              <Home size={10} /> {homeFacts.sizeSqm} m²
            </span>
          )}
          {persona.platform && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted inline-flex items-center gap-1">
              <Monitor size={10} /> {persona.platform}
            </span>
          )}
        </div>
        <p className="text-2xs text-text-muted leading-relaxed">{aiSummary}</p>
      </Section>

      {/* Goals + Constraints */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section title="核心目标" icon={Target}>
            <ul className="space-y-2 text-2xs">
              {persona.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
                  <span className="text-text-muted">{g}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="限制条件" icon={AlertTriangle}>
            <ul className="space-y-2 text-2xs">
              {persona.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" />
                  <span className="text-text-muted">{c}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* Automation focus */}
      <Section title="自动化重点" icon={Zap}>
        <p className="text-2xs text-text-muted">{automationFocus}</p>
      </Section>

      {/* Sensor plan */}
      <Section title="分区传感器方案" icon={MapPin}>
        <div className="overflow-x-auto">
          <table className="w-full text-2xs">
            <thead>
              <tr className="text-text-subtle border-b border-border">
                <th className="text-left py-1.5 pr-2 font-medium">区域</th>
                <th className="text-left py-1.5 pr-2 font-medium">传感器</th>
                <th className="text-left py-1.5 font-medium hidden sm:table-cell">依据</th>
              </tr>
            </thead>
            <tbody>
              {sensorPlan.map((s, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-1.5 pr-2 text-text">{s.area}</td>
                  <td className="py-1.5 pr-2 font-mono text-[10px] text-accent-glow">{s.sensors}</td>
                  <td className="py-1.5 text-text-muted hidden sm:table-cell">{s.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Attachments */}
      {attachments.length > 0 && (
        <Section title="客户附件" icon={Camera}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {attachments.map(att => (
              <div key={att.id} className="card overflow-hidden border border-border">
                <div className="h-20 bg-bg-elevated flex items-center justify-center text-text-subtle text-[10px]">
                  {att.type === 'image' ? <Camera size={20} /> : <FileText size={20} />}
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-text-muted truncate">{att.name}</p>
                  {att.caption && <p className="text-[9px] text-text-subtle mt-0.5 line-clamp-1">{att.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Raw inquiry (expandable) */}
      <div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center gap-2 text-2xs text-text-muted hover:text-text transition px-2 py-1.5"
        >
          <MessageSquare size={11} />
          <span>原始需求消息</span>
          {subject && <span className="text-text-subtle truncate">· {subject}</span>}
          <ChevronDown size={11} className={cn('ml-auto transition', showRaw && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <pre className="mt-1 p-3 bg-bg rounded-lg border border-border text-[10px] text-text-muted leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {rawText}
              </pre>
              <p className="mt-1 text-[9px] text-text-subtle px-1">{capturedAt.slice(0, 10)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
