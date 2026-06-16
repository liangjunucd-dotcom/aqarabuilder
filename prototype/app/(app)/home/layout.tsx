import { HomeShell } from '@/components/layout/HomeShell';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <HomeShell>{children}</HomeShell>;
}
