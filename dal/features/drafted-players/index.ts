import { supabase } from '@/supabase/client'

export interface DraftedPlayer {
    id: string
    dynasty_id: string
    year_record_id: string
    player_name: string
    position: string
    original_team: string
    drafted_team: string
    round: number | null
    pick: number | null
    year: number
}

export const DraftedPlayerService = {
    async getDraftedPlayers(dynastyId: string, yearRecordId: string): Promise<DraftedPlayer[]> {
        const { data, error } = await supabase.from('drafted_players').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId).order('player_name', { ascending: true })

        if (error) {
            console.error('Get drafted players error:', error.message)
            return []
        }

        return (data ?? []) as DraftedPlayer[]
    },

    async createDraftedPlayer(player: Omit<DraftedPlayer, 'id'>): Promise<DraftedPlayer | null> {
        const { data, error } = await supabase.from('drafted_players').insert(player).select().single()

        if (error) {
            console.error('Create drafted player error:', error.message)
            return null
        }

        return data as DraftedPlayer
    },

    async deleteDraftedPlayer(id: string): Promise<void> {
        const { error } = await supabase.from('drafted_players').delete().eq('id', id)

        if (error) throw error
    },
}
