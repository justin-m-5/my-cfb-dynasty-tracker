// app/sign-up/page.tsx

import { SignUpForm } from '@/components/forms/sign-up-form'

export default function SignUpPage() {
    return (
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <SignUpForm />
            </div>
        </div>
    )
}