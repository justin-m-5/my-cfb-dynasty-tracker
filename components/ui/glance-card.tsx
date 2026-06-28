// components/ui/glance-card.tsx

interface GlanceCardProps {
    icon?: React.ReactNode
    label: string
    value: string
}

export function GlanceCard({ icon, label, value }: GlanceCardProps) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-primary/20 bg-background/70 p-3 text-center">
            {icon}
            <p className="text-sm font-bold text-text">{value}</p>
            <p className="text-[11px] text-text/60">{label}</p>
        </div>
    )
}
