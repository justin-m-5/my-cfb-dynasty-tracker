// dal/features/players/index.ts

import { supabase } from '@/supabase/client'

export interface Player {
    id: string
    dynasty_id: string
    year_record_id: string
    name: string
    position: string
    year: string | null
    rating: number | null
    jersey_number: number | null
    dev_trait: string | null
    notes: string | null
    is_redshirted: boolean
}

export const PlayerService = {
    async getRoster(dynastyId: string, yearRecordId: string): Promise<Player[]> {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('dynasty_id', dynastyId)
            .eq('year_record_id', yearRecordId)
            .order('position')
            .order('name')

        if (error) {
            console.error('Get roster error:', error.message)
            return []
        }

        return (data ?? []) as Player[]
    },

    async createPlayer(player: Omit<Player, 'id'>): Promise<Player | null> {
        const { data, error } = await supabase
            .from('players')
            .insert(player)
            .select()
            .single()

        if (error) {
            console.error('Create player error:', error.message)
            return null
        }

        return data as Player
    },

    async updatePlayer(id: string, updates: Partial<Player>): Promise<void> {
        const { error } = await supabase
            .from('players')
            .update(updates)
            .eq('id', id)

        if (error) throw error
    },

    async deletePlayer(id: string): Promise<void> {
        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', id)

        if (error) throw error
    },
}
