// components/ui/glance-card.tsx

interface GlanceCardProps {
    icon?: React.ReactNode
    label: string
    value: string
}

export function GlanceCard({ icon, label, value }: GlanceCardProps) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-primary/20 bg-background/70 p-2 text-center">
            {/* Icon or spacer to maintain consistent height */}
            {icon ? (
                <div className="h-4">{icon}</div>
            ) : (
                <div className="h-4" />
            )}
            <p className="text-xs font-bold text-text">{value}</p>
            <p className="text-xs text-text/60">{label}</p>
        </div>
    )
}
