// dal/features/dynasty/delete-dynasty.ts

import { supabase } from '@/supabase/client'

export async function deleteDynasty(dynastyId: string): Promise<void> {
    const { error } = await supabase
        .from('dynasties')
        .delete()
        .eq('id', dynastyId)

    if (error) throw error
}
