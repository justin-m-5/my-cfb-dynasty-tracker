// dal/features/dynasty/advance-season.ts

import { supabase } from '@/supabase/client'
import { GameService } from '@/dal/features/games'
import { YearRecordService } from '@/dal/features/year-records'

export async function advanceSeason(dynastyId: string): Promise<{ newYear: number } | null> {
    // 1. Get the current dynasty
    const { data: dynasty, error: dErr } = await supabase
        .from('dynasties')
        .select('*')
        .eq('id', dynastyId)
        .single()

    if (dErr || !dynasty) throw new Error('Dynasty not found')

    // 2. Get current year record
    const yearRecord = await YearRecordService.getCurrentYearRecord(dynastyId)
    if (!yearRecord) throw new Error('No year record found for current season')

    // 3. Get all games for this season to compute stats
    const games = await GameService.getGames(dynastyId, yearRecord.id)

    const played = games.filter(g => g.result === 'W' || g.result === 'L' || g.result === 'T')
    const wins = played.filter(g => g.result === 'W').length
    const losses = played.filter(g => g.result === 'L').length

    // Compute points
    let pointsFor = 0
    let pointsAgainst = 0
    for (const g of played) {
        if (g.score) {
            const [pf, pa] = g.score.split('-').map(Number)
            if (!isNaN(pf)) pointsFor += pf
            if (!isNaN(pa)) pointsAgainst += pa
        }
    }

    // 4. Finalize current year_record
    const { error: yrErr } = await supabase
        .from('year_records')
        .update({
            overall_record: `${wins}-${losses}`,
            points_for: pointsFor,
            points_against: pointsAgainst,
        })
        .eq('id', yearRecord.id)

    if (yrErr) console.error('Failed to finalize year record:', yrErr.message)

    // 5. Update dynasty totals and advance year
    const newYear = dynasty.current_year + 1
    const { error: dynErr } = await supabase
        .from('dynasties')
        .update({
            current_year: newYear,
            seasons_played: dynasty.seasons_played + 1,
            total_wins: dynasty.total_wins + wins,
            total_losses: dynasty.total_losses + losses,
            last_played: new Date().toISOString(),
        })
        .eq('id', dynastyId)

    if (dynErr) throw new Error('Failed to advance dynasty year')

    // 6. Create new year_record for next season
    const newYr = await YearRecordService.createYearRecord(dynastyId, newYear)
    if (!newYr) throw new Error('Failed to create new year record')

    return { newYear }
}
