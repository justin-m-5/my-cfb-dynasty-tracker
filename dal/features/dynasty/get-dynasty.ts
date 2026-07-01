// dal/features/dynasty/get-dynasty.ts

import { supabase } from '@/supabase/client'

export interface Dynasty {
    id: string
    user_id: string
    name: string
    created_at: string
    last_played: string
    current_year: number
    seasons_played: number
    total_wins: number
    total_losses: number
    championships: number
    coach_name: string
    coach_level: number
    alma_mater: string | null
    pipeline: string | null
    school_name: string
    school_nickname: string | null
    school_abbrev: string | null
    conference: string | null
    stadium: string | null
    primary_color: string | null
    secondary_color: string | null
    accent_color: string | null
}

export async function getDynastyById(id: string): Promise<Dynasty | null> {
    const { data, error } = await supabase.from('dynasties').select('*').eq('id', id).single()

    if (error) {
        console.error('Get dynasty error:', error.message)
        return null
    }

    return data as Dynasty
}
