// components/layout/user-menu.tsx

'use client'

import { useContext, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, User, ChevronDown } from 'lucide-react'

import { AuthContext } from '@/auth/auth-provider'
import { supabase } from '@/supabase/client'
import { Button } from '@/components/ui/display/button'

export function UserMenu() {
    const { user, profile } = useContext(AuthContext)
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    if (!user) return null

    const avatarUrl = profile?.avatar_url || '/images/default_avatar.jpg'
    const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 py-1 pl-1 pr-3 transition-colors hover:border-primary/40"
            >
                <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                    unoptimized
                />
                <span className="hidden text-sm font-medium text-text sm:inline">
                    {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-text/60" />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-primary/20 bg-background shadow-lg">
                    <div className="border-b border-primary/10 px-4 py-3">
                        <p className="text-sm font-medium text-text">{displayName}</p>
                        <p className="truncate text-xs text-text/60">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-primary/10"
                        >
                            <User className="h-4 w-4 text-text/60" />
                            Edit Profile
                        </Link>
                        <Button
                            onClick={handleSignOut}
                            variant="ghost"
                            className="h-auto w-full justify-start rounded-none px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
