// components/dashboard/dashboard-header.tsx

import Link from 'next/link'
import { buttonStyles } from '@/components/ui/button'

interface DashboardHeaderProps {
    title: string
    description?: string
    action?: {
        label: string
        href: string
    }
}

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
    return (
        <header className="flex items-center justify-between gap-3">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-text">{title}</h1>
                {description && (
                    <p className="text-sm text-text/80">{description}</p>
                )}
            </div>
            {action && (
                <Link
                    href={action.href}
                    {...buttonStyles({ size: 'sm', bg: 'var(--secondary)', text: 'white' })}
                >
                    {action.label}
                </Link>
            )}
        </header>
    )
}
