// dal/features/dynasty/advance-season.ts

import { supabase } from '@/supabase/client'
import { GameService } from '@/dal/features/games'
import { YearRecordService } from '@/dal/features/year-records'

// Year progression map: what each year becomes next season
const yearProgression: Record<string, string> = {
    'FR': 'SO',
    'FR (RS)': 'SO (RS)',
    'SO': 'JR',
    'SO (RS)': 'JR (RS)',
    'JR': 'SR',
    'JR (RS)': 'SR (RS)',
    // SR and SR (RS) graduate - not carried forward
}

export interface AdvanceSeasonOptions {
    finalizeData?: {
        conference_record: string
        final_ranking: number | null
        heisman: string
        nat_champ: string
    }
    carryRoster?: boolean
}

export async function advanceSeason(dynastyId: string, options?: AdvanceSeasonOptions): Promise<{ newYear: number } | null> {
    const { finalizeData, carryRoster = true } = options ?? {}

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
            conference_record: finalizeData?.conference_record || yearRecord.conference_record,
            final_ranking: finalizeData?.final_ranking ?? yearRecord.final_ranking,
            heisman: finalizeData?.heisman || yearRecord.heisman,
            nat_champ: finalizeData?.nat_champ || yearRecord.nat_champ,
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

    // 6. Create new year_record for next season with team snapshot
    const { data: newYearRecord, error: newYrErr } = await supabase
        .from('year_records')
        .insert({
            dynasty_id: dynastyId,
            year: newYear,
            school_name: dynasty.school_name,
            school_nickname: dynasty.school_nickname,
            school_abbrev: dynasty.school_abbrev,
            conference: dynasty.conference,
            primary_color: dynasty.primary_color,
            secondary_color: dynasty.secondary_color,
        })
        .select()
        .single()

    if (newYrErr || !newYearRecord) throw new Error('Failed to create new year record')

    // 7. Carry roster forward (if staying at same school)
    if (carryRoster) {
        // Get current roster
        const { data: currentRoster } = await supabase
            .from('players')
            .select('*')
            .eq('dynasty_id', dynastyId)
            .eq('year_record_id', yearRecord.id)

        if (currentRoster && currentRoster.length > 0) {
            // Get outgoing transfers (players leaving)
            const { data: outgoingTransfers } = await supabase
                .from('transfers')
                .select('player_name')
                .eq('dynasty_id', dynastyId)
                .eq('year_record_id', yearRecord.id)
                .eq('transfer_direction', 'To')

            const outgoingNames = new Set((outgoingTransfers ?? []).map(t => t.player_name))

            // Filter: remove seniors and outgoing transfers, progress year
            const carryForward = currentRoster
                .filter(p => {
                    // Skip seniors (they graduate)
                    if (p.year === 'SR' || p.year === 'SR (RS)') return false
                    // Skip outgoing transfers
                    if (outgoingNames.has(p.name)) return false
                    return true
                })
                .map(p => ({
                    dynasty_id: dynastyId,
                    year_record_id: newYearRecord.id,
                    name: p.name,
                    position: p.position,
                    year: p.year ? (yearProgression[p.year] || p.year) : p.year,
                    rating: p.rating,
                    jersey_number: p.jersey_number,
                    dev_trait: p.dev_trait,
                    notes: p.notes,
                    is_redshirted: false, // Reset redshirt for new season
                    height: p.height,
                    weight: p.weight,
                }))

            // Add incoming transfers as new players
            const { data: incomingTransfers } = await supabase
                .from('transfers')
                .select('*')
                .eq('dynasty_id', dynastyId)
                .eq('year_record_id', yearRecord.id)
                .eq('transfer_direction', 'From')

            if (incomingTransfers) {
                for (const t of incomingTransfers) {
                    carryForward.push({
                        dynasty_id: dynastyId,
                        year_record_id: newYearRecord.id,
                        name: t.player_name,
                        position: t.position,
                        year: null, // Unknown year for transfers - user can update
                        rating: null,
                        jersey_number: null,
                        dev_trait: t.dev_trait || 'Normal',
                        notes: `Transfer from ${t.school}`,
                        is_redshirted: false,
                        height: t.height,
                        weight: t.weight,
                    })
                }
            }

            // Add recruits as freshmen
            const { data: recruits } = await supabase
                .from('recruits')
                .select('*')
                .eq('dynasty_id', dynastyId)
                .eq('year_record_id', yearRecord.id)

            if (recruits) {
                for (const r of recruits) {
                    carryForward.push({
                        dynasty_id: dynastyId,
                        year_record_id: newYearRecord.id,
                        name: r.name,
                        position: r.position,
                        year: 'FR',
                        rating: null,
                        jersey_number: null,
                        dev_trait: r.dev_trait || 'Normal',
                        notes: r.state ? `Recruit from ${r.state}` : null,
                        is_redshirted: false,
                        height: r.height,
                        weight: r.weight,
                    })
                }
            }

            // Insert all carried-forward players
            if (carryForward.length > 0) {
                const { error: insertErr } = await supabase
                    .from('players')
                    .insert(carryForward)

                if (insertErr) console.error('Failed to carry roster forward:', insertErr.message)
            }
        }
    }

    return { newYear }
}
