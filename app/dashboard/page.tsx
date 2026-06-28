// app/dashboard/page.tsx

import PageContainer from '@/components/ui/page-container'
import { DashboardClientWrapper } from '@/components/dashboard/dashboard-client-wrapper'
import { PageHeader } from '@/components/ui/page-header'

export default function DashboardPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Dashboard"
                description="Open an existing dynasty or create a new one to begin tracking your run."
            />

            <DashboardClientWrapper />
        </PageContainer>
    )
}
