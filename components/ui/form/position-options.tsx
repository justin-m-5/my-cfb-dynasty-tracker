// components/ui/position-options.tsx

import { positionGroups, recruitPositionGroups } from '@/lib/config/player-config'

export function PositionOptions() {
    return (
        <>
            {Object.entries(positionGroups).map(([group, pos]) => (
                <optgroup key={group} label={group}>
                    {pos.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
            ))}
        </>
    )
}

export function RecruitPositionOptions() {
    return (
        <>
            {Object.entries(recruitPositionGroups).map(([group, pos]) => (
                <optgroup key={group} label={group}>
                    {pos.map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
            ))}
        </>
    )
}
