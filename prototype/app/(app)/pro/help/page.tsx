import { HelpCircle } from 'lucide-react';
import { ProWipPage, WipPanel } from '@/components/workshop/ProWipPage';

export default function ProHelpPage() {
  return (
    <ProWipPage icon={HelpCircle} title="帮助中心" desc="文档 · 视频 · Builder 社区">
      <WipPanel title="帮助中心建设中" note="将包含 Getting Started / Forge SDK 文档 / 视频教程 / Builder 社区论坛 / 提交工单。" />
    </ProWipPage>
  );
}
