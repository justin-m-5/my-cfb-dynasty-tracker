// components/dynasty/sections/game/score-by-quarter.tsx

'use client'

import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { Button } from '@/components/ui/display/button'
import { LogoImage } from '@/components/ui/display/logo-image'
import { Plus } from 'lucide-react'
import type { Game, QuarterScore } from '@/dal/features/games'
import type { Dynasty } from '@/dal/features/dynasty'

interface ScoreByQuarterProps {
    game: Game
    dynasty: Dynasty
    updateGame: (field: keyof Game, value: unknown) => void
    userLogos: string[]
    oppLogos: string[]
}

export function ScoreByQuarter({ game, dynasty, updateGame, userLogos, oppLogos }: ScoreByQuarterProps) {
    const quarters = (game.score_by_quarter ?? []) as QuarterScore[]
    const labels = ['Q1', 'Q2', 'Q3', 'Q4']
    const hasOT = quarters.length > 4

    const updateQuarter = (qi: number, side: 'home' | 'away', val: string) => {
        const updated = [...quarters]
        updated[qi] = { ...updated[qi], [side]: Number(val) || 0 }
        updateGame('score_by_quarter', updated)

        // Auto-calculate totals and result
        const homeTotal = updated.reduce((sum, q) => sum + (q.home || 0), 0)
        const awayTotal = updated.reduce((sum, q) => sum + (q.away || 0), 0)
        
        // Determine which side is "you" based on location
        const [yourTotal, oppTotal] = game.location === 'away' 
            ? [awayTotal, homeTotal] 
            : [homeTotal, awayTotal]
        
        updateGame('score', `${yourTotal}-${oppTotal}`)
        
        // Auto-calculate result
        if (yourTotal > oppTotal) {
            updateGame('result', 'W')
        } else if (yourTotal < oppTotal) {
            updateGame('result', 'L')
        } else if (yourTotal === oppTotal && (yourTotal > 0 || oppTotal > 0)) {
            updateGame('result', 'T')
        } else {
            updateGame('result', 'N/A')
        }
    }

    const toggleOT = () => {
        if (hasOT) {
            // Remove all OT periods (keep only first 4 quarters)
            updateGame('score_by_quarter', quarters.slice(0, 4))
        } else {
            // Add one OT period
            updateGame('score_by_quarter', [...quarters, { home: 0, away: 0 }])
        }
    }

    const homeName = game.location === 'away' ? (game.opponent || 'Opponent') : (dynasty.school_abbrev ?? dynasty.school_name)
    const awayName = game.location === 'away' ? (dynasty.school_abbrev ?? dynasty.school_name) : (game.opponent || 'Opponent')
    const homeLogos = game.location === 'away' ? oppLogos : userLogos
    const awayLogos = game.location === 'away' ? userLogos : oppLogos

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs">Score by Quarter</Label>
                <Button
                    type="button"
                    size="sm"
                    onClick={toggleOT}
                    className="h-7 text-xs"
                    bg="var(--primary)" text="white"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    {hasOT ? 'Remove OT' : 'Add OT'}
                </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-primary/20 bg-background/50">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-primary/20 text-xs text-text/60">
                            <th className="py-2 pl-2 pr-4 text-left font-medium">Team</th>
                            {labels.map(l => <th key={l} className="px-2 py-2 text-center font-medium">{l}</th>)}
                            {hasOT && quarters.slice(4).map((_, i) => (
                                <th key={`ot${i}`} className="px-2 py-2 text-center font-medium">
                                    {i === 0 ? 'OT' : `${i + 1}OT`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-primary/10">
                            <td className="py-2 pl-2">
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
                            <td className="py-2 pl-2 pr-4">
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
        </div>
    )
}
