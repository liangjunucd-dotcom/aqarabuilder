import type { ReactNode } from 'react';
import { BuilderFrontShell } from '@/components/layout/BuilderFrontShell';

export function HomeShell({ children }: { children: ReactNode }) {
  return <BuilderFrontShell>{children}</BuilderFrontShell>;
}
