'use client';

import { useEffect, useState } from 'react';
import { getProject, type Project } from '@/lib/mock/projects';

/** 客户端解析项目（避免 SSR 时 localStorage 未就绪导致误触发 notFound） */
export function useClientProject(id: string | undefined): Project | null | undefined {
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setProject(null);
      return;
    }
    setProject(getProject(id) ?? null);
  }, [id]);

  return project;
}
