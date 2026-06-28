// app/dashboard/layout.tsx

import { TopBar } from '@/components/layout/top-bar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TopBar />
            <div className="mx-auto max-w-7xl px-2 py-8 w-full">
                {children}
            </div>
        </>
    )
}
