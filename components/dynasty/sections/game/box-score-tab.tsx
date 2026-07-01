// components/dynasty/sections/game/box-score-tab.tsx

'use client'

import { Input } from '@/components/ui/form/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { LogoImage } from '@/components/ui/display/logo-image'
import type { Dynasty } from '@/dal/features/dynasty'
import type { Game, QuarterScore } from '@/dal/features/games'

interface BoxScoreTabProps {
    game: Game
    dynasty: Dynasty
    updateGame: (field: keyof Game, value: unknown) => void
    userLogos: string[]
    oppLogos: string[]
}

export function BoxScoreTab({ game, dynasty, updateGame, userLogos, oppLogos }: BoxScoreTabProps) {
    const quarters = (game.score_by_quarter ?? []) as QuarterScore[]
    const labels = ['Q1', 'Q2', 'Q3', 'Q4']

    const updateQuarter = (qi: number, side: 'home' | 'away', val: string) => {
        const updated = [...quarters]
        updated[qi] = { ...updated[qi], [side]: Number(val) || 0 }
        updateGame('score_by_quarter', updated)
    }

    const homeName = game.location === 'away' ? (game.opponent || 'Opponent') : (dynasty.school_abbrev ?? dynasty.school_name)
    const awayName = game.location === 'away' ? (dynasty.school_abbrev ?? dynasty.school_name) : (game.opponent || 'Opponent')
    const homeLogos = game.location === 'away' ? oppLogos : userLogos
    const awayLogos = game.location === 'away' ? userLogos : oppLogos

    return (
        <Card>
            <CardHeader className="p-2"><CardTitle className="text-base">Score by Quarter</CardTitle></CardHeader>
            <CardContent className="p-2">
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
                                <td className="py-2">
                                    <div className="flex items-center gap-2">
                                        <LogoImage candidates={awayLogos} alt={awayName} size={32} />
                                    </div>
                                </td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-1 py-2 text-center">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={q.away}
                                            onChange={(e) => updateQuarter(i, 'away', e.target.value)}
                                            className="mx-auto h-10 w-16 min-w-16 text-center text-base tabular-nums sm:h-8 sm:w-14 sm:min-w-14 sm:text-sm px-2"
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">
                                    <div className="flex items-center gap-2">
                                        <LogoImage candidates={homeLogos} alt={homeName} size={32} />
                                    </div>
                                </td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-1 py-2 text-center">
                                        <Input
                                            type="number"
                                            min={0}
                                            value={q.home}
                                            onChange={(e) => updateQuarter(i, 'home', e.target.value)}
                                            className="mx-auto h-10 w-16 min-w-16 text-center text-base tabular-nums sm:h-8 sm:w-14 sm:min-w-14 sm:text-sm px-2"
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
