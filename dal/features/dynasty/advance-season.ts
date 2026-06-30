// dal/features/dynasty/advance-season.ts

import { supabase } from '@/supabase/client'
import { GameService } from '@/dal/features/games'
import { type CreatePlayerSeasonInput } from '@/dal/features/players'
import { YearRecordService } from '@/dal/features/year-records'

const yearProgression: Record<string, string> = {
    'FR': 'SO',
    'FR (RS)': 'SO (RS)',
    'SO': 'JR',
    'SO (RS)': 'JR (RS)',
    'JR': 'SR',
    'JR (RS)': 'SR (RS)',
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

    const { data: dynasty, error: dErr } = await supabase.from('dynasties').select('*').eq('id', dynastyId).single()

    if (dErr || !dynasty) throw new Error('Dynasty not found')

    const yearRecord = await YearRecordService.getCurrentYearRecord(dynastyId)
    if (!yearRecord) throw new Error('No year record found for current season')

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

    const { error: yrErr } = await supabase.from('year_records').update({
        overall_record: `${wins}-${losses}`,
        points_for: pointsFor,
        points_against: pointsAgainst,
        conference_record: finalizeData?.conference_record || yearRecord.conference_record,
        final_ranking: finalizeData?.final_ranking ?? yearRecord.final_ranking,
        heisman: finalizeData?.heisman || yearRecord.heisman,
        nat_champ: finalizeData?.nat_champ || yearRecord.nat_champ,
    }).eq('id', yearRecord.id)

    if (yrErr) console.error('Failed to finalize year record:', yrErr.message)

    const newYear = dynasty.current_year + 1
    const { error: dynErr } = await supabase.from('dynasties').update({
        current_year: newYear,
        seasons_played: dynasty.seasons_played + 1,
        total_wins: dynasty.total_wins + wins,
        total_losses: dynasty.total_losses + losses,
        last_played: new Date().toISOString(),
    }).eq('id', dynastyId)

    if (dynErr) throw new Error('Failed to advance dynasty year')

    const { data: newYearRecord, error: newYrErr } = await supabase.from('year_records').insert({
        dynasty_id: dynastyId,
        year: newYear,
        school_name: dynasty.school_name,
        school_nickname: dynasty.school_nickname,
        school_abbrev: dynasty.school_abbrev,
        conference: dynasty.conference,
        primary_color: dynasty.primary_color,
        secondary_color: dynasty.secondary_color,
    }).select().single()

    if (newYrErr || !newYearRecord) throw new Error('Failed to create new year record')

    if (carryRoster) {
        const { data: currentSeasons } = await supabase.from('player_seasons').select('*, players!inner(id, name)').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecord.id)

        if (currentSeasons && currentSeasons.length > 0) {
            const { data: outgoingTransfers } = await supabase.from('transfers').select('player_name').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecord.id).eq('transfer_direction', 'To')

            const outgoingNames = new Set((outgoingTransfers ?? []).map(t => t.player_name))

            const newSeasons: CreatePlayerSeasonInput[] = currentSeasons.filter(ps => {
                if (ps.year === 'SR' || ps.year === 'SR (RS)') return false
                    const playerName = (ps.players as { name: string })?.name
                    if (outgoingNames.has(playerName)) return false
                    return true
            }).map(ps => ({
                player_id: ps.player_id,
                year_record_id: newYearRecord.id,
                dynasty_id: dynastyId,
                year: ps.year ? (yearProgression[ps.year] || ps.year) : ps.year,
                rating: ps.rating,
                jersey_number: ps.jersey_number,
                is_redshirted: false,
                notes: null,
                dev_trait: ps.dev_trait || null,
            }))

            const { data: incomingTransfers } = await supabase.from('transfers').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecord.id).eq('transfer_direction', 'From')

            if (incomingTransfers) {
                for (const t of incomingTransfers) {
                    const { data: newPlayer } = await supabase.from('players').insert({
                        dynasty_id: dynastyId,
                        name: t.player_name,
                        position: t.position,
                        height: t.height,
                        weight: t.weight,
                    }).select().single()
                    
                    if (newPlayer) {
                        newSeasons.push({
                            player_id: newPlayer.id,
                            year_record_id: newYearRecord.id,
                            dynasty_id: dynastyId,
                            year: null,
                            rating: null,
                            jersey_number: null,
                            is_redshirted: false,
                            notes: `Transfer from ${t.school}`,
                            dev_trait: t.dev_trait || 'Normal',
                        })
                    }
                }
            }

            const { data: recruits } = await supabase.from('recruits').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecord.id)

            if (recruits) {
                for (const r of recruits) {
                    const { data: newPlayer } = await supabase.from('players').insert({
                        dynasty_id: dynastyId,
                        name: r.name,
                        position: r.position,
                        height: r.height,
                        weight: r.weight,
                    }).select().single()

                    if (newPlayer) {
                        newSeasons.push({
                            player_id: newPlayer.id,
                            year_record_id: newYearRecord.id,
                            dynasty_id: dynastyId,
                            year: 'FR',
                            rating: null,
                            jersey_number: null,
                            is_redshirted: false,
                            notes: r.state ? `Recruit from ${r.state}` : null,
                            dev_trait: r.dev_trait || 'Normal',
                        })
                    }
                }
            }

            if (newSeasons.length > 0) {
                const { error: insertErr } = await supabase.from('player_seasons').insert(newSeasons)

                if (insertErr) console.error('Failed to carry roster forward:', insertErr.message)
            }
        }
    }

    return { newYear }
}
