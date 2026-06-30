// lib/upload-player-image.ts

import { supabase } from '@/supabase/client'

const BUCKET = 'player-images'

export async function uploadPlayerImage(
    file: File,
    dynastyId: string,
    playerId: string
): Promise<string | null> {
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${dynastyId}/${playerId}.${ext}`

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true })

    if (error) {
        console.error('Upload error:', error.message)
        return null
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
}

export async function deletePlayerImage(
    dynastyId: string,
    playerId: string,
    currentUrl: string
): Promise<void> {
    // Extract path from URL
    const ext = currentUrl.split('.').pop() ?? 'png'
    const path = `${dynastyId}/${playerId}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) console.error('Delete image error:', error.message)
}
