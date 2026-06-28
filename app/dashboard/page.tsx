// app/dashboard/page.tsx

import PageContainer from '@/components/ui/page-container'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardClientWrapper } from '@/components/dashboard/dashboard-client-wrapper'

export default function DashboardPage() {
    return (
        <PageContainer>
            <DashboardHeader
                title="Dashboard"
                description="Open an existing dynasty or create a new one to begin tracking your run."
                action={{ label: 'Edit Profile', href: '/dashboard/profile' }}
            />

            <DashboardClientWrapper />
        </PageContainer>
    )
}
