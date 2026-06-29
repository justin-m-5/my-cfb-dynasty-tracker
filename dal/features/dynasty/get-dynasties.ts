// dal/features/dynasty/get-dynasties.ts

import { supabase } from '@/supabase/client'
import type { DynastySummary } from './types'

export async function getDynasties(): Promise<DynastySummary[]> {
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return []

	const { data, error } = await supabase.from('dynasties').select('id, name, current_year, coach_name, school_name, school_nickname, school_abbrev, conference, primary_color, secondary_color, seasons_played, total_wins, total_losses, championships, last_played').eq('user_id', user.id).order('last_played', { ascending: false })

	if (error) {
		console.error('Fetch dynasties error:', error.message)
		return []
	}

	return (data ?? []) as DynastySummary[]
}