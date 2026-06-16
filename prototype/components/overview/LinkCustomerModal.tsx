'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, X, Users, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MyCustomers, type Customer } from '@/lib/mock/customers';
import { saveCubixLocalProject, getAllProjects, type Project } from '@/lib/mock/projects';

const TAG_COLOR: Record<string, string> = {
  eldercare: '#10b981',
  family: '#a855f7',
  rental: '#f59e0b',
  villa: '#06b6d4',
  geek: '#6366f1',
  minimal: '#64748b',
};

export function LinkCustomerModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [linking, setLinking] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    if (!q.trim()) return MyCustomers;
    const s = q.trim().toLowerCase();
    return MyCustomers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s) ||
      c.tag.toLowerCase().includes(s)
    );
  }, [q]);

  const handleLink = (customer: Customer) => {
    setLinking(customer.id);
    // Build a clean copy with customer fields set — don't mutate source objects
    const all = getAllProjects();
    const target = all.find(p => p.id === project.id);
    if (target) {
      const updated: Project = {
        ...target,
        customerId: customer.id,
        customerName: customer.name,
        tags: target.tags?.length ? target.tags : [customer.tag],
        city: target.city ?? customer.city,
        // If a solution gets a customer, it becomes a client-facing project
        origin: target.origin || 'pro-console',
      };
      saveCubixLocalProject(updated);
    }
    setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 800);
    }, 400);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[500px] rounded-xl border border-border bg-bg-elevated shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Users size={16} className="text-accent-glow" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">关联客户</h2>
              <p className="text-2xs text-text-muted">
                选择一个已有客户，将方案转为交付项目
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted"><X size={15} /></button>
          </div>

          {!done ? (
            <>
              {/* Search */}
              <div className="px-5 py-3 border-b border-border">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                  <input
                    value={q} onChange={e => setQ(e.target.value)}
                    placeholder="搜索客户姓名、城市、标签..."
                    className="w-full pl-7 pr-2 py-2 text-xs rounded-lg bg-bg border border-border focus:border-accent/50 outline-none transition"
                    autoFocus
                  />
                </div>
              </div>

              {/* Customer list */}
              <div className="max-h-[360px] overflow-y-auto px-3 py-2 space-y-1">
                {filtered.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm text-text-muted mb-1">未找到匹配客户</p>
                    <p className="text-2xs text-text-muted">尝试其他搜索词，或先在客户管理中新建客户</p>
                  </div>
                )}
                {filtered.map(customer => {
                  const isLinking = linking === customer.id;
                  return (
                    <button
                      key={customer.id}
                      onClick={() => !linking && handleLink(customer)}
                      disabled={!!linking}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition',
                        isLinking
                          ? 'bg-accent/10 border border-accent/30'
                          : 'hover:bg-white/5 border border-transparent'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: customer.avatarGradient }}
                      >
                        {customer.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text truncate">{customer.name}</div>
                        <div className="text-[10px] text-text-muted flex items-center gap-1.5">
                          <span className="flex items-center gap-0.5"><MapPin size={9} /> {customer.city}</span>
                          <span>· {customer.spaceName}</span>
                        </div>
                      </div>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0"
                        style={{
                          background: `${TAG_COLOR[customer.tag] || '#64748b'}15`,
                          borderColor: `${TAG_COLOR[customer.tag] || '#64748b'}40`,
                          color: TAG_COLOR[customer.tag] || '#64748b',
                        }}
                      >
                        {customer.tag}
                      </span>
                      {isLinking && (
                        <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="px-5 py-16 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-success" />
              </div>
              <p className="text-sm text-text">客户已关联</p>
              <p className="text-2xs text-text-muted">页面即将刷新...</p>
            </div>
          )}

          <div className="flex items-center gap-2 px-5 py-3.5 border-t border-border bg-bg/80">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:text-text transition">
              取消
            </button>
            <div className="flex-1" />
            <p className="text-2xs text-text-subtle">
              共 {MyCustomers.length} 位客户
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
