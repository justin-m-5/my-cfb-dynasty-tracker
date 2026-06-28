// components/dashboard/dashboard-empty-state.tsx

import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
                    href="/dashboard/create"
                    className={cn(buttonVariants({ variant: 'default' }), 'font-bold text-white')}
                >
                    Create Dynasty
                </Link>
            </CardFooter>
        </Card>
    )
}
