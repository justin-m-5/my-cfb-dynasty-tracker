//auth/profile.ts

import { supabase } from '@/supabase/client'

export type ProfileStatus = 'active' | 'suspended';

export interface DbProfile {
    id: string;
    display_name: string | null;
    role: string;
    avatar_url: string | null;
    created_at: string;
    email?: string;
    status: ProfileStatus;
    last_seen_at: string | null;
    referred_by: string | null;
}

export const ProfileService = {

  async getProfile(id: string): Promise<DbProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      // PGRST116 indicates multiple rows or failed object coercion for maybeSingle.
      if (error.code === 'PGRST116') {
        const { data: rows, error: rowsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .limit(1)

        if (rowsError) {
          console.error('Profile fetch error:', rowsError.message)
          return null
        }

        return ((rows?.[0] ?? null) as DbProfile | null)
      }

      console.error('Profile fetch error:', error.message)
      return null
    }

    return data as DbProfile
  },

  async updateProfile(id: string, updates: Partial<DbProfile>) {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)
    if (error) throw error
  },

  async createProfile(id: string, fields: Partial<DbProfile>) {
    const { error } = await supabase.from('profiles').insert({ id, ...fields })
    if (error) throw error
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    await this.updateProfile(userId, { avatar_url: data.publicUrl })

    return data.publicUrl
  }
}
