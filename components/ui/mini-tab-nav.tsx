// components/ui/mini-tab-nav.tsx

'use client'

interface MiniTabNavProps {
    tabs: readonly string[]
    active: string
    onChange: (tab: string) => void
}

export function MiniTabNav({ tabs, active, onChange }: MiniTabNavProps) {
    return (
        <>
            {/* Mobile: vertical stacked buttons */}
            <div className="flex flex-col gap-1 sm:hidden">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                            active === tab
                                ? 'bg-primary/10 text-primary'
                                : 'text-text/70 hover:bg-primary/5 hover:text-primary'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Desktop/tablet: horizontal tabs */}
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
