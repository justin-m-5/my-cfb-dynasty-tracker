// app/sign-up/page.tsx

import { SignUpForm } from '@/components/forms/sign-up-form'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/dal/features/auth/server'

export default async function SignUpPage() {
    const { session } = await getServerAuthSession()

    if (session) {
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <SignUpForm />
            </div>
        </div>
    )
}