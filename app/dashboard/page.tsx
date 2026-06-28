// app/dashboard/page.tsx

import PageContainer from '@/components/ui/page-container'
import { DashboardEntry } from '@/components/dashboard/dashboard-entry'

export default function DashboardPage() {
    return (
        <PageContainer>
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-text">Dashboard</h1>
            </header>

            <DashboardEntry />
        </PageContainer>
    )
}
