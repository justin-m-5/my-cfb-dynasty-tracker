// app/dashboard/dynasty/[id]/layout.tsx

import { ReactNode } from 'react'

interface DynastyLayoutProps {
    children: ReactNode
}

export default function DynastyLayout({ children }: DynastyLayoutProps) {
    return (
        <div className="flex min-h-full flex-col gap-4">
            <main className="flex flex-1 flex-col gap-4">
                {children}
            </main>
        </div>
    )
}
