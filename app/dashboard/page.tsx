// app/dashboard/page.tsx

import Link from 'next/link'
import PageContainer from '@/components/ui/page-container'
import { DashboardEntry } from '@/components/dashboard/dynasty-entry'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
    return (
        <PageContainer>
            <header className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-text">Dashboard</h1>
                    <p className="text-sm text-text/80">
                        Open an existing dynasty or create a new one to begin tracking your run.
                    </p>
                </div>
                <Link
                    href="/dashboard/profile"
                    className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'shrink-0')}
                >
                    Edit Profile
                </Link>
            </header>

            <DashboardEntry />
        </PageContainer>
    )
}
