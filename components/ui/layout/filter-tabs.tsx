// components/ui/filter-tabs.tsx

'use client'

import { cn } from '@/lib/utils'

interface FilterTab<T extends string> {
    key: T
    label: string
}

interface FilterTabsProps<T extends string> {
    tabs: FilterTab<T>[]
    active: T
    onChange: (key: T) => void
    className?: string
}

export function FilterTabs<T extends string>({ tabs, active, onChange, className }: FilterTabsProps<T>) {
    return (
        <div className={cn('grid overflow-hidden rounded-lg border border-primary/15', className)} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab, i) => {
                const isActive = active === tab.key
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'py-2 text-xs font-semibold transition-colors',
                            i > 0 && 'border-l border-primary/15',
                            isActive ? 'bg-primary/10 text-primary' : 'text-text/60 hover:bg-primary/5 hover:text-text'
                        )}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
