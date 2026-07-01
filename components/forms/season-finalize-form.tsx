// components/forms/season-finalize-form.tsx

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SeasonFinalizeData {
    conference_record: string
    final_ranking: number | null
    heisman: string
    nat_champ: string
}

interface SeasonFinalizeFormProps {
    year: number
    initialData: SeasonFinalizeData
    onChange: (data: SeasonFinalizeData) => void
}

export function SeasonFinalizeForm({ year, initialData, onChange }: SeasonFinalizeFormProps) {
    const [data, setData] = useState<SeasonFinalizeData>(initialData)

    const update = (field: keyof SeasonFinalizeData, value: string | number | null) => {
        const next = { ...data, [field]: value }
        setData(next)
        onChange(next)
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Finalize {year} Season</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <Label className="text-xs">Conference Record</Label>
                        <Input
                            value={data.conference_record}
                            onChange={(e) => update('conference_record', e.target.value)}
                            placeholder="e.g. 7-2"
                            className="mt-1 h-8 text-base sm:text-xs"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Final AP Ranking</Label>
                        <Input
                            type="number"
                            value={data.final_ranking ?? ''}
                            onChange={(e) => update('final_ranking', e.target.value ? Number(e.target.value) : null)}
                            placeholder="e.g. 4 (blank if unranked)"
                            className="mt-1 h-8 text-base sm:text-xs"
                            min={1}
                            max={25}
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Heisman Winner</Label>
                        <Input
                            value={data.heisman}
                            onChange={(e) => update('heisman', e.target.value)}
                            placeholder="Player name (if your player won)"
                            className="mt-1 h-8 text-base sm:text-xs"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">National Champion</Label>
                        <Input
                            value={data.nat_champ}
                            onChange={(e) => update('nat_champ', e.target.value)}
                            placeholder="Team name (if you won)"
                            className="mt-1 h-8 text-base sm:text-xs"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
