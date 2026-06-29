// dal/features/dynasty/create-dynasty.ts

import { supabase } from '@/supabase/client'
import type { CreateDynastyInput } from './types'

export async function createDynasty(input: CreateDynastyInput) {
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) throw new Error('Authentication required')

	const { data, error } = await supabase.from('dynasties').insert({
		user_id: user.id,
		name: input.name,
		current_year: input.currentYear,
		coach_name: input.coachName,
		school_name: input.schoolName,
		school_nickname: input.schoolNickName,
		school_abbrev: input.schoolAbbrev,
		conference: input.conference,
		alma_mater: input.almaMater,
		pipeline: input.pipeline,
		primary_color: input.primaryColor,
		secondary_color: input.secondaryColor,
		accent_color: input.accentColor,
	}).select().single()

	if (error) throw error

	// Create the initial year record for the starting year
	const { error: yrError } = await supabase.from('year_records').insert({ dynasty_id: data.id, year: input.currentYear })

	if (yrError) console.error('Failed to create initial year record:', yrError.message)

	return data
}