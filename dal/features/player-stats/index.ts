// dal/features/player-stats/index.ts

import { supabase } from '@/supabase/client'

export interface PlayerStat {
    id: string
    player_id: string
    game_id: string
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

export interface CareerPlayerStat extends PlayerStat {
    game_week: number
    game_year: number
}

export const PlayerStatService = {
    async getStatsForGame(gameId: string): Promise<PlayerStat[]> {
        const { data, error } = await supabase.from('player_stats').select('*').eq('game_id', gameId)

        if (error) {
            console.error('Get player stats error:', error.message)
            return []
        }

        return (data ?? []) as PlayerStat[]
    },

    async getSeasonStats(dynastyId: string, yearRecordId: string): Promise<PlayerStat[]> {
        // Get all game IDs for this season, then aggregate
        const { data: games } = await supabase.from('games').select('id').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId)

        if (!games || games.length === 0) return []

        const gameIds = games.map(g => g.id)
        const { data, error } = await supabase.from('player_stats').select('*').in('game_id', gameIds)

        if (error) {
            console.error('Get season stats error:', error.message)
            return []
        }

        return (data ?? []) as PlayerStat[]
    },

    async getSeasonTotalsWithNames(dynastyId: string, yearRecordId: string): Promise<(PlayerStat & { player_name: string; position: string })[]> {
        const { data: games } = await supabase.from('games').select('id').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId)

        if (!games || games.length === 0) return []

        const gameIds = games.map(g => g.id)
        const { data, error } = await supabase.from('player_stats').select('*, players!inner(name, position)').in('game_id', gameIds)

        if (error) {
            console.error('Get season totals error:', error.message)
            return []
        }

        return (data ?? []).map((row: Record<string, unknown>) => {
            const players = row.players as { name: string; position: string } | undefined
            return {
                ...row,
                player_name: players?.name ?? 'Unknown',
                position: players?.position ?? '',
            }
        }) as (PlayerStat & { player_name: string; position: string })[]
    },

    async getCareerStats(playerId: string): Promise<CareerPlayerStat[]> {
        const { data, error } = await supabase
            .from('player_stats')
            .select('*, games!inner(week, year_records!inner(year))')
            .eq('player_id', playerId)

        if (error) {
            console.error('Get career stats error:', error.message)
            return []
        }

        const rows = (data ?? []) as (PlayerStat & {
            games?: {
                week?: number | null
                year_records?: { year?: number | null } | { year?: number | null }[] | null
            } | null
        })[]

        return rows.map((row) => {
            const game = row.games as { week?: number | null; year_records?: { year?: number | null } | { year?: number | null }[] | null } | undefined
            const yearRecord = Array.isArray(game?.year_records) ? game?.year_records[0] : game?.year_records
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { games: _games, ...statRow } = row

            return {
                ...statRow,
                game_week: game?.week ?? 0,
                game_year: yearRecord?.year ?? 0,
            }
        })
    },

    async upsertStat(stat: Omit<PlayerStat, 'id'> & { id?: string }): Promise<PlayerStat | null> {
        const { data, error } = await supabase.from('player_stats').upsert(stat, { onConflict: 'player_id,game_id' }).select().single()

        if (error) {
            console.error('Upsert player stat error:', error.message)
            return null
        }

        return data as PlayerStat
    },

    async createStat(stat: Omit<PlayerStat, 'id'>): Promise<PlayerStat | null> {
        const { data, error } = await supabase.from('player_stats').insert(stat).select().single()

        if (error) {
            console.error('Create player stat error:', error.message)
            return null
        }

        return data as PlayerStat
    },

    async updateStat(id: string, updates: Partial<PlayerStat>): Promise<void> {
        const { error } = await supabase.from('player_stats').update(updates).eq('id', id)

        if (error) throw error
    },

    async deleteStat(id: string): Promise<void> {
        const { error } = await supabase.from('player_stats').delete().eq('id', id)

        if (error) throw error
    },
}
