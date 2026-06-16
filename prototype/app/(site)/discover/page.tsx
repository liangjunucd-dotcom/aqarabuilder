'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DiscoverRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home/discover');
  }, [router]);

  return null;
}
