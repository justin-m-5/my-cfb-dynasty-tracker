// components/layout/top-bar.tsx

'use client'

import Link from 'next/link'
import { UserMenu } from './user-menu'

export function TopBar() {
    return (
        <header className="border-b border-primary/10 bg-background/90 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                <Link
                    href="/dashboard"
                    className="text-lg font-bold text-text hover:text-primary transition-colors"
                >
                    CFB Dynasty Tracker
                </Link>

                <UserMenu />
            </div>
        </header>
    )
}
