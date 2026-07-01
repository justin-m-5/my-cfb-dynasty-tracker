// components/ui/detail-card.tsx

interface DetailCardProps {
    label: string
    value: string
    color?: string
    icon?: React.ReactNode
}

export function DetailCard({ label, value, color, icon }: DetailCardProps) {
    return (
        <div className="rounded-xl border border-primary/20 bg-background/70 p-2 text-center">
            <p className="text-sm font-bold text-text" style={color ? { color } : undefined}>{value}</p>
            <div className="mt-1 flex items-center justify-center gap-1">
                {icon}
                <p className="text-[11px] text-text/60">{label}</p>
            </div>
        </div>
    )
}
