'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SolutionsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/pro/projects'); }, [router]);
  return null;
}
