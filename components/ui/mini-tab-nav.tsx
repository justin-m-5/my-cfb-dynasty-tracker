// components/ui/mini-tab-nav.tsx

'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface MiniTabNavProps {
    tabs: readonly string[]
    active: string
    onChange: (tab: string) => void
}

export function MiniTabNav({ tabs, active, onChange }: MiniTabNavProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile: hamburger button + drawer */}
            <div className="sm:hidden">
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-1.5 rounded-md border border-primary/20 px-2.5 py-1.5 text-sm font-medium text-text"
                >
                    <Menu className="h-4 w-4" />
                    {active}
                </button>

                {open && (
                    <div className="fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                        <div className="relative z-10 flex h-full w-64 flex-col bg-background shadow-xl">
                            <div className="flex items-center justify-between border-b border-primary/15 px-4 py-3">
                                <span className="text-sm font-semibold text-text">Sections</span>
                                <button onClick={() => setOpen(false)} className="text-text/60 hover:text-text">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-1 p-3">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => { onChange(tab); setOpen(false) }}
                                        className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                                            active === tab
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text/70 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop: horizontal tabs */}
            <div className="hidden sm:flex gap-2 border-b border-primary/20">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={`whitespace-nowrap pb-2 px-2 text-sm font-medium transition-colors ${
                            active === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text/60 hover:text-primary'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </>
    )
}
