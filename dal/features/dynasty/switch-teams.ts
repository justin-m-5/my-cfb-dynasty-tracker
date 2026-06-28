// dal/features/dynasty/switch-teams.ts

import { supabase } from '@/supabase/client'
import type { SwitchTeamsInput } from './types'

export async function switchTeams(dynastyId: string, updates: SwitchTeamsInput) {
	const { data, error } = await supabase
		.from('dynasties')
		.update({
			school_name: updates.schoolName,
			school_nickname: updates.schoolNickName,
			school_abbrev: updates.schoolAbbrev,
			conference: updates.conference,
			primary_color: updates.primaryColor,
			secondary_color: updates.secondaryColor,
			accent_color: updates.accentColor,
			last_played: new Date().toISOString(),
		})
		.eq('id', dynastyId)
		.select()
		.single()

	if (error) throw error
	return data
}