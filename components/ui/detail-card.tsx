// components/ui/detail-card.tsx

interface DetailCardProps {
    label: string
    value: string
    color?: string
}

export function DetailCard({ label, value, color }: DetailCardProps) {
    return (
        <div className="rounded-xl border border-primary/20 bg-background/70 p-3 text-center">
            <p className="text-sm font-bold text-text" style={color ? { color } : undefined}>{value}</p>
            <p className="mt-1 text-[11px] text-text/60">{label}</p>
        </div>
    )
}
