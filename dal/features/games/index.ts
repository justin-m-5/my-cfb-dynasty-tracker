// dal/features/games/index.ts

import { supabase } from '@/supabase/client'

export interface QuarterScore {
    home: number
    away: number
}

export interface Game {
    id: string
    dynasty_id: string
    year_record_id: string
    week: number
    location: 'home' | 'away' | 'neutral' | 'none'
    opponent: string
    result: 'W' | 'L' | 'T' | 'Bye' | 'N/A'
    score: string | null
    score_by_quarter: QuarterScore[] | null
    team_stats: Record<string, unknown> | null
    recap: string | null
    stadium: string | null
}

export const GameService = {
    async getGameById(id: string): Promise<Game | null> {
        const { data, error } = await supabase.from('games').select('*').eq('id', id).single()

        if (error) {
            console.error('Get game error:', error.message)
            return null
        }

        return data as Game
    },

    async getGames(dynastyId: string, yearRecordId: string): Promise<Game[]> {
        const { data, error } = await supabase.from('games').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId).order('week', { ascending: true })

        if (error) {
            console.error('Get games error:', error.message)
            return []
        }

        return (data ?? []) as Game[]
    },

    async updateGame(id: string, updates: Partial<Game>): Promise<void> {
        const { error } = await supabase.from('games').update(updates).eq('id', id)

        if (error) throw error
    },

    async createGame(game: Omit<Game, 'id'>): Promise<Game | null> {
        const { data, error } = await supabase.from('games').insert(game).select().single()

        if (error) {
            console.error('Create game error:', error.message)
            return null
        }

        return data as Game
    },
}
