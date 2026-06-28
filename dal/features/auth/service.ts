// dal/features/auth/service.ts

import { supabase } from '@/supabase/client'
import type { DbProfile as Profile } from '@/auth/profile'
import { ProfileService } from '@/auth/profile'

export const AuthService = {
    
    async getCurrentSession() {
        const {
            data: { session },
        } = await supabase.auth.getSession()
        
        if (!session) return { session: null, user: null, profile: null }

        const user = session.user

        this.updateActivity(user.id)

        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

        if (error) console.error('Profile Fetch Error:', error.message)

        return { session, user, profile: profile as Profile }
    },

    updateActivity(userId: string) {
        supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', userId).then(({ error }) => {
            if (error) console.error('Heartbeat Error:', error.message)
        })
    },

    async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) throw error

        if (data.user) {
            this.updateActivity(data.user.id)
        }

        return data
    },

    async logout() {
        await supabase.auth.signOut()
    },

    async changePassword(currentPassword: string, newPassword: string) {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            throw new Error('You must be logged in to change your password.')
        }

        if (!user.email) {
            throw new Error('Account email is unavailable for password verification.')
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        })

        if (verifyError) {
            throw new Error('Current password is incorrect.')
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

        if (updateError) {
            throw updateError
        }
    },

    async signUp(email: string, password: string, displayName: string, referralCode?: string | null) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName } },
        })

        if (error) throw error

        if (data.user) {
            await ProfileService.updateProfile(data.user.id, {
                display_name: displayName,
                referred_by: referralCode,
                avatar_url: '/images/default_avatar.jpg',
            })
            this.updateActivity(data.user.id)
        }

        return data
    },
}