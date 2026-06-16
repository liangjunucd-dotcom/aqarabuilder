'use client';

import { useState } from 'react';
import { CopilotHeader } from '@/components/copilot/CopilotHeader';
import { CopilotLeftRail } from '@/components/copilot/CopilotLeftRail';
import { CopilotWorkspace } from '@/components/copilot/CopilotWorkspace';
import { CopilotChat } from '@/components/copilot/CopilotChat';
import { CommandPalette, useCommandPalette } from '@/components/copilot/CommandPalette';
import { DeployFlowModal } from '@/components/copilot/DeployFlowModal';
import { CopilotOnboarding } from '@/components/copilot/CopilotOnboarding';
import { AGENTS } from '@/lib/mock/agents';

export default function CopilotStudioPage() {
  const [studioId, setStudioId] = useState('aq-eldercare-zhang');
  const [activeAgents, setActiveAgents] = useState<string[]>(
    AGENTS.filter(a => a.enabledByDefault).map(a => a.id)
  );
  const cmd = useCommandPalette();
  const [deployOpen, setDeployOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <CopilotHeader
        projectName="适老化方案 · 张奶奶家"
        activeStudioId={studioId}
        onStudioChange={setStudioId}
        onOpenCommandPalette={() => cmd.setOpen(true)}
      />
      <div className="flex-1 flex min-h-0">
        <CopilotLeftRail
          activeAgents={activeAgents}
          onToggleAgent={(id) =>
            setActiveAgents(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
          }
        />
        <CopilotWorkspace studioId={studioId} />
        <CopilotChat onApproveDeploy={() => setDeployOpen(true)} />
      </div>

      {/* Overlays */}
      <CommandPalette open={cmd.open} onClose={() => cmd.setOpen(false)} />
      <DeployFlowModal open={deployOpen} onClose={() => setDeployOpen(false)} />
      <CopilotOnboarding />
    </div>
  );
}
