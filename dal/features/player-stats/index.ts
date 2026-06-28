// dal/features/player-stats/index.ts

import { supabase } from '@/supabase/client'

export interface PlayerStat {
    id: string
    player_id: string
    game_id: string
    category: string
    games_played: number
    attempts: number
    completions: number
    pass_yards: number
    pass_td: number
    pass_int: number
    long: number
    carries: number
    rush_yards: number
    rush_td: number
    fumbles: number
    yac: number
    receptions: number
    rec_yards: number
    rec_td: number
    rac: number
    solo: number
    assists: number
    tackles: number
    tfl: number
    sacks: number
    def_int: number
    forced_fumbles: number
    def_td: number
    fg_made: number
    fg_attempted: number
    xp_made: number
    xp_attempted: number
    punts: number
    punt_yards: number
    touchbacks: number
    kr_yards: number
    kr_td: number
    pr_yards: number
    pr_td: number
    kr_long: number
    pr_long: number
}

export const PlayerStatService = {
    async getStatsForGame(gameId: string): Promise<PlayerStat[]> {
        const { data, error } = await supabase
            .from('player_stats')
            .select('*')
            .eq('game_id', gameId)

        if (error) {
            console.error('Get player stats error:', error.message)
            return []
        }

        return (data ?? []) as PlayerStat[]
    },

    async createStat(stat: Omit<PlayerStat, 'id'>): Promise<PlayerStat | null> {
        const { data, error } = await supabase
            .from('player_stats')
            .insert(stat)
            .select()
            .single()

        if (error) {
            console.error('Create player stat error:', error.message)
            return null
        }

        return data as PlayerStat
    },

    async updateStat(id: string, updates: Partial<PlayerStat>): Promise<void> {
        const { error } = await supabase
            .from('player_stats')
            .update(updates)
            .eq('id', id)

        if (error) throw error
    },

    async deleteStat(id: string): Promise<void> {
        const { error } = await supabase
            .from('player_stats')
            .delete()
            .eq('id', id)

        if (error) throw error
    },
}
