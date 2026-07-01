// components/dynasty/sections/roster/roster-filters.tsx

'use client'

import { Input } from '@/components/ui/form/input'
import { Select } from '@/components/ui/form/select'
import { PositionOptions } from '@/components/ui/form/position-options'

interface RosterFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    posFilter: string
    onPosFilterChange: (value: string) => void
}

export function RosterFilters({ search, onSearchChange, posFilter, onPosFilterChange }: RosterFiltersProps) {
    return (
        <div className="flex gap-2">
            <Input
                placeholder="Search name..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 flex-1 text-base sm:text-xs"
            />
            <Select
                value={posFilter}
                onChange={(e) => onPosFilterChange(e.target.value)}
                className="h-8 w-24 text-base sm:text-xs"
            >
                <option value="ALL">All</option>
                <PositionOptions />
            </Select>
        </div>
    )
}
