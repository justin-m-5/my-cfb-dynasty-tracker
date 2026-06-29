// dal/features/top25/index.ts

import { supabase } from '@/supabase/client'

export interface Top25Ranking {
    id: string
    dynasty_id: string
    year: number
    week: number
    rank: number
    team_name: string
    record: string | null
    created_at: string
}

export interface RankedTeam {
    name: string
    record: string
}

export const Top25Service = {
    async getRankings(dynastyId: string, year: number, week: number): Promise<Top25Ranking[]> {
        const { data, error } = await supabase
            .from('top25_rankings')
            .select('*')
            .eq('dynasty_id', dynastyId)
            .eq('year', year)
            .eq('week', week)
            .order('rank', { ascending: true })

        if (error) {
            console.error('Get top25 error:', error.message)
            return []
        }
        return (data ?? []) as Top25Ranking[]
    },

    async getLastSavedWeek(dynastyId: string, year: number): Promise<number> {
        const { data, error } = await supabase
            .from('top25_rankings')
            .select('week')
            .eq('dynasty_id', dynastyId)
            .eq('year', year)
            .order('week', { ascending: false })
            .limit(1)

        if (error || !data || data.length === 0) return 0
        return data[0].week
    },

    async saveRankings(dynastyId: string, year: number, week: number, rankings: RankedTeam[]): Promise<void> {
        // Delete existing rankings for this week
        const { error: delError } = await supabase
            .from('top25_rankings')
            .delete()
            .eq('dynasty_id', dynastyId)
            .eq('year', year)
            .eq('week', week)

        if (delError) throw new Error(`Delete failed: ${delError.message}`)

        // Insert new rankings (only non-empty teams)
        const rows = rankings
            .map((team, i) => ({
                dynasty_id: dynastyId,
                year,
                week,
                rank: i + 1,
                team_name: team.name,
                record: team.record || null,
            }))
            .filter(r => r.team_name.trim() !== '')

        if (rows.length === 0) return

        const { error: insError } = await supabase
            .from('top25_rankings')
            .insert(rows)

        if (insError) throw new Error(`Insert failed: ${insError.message}`)
    },
}
