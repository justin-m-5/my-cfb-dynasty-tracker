// components/forms/edit-profile-form.tsx

'use client'

import { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Monitor } from 'lucide-react'
import { AuthContext } from '@/auth/auth-provider'
import { ProfileService } from '@/auth/profile'
import { useTheme, type Theme } from '@/components/theme/theme-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarInput } from '../ui/avatar-input'

export function EditProfileForm() {
    const { user, profile } = useContext(AuthContext)
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            if (avatarFile) {
                await ProfileService.uploadAvatar(user.id, avatarFile)
            }

            await ProfileService.updateProfile(user.id, {
                display_name: displayName.trim() || null,
            })

            setSuccess(true)
            setAvatarFile(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-xl">Profile Settings</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* AVATAR SECTION */}
                    <div>
                        <Label>Avatar</Label>
                        <div className="mt-1">
                            <AvatarInput 
                                previewUrl={avatarPreview} 
                                onChange={handleAvatarChange} 
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <div>
                        <Label>Theme</Label>
                        <div className="mt-2 flex gap-2">
                            {([
                                { value: 'light' as Theme, icon: Sun, label: 'Light' },
                                { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
                                { value: 'system' as Theme, icon: Monitor, label: 'System' },
                            ]).map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setTheme(value)}
                                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                                        theme === value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-primary/20 text-text/60 hover:border-primary/40 hover:text-text'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-600">Profile updated!</p>}
                </CardContent>

                <CardFooter className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting} variant="save" className="font-bold">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                        type="button"
                        variant="cancel"
                        onClick={() => router.push('/dashboard')}
                    >
                        Back
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}