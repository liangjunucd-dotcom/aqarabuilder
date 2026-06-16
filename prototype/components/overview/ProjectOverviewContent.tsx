'use client';

import { FileText } from 'lucide-react';
import { CustomerBriefCard } from './CustomerBriefCard';
import { SolutionOverviewContent } from './SolutionOverviewContent';
import type { Project } from '@/lib/mock/projects';
import type { Customer } from '@/lib/mock/customers';
import type { CustomerBrief } from '@/lib/mock/customer-briefs';

export function ProjectOverviewContent({
  project, customer, customerBrief, onLinkCustomer,
}: {
  project: Project;
  customer: Customer | null;
  customerBrief: CustomerBrief | null;
  onLinkCustomer?: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Solution content first (IDE summary, floorplan, versions) */}
      <SolutionOverviewContent
        project={project}
        customer={customer}
        customerBrief={customerBrief}
        onLinkCustomer={onLinkCustomer}
      />

      {/* Customer info card (for projects with customers) */}
      {customer && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ background: customer.avatarGradient }}
            >
              {customer.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold">{customer.name}</h2>
              <p className="text-2xs text-text-muted">{customer.city} · {customer.spaceName}</p>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted">
              {customer.tag}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-2xs">
            <div>
              <span className="text-text-subtle">Studios</span>
              <p className="text-text mt-0.5">{customer.studios.length} 台</p>
            </div>
            <div>
              <span className="text-text-subtle">累计项目</span>
              <p className="text-text mt-0.5">{customer.projects} 个</p>
            </div>
            <div>
              <span className="text-text-subtle">Lifetime Value</span>
              <p className="text-text mt-0.5 num">¥{customer.lifetimeValue.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-text-subtle">最近联系</span>
              <p className="text-text mt-0.5">{customer.lastContact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Customer brief */}
      {customerBrief && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">客户需求档案</h2>
          </div>
          <CustomerBriefCard brief={customerBrief} />
        </div>
      )}
    </div>
  );
}
