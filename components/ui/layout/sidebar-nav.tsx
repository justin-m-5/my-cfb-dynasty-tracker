// components/ui/sidebar-nav.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export interface SidebarNavItem {
    name: string
    key: string
    href?: string
}

interface SidebarNavProps {
    items: SidebarNavItem[]
    active: string
    onChange?: (key: string) => void
}

export function SidebarNav({ items, active, onChange }: SidebarNavProps) {
    const [open, setOpen] = useState(false)

    const handleSelect = (key: string) => {
        onChange?.(key)
        setOpen(false)
    }

    const activeLabel = items.find(i => i.key === active)?.name

    const itemClasses = (isActive: boolean) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-primary text-white' : 'text-text/70 hover:bg-primary/10 hover:text-text'
    }`

    return (
        <>
            {/* Toggle button — always visible */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed top-20 right-4 z-40 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-background p-4 text-xs font-medium text-text/80 shadow-sm cursor-pointer"
            >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                {!open && <span>{activeLabel}</span>}
            </button>

            {/* Slide-out drawer */}
            {open && (
                <div className="fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    <nav className="absolute right-0 top-0 h-full w-56 bg-background border-l border-primary/20 shadow-lg pt-36 px-3">
                        <div className="space-y-1">
                            {items.map(item =>
                                item.href ? (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`block ${itemClasses(active === item.key)}`}
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <button
                                        key={item.key}
                                        onClick={() => handleSelect(item.key)}
                                        className={`w-full text-left ${itemClasses(active === item.key)}`}
                                    >
                                        {item.name}
                                    </button>
                                )
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </>
    )
}
