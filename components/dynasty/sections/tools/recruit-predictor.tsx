// components/dynasty/sections/tools/recruit-predictor.tsx

'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const predictorPositions = [
    { label: 'QB', value: 'QB', modifier: 2.42, stdError: 0.61 },
    { label: 'HB', value: 'HB', modifier: 1.29, stdError: 0.57 },
    { label: 'FB', value: 'FB', modifier: 2.60, stdError: 1.44 },
    { label: 'WR', value: 'WR', modifier: 0.18, stdError: 0.57 },
    { label: 'TE', value: 'TE', modifier: 0.88, stdError: 0.64 },
    { label: 'LT', value: 'LT', modifier: 2.01, stdError: 0.58 },
    { label: 'LG', value: 'LG', modifier: 2.07, stdError: 0.60 },
    { label: 'C', value: 'C', modifier: 0, stdError: 0.70 },
    { label: 'RG', value: 'RG', modifier: 2.07, stdError: 0.60 },
    { label: 'RT', value: 'RT', modifier: 2.01, stdError: 0.58 },
    { label: 'LEDG', value: 'LEDG', modifier: 2.07, stdError: 0.56 },
    { label: 'REDG', value: 'REDG', modifier: 2.07, stdError: 0.56 },
    { label: 'DT', value: 'DT', modifier: 1.95, stdError: 0.62 },
    { label: 'SAM', value: 'SAM', modifier: 2.12, stdError: 0.58 },
    { label: 'MIKE', value: 'MIKE', modifier: 1.54, stdError: 0.65 },
    { label: 'WILL', value: 'WILL', modifier: 2.12, stdError: 0.58 },
    { label: 'CB', value: 'CB', modifier: 2.74, stdError: 0.58 },
    { label: 'FS', value: 'FS', modifier: 1.92, stdError: 0.62 },
    { label: 'SS', value: 'SS', modifier: 2.10, stdError: 0.66 },
    { label: 'K', value: 'K', modifier: 2.23, stdError: 1.22 },
    { label: 'P', value: 'P', modifier: 3.23, stdError: 1.22 },
    { label: 'ATH', value: 'ATH', modifier: 1.80, stdError: 0.70 },
]

const stars = [
    { label: '5 ★', value: 25.44 },
    { label: '4 ★', value: 22.14 },
    { label: '3 ★', value: 14.38 },
    { label: '2 ★', value: 6.98 },
    { label: '1 ★', value: 0 },
]

export function RecruitPredictor() {
    const [position, setPosition] = useState('')
    const [starRating, setStarRating] = useState('')
    const [result, setResult] = useState<{ predicted: number; low: number; high: number } | null>(null)

    const calculate = () => {
        if (!position || !starRating) return

        const pos = predictorPositions.find(p => p.value === position)
        const star = stars.find(s => s.value.toString() === starRating)
        if (!pos || !star) return

        const predicted = Math.round(((50 + (pos.modifier + star.value)) + Number.EPSILON) * 100) / 100
        const errorMargin = pos.stdError * 2.2

        setResult({
            predicted,
            low: Math.round((predicted - errorMargin) * 100) / 100,
            high: Math.round((predicted + errorMargin) * 100) / 100,
        })
    }

    const reset = () => {
        setPosition('')
        setStarRating('')
        setResult(null)
    }

    return (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs">Position</Label>
                    <Select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="mt-1 h-8"
                    >
                        <option value="">Select</option>
                        {predictorPositions.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label className="text-xs">Star Rating</Label>
                    <Select
                        value={starRating}
                        onChange={(e) => setStarRating(e.target.value)}
                        className="mt-1 h-8"
                    >
                        <option value="">Select</option>
                        {stars.map(s => (
                            <option key={s.value} value={s.value.toString()}>{s.label}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    bg="var(--primary)"
                    text="white"
                    onClick={calculate}
                    disabled={!position || !starRating}
                    className="text-xs font-semibold"
                >
                    Calculate
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={reset}
                    className="text-xs"
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset
                </Button>
            </div>

            {result && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{result.predicted} OVR</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Range: {result.low} – {result.high}
                    </p>
                </div>
            )}
        </div>
    )
}
