// components/dynasty/sections/tools/recruiting-calculator.tsx

'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const grades = [
    { label: 'A+', value: 13 },
    { label: 'A', value: 12 },
    { label: 'A-', value: 11 },
    { label: 'B+', value: 10 },
    { label: 'B', value: 9 },
    { label: 'B-', value: 8 },
    { label: 'C+', value: 7 },
    { label: 'C', value: 6 },
    { label: 'C-', value: 5 },
    { label: 'D+', value: 4 },
    { label: 'D', value: 3 },
    { label: 'D-', value: 2 },
    { label: 'F', value: 1 },
]

export function RecruitingCalculator() {
    const [grade1, setGrade1] = useState('')
    const [grade2, setGrade2] = useState('')
    const [grade3, setGrade3] = useState('')
    const [result, setResult] = useState<string | null>(null)

    const calculate = () => {
        if (!grade1 || !grade2 || !grade3) return
        const total = Number(grade1) + Number(grade2) + Number(grade3)

        if (total <= 17) {
            setResult("DON'T SELL!")
        } else if (total <= 20) {
            setResult('RISKY!')
        } else {
            setResult('SELL!')
        }
    }

    const reset = () => {
        setGrade1('')
        setGrade2('')
        setGrade3('')
        setResult(null)
    }

    const getResultColor = (r: string) => {
        if (r === 'SELL!') return 'text-green-600'
        if (r === 'RISKY!') return 'text-amber-500'
        return 'text-red-600'
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {[
                    { value: grade1, setter: setGrade1, label: 'Grade 1' },
                    { value: grade2, setter: setGrade2, label: 'Grade 2' },
                    { value: grade3, setter: setGrade3, label: 'Grade 3' },
                ].map(({ value, setter, label }) => (
                    <div key={label}>
                        <Label className="text-xs">{label}</Label>
                        <Select
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="mt-1 h-8"
                        >
                            <option value="">—</option>
                            {grades.map(g => (
                                <option key={g.label} value={g.value.toString()}>{g.label}</option>
                            ))}
                        </Select>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    bg="var(--primary)"
                    text="white"
                    onClick={calculate}
                    disabled={!grade1 || !grade2 || !grade3}
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
                    <p className={`text-2xl font-bold ${getResultColor(result)}`}>{result}</p>
                </div>
            )}
        </div>
    )
}
