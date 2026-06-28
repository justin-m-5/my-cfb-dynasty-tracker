// components/dashboard/edit-profile-form.tsx

'use client'

import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/auth/auth-provider'
import { ProfileService } from '@/auth/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function EditProfileForm() {
    const { user, profile } = useContext(AuthContext)
    const router = useRouter()

    const [displayName, setDisplayName] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name ?? '')
            setAvatarPreview(profile.avatar_url)
        }
    }, [profile])

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

                <CardContent className="space-y-4">
                    {avatarPreview && (
                        <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="h-20 w-20 rounded-full border border-primary/20 object-cover"
                        />
                    )}

                    <div>
                        <Label htmlFor="avatar">Avatar</Label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="mt-1"
                        />
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

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-600">Profile updated!</p>}
                </CardContent>

                <CardFooter className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting} className="font-bold text-white">
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
