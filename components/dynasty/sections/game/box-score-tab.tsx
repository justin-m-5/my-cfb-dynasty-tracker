// components/dynasty/sections/game/box-score-tab.tsx

'use client'

import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Dynasty } from '@/dal/features/dynasty'
import type { Game, QuarterScore } from '@/dal/features/games'

interface BoxScoreTabProps {
    game: Game
    dynasty: Dynasty
    updateGame: (field: keyof Game, value: unknown) => void
}

export function BoxScoreTab({ game, dynasty, updateGame }: BoxScoreTabProps) {
    const quarters = (game.score_by_quarter ?? []) as QuarterScore[]
    const labels = ['Q1', 'Q2', 'Q3', 'Q4']

    const updateQuarter = (qi: number, side: 'home' | 'away', val: string) => {
        const updated = [...quarters]
        updated[qi] = { ...updated[qi], [side]: Number(val) || 0 }
        updateGame('score_by_quarter', updated)
    }

    const homeName = game.location === 'away' ? (game.opponent || 'Opponent') : (dynasty.school_abbrev ?? dynasty.school_name)
    const awayName = game.location === 'away' ? (dynasty.school_abbrev ?? dynasty.school_name) : (game.opponent || 'Opponent')

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Score by Quarter</CardTitle></CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary/20 text-xs text-text/60">
                                <th className="py-2 pr-4 text-left font-medium">Team</th>
                                {labels.map(l => <th key={l} className="px-2 py-2 text-center font-medium">{l}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-primary/10">
                                <td className="py-2 pr-4 text-xs font-medium text-text sm:text-sm">{awayName}</td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-1 py-2 text-center">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={q.away}
                                            onChange={(e) => updateQuarter(i, 'away', e.target.value)}
                                            className="h-8 w-12 text-center text-sm mx-auto sm:w-14"
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 text-xs font-medium text-text sm:text-sm">{homeName}</td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-1 py-2 text-center">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={q.home}
                                            onChange={(e) => updateQuarter(i, 'home', e.target.value)}
                                            className="h-8 w-12 text-center text-sm mx-auto sm:w-14"
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
