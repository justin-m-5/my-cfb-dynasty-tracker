// components/dynasty/sections/game/quick-edit-row.tsx

'use client'

import { useMemo } from 'react'
import { fbsTeams } from '@/lib/fbs-teams'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import type { Game, QuarterScore } from '@/dal/features/games'
import type { Dynasty } from '@/dal/features/dynasty'

interface QuickEditRowProps {
    game: Game
    dynasty: Dynasty
    updateGame: (field: keyof Game, value: unknown) => void
    userLogos: string[]
    oppLogos: string[]
}

export function QuickEditRow({ game, dynasty, updateGame, userLogos, oppLogos }: QuickEditRowProps) {
    const opponentTeams = useMemo(
        () => fbsTeams.map(t => ({ name: t.name, conference: t.conference })).sort((a, b) => a.name.localeCompare(b.name)),
        []
    )

    const quarters = (game.score_by_quarter ?? []) as QuarterScore[]
    const labels = ['Q1', 'Q2', 'Q3', 'Q4']

    const updateQuarter = (qi: number, side: 'home' | 'away', val: string) => {
        const updated = [...quarters]
        updated[qi] = { ...updated[qi], [side]: Number(val) || 0 }
        updateGame('score_by_quarter', updated)

        // Auto-calculate totals if score is null or empty
        const yourScore = game.score?.split('-')[0] ?? ''
        const oppScore = game.score?.split('-')[1] ?? ''
        
        if (!yourScore || !oppScore) {
            const homeTotal = updated.reduce((sum, q) => sum + (q.home || 0), 0)
            const awayTotal = updated.reduce((sum, q) => sum + (q.away || 0), 0)
            
            // Determine which side is "you" based on location
            const [yourTotal, oppTotal] = game.location === 'away' 
                ? [awayTotal, homeTotal] 
                : [homeTotal, awayTotal]
            
            updateGame('score', `${yourTotal}-${oppTotal}`)
        }
    }

    const homeName = game.location === 'away' ? (game.opponent || 'Opponent') : (dynasty.school_abbrev ?? dynasty.school_name)
    const awayName = game.location === 'away' ? (dynasty.school_abbrev ?? dynasty.school_name) : (game.opponent || 'Opponent')
    const homeLogos = game.location === 'away' ? oppLogos : userLogos
    const awayLogos = game.location === 'away' ? userLogos : oppLogos

    return (
        <div className="space-y-4">
            {/* Quick edit fields */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
                <div className="col-span-2 sm:min-w-45 sm:flex-1">
                    <Label className="text-xs">Opponent</Label>
                    <Select
                        value={game.opponent}
                        onChange={(e) => updateGame('opponent', e.target.value)}
                        className="mt-1 h-9 text-sm"
                    >
                        <option value="">Select</option>
                        <option value="BYE">BYE</option>
                        {opponentTeams.map((t) => (
                            <option key={t.name} value={t.name}>{t.name} ({t.conference})</option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label className="text-xs">Location</Label>
                    <Select
                        value={game.location}
                        onChange={(e) => updateGame('location', e.target.value)}
                        className="mt-1 h-9 text-sm"
                    >
                        <option value="home">Home</option>
                        <option value="away">Away</option>
                        <option value="neutral">Neutral</option>
                        <option value="none">None</option>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs">Result</Label>
                    <Select
                        value={game.result}
                        onChange={(e) => updateGame('result', e.target.value)}
                        className="mt-1 h-9 text-sm"
                    >
                        <option value="N/A">—</option>
                        <option value="W">Win</option>
                        <option value="L">Loss</option>
                        <option value="T">Tie</option>
                        <option value="Bye">Bye</option>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs">Your Score</Label>
                    <Input
                        type="number"
                        min={0}
                        value={game.score?.split('-')[0] ?? ''}
                        onChange={(e) => {
                            const opp = game.score?.split('-')[1] ?? '0'
                            updateGame('score', `${e.target.value}-${opp}`)
                        }}
                        className="mt-1 h-9 w-full text-center text-sm sm:w-20"
                    />
                </div>
                <div>
                    <Label className="text-xs">Opp Score</Label>
                    <Input
                        type="number"
                        min={0}
                        value={game.score?.split('-')[1] ?? ''}
                        onChange={(e) => {
                            const you = game.score?.split('-')[0] ?? '0'
                            updateGame('score', `${you}-${e.target.value}`)
                        }}
                        className="mt-1 h-9 w-full text-center text-sm sm:w-20"
                    />
                </div>
            </div>

            {/* Score by Quarter */}
            <div>
                <Label className="mb-2 text-xs">Score by Quarter</Label>
                <div className="overflow-x-auto rounded-lg border border-primary/20 bg-background/50">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary/20 text-xs text-text/60">
                                <th className="py-2 pl-2 pr-4 text-left font-medium">Team</th>
                                {labels.map(l => <th key={l} className="px-2 py-2 text-center font-medium">{l}</th>)}
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
        </div>
    )
}
