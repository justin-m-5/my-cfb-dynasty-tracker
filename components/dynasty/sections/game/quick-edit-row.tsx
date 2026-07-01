// components/dynasty/sections/game/quick-edit-row.tsx

'use client'

import { useMemo, useEffect, useState } from 'react'
import { fbsTeams } from '@/lib/fbs-teams'
import { neutralStadiums } from '@/lib/neutral-stadiums'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LogoImage } from '@/components/ui/logo-image'
import { getSchoolLogoCandidates } from '@/lib/logos'
import { Plus } from 'lucide-react'
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

    // Handle stadium auto-selection
    useEffect(() => {
        if (game.location === 'home') {
            // Use dynasty's stadium (you may need to add this to Dynasty type)
            updateGame('stadium', dynasty.stadium || null)
        } else if (game.location === 'away') {
            // Use opponent's stadium
            const oppTeam = fbsTeams.find(t => t.name === game.opponent)
            updateGame('stadium', oppTeam?.stadium || null)
        } else if (game.location === 'neutral' && !game.stadium) {
            // Leave null for neutral, user will pick
            updateGame('stadium', null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.location, game.opponent, dynasty.stadium])

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

    const addOT = () => {
        const updated = [...quarters, { home: 0, away: 0 }]
        updateGame('score_by_quarter', updated)
    }

    const homeName = game.location === 'away' ? (game.opponent || 'Opponent') : (dynasty.school_abbrev ?? dynasty.school_name)
    const awayName = game.location === 'away' ? (dynasty.school_abbrev ?? dynasty.school_name) : (game.opponent || 'Opponent')
    const homeLogos = game.location === 'away' ? oppLogos : userLogos
    const awayLogos = game.location === 'away' ? userLogos : oppLogos

    const [yourScore, oppScore] = game.score?.split('-').map(s => parseInt(s) || 0) ?? [0, 0]

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
                
                {/* Stadium field: auto-filled or dropdown for neutral */}
                {game.location === 'neutral' ? (
                    <div className="col-span-2 sm:flex-1">
                        <Label className="text-xs">Stadium</Label>
                        <Select
                            value={game.stadium || ''}
                            onChange={(e) => updateGame('stadium', e.target.value || null)}
                            className="mt-1 h-9 text-sm"
                        >
                            <option value="">Select Neutral Site</option>
                            {neutralStadiums.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Select>
                    </div>
                ) : (
                    <div className="col-span-2 sm:flex-1">
                        <Label className="text-xs">Stadium</Label>
                        <Input
                            value={game.stadium || '—'}
                            readOnly
                            className="mt-1 h-9 text-sm bg-background/50"
                        />
                    </div>
                )}
            </div>

            {/* Score by Quarter */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <Label className="text-xs">Score by Quarter</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOT}
                        className="h-7 text-xs"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add OT
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

            {/* Total Scores (read-only, at bottom) */}
            <div className="flex items-center justify-center gap-8 rounded-lg border border-primary/20 bg-background/50 py-3">
                <div className="text-center">
                    <p className="text-xs text-text/60 mb-1">Your Score</p>
                    <p className="text-2xl font-bold text-text tabular-nums">{yourScore}</p>
                </div>
                <div className="text-4xl font-bold text-text/30">-</div>
                <div className="text-center">
                    <p className="text-xs text-text/60 mb-1">Opp Score</p>
                    <p className="text-2xl font-bold text-text tabular-nums">{oppScore}</p>
                </div>
            </div>
        </div>
    )
}
