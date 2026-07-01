// components/dashboard/dashboard-loading-state.tsx

import { Card, CardContent } from '@/components/ui/layout/card'

export function DashboardLoadingState() {
    return (
        <Card>
            <CardContent className="p-8">
                <p className="text-sm text-text/80">Loading your dynasties...</p>
            </CardContent>
        </Card>
    )
}
