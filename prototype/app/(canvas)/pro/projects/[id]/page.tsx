import { redirect } from 'next/navigation';
import { MyProjects } from '@/lib/mock/projects';

export function generateStaticParams() {
  return MyProjects.map(p => ({ id: p.id }));
}

export default function ProjectDesignRedirect({ params }: { params: { id: string } }) {
  const query = new URLSearchParams({
    entry: 'pro',
    demo_as: 'pro',
    workflow: 'space',
    project: params.id,
  });

  redirect(`/build?${query.toString()}`);
}
