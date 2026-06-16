'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BottomNav } from '../../components/BottomNav'
import { Cpu } from 'lucide-react'

function DevicesContent() {
  const params = useSearchParams()
  const studioName = params?.get('studio') ?? undefined
  const config     = params?.get('config') ?? undefined
  const persona    = params?.get('persona') ?? undefined

  const configApplied = studioName && config === 'accepted'
  const studioExtra   = configApplied && persona ? `config=accepted&persona=${persona}` : undefined

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <Cpu size={40} className="text-text-subtle mb-4"/>
        <p className="text-sm font-medium text-text mb-1">设备管理</p>
        <p className="text-2xs text-text-muted">即将上线</p>
      </div>
      <BottomNav
        active="设备"
        mode={configApplied ? 'studio' : 'solo'}
        studioName={studioName}
        studioExtra={studioExtra}
      />
    </div>
  )
}

export default function DevicesPage() {
  return <Suspense><DevicesContent/></Suspense>
}
