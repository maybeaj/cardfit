import type { ReactNode } from 'react'
import { DemoProvider } from '@/state/store'
import { PhoneShell } from '@/components/ui'

export default function AppDemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <PhoneShell>{children}</PhoneShell>
    </DemoProvider>
  )
}
