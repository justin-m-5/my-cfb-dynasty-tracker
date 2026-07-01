// components/dashboard/dashboard-empty-state.tsx

import Link from 'next/link'
import { buttonStyles } from '@/lib/button-utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/layout/card'

export function DashboardEmptyState() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">No dynasties yet</CardTitle>
                <CardDescription>
                    Start your first dynasty to track seasons, coaching changes, and school history.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0" />
            <CardFooter className="justify-start">
                <Link
                    href="/dashboard/create-dynasty"
                    {...buttonStyles({ bg: 'var(--primary)', text: 'white', className: 'font-bold' })}
                >
                    Create Dynasty
                </Link>
            </CardFooter>
        </Card>
    )
}
