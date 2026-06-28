// dal/features/auth/server.ts

import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { DbProfile as Profile } from '@/auth/profile'

function requireEnv(value: string | undefined, message: string): string {
    if (!value) throw new Error(message)
    return value
}

const supabaseUrl = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL, 'Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL).')

const supabasePublishableKey = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).')

export async function getServerAuthSession() {
    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                } catch {
                    // In some render contexts (e.g., static/prerender), cookies are read-only.
                }
            },
        },
    })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) return { session: null, user: null, profile: null }

    const user = session.user
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    return { session, user, profile: (profile as Profile) ?? null }
}