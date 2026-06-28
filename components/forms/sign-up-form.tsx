// components/forms/sign-up-form.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignUpForm() {
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            await AuthService.signUp(email, password, displayName)
            router.push('/dashboard')
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
            <h2 className="text-center text-2xl font-bold text-text">Sign Up</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="displayName" className="text-text">
                        Display Name
                    </Label>
                    <Input
                        id="displayName"
                        name="displayName"
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1 text-text focus-visible:ring-primary"
                    />
                </div>

                <div>
                    <Label htmlFor="signUpEmail" className="text-text">
                        Email Address
                    </Label>
                    <Input
                        id="signUpEmail"
                        name="signUpEmail"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 text-text focus-visible:ring-primary"
                    />
                </div>

                <div>
                    <Label htmlFor="signUpPassword" className="text-text">
                        Password
                    </Label>
                    <Input
                        id="signUpPassword"
                        name="signUpPassword"
                        type="password"
                        autoComplete="new-password"
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
                    {isSubmitting ? 'Processing...' : 'Sign Up'}
                </Button>

                <p className="text-center text-sm text-text">
                    Already have an account?{' '}
                    <Link href="/" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </form>
        </section>
    )
}