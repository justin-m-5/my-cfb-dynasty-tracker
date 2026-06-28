// components/forms/sign-in-form.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthService } from '@/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignInForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const searchParams = useSearchParams()

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            await AuthService.login(email, password)

            const nextPath = searchParams.get('next')
            const destination = nextPath && nextPath.startsWith('/') ? nextPath : '/dashboard'

            window.location.href = destination
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unexpected error occurred.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="space-y-6 rounded-lg border bg-background p-8 shadow-md">
            <h2 className="text-center text-2xl font-bold text-text">Sign In</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="signInEmail" className="text-text">
                        Email Address
                    </Label>
                    <Input
                        id="signInEmail"
                        name="signInEmail"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 text-text focus-visible:ring-primary"
                    />
                </div>

                <div>
                    <Label htmlFor="signInPassword" className="text-text">
                        Password
                    </Label>
                    <Input
                        id="signInPassword"
                        name="signInPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 text-text focus-visible:ring-primary"
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    bg="var(--primary)"
                    text="white"
                    className="w-full font-bold"
                >
                    {isSubmitting ? 'Processing...' : 'Sign In'}
                </Button>

                <p className="text-center text-sm text-text">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="font-semibold text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </form>
        </section>
    )
}