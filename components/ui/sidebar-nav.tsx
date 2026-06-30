// components/ui/sidebar-nav.tsx

'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface SidebarNavItem {
    name: string
    key: string
}

interface SidebarNavProps {
    items: SidebarNavItem[]
    active: string
    onChange: (key: string) => void
}

export function SidebarNav({ items, active, onChange }: SidebarNavProps) {
    const [open, setOpen] = useState(false)

    const handleSelect = (key: string) => {
        onChange(key)
        setOpen(false)
    }

    return (
        <>
            {/* Mobile: toggle button */}
            <button
                onClick={() => setOpen(!open)}
                className="md:hidden fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-background px-2.5 py-1.5 text-xs font-medium text-text/80 shadow-sm"
            >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                {!open && <span>{items.find(i => i.key === active)?.name}</span>}
            </button>

            {/* Mobile: slide-out sidebar */}
            {open && (
                <div className="md:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    <nav className="absolute right-0 top-0 h-full w-52 bg-background border-l border-primary/20 shadow-lg pt-14 px-3">
                        <div className="space-y-1">
                            {items.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => handleSelect(item.key)}
                                    className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                        active === item.key
                                            ? 'bg-primary text-white'
                                            : 'text-text/70 hover:bg-primary/10 hover:text-text'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>
            )}

            {/* Desktop: horizontal tabs inline */}
            <div className="hidden md:flex gap-1 overflow-x-auto rounded-lg border border-primary/20 bg-background/70 p-1.5">
                {items.map(item => (
                    <button
                        key={item.key}
                        onClick={() => onChange(item.key)}
                        className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            active === item.key
                                ? 'bg-primary text-white'
                                : 'text-text/70 hover:bg-primary/10 hover:text-text'
                        }`}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
        </>
    )
}
