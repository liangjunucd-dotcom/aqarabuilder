'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function FloorPlanActivationBridge() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams({
      entry: 'pro',
      demo_as: 'pro',
      workflow: 'space',
    });
    const projectId = firstParam(searchParams?.get('project') ?? undefined);
    const leadId = firstParam(searchParams?.get('lead') ?? undefined);
    const floorplanId = firstParam(searchParams?.get('floorplan') ?? undefined);

    if (projectId) query.set('project', projectId);
    if (leadId) query.set('lead', leadId);
    if (floorplanId) query.set('floorplan', floorplanId);

    router.replace(`/build?${query.toString()}`);
  }, [searchParams, router]);

  return null;
}
